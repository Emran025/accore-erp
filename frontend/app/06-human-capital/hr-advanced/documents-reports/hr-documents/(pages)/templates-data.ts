import { catalogMessage } from "@/lib/i18n";
import { TemplateField } from "@/components/template-editor/types";

// ── HR Approved Keys ──
export const HR_APPROVED_KEYS: TemplateField[] = [
    // Common
    { key: "company_name", description: catalogMessage("text_fa3c0f576ae4"), type: "string" },
    { key: "company_address", description: catalogMessage("text_ec14191cefe9"), type: "string" },
    { key: "company_tax_id", description: catalogMessage("text_74b3eeb4b88d"), type: "string" },
    { key: "company_logo", description: catalogMessage("text_63ecf3c484aa"), type: "string" },
    { key: "today_date", description: catalogMessage("text_669d64b5c69e"), type: "date" },
    { key: "reference_number", description: catalogMessage("text_d84c49840d85"), type: "string" },
    // HR Specific
    { key: "employee_name", description: catalogMessage("text_394f067f92ff"), type: "string", templateTypes: ["contract", "clearance", "warning", "id_card", "handover", "certificate", "memo", "other", "employee_certificate", "employee_contract"] },
    { key: "employee_code", description: catalogMessage("text_092f08fd75ac"), type: "string", templateTypes: ["contract", "clearance", "warning", "id_card", "handover", "certificate", "other", "employee_certificate", "employee_contract"] },
    { key: "employee_national_id", description: catalogMessage("text_ad9bbbaac911"), type: "string", templateTypes: ["contract", "certificate", "other", "employee_certificate"] },
    { key: "department", description: catalogMessage("text_0771c3ff9336"), type: "string", templateTypes: ["contract", "clearance", "warning", "id_card", "handover", "certificate", "memo", "other", "employee_certificate"] },
    { key: "role", description: catalogMessage("text_de98bd734462"), type: "string", templateTypes: ["contract", "clearance", "warning", "id_card", "handover", "certificate", "other", "employee_certificate"] },
    { key: "hire_date", description: catalogMessage("text_057fc55c3df6"), type: "date", templateTypes: ["contract", "clearance", "warning", "id_card", "certificate", "other", "employee_certificate"] },
    { key: "certificate_date", description: catalogMessage("text_b5ea404ce66b"), type: "date", templateTypes: ["employee_certificate"] },
    { key: "contract_type", description: catalogMessage("text_2b9fa3db572a"), type: "string", templateTypes: ["contract", "certificate", "employee_contract"] },
    { key: "start_date", description: catalogMessage("text_90f719b91522"), type: "date", templateTypes: ["employee_contract"] },
    { key: "end_date", description: catalogMessage("text_ec3093bd6fd5"), type: "date", templateTypes: ["employee_contract"] },
    { key: "base_salary", description: catalogMessage("text_73ad6b20ceb7"), type: "number", templateTypes: ["contract", "employee_contract"] },
    { key: "email", description: catalogMessage("text_ddf0fca39a4f"), type: "string", templateTypes: ["contract", "other"] },
    { key: "phone", description: catalogMessage("text_6dbe8474b01b"), type: "string", templateTypes: ["contract", "other"] }
];

// ── Mock data for preview ──
export const HR_MOCK_CONTEXT: Record<string, string> = {
    company_name: catalogMessage("text_2bd95777c0bf"),
    company_address: catalogMessage("text_7e2f9e632d62"),
    company_tax_id: "300123456700003",
    company_logo: "https://via.placeholder.com/150",
    today_date: "2026-02-21",
    reference_number: "HR-2026-00142",
    employee_name: catalogMessage("text_5d0a7ba11fd3"),
    employee_code: "EMP-0057",
    employee_national_id: "1098765432",
    department: catalogMessage("text_4a607dd1d9aa"),
    role: catalogMessage("text_2f863a664d61"),
    hire_date: "2023-06-15",
    certificate_date: "2026-02-21",
    contract_type: catalogMessage("text_ae607c34c510"),
    start_date: "2023-06-15",
    end_date: "2025-06-14",
    base_salary: catalogMessage("text_e98b07f5de8c"),
    email: catalogMessage("text_47d7da5f7098"),
    phone: catalogMessage("text_c1b9f1f1e525")
};

// ── Bilingual labels for every template type ──
export const templateTypeLabels: Record<string, string> = {
    contract: catalogMessage("text_30cf74d82031"),
    clearance: catalogMessage("text_b6d707dc6f6e"),
    warning: catalogMessage("text_72f9dd59fd3b"),
    id_card: catalogMessage("text_31090eaeff87"),
    handover: catalogMessage("text_799c828ecfa8"),
    certificate: catalogMessage("text_163de5ae01c9"),
    memo: catalogMessage("text_75ebe67d0f46"),
    other: catalogMessage("text_17a9f38e22b6"),
};

// ── Badge colors ──
export const templateTypeBadgeClass: Record<string, string> = {
    contract: "badge-primary",
    clearance: "badge-danger",
    warning: "badge-warning",
    id_card: "badge-info",
    handover: "badge-secondary",
    certificate: "badge-success",
    memo: "badge-default",
    other: "badge-secondary",
};


