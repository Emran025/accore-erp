import fs from "node:fs";
import path from "node:path";

type Classification = "user-facing" | "review-required" | "technical";

interface Candidate {
    id: string;
    file: string;
    line: number;
    column: number;
    kind: string;
    classification: Classification;
    value: string;
    context: string;
    suggestedKey: string;
}

interface CatalogItem {
    id: string;
    source: string;
    classification: Exclude<Classification, "technical">;
    occurrences: Array<Pick<Candidate, "id" | "file" | "line" | "column" | "kind" | "context">>;
}

interface KeyManifest {
    format: "scope.feature.descriptiveEnglishIntent";
    entries: Array<{ source: string; key: string }>;
}

const semanticKey = /^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*){2,}(?:\.alternative\d+)?$/;
const root = path.resolve(__dirname, "..");
const inventoryPath = path.join(root, "i18n", "inventory", "candidates.json");
const outputPath = path.join(root, "i18n", "catalog", "source.json");
const manifestPath = path.join(root, "i18n", "catalog", "key-manifest.json");
const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8")) as { candidates: Candidate[] };
const existing = fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, "utf8")) as { items: CatalogItem[] }
    : { items: [] };
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as KeyManifest;

const normalise = (value: string) => value.replace(/\s+/g, " ").trim().normalize("NFC");
const existingBySource = new Map(existing.items.map((item) => [normalise(item.source), item.id]));
const manifestBySource = new Map(manifest.entries.map((entry) => [normalise(entry.source), entry.key]));
const grouped = new Map(existing.items.map((item) => [normalise(item.source), {
    ...item,
    source: normalise(item.source),
    occurrences: [...item.occurrences],
}]));
const unresolved: Candidate[] = [];

for (const candidate of inventory.candidates) {
    if (candidate.classification === "technical") continue;
    const source = normalise(candidate.value);
    const occurrence = { id: candidate.id, file: candidate.file, line: candidate.line, column: candidate.column, kind: candidate.kind, context: candidate.context };
    const existingItem = grouped.get(source);
    if (existingItem) {
        if (!existingItem.occurrences.some((current) => current.id === occurrence.id)) {
            existingItem.occurrences.push(occurrence);
        }
        if (candidate.classification === "user-facing") existingItem.classification = "user-facing";
        continue;
    }

    const key = existingBySource.get(source) ?? manifestBySource.get(source);
    if (!key) {
        unresolved.push(candidate);
        continue;
    }
    if (!semanticKey.test(key)) {
        throw new Error(`Invalid semantic key '${key}' for '${source}'. Expected scope.feature.descriptiveEnglishIntent.`);
    }
    grouped.set(source, {
        id: key,
        source,
        classification: candidate.classification,
        occurrences: [occurrence],
    });
}

if (unresolved.length > 0) {
    const sample = unresolved.slice(0, 20).map((candidate) => `${candidate.file}:${candidate.line} '${candidate.value}'`).join("\n");
    throw new Error(`New interface text requires a reviewed semantic key in i18n/catalog/key-manifest.json before catalog generation.\n${sample}`);
}

const items = [...grouped.values()].sort((left, right) => left.id.localeCompare(right.id));
const duplicateKeys = items.filter((item, index) => items.findIndex((candidate) => candidate.id === item.id) !== index);
if (duplicateKeys.length > 0) {
    throw new Error(`Semantic catalog key collision: ${duplicateKeys.map((item) => item.id).join(", ")}`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), itemCount: items.length, items }, null, 2)}\n`);
console.log(`i18n catalog: ${items.length} semantic non-technical text entries from ${inventory.candidates.length} candidates`);
