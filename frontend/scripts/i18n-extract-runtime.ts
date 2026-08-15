import fs from "node:fs";
import path from "node:path";
import { Node, Project, SourceFile } from "ts-morph";

interface Candidate {
    id: string;
    file: string;
    line: number;
    column: number;
    kind: "jsx-text" | "jsx-attribute" | "object-property" | "call-argument" | "string-literal" | "template-literal";
    classification: "user-facing" | "review-required" | "technical";
    status: "pending" | "extracted" | "approved-exception" | "technical";
    value: string;
}

const root = path.resolve(__dirname, "..");
const inventory = JSON.parse(fs.readFileSync(path.join(root, "i18n", "inventory", "candidates.json"), "utf8")) as { candidates: Candidate[] };
const catalog = JSON.parse(fs.readFileSync(path.join(root, "i18n", "catalog", "source.json"), "utf8")) as { items: Array<{ id: string; source: string }> };
const candidates = new Map(inventory.candidates.filter((candidate) => candidate.status === "pending").map((candidate) => [candidate.id, candidate]));
const keysBySource = new Map(catalog.items.map((item) => [item.source, item.id]));
const report: { migrated: Candidate[]; skipped: Array<Candidate & { reason: string }> } = { migrated: [], skipped: [] };

function relative(source: SourceFile): string {
    return path.relative(root, source.getFilePath()).replace(/\\/g, "/");
}

function candidateId(source: SourceFile, node: Node): string {
    const position = source.getLineAndColumnAtPos(node.getStart());
    return `${relative(source)}:${position.line}:${position.column}`;
}

function ensureImport(source: SourceFile): void {
    const declaration = source.getImportDeclarations().find((item) => item.getModuleSpecifierValue() === "@/lib/i18n");
    if (declaration) {
        if (!declaration.getNamedImports().some((item) => item.getName() === "catalogMessage")) declaration.addNamedImport("catalogMessage");
        return;
    }
    const directiveIndex = source.getStatements().findIndex((statement) => {
        if (!Node.isExpressionStatement(statement)) return false;
        const expression = statement.getExpression();
        return Node.isStringLiteral(expression) && expression.getLiteralText() === "use client";
    });
    source.insertImportDeclaration(directiveIndex >= 0 ? directiveIndex + 1 : 0, { moduleSpecifier: "@/lib/i18n", namedImports: ["catalogMessage"] });
}

function catalogKey(candidate: Candidate): string | undefined {
    return keysBySource.get(candidate.value);
}

function expression(node: Node, candidate: Candidate): string | undefined {
    const key = catalogKey(candidate);
    if (!key) return undefined;
    if (Node.isTemplateExpression(node)) {
        const values = node.getTemplateSpans().map((span, index) => `value${index}: ${span.getExpression().getText()}`).join(", ");
        return `catalogMessage(${JSON.stringify(key)}, { ${values} })`;
    }
    return `catalogMessage(${JSON.stringify(key)})`;
}

const project = new Project({ tsConfigFilePath: path.join(root, "tsconfig.json"), skipAddingFilesFromTsConfig: true });
project.addSourceFilesAtPaths([
    path.join(root, "app/**/*.{ts,tsx}"),
    path.join(root, "components/**/*.{ts,tsx}"),
    path.join(root, "lib/**/*.{ts,tsx}"),
    path.join(root, "stores/**/*.{ts,tsx}"),
]);

for (const source of project.getSourceFiles()) {
    const actions: Array<{ node: Node; candidate: Candidate }> = [];
    source.forEachDescendant((node) => {
        if (!Node.isJsxText(node) && !Node.isStringLiteral(node) && !Node.isTemplateExpression(node)) return;
        const candidate = candidates.get(candidateId(source, node));
        if (candidate) actions.push({ node, candidate });
    });
    if (actions.length === 0) continue;
    ensureImport(source);
    actions.sort((left, right) => right.node.getStart() - left.node.getStart());
    for (const action of actions) {
        const replacement = expression(action.node, action.candidate);
        if (!replacement) {
            report.skipped.push({ ...action.candidate, reason: "No generated catalog key was found for this source value." });
            continue;
        }
        if (Node.isJsxText(action.node)) {
            action.node.replaceWithText(`{${replacement}}`);
        } else if (Node.isStringLiteral(action.node)) {
            const parent = action.node.getParent();
            if (Node.isJsxAttribute(parent) && parent.getInitializer() === action.node) parent.setInitializer(`{${replacement}}`);
            else action.node.replaceWithText(replacement);
        } else if (Node.isTemplateExpression(action.node)) {
            action.node.replaceWithText(replacement);
        } else {
            report.skipped.push({ ...action.candidate, reason: `Unsupported node ${action.node.getKindName()}.` });
            continue;
        }
        report.migrated.push(action.candidate);
    }
}

project.saveSync();
const outputDirectory = path.join(root, "i18n", "migration");
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "runtime-latest.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), migrated: report.migrated, skipped: report.skipped }, null, 2)}\n`);
console.log(`i18n runtime extraction: migrated ${report.migrated.length}, skipped ${report.skipped.length}`);
