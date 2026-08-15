import fs from "node:fs";
import path from "node:path";

type Finding = { id: string; kind: string; arabic: string; occurrences: Array<{ file: string }> };
type SourceItem = { id: string; source: string; occurrences: Array<{ file: string }> };

const root = path.resolve(__dirname, "..");
const findings = JSON.parse(fs.readFileSync(path.join(root, "i18n/editorial/static-findings.json"), "utf8")) as { findings: Finding[] };
const source = JSON.parse(fs.readFileSync(path.join(root, "i18n/catalog/source.json"), "utf8")) as { items: SourceItem[] };
const sources = new Map(source.items.map((item) => [item.id, item.source]));
const allFindings = findings.findings;
const technicalEntries = allFindings.filter((finding) => finding.kind === "technical-remnant");
if (technicalEntries.length === 0) throw new Error("No technical-remnant findings are available.");

const byFile = new Map<string, Array<{ id: string; value: string }>>();
for (const finding of technicalEntries) {
    const value = sources.get(finding.id) ?? finding.arabic;
    if (value.includes("{value")) continue;
    for (const occurrence of finding.occurrences) {
        const list = byFile.get(occurrence.file) ?? [];
        list.push({ id: finding.id, value });
        byFile.set(occurrence.file, list);
    }
}

let replacements = 0;
const deferred: Array<{ id: string; value: string }> = [];
for (const finding of technicalEntries) {
    const value = sources.get(finding.id) ?? finding.arabic;
    if (value.includes("{value")) deferred.push({ id: finding.id, value });
}

for (const [file, values] of byFile) {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, "utf8");
    for (const { id, value } of values) {
        const literal = JSON.stringify(value);
        const patterns = [
            new RegExp(`i18n\\.catalog\\["${id}"\\]`, "g"),
            new RegExp(`catalogMessage\\("${id}"\\)`, "g"),
            new RegExp(`catalogMessage\\(i18n,\\s*"${id}"\\)`, "g"),
        ];
        for (const pattern of patterns) {
            const before = content;
            content = content.replace(pattern, literal);
            replacements += before === content ? 0 : 1;
        }
    }
    fs.writeFileSync(filePath, content);
}

const report = { generatedAt: new Date().toISOString(), revertedReferences: replacements, deferredDynamicEntries: deferred };
fs.writeFileSync(path.join(root, "i18n/editorial/technical-revert-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ revertedReferences: replacements, deferredDynamicEntries: deferred.length }, null, 2));
