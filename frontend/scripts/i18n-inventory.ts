import fs from "node:fs";
import path from "node:path";
import { Node, Project, SourceFile, SyntaxKind } from "ts-morph";

type CandidateKind = "jsx-text" | "jsx-attribute" | "object-property" | "call-argument" | "string-literal" | "template-literal";
type CandidateClassification = "user-facing" | "review-required" | "technical";
type CandidateStatus = "pending" | "extracted" | "approved-exception" | "technical";

interface ApprovedException {
    path: string;
    line?: number;
    column?: number;
    value?: string;
    jsxAttribute?: string;
    reason: string;
}

interface InventoryPolicy {
    include: string[];
    exclude: string[];
    userFacingJsxAttributes: string[];
    userFacingObjectProperties: string[];
    userFacingCallNames: string[];
    approvedExceptions: ApprovedException[];
}

interface Candidate {
    id: string;
    file: string;
    line: number;
    column: number;
    kind: CandidateKind;
    classification: CandidateClassification;
    status: CandidateStatus;
    value: string;
    context: string;
    suggestedKey: string;
}

const root = path.resolve(__dirname, "..");
const policyPath = path.join(root, "i18n", "inventory-policy.json");
const outputDirectory = path.join(root, "i18n", "inventory");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf8")) as InventoryPolicy;
const existingStatusPath = path.join(outputDirectory, "review-status.json");
const existingStatuses: Record<string, CandidateStatus> = fs.existsSync(existingStatusPath)
    ? JSON.parse(fs.readFileSync(existingStatusPath, "utf8")) as Record<string, CandidateStatus>
    : {};

function isText(value: string): boolean {
    return /[\p{L}\p{N}]/u.test(value) && !/^([A-Z_][A-Z0-9_]*|[a-z][a-zA-Z0-9]*|[\w-]+)$/.test(value);
}

