import path from "node:path";
import { Node, Project } from "ts-morph";

const root = path.resolve(__dirname, "..");
const project = new Project({ tsConfigFilePath: path.join(root, "tsconfig.json"), skipAddingFilesFromTsConfig: true });
project.addSourceFilesAtPaths([path.join(root, "app/**/*.{ts,tsx}"), path.join(root, "components/**/*.{ts,tsx}")]);

let repaired = 0;
for (const source of project.getSourceFiles()) {
    const statements = source.getStatements();
    const directive = statements.find((statement) => {
        if (!Node.isExpressionStatement(statement)) return false;
        const expression = statement.getExpression();
        return Node.isStringLiteral(expression) && expression.getLiteralText() === "use client";
    });
    if (!directive) continue;

    const importsBeforeDirective = source.getImportDeclarations().filter((declaration) => declaration.getStart() < directive.getStart());
    if (importsBeforeDirective.length === 0) continue;

    const importTexts = importsBeforeDirective.map((declaration) => declaration.getText());
    importsBeforeDirective.forEach((declaration) => declaration.remove());
    const currentDirective = source.getStatements().find((statement) => {
        if (!Node.isExpressionStatement(statement)) return false;
        const expression = statement.getExpression();
        return Node.isStringLiteral(expression) && expression.getLiteralText() === "use client";
    });
    if (!currentDirective) continue;
    const directiveIndex = source.getStatements().indexOf(currentDirective);
    source.insertStatements(directiveIndex + 1, importTexts);
    repaired += 1;
}

project.saveSync();
console.log(`i18n client directive repair: ${repaired} files normalized`);
