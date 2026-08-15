import fs from "node:fs";
import path from "node:path";

type SourceCatalog = { generatedAt: string; itemCount: number; items: Array<{ id: string }> };
type EnglishCatalog = { generatedAt: string; translations: Record<string, string> };

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "i18n/catalog/source.json");
const englishPath = path.join(root, "i18n/catalog/en-US.json");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as SourceCatalog;
const english = JSON.parse(fs.readFileSync(englishPath, "utf8")) as EnglishCatalog;
const active = new Set(source.items.map((item) => item.id));
const orphaned = Object.keys(english.translations).filter((key) => !active.has(key));
const missing = source.items.map((item) => item.id).filter((key) => !(key in english.translations));

if (missing.length > 0) {
    throw new Error(`English catalog is missing ${missing.length} active semantic keys: ${missing.slice(0, 10).join(", ")}`);
}

for (const key of orphaned) delete english.translations[key];
english.translations = Object.fromEntries(Object.entries(english.translations).sort(([left], [right]) => left.localeCompare(right)));
english.generatedAt = new Date().toISOString();
fs.writeFileSync(englishPath, `${JSON.stringify(english, null, 2)}\n`);
console.log(JSON.stringify({ activeKeys: active.size, removedOrphanedTranslations: orphaned.length, remainingTranslations: Object.keys(english.translations).length }, null, 2));
