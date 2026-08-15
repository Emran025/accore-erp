import fs from "node:fs";
import path from "node:path";
import {
    ArrowFunction,
    FunctionDeclaration,
    FunctionExpression,
    Node,
    Project,
    SourceFile,
    SyntaxKind,
} from "ts-morph";

type FunctionLike = ArrowFunction | FunctionDeclaration | FunctionExpression;

interface Candidate {
    id: string;
    file: string;
    line: number;
    column: number;
    kind: "jsx-text" | "jsx-attribute" | "object-property" | "call-argument" | "string-literal" | "template-literal";
    classification: "user-facing" | "review-required" | "technical";
    value: string;
}

interface Action {
    node: Node;
    candidate: Candidate;
    component: FunctionLike;
}

const root = path.resolve(__dirname, "..");
const scopeArgument = process.argv.find((argument) => argument.startsWith("--scope="))?.replace("--scope=", "") ?? "";
const inventory = JSON.parse(fs.readFileSync(path.join(root, "i18n", "inventory", "candidates.json"), "utf8")) as { candidates: Candidate[] };
const candidatesById = new Map(inventory.candidates.filter((candidate) => candidate.classification !== "technical").map((candidate) => [candidate.id, candidate]));
const sourceCatalog = JSON.parse(fs.readFileSync(path.join(root, "i18n", "catalog", "source.json"), "utf8")) as { items: Array<{ id: string; source: string }> };
const catalogKeysBySource = new Map(sourceCatalog.items.map((item) => [item.source, item.id]));
const report: { migrated: Candidate[]; skipped: Array<Candidate & { reason: string }> } = { migrated: [], skipped: [] };

function relative(source: SourceFile): string {
    return path.relative(root, source.getFilePath()).replace(/\\/g, "/");
}

function candidateId(source: SourceFile, node: Node): string {
    const position = source.getLineAndColumnAtPos(node.getStart());
    return `${relative(source)}:${position.line}:${position.column}`;
}

function functionName(node: FunctionLike): string | undefined {
    if (Node.isFunctionDeclaration(node) || Node.isFunctionExpression(node)) return node.getName();
    const parent = node.getParent();
    if (Node.isVariableDeclaration(parent) && Node.isIdentifier(parent.getNameNode())) return parent.getName();
    return undefined;
}

function isComponent(node: FunctionLike): boolean {
    const name = functionName(node);
    return Boolean(name && /^[A-Z]/.test(name));
}

function nearestComponent(node: Node): FunctionLike | undefined {
    const ancestors = node.getAncestors();
    for (const ancestor of ancestors) {
        if ((Node.isArrowFunction(ancestor) || Node.isFunctionDeclaration(ancestor) || Node.isFunctionExpression(ancestor)) && isComponent(ancestor)) {
            const body = ancestor.getBody();
            if (body && node.getStart() >= body.getStart() && node.getEnd() <= body.getEnd()) return ancestor;
        }
    }
    return undefined;
}

function ensureImport(source: SourceFile, name: "useI18n" | "catalogText"): void {
    const declaration = source.getImportDeclarations().find((item) => item.getModuleSpecifierValue() === "@/lib/i18n");
    if (!declaration) {
        const directiveIndex = source.getStatements().findIndex((statement) => {
            if (!Node.isExpressionStatement(statement)) return false;
            const expression = statement.getExpression();
            return Node.isStringLiteral(expression) && expression.getLiteralText() === "use client";
        });
        source.insertImportDeclaration(directiveIndex >= 0 ? directiveIndex + 1 : 0, { moduleSpecifier: "@/lib/i18n", namedImports: [name] });
        return;
    }
    if (!declaration.getNamedImports().some((item) => item.getName() === name)) declaration.addNamedImport(name);
}

function ensureHook(component: FunctionLike): boolean {
    const body = component.getBody();
    if (!body || !Node.isBlock(body)) return false;
    if (body.getText().includes("useI18n()")) return true;
    body.insertStatements(0, "const { t: i18n } = useI18n();");
    return true;
}

function catalogKey(candidate: Candidate): string {
    const entry = catalogKeysBySource.get(candidate.value);
    if (!entry) throw new Error(`No catalog ID for ${candidate.id}`);
    return entry;
}

