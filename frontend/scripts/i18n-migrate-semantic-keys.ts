import fs from "node:fs";
import path from "node:path";

type Occurrence = { file: string; line: number; column: number; kind: string; context: string };
type CatalogItem = { id: string; source: string; classification: string; occurrences: Occurrence[] };
type SourceCatalog = { generatedAt: string; itemCount: number; items: CatalogItem[] };
type EnglishCatalog = { generatedAt: string; translations: Record<string, string> };
type KeyMap = { generatedAt: string; format: string; entries: Array<{ oldKey: string; newKey: string; source: string; english: string; primaryFile: string }> };

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "i18n/catalog/source.json");
const englishPath = path.join(root, "i18n/catalog/en-US.json");
const reportPath = path.join(root, "i18n/catalog/semantic-key-map.json");
const apply = process.argv.includes("--apply");
const ignoredDirectories = new Set([".git", ".next", "node_modules", "coverage"]);
const ignoredFiles = new Set([
    path.relative(root, sourcePath).replace(/\\/g, "/"),
    path.relative(root, englishPath).replace(/\\/g, "/"),
    "lib/i18n/catalog/ar-SA.ts",
    "lib/i18n/catalog/en-US.ts",
    "i18n/catalog/semantic-key-map.json",
]);

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as SourceCatalog;
const english = JSON.parse(fs.readFileSync(englishPath, "utf8")) as EnglishCatalog;

function camel(value: string): string {
    const words = value
        .replace(/<[^>]+>/g, " ")
        .replace(/\{value\d+\}/g, " ")
        .replace(/[^A-Za-z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.toLowerCase());
    if (words.length === 0) return "message";
    const [first, ...rest] = words;
    const result = `${first}${rest.map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`).join("")}`;
    return /^\d/.test(result) ? `message${result}` : result;
}

function scopeFor(file: string): string {
    if (file.startsWith("app/auth/") || file.includes("/auth/")) return "auth";
    if (file.startsWith("app/01-enterprise-core/")) return "enterpriseCore";
    if (file.startsWith("app/02-commercial/")) return "commercial";
    if (file.startsWith("app/03-finance/")) return "finance";
    if (file.startsWith("app/04-supply-chain/")) return "supplyChain";
    if (file.startsWith("app/06-human-capital/")) return "humanCapital";
    if (file.startsWith("app/08-assets/")) return "assets";
    if (file.startsWith("components/ui/")) return "ui";
    if (file.startsWith("components/tax/")) return "tax";
    if (file.startsWith("components/number-range/")) return "numberRange";
    if (file.startsWith("components/")) return "components";
    if (file.startsWith("stores/")) return "state";
    if (file.startsWith("lib/navigation/")) return "navigation";
    if (file.startsWith("lib/")) return "platform";
    return "shared";
}

function featureFor(file: string, scope: string, shared: boolean): string {
    if (shared) return "general";
    const segments = file.replace(/\.(?:ts|tsx)$/, "").split("/");
    const sourceName = segments.at(-1) === "page" ? segments.at(-3) ?? "page" : segments.at(-1) ?? "general";
    const normalized = sourceName
        .replace(/(?:Tab|Panel|Module|Workspace|Manager|List|Page|Form)$/u, "")
        .replace(/^\d+-/u, "");
    const feature = camel(normalized);
    return feature === scope || feature === "message" ? "general" : feature;
}

function intentFor(englishValue: string): string {
    const plain = englishValue
        .replace(/<[^>]+>/g, " ")
        .replace(/\{value\d+\}/g, " ")
        .replace(/&(?:amp|lt|gt|quot|#039);/g, " ")
        .replace(/\b(?:the|a|an|of|for|to|and|or|with|in|on|at|from|by)\b/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (!plain || /^[—\-–]+$/.test(plain)) return "notAvailable";
    const words = plain.split(/\s+/).slice(0, 8).join(" ");
    const intent = camel(words);
    return intent === "message" ? "message" : intent.slice(0, 72);
}

const proposed = source.items.map((item) => {
    const englishValue = english.translations[item.id] ?? item.source;
    const primaryFile = item.occurrences[0]?.file ?? "shared";
    const shared = item.occurrences.length > 1;
    const scope = shared ? "common" : scopeFor(primaryFile);
    const feature = featureFor(primaryFile, scope, shared);
    return {
        oldKey: item.id,
        baseKey: `${scope}.${feature}.${intentFor(englishValue)}`,
        source: item.source,
        english: englishValue,
        primaryFile,
    };
});

const counters = new Map<string, number>();
const entries = proposed
    .sort((left, right) => left.baseKey.localeCompare(right.baseKey) || left.oldKey.localeCompare(right.oldKey))
    .map((entry) => {
        const count = (counters.get(entry.baseKey) ?? 0) + 1;
        counters.set(entry.baseKey, count);
        return { ...entry, newKey: count === 1 ? entry.baseKey : `${entry.baseKey}.alternative${count}` };
    })
    .sort((left, right) => left.oldKey.localeCompare(right.oldKey));

const map = new Map(entries.map((entry) => [entry.oldKey, entry.newKey]));
const report: KeyMap = {
    generatedAt: new Date().toISOString(),
    format: "scope.feature.descriptiveEnglishIntent",
    entries: entries.map(({ oldKey, newKey, source: sourceValue, english: englishValue, primaryFile }) => ({ oldKey, newKey, source: sourceValue, english: englishValue, primaryFile })),
};
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

function filesUnder(directory: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const absolute = path.join(directory, entry.name);
        const relative = path.relative(root, absolute).replace(/\\/g, "/");
        if (entry.isDirectory()) return ignoredDirectories.has(entry.name) ? [] : filesUnder(absolute);
        if (!/\.(?:ts|tsx|md|json)$/u.test(entry.name) || ignoredFiles.has(relative)) return [];
        return [absolute];
    });
}

if (apply) {
    for (const item of source.items) item.id = map.get(item.id) ?? item.id;
    source.items.sort((left, right) => left.id.localeCompare(right.id));
    source.generatedAt = new Date().toISOString();

    const translations: Record<string, string> = {};
    for (const [oldKey, value] of Object.entries(english.translations)) translations[map.get(oldKey) ?? oldKey] = value;
    english.translations = Object.fromEntries(Object.entries(translations).sort(([left], [right]) => left.localeCompare(right)));
    english.generatedAt = new Date().toISOString();
    fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);
    fs.writeFileSync(englishPath, `${JSON.stringify(english, null, 2)}\n`);

    const orderedMappings = [...map.entries()].sort(([left], [right]) => right.length - left.length || left.localeCompare(right));
    let changedFiles = 0;
    for (const file of filesUnder(root)) {
        let content = fs.readFileSync(file, "utf8");
        const original = content;
        for (const [oldKey, newKey] of orderedMappings) content = content.replaceAll(oldKey, newKey);
        if (content !== original) {
            fs.writeFileSync(file, content);
            changedFiles += 1;
        }
    }
    console.log(`semantic-key migration: ${entries.length} keys mapped; ${changedFiles} source files rewritten`);
} else {
    console.log(`semantic-key migration preview: ${entries.length} keys mapped; run with --apply to rewrite catalogs and references`);
}

const collisions = [...counters.entries()].filter(([, count]) => count > 1).length;
console.log(JSON.stringify({ entries: entries.length, collisions, report: path.relative(root, reportPath) }, null, 2));
