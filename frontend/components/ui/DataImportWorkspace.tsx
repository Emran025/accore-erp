"use client";

import { importClassAliases, importCopy } from "@/lib/i18n/import-copy";
import type { ImportApprovalRequirement, ImportCommitContext, ImportField, ImportFieldVisibility, ImportMappingDecision, ImportNormalizer, ImportResult, ImportRow, ImportValidator } from "@/lib/imports/import-model";
export type { ImportApprovalRequirement, ImportCommitContext, ImportField, ImportFieldType, ImportFieldVisibility, ImportMappingDecision, ImportNormalizer, ImportResult, ImportRow, ImportValidator } from "@/lib/imports/import-model";
import { Button } from "./Button";
import { Select } from "./select";
import { showToast } from "./Toast";
import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

interface ParsedSource {
    fileName: string;
    headers: string[];
    rows: Record<string, string>[];
}

interface DataImportWorkspaceProps {
    title: string;
    subtitle: string;
    fields: readonly ImportField[];
    onImport: (rows: ImportRow[], context: ImportCommitContext) => Promise<ImportResult>;
    onClose: () => void;
    maxRows?: number;
    schemaVersion?: string;
    approvalRequirements?: (rows: ImportRow[], fields: readonly ImportField[]) => ImportApprovalRequirement[];
    normalizeRow?: ImportNormalizer;
    validateRow?: ImportValidator;
    isFieldVisible?: ImportFieldVisibility;
}

const STEP_LABELS = [importCopy("source"), importCopy("linkFields"), importCopy("review"), importCopy("complete")];

function normalizeKey(value: string): string {
    return value
        .trim()
        .toLocaleLowerCase()
        .replace(/[\u064B-\u065F\u0670]/g, "")
        .replace(/[^a-z0-9\u0600-\u06ff]+/g, "");
}

function textValue(value: unknown): string {
    return value === null || value === undefined ? "" : String(value).trim();
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
    const normalized = textValue(value).toLocaleLowerCase();
    if (["true", "1", "yes", "y", importCopy("yes"), importCopy("available")].includes(normalized)) return true;
    if (["false", "0", "no", "n", importCopy("no"), importCopy("unavailable")].includes(normalized)) return false;
    return fallback;
}

function parseNumber(value: unknown, fallback = 0): number {
    const normalized = textValue(value).replace(/,/g, "");
    if (!normalized) return fallback;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : fallback;
}

function parseWorkbook(file: File): Promise<ParsedSource> {
    return file.arrayBuffer().then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) throw new Error(importCopy("unreadableWorkbook"));
        const matrix = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, defval: "" });
        const rawHeaders = (matrix[0] || []).map((value) => textValue(value));
        const headers = rawHeaders.map((header, index) => header || `Column ${index + 1}`);
        const rows = matrix.slice(1)
            .filter((row) => row.some((value) => textValue(value) !== ""))
            .map((row) => headers.reduce<Record<string, string>>((record, header, index) => {
                record[header] = textValue(row[index]);
                return record;
            }, {}));
        if (!headers.length || !rows.length) throw new Error(importCopy("emptyWorkbook"));
        return { fileName: file.name, headers, rows };
    });
}

