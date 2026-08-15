import fs from "node:fs";
import path from "node:path";

interface Candidate {
    file: string;
    status: "pending" | "extracted" | "approved-exception" | "technical";
}

const root = path.resolve(__dirname, "..");
const inventory = JSON.parse(fs.readFileSync(path.join(root, "i18n", "inventory", "candidates.json"), "utf8")) as { candidates: Candidate[] };
const grouped = new Map<string, Candidate[]>();
for (const candidate of inventory.candidates) {
    const list = grouped.get(candidate.file) ?? [];
    list.push(candidate);
    grouped.set(candidate.file, list);
}

const files = [...grouped.entries()]
    .map(([file, candidates]) => ({
        file,
        candidates: candidates.length,
        pending: candidates.filter((candidate) => candidate.status === "pending").length,
        extracted: candidates.filter((candidate) => candidate.status === "extracted").length,
        approvedExceptions: candidates.filter((candidate) => candidate.status === "approved-exception").length,
        technical: candidates.filter((candidate) => candidate.status === "technical").length,
        passed: candidates.every((candidate) => candidate.status !== "pending"),
    }))
    .sort((left, right) => left.file.localeCompare(right.file));

const pending = files.filter((file) => !file.passed);
const output = {
    generatedAt: new Date().toISOString(),
    filesScanned: files.length,
    candidatesScanned: inventory.candidates.length,
    filesPassing: files.length - pending.length,
    filesFailing: pending.length,
    files,
};
const reportDirectory = path.join(root, "i18n", "inventory");
fs.writeFileSync(path.join(reportDirectory, "coverage.json"), `${JSON.stringify(output, null, 2)}\n`);
fs.writeFileSync(path.join(reportDirectory, "coverage.md"), `# Interface Localization Coverage\n\n| Metric | Value |\n|---|---:|\n| Files scanned | ${output.filesScanned} |\n| Candidate literals scanned | ${output.candidatesScanned} |\n| Files passing | ${output.filesPassing} |\n| Files failing | ${output.filesFailing} |\n\n## Per-file verification\n\n| File | Candidates | Pending | Technical | Passed |\n|---|---:|---:|---:|---|\n${files.map((file) => `| \`${file.file}\` | ${file.candidates} | ${file.pending} | ${file.technical} | ${file.passed ? "Yes" : "No"} |`).join("\n")}\n`);
console.log(`i18n coverage: ${output.filesPassing}/${output.filesScanned} files passing; ${output.filesFailing} failing`);
if (process.argv.includes("--check") && pending.length > 0) process.exitCode = 1;
