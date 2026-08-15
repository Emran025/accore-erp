import crypto from "node:crypto";
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
}

interface CatalogItem {
    id: string;
    source: string;
    classification: Exclude<Classification, "technical">;
    occurrences: Array<Pick<Candidate, "id" | "file" | "line" | "column" | "kind" | "context">>;
}

const root = path.resolve(__dirname, "..");
const inventoryPath = path.join(root, "i18n", "inventory", "candidates.json");
const outputPath = path.join(root, "i18n", "catalog", "source.json");
const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8")) as { candidates: Candidate[] };

const grouped = new Map<string, CatalogItem>();
for (const candidate of inventory.candidates) {
    if (candidate.classification === "technical") continue;
    const normalized = candidate.value.replace(/\s+/g, " ").trim();
    const key = normalized.normalize("NFC");
    const occurrence = { id: candidate.id, file: candidate.file, line: candidate.line, column: candidate.column, kind: candidate.kind, context: candidate.context };
    const existing = grouped.get(key);
    if (existing) {
        existing.occurrences.push(occurrence);
        if (candidate.classification === "user-facing") existing.classification = "user-facing";
        continue;
    }
    const hash = crypto.createHash("sha256").update(key).digest("hex").slice(0, 12);
    grouped.set(key, {
        id: `text_${hash}`,
        source: normalized,
        classification: candidate.classification,
        occurrences: [occurrence],
    });
}

const items = [...grouped.values()].sort((a, b) => a.id.localeCompare(b.id));
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), itemCount: items.length, items }, null, 2)}\n`);
console.log(`i18n catalog: ${items.length} unique non-technical text entries from ${inventory.candidates.length} candidates`);