function autoMap(headers: string[], fields: readonly ImportField[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    fields.forEach((field) => {
        const accepted = [field.id, ...field.aliases].map(normalizeKey);
        const match = headers.find((header) => accepted.includes(normalizeKey(header)));
        if (match) mapping[field.id] = match;
    });
    return mapping;
}

function mappingDecisions(headers: string[], fields: readonly ImportField[], mapping: Record<string, string>, manualFieldId?: string): ImportMappingDecision[] {
    const headerUsage = Object.values(mapping).reduce<Record<string, number>>((usage, header) => {
        if (header) usage[normalizeKey(header)] = (usage[normalizeKey(header)] || 0) + 1;
        return usage;
    }, {});
    return fields.map((field) => {
        const sourceHeader = mapping[field.id] || "";
        if (!sourceHeader || !headers.includes(sourceHeader)) return { sourceHeader, fieldId: field.id, confidence: "manual", status: "unresolved" };
        const exact = normalizeKey(sourceHeader) === normalizeKey(field.id);
        const status = headerUsage[normalizeKey(sourceHeader)] > 1 ? "conflict" : "mapped";
        return { sourceHeader, fieldId: field.id, confidence: manualFieldId === field.id ? "manual" : exact ? "exact" : "alias", status };
    });
}

function fieldValueForRow(row: Record<string, string>, mapping: Record<string, string>, field: ImportField): unknown {
    const source = mapping[field.id];
    if (!source) return "";
    return row[source] ?? "";
}

function defaultNormalizeRow(source: Record<string, string>, mapping: Record<string, string>, fields: readonly ImportField[]): ImportRow {
    const raw: ImportRow = {};
    fields.forEach((field) => {
        const value = fieldValueForRow(source, mapping, field);
        if (field.type === "number") raw[field.id] = parseNumber(value, 0);
        else if (field.type === "boolean") raw[field.id] = parseBoolean(value, true);
        else raw[field.id] = textValue(value);
    });

    const itemType = textValue(raw.item_type).toLocaleLowerCase();
    const isService = importClassAliases.service.some((value) => value === itemType);
    const isRawMaterial = importClassAliases.rawMaterial.some((value) => value === itemType);
    raw.item_type = isService ? "service" : isRawMaterial ? "raw_material" : "product";
    raw.inventory_control = raw.item_type === "service" ? false : (mapping.inventory_control ? raw.inventory_control : true);
    raw.sellable = raw.item_type === "raw_material" ? false : (mapping.sellable ? raw.sellable : true);
    raw.taxable = mapping.taxable ? raw.taxable : true;
    raw.unit_name = textValue(raw.unit_name) || "piece";
    raw.items_per_unit = parseNumber(raw.items_per_unit, 1) || 1;
    raw.stock_quantity = raw.inventory_control ? parseNumber(raw.stock_quantity, 0) : 0;
    raw.low_stock_threshold = parseNumber(raw.low_stock_threshold, 10);
    raw.unit_price = parseNumber(raw.unit_price, parseNumber(raw.selling_price, 0));
    raw.purchase_price = parseNumber(raw.purchase_price, 0);
    raw.minimum_profit_margin = mapping.minimum_profit_margin
        ? parseNumber(raw.minimum_profit_margin, 0)
        : raw.purchase_price && raw.unit_price
            ? Number((((Number(raw.unit_price) - Number(raw.purchase_price)) / Number(raw.purchase_price)) * 100).toFixed(2))
            : 0;
    return raw;
}

function defaultValidateRow(row: ImportRow, fields: readonly ImportField[]): string[] {
    const errors: string[] = [];
    fields.filter((field) => field.required && (!field.dependsOn || row[field.dependsOn] !== "service")).forEach((field) => {
        if (textValue(row[field.id]) === "") errors.push(importCopy("requiredField", { value0: field.label }));
    });
    ["unit_price", "purchase_price", "stock_quantity", "items_per_unit", "low_stock_threshold", "minimum_profit_margin"].forEach((key) => {
        if (key in row && (!Number.isFinite(Number(row[key])) || Number(row[key]) < 0)) errors.push(importCopy("nonNegativeNumber", { value0: key }));
    });
    if (!["product", "service", "raw_material"].includes(textValue(row.item_type))) errors.push(importCopy("unsupportedClass"));
    if (Number(row.items_per_unit) < 1) errors.push(importCopy("itemsPerUnitMin"));
    return errors;
}

const FIELD_GROUPS: Array<{ key: ImportField["group"]; label: string }> = [
    { key: "identity", label: importCopy("identity") },
    { key: "classification", label: importCopy("classFirst") },
    { key: "commercial", label: importCopy("commercial") },
    { key: "inventory", label: importCopy("inventory") },
    { key: "additional", label: importCopy("additional") },
];

export function DataImportWorkspace({ title, subtitle, fields, onImport, onClose, maxRows = 1000, schemaVersion = "import.v1", approvalRequirements, normalizeRow: normalizeRowOverride, validateRow: validateRowOverride, isFieldVisible: isFieldVisibleOverride }: DataImportWorkspaceProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [source, setSource] = useState<ParsedSource | null>(null);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [mappingAudit, setMappingAudit] = useState<ImportMappingDecision[]>([]);
    const [rows, setRows] = useState<ImportRow[]>([]);
    const [rowErrors, setRowErrors] = useState<string[][]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [approvalAccepted, setApprovalAccepted] = useState(false);
    const [reviewSearch, setReviewSearch] = useState("");
    const [reviewPage, setReviewPage] = useState(0);
    const normalizeRow = normalizeRowOverride ?? defaultNormalizeRow;
    const validateRow = validateRowOverride ?? defaultValidateRow;
    const isFieldVisible = isFieldVisibleOverride ?? ((field: ImportField, currentRows: readonly ImportRow[]) => {
        if (!field.dependsOn || !field.dependsOnValues?.length || currentRows.length === 0) return true;
        return currentRows.some((row) => field.dependsOnValues?.includes(String(row[field.dependsOn as string] ?? "")));
    });

    const visibleFields = useMemo(() => fields.filter((field) => {
        return isFieldVisible(field, rows);
    }), [fields, rows]);
    const approvalItems = useMemo(() => approvalRequirements?.(rows, fields) ?? [], [approvalRequirements, fields, rows]);
    const approvalRequired = approvalItems.some((requirement) => requirement.level === "required");
    const filteredReviewRows = useMemo(() => {
        const query = reviewSearch.trim().toLocaleLowerCase();
        return rows.map((row, index) => ({ row, index })).filter(({ row }) => !query || [row.name, row.item_type, row.barcode, row.description].some((value) => textValue(value).toLocaleLowerCase().includes(query)));
    }, [reviewSearch, rows]);
    const reviewPageSize = 25;
    const reviewPageCount = Math.max(1, Math.ceil(filteredReviewRows.length / reviewPageSize));
    const reviewRows = filteredReviewRows.slice(reviewPage * reviewPageSize, (reviewPage + 1) * reviewPageSize);

    const readFile = async (file?: File) => {
        if (!file) return;
        try {
            setIsLoading(true);
            const parsed = await parseWorkbook(file);
            const limitedRows = parsed.rows.slice(0, maxRows);
            const nextMapping = autoMap(parsed.headers, fields);
            const nextRows = limitedRows.map((row) => normalizeRow(row, nextMapping, fields));
            setSource({ ...parsed, rows: limitedRows });
            setMapping(nextMapping);
            setMappingAudit(mappingDecisions(parsed.headers, fields, nextMapping));
            setRows(nextRows);
            setRowErrors(nextRows.map((row) => validateRow(row, fields)));
            setResult(null);
            setReviewSearch("");
            setReviewPage(0);
            setActiveStep(1);
        } catch (error) {
            showToast(error instanceof Error ? error.message : importCopy("readFileFailed"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    const remapRows = (nextMapping: Record<string, string>) => {
        if (!source) return;
        const nextRows = source.rows.map((row) => normalizeRow(row, nextMapping, fields));
        setMapping(nextMapping);
        setMappingAudit(mappingDecisions(source.headers, fields, nextMapping, Object.keys(nextMapping).find((key) => nextMapping[key] !== mapping[key])));
        setRows(nextRows);
        setApprovalAccepted(false);
        setRowErrors(nextRows.map((row) => validateRow(row, fields)));
    };

    const updateRow = (rowIndex: number, field: ImportField, value: string) => {
        setApprovalAccepted(false);
        setRows((current) => current.map((row, index) => {
            if (index !== rowIndex) return row;
            const next = { ...row };
            if (field.type === "number") next[field.id] = parseNumber(value, 0);
            else if (field.type === "boolean") next[field.id] = parseBoolean(value, false);
            else next[field.id] = value;
            if (field.id === "item_type") {
                next.inventory_control = value === "service" ? false : next.inventory_control ?? true;
                next.sellable = value === "raw_material" ? false : next.sellable ?? true;
            }
            return next;
        }));
        setRowErrors((current) => current.map((errors, index) => index === rowIndex ? validateRow({ ...rows[rowIndex], [field.id]: value }, fields) : errors));
    };

    const goToReview = () => {
        const errors = rows.map((row) => validateRow(row, fields));
        setRowErrors(errors);
        if (errors.some((item) => item.length)) {
            showToast(importCopy("resolveIssues"), "error");
            return;
        }
        setActiveStep(2);
    };

    const commitImport = async () => {
        const errors = rows.map((row) => validateRow(row, fields));
        setRowErrors(errors);
        if (!rows.length || errors.some((item) => item.length)) {
            showToast(importCopy("unresolvedRecords"), "error");
            return;
        }
        if (approvalRequired && !approvalAccepted) {
            showToast(importCopy("approvalRequired"), "error");
            return;
        }
        try {
            setIsLoading(true);
            const importResult = await onImport(rows, {
                batchId: crypto.randomUUID(),
                schemaVersion,
                sourceFile: source?.fileName,
                approvalAcknowledged: approvalAccepted,
                approvalFieldIds: approvalItems.flatMap((requirement) => requirement.fieldIds),
            });
            setResult(importResult);
            setActiveStep(3);
        } catch (error) {
            showToast(error instanceof Error ? error.message : importCopy("importFailed"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    const classSummary = rows.reduce<Record<string, number>>((summary, row) => {
        const key = textValue(row.item_type) || "product";
        summary[key] = (summary[key] || 0) + 1;
        return summary;
    }, {});

    return (
        <section className="data-import-workspace" aria-label={title}>
            <header className="data-import-header">
                <div>
                    <span className="data-import-eyebrow">{importCopy("reusableBridge")}</span>
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
                <div className="data-import-header-actions">
                    <span className="data-import-format-note">{importCopy("fileFormats")}</span>
                    <Button variant="secondary" onClick={onClose}>{importCopy("close")}</Button>
                </div>
            </header>

            <div className="data-import-steps" role="list" aria-label={importCopy("importProgress")}>
                {STEP_LABELS.map((label, index) => (
                    <button type="button" key={label} className={`data-import-step ${activeStep === index ? "active" : ""} ${activeStep > index ? "complete" : ""}`} onClick={() => index < activeStep && setActiveStep(index)}>
                        <span>{activeStep > index ? "✓" : index + 1}</span>
                        <strong>{label}</strong>
                    </button>
                ))}
            </div>

            {activeStep === 0 && (
                <div className="data-import-source-panel">
                    <div className={`data-import-dropzone ${isDragging ? "is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); void readFile(event.dataTransfer.files[0]); }}>
                        <div className="data-import-drop-icon">⇩</div>
                        <h3>{importCopy("dropFile")}</h3>
                        <p>{importCopy("dropFileDescription")}</p>
                        <Button variant="primary" onClick={() => inputRef.current?.click()} disabled={isLoading}>{isLoading ? importCopy("readingFile") : importCopy("chooseFile")}</Button>
                        <input ref={inputRef} type="file" hidden accept=".xlsx,.xls,.csv,.tsv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" onChange={(event) => void readFile(event.target.files?.[0])} />
                    </div>
                    <div className="data-import-source-guidance">
                        <div><strong>{importCopy("externalModel")}</strong><span>{importCopy("externalModelDescription")}</span></div>
                        <div><strong>{importCopy("internalModel")}</strong><span>{importCopy("internalModelDescription")}</span></div>
                        <div><strong>{importCopy("safeHandoff")}</strong><span>{importCopy("safeHandoffDescription")}</span></div>
                    </div>
                </div>
            )}

            {activeStep === 1 && source && (
                <div className="data-import-mapping-panel">
                    <aside className="data-import-source-summary">
                        <span className="data-import-eyebrow">{importCopy("detectedSource")}</span>
                        <strong>{source.fileName}</strong>
                        <span>{importCopy("recordsAndColumns", { value0: source.rows.length, value1: source.headers.length })}</span>
                        <div className="data-import-header-chips">{source.headers.map((header) => <span key={header}>{header}</span>)}</div>
                        <button type="button" className="data-import-link-button" onClick={() => setActiveStep(0)}>{importCopy("chooseAnotherFile")}</button>
                    </aside>
                    <div className="data-import-field-linker">
                        <div className="data-import-section-heading"><div><span className="data-import-eyebrow">{importCopy("externalToInternal")}</span><h3>{importCopy("linkClass")}</h3></div><span className="data-import-match-count">{Object.keys(mapping).length}/{fields.length} suggested</span></div>
                        <p className="data-import-helper">{importCopy("linkClassDescription")}</p>
                        {FIELD_GROUPS.map((group) => {
                            const groupFields = fields.filter((field) => field.group === group.key && visibleFields.includes(field));
                            if (!groupFields.length) return null;
                            return <div className={`data-import-field-group ${group.key === "classification" ? "priority" : ""}`} key={group.key}>
                                <div className="data-import-group-label">{group.label}{group.key === "classification" && <span>{importCopy("unlocksFields")}</span>}</div>
                                {groupFields.map((field) => {
                                    const decision = mappingAudit.find((item) => item.fieldId === field.id);
                                    const decisionLabel = decision?.status === "conflict" ? importCopy("conflictMapping") : decision?.status === "unresolved" ? importCopy("unresolvedMapping") : decision?.confidence === "exact" ? importCopy("exactMatch") : decision?.confidence === "manual" ? importCopy("manualMatch") : importCopy("aliasMatch");
                                    return <div className="data-import-map-row" key={field.id}>
                                        <div><strong>{field.label}</strong>{field.required && <em>{importCopy("required")}</em>}<small>{field.aliases.slice(0, 2).join(" · ")}<span className={`data-import-mapping-badge ${decision?.status || "unresolved"}`}>{decisionLabel}</span></small></div>
                                        <Select value={mapping[field.id] || "__unmapped__"} onChange={(event) => remapRows({ ...mapping, [field.id]: event.target.value === "__unmapped__" ? "" : event.target.value })} options={[{ value: "__unmapped__", label: importCopy("leaveUnmapped") }, ...source.headers.map((header) => ({ value: header, label: header }))]} />
                                    </div>;
                                })}
                            </div>;
                        })}
                        <div className="data-import-actions"><Button variant="secondary" onClick={() => setActiveStep(0)}>{importCopy("back")}</Button><Button variant="primary" onClick={goToReview}>{importCopy("reviewRecords", { value0: rows.length })}</Button></div>
                    </div>
                </div>
            )}

            {activeStep === 2 && source && (
                <div className="data-import-review-panel">
                    <div className="data-import-review-summary"><div><span className="data-import-eyebrow">{importCopy("integrityCheckpoint")}</span><h3>{importCopy("reviewItems")}</h3><p>{importCopy("reviewItemsDescription")}</p></div><div className="data-import-class-summary">{Object.entries(classSummary).map(([key, value]) => <span key={key}><strong>{value}</strong>{key.replace("_", " ")}</span>)}</div></div>
                    <div className="data-import-review-toolbar"><label><span>{importCopy("searchImportedRecords")}</span><input value={reviewSearch} onChange={(event) => { setReviewSearch(event.target.value); setReviewPage(0); }} placeholder={importCopy("searchImportedRecords")} /></label><span>{importCopy("filteredRecords", { value0: filteredReviewRows.length })}</span></div>
                    <div className="data-import-gallery">{reviewRows.slice(0, 6).map(({ row, index }) => <article className={`data-import-product-card ${rowErrors[index]?.length ? "has-errors" : ""}`} key={`${textValue(row.name)}-${index}`}><div className="data-import-card-topline"><span>{textValue(row.item_type).replace("_", " ")}</span><small>{importCopy("row")} {index + 2}</small></div><h4>{textValue(row.name) || importCopy("unnamedItem")}</h4><div className="data-import-card-meta"><span>{textValue(row.unit_name) || importCopy("piece")}</span><span>{Number(row.stock_quantity || 0)} {importCopy("inStock")}</span></div><strong>{Number(row.unit_price || 0).toFixed(2)}</strong>{rowErrors[index]?.length ? <div className="data-import-error-text">{rowErrors[index].join(" · ")}</div> : <div className="data-import-success-text">{importCopy("readyForImport")}</div>}</article>)}</div>
                    <div className="data-import-raw-heading"><div><span className="data-import-eyebrow">{importCopy("rawValues")}</span><h3>{importCopy("correctFields")}</h3></div><span>{importCopy("records", { value0: filteredReviewRows.length })}</span></div>
                    <div className="data-import-raw-table-wrap"><table className="data-import-raw-table"><thead><tr><th>{importCopy("row")}</th>{visibleFields.map((field) => <th key={field.id}>{field.label}</th>)}</tr></thead><tbody>{reviewRows.map(({ row, index }) => <tr key={index}><td>{index + 2}</td>{visibleFields.map((field) => <td key={field.id}>{field.type === "boolean" ? <select value={row[field.id] ? "true" : "false"} onChange={(event) => updateRow(index, field, event.target.value)}><option value="true">{importCopy("yes")}</option><option value="false">{importCopy("no")}</option></select> : <input value={textValue(row[field.id])} type={field.type === "number" ? "number" : "text"} onChange={(event) => updateRow(index, field, event.target.value)} />}</td>)}</tr>)}</tbody></table></div>
                    <div className="data-import-pagination"><Button variant="secondary" onClick={() => setReviewPage((page) => Math.max(0, page - 1))} disabled={reviewPage === 0}>{importCopy("previousRows")}</Button><span>{reviewPage + 1} / {reviewPageCount}</span><Button variant="secondary" onClick={() => setReviewPage((page) => Math.min(reviewPageCount - 1, page + 1))} disabled={reviewPage >= reviewPageCount - 1}>{importCopy("nextRows")}</Button></div>
                    {approvalItems.length > 0 && <div className="data-import-approval-panel"><div><span className="data-import-eyebrow">{importCopy("approvalCheckpoint")}</span><h3>{importCopy("approvalDescription")}</h3>{approvalItems.map((requirement) => <p key={requirement.key}>{requirement.label}: {requirement.fieldIds.map((fieldId) => fields.find((field) => field.id === fieldId)?.label || fieldId).join(" · ")}</p>)}</div><label><input type="checkbox" checked={approvalAccepted} onChange={(event) => setApprovalAccepted(event.target.checked)} />{importCopy("acknowledgeApproval")}</label></div>}
                    <div className="data-import-actions"><Button variant="secondary" onClick={() => setActiveStep(1)}>{importCopy("backToMapping")}</Button><Button variant="primary" onClick={() => void commitImport()} disabled={isLoading || (approvalRequired && !approvalAccepted)}>{isLoading ? importCopy("importing") : importCopy("importItems", { value0: rows.length })}</Button></div>
                </div>
            )}

            {activeStep === 3 && result && (
                <div className="data-import-complete"><div className="data-import-complete-mark">✓</div><span className="data-import-eyebrow">{importCopy("importComplete")}</span><h3>{result.imported} {importCopy("recordsAvailable")}</h3><p>{result.message || importCopy("importCompleteDescription")}</p><Button variant="primary" onClick={onClose}>{importCopy("returnToProducts")}</Button></div>
            )}
        </section>
    );
}