function dynamicExpression(node: Node, candidate: Candidate): string | undefined {
    if (!Node.isTemplateExpression(node)) return undefined;
    const values = node.getTemplateSpans().map((span, index) => `value${index}: ${span.getExpression().getText()}`).join(", ");
    return `catalogText(i18n, ${JSON.stringify(catalogKey(candidate))}, { ${values} })`;
}

function migrateAction(action: Action): boolean {
    const { node, candidate, component } = action;
    const source = node.getSourceFile();
    if (!ensureHook(component)) {
        report.skipped.push({ ...candidate, reason: "Component has an expression body and requires manual hook placement." });
        return false;
    }
    ensureImport(source, "useI18n");

    const dynamic = dynamicExpression(node, candidate);
    const expression = dynamic ?? `i18n.catalog[${JSON.stringify(catalogKey(candidate))}]`;
    if (dynamic) ensureImport(source, "catalogText");

    if (Node.isJsxText(node)) {
        node.replaceWithText(`{${expression}}`);
    } else if (Node.isStringLiteral(node)) {
        const parent = node.getParent();
        if (Node.isJsxAttribute(parent) && parent.getInitializer() === node) {
            parent.setInitializer(`{${expression}}`);
        } else {
            node.replaceWithText(expression);
        }
    } else if (Node.isTemplateExpression(node)) {
        node.replaceWithText(expression);
    } else {
        report.skipped.push({ ...candidate, reason: `Unsupported AST node ${node.getKindName()}.` });
        return false;
    }
    report.migrated.push(candidate);
    return true;
}

function hasClientDirective(source: SourceFile): boolean {
    return source.getStatements().some((statement) => {
        if (!Node.isExpressionStatement(statement)) return false;
        const expression = statement.getExpression();
        return Node.isStringLiteral(expression) && expression.getLiteralText() === "use client";
    });
}

const project = new Project({ tsConfigFilePath: path.join(root, "tsconfig.json"), skipAddingFilesFromTsConfig: true });
project.addSourceFilesAtPaths([path.join(root, "app/**/*.{ts,tsx}"), path.join(root, "components/**/*.{ts,tsx}")]);
const sources = project.getSourceFiles().filter((source) => !source.getFilePath().includes("/node_modules/") && (!scopeArgument || relative(source).startsWith(scopeArgument)));

for (const source of sources) {
    const isClientFile = hasClientDirective(source);
    const actions: Action[] = [];
    source.forEachDescendant((node) => {
        if (!Node.isJsxText(node) && !Node.isStringLiteral(node) && !Node.isTemplateExpression(node)) return;
        const candidate = candidatesById.get(candidateId(source, node));
        if (!candidate) return;
        if (!isClientFile) {
            report.skipped.push({ ...candidate, reason: "Server component requires server-localization migration." });
            return;
        }
        const component = nearestComponent(node);
        if (!component) {
            report.skipped.push({ ...candidate, reason: "Outside a React component body; requires explicit configuration or factory migration." });
            return;
        }
        actions.push({ node, candidate, component });
    });

    const components = new Set<FunctionLike>();
    for (const action of actions) components.add(action.component);
    const validComponents = new Set([...components].filter(ensureHook));
    for (const component of validComponents) ensureImport(source, "useI18n");

    actions.sort((left, right) => right.node.getStart() - left.node.getStart());
    for (const action of actions) {
        if (!validComponents.has(action.component)) {
            report.skipped.push({ ...action.candidate, reason: "Component has an expression body and requires manual hook placement." });
            continue;
        }
        migrateAction(action);
    }
}

project.saveSync();

const reportDirectory = path.join(root, "i18n", "migration");
fs.mkdirSync(reportDirectory, { recursive: true });
fs.writeFileSync(path.join(reportDirectory, "latest.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), scope: scopeArgument || "app-and-components", migrated: report.migrated, skipped: report.skipped }, null, 2)}\n`);
console.log(`i18n extraction: migrated ${report.migrated.length}, skipped ${report.skipped.length}, scope=${scopeArgument || "app-and-components"}`);
