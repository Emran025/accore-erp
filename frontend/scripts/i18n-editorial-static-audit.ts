import fs from "node:fs";
import path from "node:path";

type Occurrence = { file: string; line: number; column: number; context: string };
type SourceItem = { id: string; source: string; classification: string; occurrences: Occurrence[] };
type FindingKind = "untranslated" | "placeholder-drift" | "technical-remnant" | "terminology-variant" | "editorial-review";
type Finding = { id: string; kind: FindingKind; severity: "high" | "medium" | "low"; arabic: string; english: string; reason: string; occurrences: Occurrence[] };

const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(root, "i18n/catalog/source.json"), "utf8")) as { items: SourceItem[] };
const english = JSON.parse(fs.readFileSync(path.join(root, "i18n/catalog/en-US.json"), "utf8")) as { translations: Record<string, string> };
const outDir = path.join(root, "i18n/editorial");
fs.mkdirSync(outDir, { recursive: true });

const arabic = /[\u0600-\u06FF]/u;
const placeholder = /\{value\d+\}/g;
const technical = /^(?:[./@]|https?:\/\/)|(?:\.(?:tsx?|css|json)$)|(?:^|\s)(?:bg-|text-|border-|flex|grid|hover:|focus:|px-|py-|mx-|my-|w-|h-|min-|max-|items-|justify-|rounded-|shadow-|animate-|transition-|duration-|ease-|absolute(?=\s|$)|relative(?=\s|$)|fixed(?=\s|$))[\w:[\]./-]+|(?:rgba\(|linear-gradient\(|repeat\(|minmax\(|var\(--|@keyframes|translate[XYZ]?\(|scale[XYZ]?\(|rotate\(|skew[XY]?\(|matrix\(|calc\()|(?:^|\/)api\/|(?:next\/|react\/)|^(?:GET|POST|PUT|PATCH|DELETE)\s+\/|^(?:text\/html|application\/json)$/i;

const tokens = (value: string) => value.match(placeholder) ?? [];
const sameTokens = (left: string, right: string) => JSON.stringify(tokens(left)) === JSON.stringify(tokens(right));
const findings: Finding[] = [];
const translationsByArabic = new Map<string, Set<string>>();

for (const item of source.items) {
    const translated = english.translations[item.id] ?? "";
    const record: Finding = { id: item.id, kind: "editorial-review", severity: "low", arabic: item.source, english: translated, reason: "", occurrences: item.occurrences };
    if (!translated) {
        record.kind = "untranslated";
        record.severity = "high";
        record.reason = "The English catalog entry is empty.";
        findings.push(record);
        continue;
    }
    if (!sameTokens(item.source, translated)) {
        record.kind = "placeholder-drift";
        record.severity = "high";
        record.reason = `Placeholder mismatch: Arabic ${JSON.stringify(tokens(item.source))}; English ${JSON.stringify(tokens(translated))}.`;
        findings.push(record);
    }
    if (arabic.test(translated)) {
        record.kind = "untranslated";
        record.severity = "high";
        record.reason = "Arabic script remains in the English catalog value.";
        findings.push(record);
    }
    const isDocumentTemplate = /<(?:html|article|section|tr)\b/i.test(item.source) && arabic.test(item.source);
    if (!isDocumentTemplate && (technical.test(item.source) || technical.test(translated))) {
        record.kind = "technical-remnant";
        record.severity = "medium";
        record.reason = "The catalog value matches a deterministic technical-string pattern and requires source-context confirmation.";
        findings.push(record);
    }
    const set = translationsByArabic.get(item.source) ?? new Set<string>();
    set.add(translated);
    translationsByArabic.set(item.source, set);
}

for (const item of source.items) {
    const values = translationsByArabic.get(item.source);
    if (values && values.size > 1) {
        findings.push({
            id: item.id,
            kind: "terminology-variant",
            severity: "medium",
            arabic: item.source,
            english: english.translations[item.id] ?? "",
            reason: `The same Arabic source has ${values.size} English renderings: ${[...values].join(" | ")}.`,
            occurrences: item.occurrences,
        });
    }
}

const unique = [...new Map(findings.map((finding) => [`${finding.id}:${finding.kind}`, finding])).values()]
    .sort((left, right) => left.severity.localeCompare(right.severity) || left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id));
const summary = {
    generatedAt: new Date().toISOString(),
    catalogEntries: source.items.length,
    findings: unique.length,
    byKind: Object.fromEntries(["untranslated", "placeholder-drift", "technical-remnant", "terminology-variant", "editorial-review"].map((kind) => [kind, unique.filter((finding) => finding.kind === kind).length])),
    bySeverity: Object.fromEntries(["high", "medium", "low"].map((severity) => [severity, unique.filter((finding) => finding.severity === severity).length])),
};
fs.writeFileSync(path.join(outDir, "static-findings.json"), `${JSON.stringify({ summary, findings: unique }, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, "static-findings.md"), `# Deterministic Editorial Audit Findings\n\n| Metric | Value |\n|---|---:|\n| Catalog entries reviewed | ${summary.catalogEntries} |\n| Findings | ${summary.findings} |\n| High severity | ${summary.bySeverity.high} |\n| Medium severity | ${summary.bySeverity.medium} |\n\n| ID | Kind | Arabic source | English output | Reason |\n|---|---|---|---|---|\n${unique.map((finding) => `| \`${finding.id}\` | ${finding.kind} | ${finding.arabic.replaceAll("|", "\\|")} | ${finding.english.replaceAll("|", "\\|")} | ${finding.reason.replaceAll("|", "\\|")} |`).join("\n")}\n`);
console.log(JSON.stringify(summary, null, 2));
