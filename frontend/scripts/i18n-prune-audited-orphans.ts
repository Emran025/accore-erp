import fs from "node:fs";
import path from "node:path";

type Finding = { id: string; kind: string };
type CatalogItem = { id: string; source: string; classification: string; occurrences: unknown[] };
type SourceCatalog = { generatedAt: string; itemCount: number; items: CatalogItem[] };
type EnglishCatalog = { generatedAt: string; translations: Record<string, string> };

const root = path.resolve(__dirname, "..");
const findings = JSON.parse(fs.readFileSync(path.join(root, "i18n/editorial/static-findings.json"), "utf8")) as { findings: Finding[] };
const sourcePath = path.join(root, "i18n/catalog/source.json");
const englishPath = path.join(root, "i18n/catalog/en-US.json");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as SourceCatalog;
const english = JSON.parse(fs.readFileSync(englishPath, "utf8")) as EnglishCatalog;
const apply = process.argv.includes("--apply");

function collectFiles(directory: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) return entry.name === "i18n" ? [] : collectFiles(absolute);
        return /\.(?:ts|tsx)$/u.test(entry.name) ? [absolute] : [];
    });
}

const sourceText = ["app", "components", "lib", "stores"]
    .flatMap((directory) => collectFiles(path.join(root, directory)))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
const candidates = findings.findings.filter((finding) => finding.kind === "technical-remnant").map((finding) => finding.id);
const removable = candidates.filter((id) => !sourceText.includes(id));

if (apply) {
    source.items = source.items.filter((item) => !removable.includes(item.id));
    source.itemCount = source.items.length;
    source.generatedAt = new Date().toISOString();
    for (const id of removable) delete english.translations[id];
    english.generatedAt = new Date().toISOString();
    fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);
    fs.writeFileSync(englishPath, `${JSON.stringify(english, null, 2)}\n`);
}

console.log(JSON.stringify({ auditedTechnicalCandidates: candidates.length, removable, applied: apply }, null, 2));
