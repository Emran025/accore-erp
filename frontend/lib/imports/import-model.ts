export type ImportFieldType = "text" | "number" | "boolean" | "class";

export type ImportFieldGroup = "identity" | "classification" | "commercial" | "inventory" | "additional";

export type ImportApprovalLevel = "none" | "review" | "required";

export interface ImportField {
    id: string;
    label: string;
    aliases: readonly string[];
    type: ImportFieldType;
    required?: boolean;
    group: ImportFieldGroup;
    dependsOn?: string;
    dependsOnValues?: readonly string[];
    approval?: ImportApprovalLevel;
    sensitive?: boolean;
    description?: string;
}

export type ImportRow = Record<string, unknown>;
export type ImportNormalizer = (source: Record<string, string>, mapping: Record<string, string>, fields: readonly ImportField[]) => ImportRow;
export type ImportValidator = (row: ImportRow, fields: readonly ImportField[]) => string[];
export type ImportFieldVisibility = (field: ImportField, rows: readonly ImportRow[]) => boolean;

export interface ImportApprovalRequirement {
    key: string;
    level: Exclude<ImportApprovalLevel, "none">;
    label: string;
    reason: string;
    fieldIds: readonly string[];
}

export interface ImportCommitContext {
    batchId: string;
    sourceFile?: string;
    approvalAcknowledged: boolean;
    approvalFieldIds: readonly string[];
}

export interface ImportResult {
    imported: number;
    failed?: number;
    message?: string;
    batchId?: string;
}

export interface ImportMappingDecision {
    sourceHeader: string;
    fieldId: string;
    confidence: "exact" | "alias" | "manual";
    status: "mapped" | "unresolved" | "conflict";
}