function isTechnicalValue(value: string): boolean {
    const hasArabic = /[\u0600-\u06FF]/.test(value);
    return value.length === 0
        || value.startsWith("/")
        || value.startsWith(".")
        || value.startsWith("http:")
        || value.startsWith("https:")
        || value.startsWith("#")
        || value.includes("@/")
        || /^[a-z]+:\/\//i.test(value)
        || /^[a-z0-9_-]+$/i.test(value)
        || /^\d+(\.\d+)*$/.test(value)
        || value.includes("var(--")
        || value.includes("@keyframes")
        || value.includes("fa-")
        || value.includes("api/")
        || (!hasArabic && (value.includes("/v2/") || /^(?:v2|auth)\//.test(value) || value.includes("?") || value.includes("&") || value.includes("=")))
        || (!hasArabic && /(?:rgba\(|linear-gradient\(|\d+(?:\.\d+)?px\s+solid|class=|<\/?(?:div|span|th|td|section|header|footer)\b)/i.test(value))
        || (!hasArabic && /^(?:TRX|INV|PO|SO|SRV)-/i.test(value))
        || (!hasArabic && /^(?:[A-Z]{2,}\d+,\d{4}-\d{2}-\d{2},\d{2}:\d{2}:\d{2}\s*)+$/u.test(value))
        || (!hasArabic && /^(?:application\/[a-z0-9.+-]+|mailto:|tel:|noopener noreferrer)$/i.test(value))
        || (!hasArabic && /(?:^|\s)(?:inline-flex|items-center|justify-center|rounded(?:-[a-z0-9]+)?|text-[a-z0-9-]+|bg-[a-z0-9-]+|border(?:-[a-z0-9-]+)?|hover:bg-[a-z0-9-]+|focus(?:-visible)?:[a-z0-9-]+|h-\d+|w-\d+|px-\d+(?:\.\d+)?|py-\d+(?:\.\d+)?)(?:\s|$)/i.test(value))
        || (!hasArabic && /(?:translate[XYZ]?\(|scale[XYZ]?\(|rotate\(|skew[XY]?\(|matrix\(|calc\()/i.test(value))
        || (!hasArabic && /^(?:(?:\d+(?:\.\d+)?(?:rem|px|em|%))(?:\s+(?:0|\d+(?:\.\d+)?(?:rem|px|em|%)))*|opacity\s+\d+(?:\.\d+)?s\s+ease|alert\s+alert-\{value\d+\}\s+animate-[\w-]+)$/i.test(value))
        || (!hasArabic && /^(?:btn(?:\s|-)\S+|btn-\{value\d+\}|border-radius-\{value\d+\}|\{value\d+\}(?:\s+\{value\d+\})+)$/u.test(value))
        || /^[—·•…]+$/u.test(value)
        || (!hasArabic && /^\{value\d+\}\/\{value\d+\}$/u.test(value))
        || (!hasArabic && /^\{value\d+\}(?:\s*[()|—:-]\s*\{value\d+\})*$/u.test(value))
        || (!hasArabic && /^(?:line|column) \{value\d+\}$/i.test(value))
        || (!hasArabic && /^(?:operating-readiness|runtime-error|runtime-rejection|fiscal-period-nearing-end|legacy-error):/i.test(value))
        || (!hasArabic && /^(?:err|notification)_[a-z0-9_{}-]+$/i.test(value));
}

function nearestAncestor<T extends Node>(node: Node, predicate: (candidate: Node) => candidate is T): T | undefined {
    let current: Node | undefined = node.getParent();
    while (current) {
        if (predicate(current)) return current;
        current = current.getParent();
    }
    return undefined;
}

function propertyName(node: Node): string | undefined {
    if (!Node.isPropertyAssignment(node)) return undefined;
    const nameNode = node.getNameNode();
    return Node.isIdentifier(nameNode) || Node.isStringLiteral(nameNode) ? nameNode.getText().replace(/["']/g, "") : undefined;
}

function jsxAttributeName(node: Node): string | undefined {
    if (!Node.isJsxAttribute(node)) return undefined;
    return node.getNameNode().getText();
}

function getCallName(node: Node): string | undefined {
    if (!Node.isCallExpression(node)) return undefined;
    const expression = node.getExpression();
    if (Node.isIdentifier(expression)) return expression.getText();
    if (Node.isPropertyAccessExpression(expression)) return expression.getName();
    return undefined;
}

function classify(node: Node, value: string): { kind: CandidateKind; classification: CandidateClassification; context: string } | null {
    const isSemanticLocaleKey = /^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*){2,}(?:\.alternative\d+)?$/.test(value);
    if (value === "use client" || /^text_[a-f0-9]{12}$/i.test(value) || value.startsWith("desktop.error.") || isSemanticLocaleKey) {
        return { kind: "string-literal", classification: "technical", context: "Localization runtime syntax" };
    }
    const binary = nearestAncestor(node, Node.isBinaryExpression);
    if (binary && (Node.isTypeOfExpression(binary.getLeft()) || Node.isTypeOfExpression(binary.getRight()))) {
        return { kind: "string-literal", classification: "technical", context: "Runtime type guard" };
    }
    const propertyKey = node.getParent();
    if (Node.isPropertyAssignment(propertyKey) && propertyKey.getNameNode() === node) {
        return { kind: "string-literal", classification: "technical", context: "Object property key" };
    }
    if (Node.isImportDeclaration(propertyKey) || Node.isExportDeclaration(propertyKey)) {
        return { kind: "string-literal", classification: "technical", context: "Module specifier" };
    }
    if (Node.isCallExpression(propertyKey) && propertyKey.getExpression().getKind() === SyntaxKind.ImportKeyword) {
        return { kind: "string-literal", classification: "technical", context: "Dynamic module specifier" };
    }
    const technicalCall = nearestAncestor(node, Node.isCallExpression);
    if (technicalCall && getCallName(technicalCall) === "importCopy") {
      return { kind: "call-argument", classification: "technical", context: "Localization runtime syntax" };
    }
    if (technicalCall && getCallName(technicalCall) === "text") {
        const argumentIndex = technicalCall.getArguments().findIndex((argument) => argument === node || argument.getDescendants().includes(node));
        if (argumentIndex >= 1) return { kind: "call-argument", classification: "technical", context: "Data field selector" };
    }
    if (technicalCall && getCallName(technicalCall) === "parseFromString") {
        const argumentIndex = technicalCall.getArguments().findIndex((argument) => argument === node || argument.getDescendants().includes(node));
        if (argumentIndex === 1) return { kind: "string-literal", classification: "technical", context: "DOM parser MIME type" };
    }

    const jsxText = nearestAncestor(node, Node.isJsxText);
    if (jsxText) return { kind: "jsx-text", classification: "user-facing", context: "JSX text" };

    const jsxAttribute = nearestAncestor(node, Node.isJsxAttribute);
    const attributeName = jsxAttribute ? jsxAttributeName(jsxAttribute) : undefined;
    if (attributeName && policy.userFacingJsxAttributes.includes(attributeName)) {
        if (isTechnicalValue(value)) return { kind: "jsx-attribute", classification: "technical", context: `Technical JSX ${attributeName}` };
        return { kind: "jsx-attribute", classification: "user-facing", context: `JSX ${attributeName}` };
    }
    if (attributeName && ["className", "style", "id", "key", "href", "src", "name", "type", "role", "value"].includes(attributeName)) {
        return { kind: "jsx-attribute", classification: "technical", context: `Technical JSX ${attributeName}` };
    }

    const property = nearestAncestor(node, Node.isPropertyAssignment);
    const name = property ? propertyName(property) : undefined;
    if (name && policy.userFacingObjectProperties.includes(name)) {
        if (isTechnicalValue(value)) {
            return { kind: "object-property", classification: "technical", context: `Technical object ${name}` };
        }
        return { kind: "object-property", classification: "user-facing", context: `Object ${name}` };
    }

    const call = nearestAncestor(node, Node.isCallExpression);
    const callName = call ? getCallName(call) : undefined;
    if (call && callName && policy.userFacingCallNames.includes(callName)) {
        const directArgument = call.getArguments().findIndex((argument) => argument === node || argument.getDescendants().includes(node));
        const visibleArgumentIndexes: Record<string, number[]> = {
            showAlert: [1],
            alert: [0],
            confirm: [0],
            prompt: [0],
            toast: [0],
            notify: [0],
        };
        if ((visibleArgumentIndexes[callName] ?? [0]).includes(directArgument)) {
            return { kind: "call-argument", classification: "user-facing", context: `Call ${callName}` };
        }
        return { kind: "call-argument", classification: "technical", context: `Technical argument for ${callName}` };
    }

    if (isTechnicalValue(value)) return { kind: "string-literal", classification: "technical", context: "Technical identifier or route" };
    if (isText(value) || /[\u0600-\u06FF]/.test(value)) return { kind: "string-literal", classification: "review-required", context: "Unclassified textual literal" };
    return null;
}

function suggestedKey(file: string, line: number, value: string): string {
    const area = file.replace(/\.(ts|tsx)$/, "").replace(/[^a-zA-Z0-9]+/g, ".").replace(/^\.|\.$/g, "").toLowerCase();
    const hint = value
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .trim()
        .split(/\s+/)
        .slice(0, 4)
        .join("-")
        .toLowerCase() || `line-${line}`;
    return `${area}.${hint}`;
}

function templateSource(node: Node): string {
    if (!Node.isTemplateExpression(node)) return "";
    return node.getTemplateSpans().reduce(
        (text, span, index) => `${text}{value${index}}${span.getLiteral().getLiteralText()}`,
        node.getHead().getLiteralText(),
    );
}

function isDocumentedApprovedException(candidate: Pick<Candidate, "file" | "line" | "column" | "value">, node: Node): boolean {
    const jsxAttribute = nearestAncestor(node, Node.isJsxAttribute);
    const attributeName = jsxAttribute ? jsxAttributeName(jsxAttribute) : undefined;
    return policy.approvedExceptions.some((exception) => {
        const targetsCandidate = exception.line !== undefined || exception.column !== undefined || exception.value !== undefined || exception.jsxAttribute !== undefined;
        return targetsCandidate
            && exception.path === candidate.file
            && (exception.line === undefined || exception.line === candidate.line)
            && (exception.column === undefined || exception.column === candidate.column)
            && (exception.value === undefined || exception.value === candidate.value)
            && (exception.jsxAttribute === undefined || exception.jsxAttribute === attributeName)
            && exception.reason.trim().length > 0;
    });
}

function candidateFromNode(node: Node, value: string, sourceFile: SourceFile): Candidate | null {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized) return null;
    const result = classify(node, normalized);
    if (!result) return null;
    const position = sourceFile.getLineAndColumnAtPos(node.getStart());
    const file = path.relative(root, sourceFile.getFilePath()).replace(/\\/g, "/");
    const id = `${file}:${position.line}:${position.column}`;
    const documentedException = isDocumentedApprovedException({
        file,
        line: position.line,
        column: position.column,
        value: normalized,
    }, node);
    const candidate: Candidate = {
        id,
        file,
        line: position.line,
        column: position.column,
        kind: result.kind,
        classification: result.classification,
        status: existingStatuses[id] ?? (documentedException ? "approved-exception" : result.classification === "technical" ? "technical" : "pending"),
        value: normalized,
        context: result.context,
        suggestedKey: suggestedKey(file, position.line, normalized),
    };
    if (candidate.status === "approved-exception" && !documentedException) {
        throw new Error(`Missing documented approved exception for ${candidate.id}`);
    }
    return candidate;
}

function collectFromSource(sourceFile: SourceFile): Candidate[] {
    const candidates: Candidate[] = [];
    sourceFile.forEachDescendant((node) => {
        if (Node.isJsxText(node)) {
            const candidate = candidateFromNode(node, node.getText(), sourceFile);
            if (candidate) candidates.push(candidate);
            return;
        }
        if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
            const candidate = candidateFromNode(node, node.getLiteralText(), sourceFile);
            if (candidate) candidates.push(candidate);
        }
        if (Node.isTemplateExpression(node)) {
            const candidate = candidateFromNode(node, templateSource(node), sourceFile);
            if (candidate) candidates.push({ ...candidate, kind: "template-literal", classification: candidate.classification === "technical" ? "technical" : "review-required", context: "Dynamic template literal" });
        }
    });
    return candidates;
}

function markdown(candidates: Candidate[]): string {
    const counts = candidates.reduce<Record<string, number>>((accumulator, candidate) => {
        accumulator[candidate.status] = (accumulator[candidate.status] ?? 0) + 1;
        return accumulator;
    }, {});
    const fileCounts = candidates.reduce<Record<string, number>>((accumulator, candidate) => {
        accumulator[candidate.file] = (accumulator[candidate.file] ?? 0) + 1;
        return accumulator;
    }, {});
    const files = Object.entries(fileCounts).sort((a, b) => b[1] - a[1]).slice(0, 100);
    return `# Interface Text Inventory\n\nGenerated deterministically by \`npm run i18n:inventory\`.\n\n| Status | Count |\n|---|---:|\n${Object.entries(counts).sort().map(([status, count]) => `| ${status} | ${count} |`).join("\n")}\n\n## Highest-volume files\n\n| File | Candidate literals |\n|---|---:|\n${files.map(([file, count]) => `| \`${file}\` | ${count} |`).join("\n")}\n\n## Gate\n\nThe check command fails while any candidate remains in \`pending\` status. A candidate can become \`extracted\` only after its source location is replaced with typed locale access, \`approved-exception\` only with a documented rationale, or \`technical\` only when it is demonstrably not user-facing.\n`;
}

function isExcluded(filePath: string): boolean {
    const relative = path.relative(root, filePath).replace(/\\/g, "/");
    return relative.startsWith("lib/i18n/")
        || relative === "lib/translations.ts"
        || relative.includes("/node_modules/")
        || relative.includes("/.next/")
        || relative.includes("/tests/")
        || relative.endsWith(".d.ts");
}

const project = new Project({ tsConfigFilePath: path.join(root, "tsconfig.json"), skipAddingFilesFromTsConfig: true });
project.addSourceFilesAtPaths(policy.include.map((pattern) => path.join(root, pattern)));
const candidates = project.getSourceFiles()
    .filter((source) => !isExcluded(source.getFilePath()))
    .flatMap(collectFromSource)
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "candidates.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), total: candidates.length, candidates }, null, 2)}\n`);
fs.writeFileSync(path.join(outputDirectory, "report.md"), markdown(candidates));

const pending = candidates.filter((candidate) => candidate.status === "pending");
console.log(`i18n inventory: ${candidates.length} candidates, ${pending.length} pending review`);
if (process.argv.includes("--check") && pending.length > 0) process.exitCode = 1;
