import { catalogMessage } from "@/lib/i18n";
import { TemplateField } from "@/components/template-editor/types";

// ── HR Approved Keys ──
export const HR_APPROVED_KEYS: TemplateField[] = [
    // Common
    { key: "company_name", description: catalogMessage("common.general.organizationName"), type: "string" },
    { key: "company_address", description: catalogMessage("common.general.organizationAddress"), type: "string" },
    { key: "company_tax_id", description: catalogMessage("common.general.taxNumber"), type: "string" },
    { key: "company_logo", description: catalogMessage("common.general.companyLogo"), type: "string" },
    { key: "today_date", description: catalogMessage("common.general.todaySDate"), type: "date" },
    { key: "reference_number", description: catalogMessage("common.general.referenceNumber"), type: "string" },
    // HR Specific
    { key: "employee_name", description: catalogMessage("common.general.employeeName"), type: "string", templateTypes: ["contract", "clearance", "warning", "id_card", "handover", "certificate", "memo", "other", "employee_certificate", "employee_contract"] },
    { key: "employee_code", description: catalogMessage("common.general.employeeNumber"), type: "string", templateTypes: ["contract", "clearance", "warning", "id_card", "handover", "certificate", "other", "employee_certificate", "employee_contract"] },
    { key: "employee_national_id", description: catalogMessage("humanCapital.templatesData.nationalIdNumber"), type: "string", templateTypes: ["contract", "certificate", "other", "employee_certificate"] },
    { key: "department", description: catalogMessage("common.general.section"), type: "string", templateTypes: ["contract", "clearance", "warning", "id_card", "handover", "certificate", "memo", "other", "employee_certificate"] },
    { key: "role", description: catalogMessage("common.general.jobTitle.alternative3"), type: "string", templateTypes: ["contract", "clearance", "warning", "id_card", "handover", "certificate", "other", "employee_certificate"] },
    { key: "hire_date", description: catalogMessage("common.general.hireDate"), type: "date", templateTypes: ["contract", "clearance", "warning", "id_card", "certificate", "other", "employee_certificate"] },
    { key: "certificate_date", description: catalogMessage("humanCapital.templatesData.certificateDate"), type: "date", templateTypes: ["employee_certificate"] },
    { key: "contract_type", description: catalogMessage("common.general.contractType"), type: "string", templateTypes: ["contract", "certificate", "employee_contract"] },
    { key: "start_date", description: catalogMessage("common.general.startDate.alternative2"), type: "date", templateTypes: ["employee_contract"] },
    { key: "end_date", description: catalogMessage("common.general.endDate.alternative2"), type: "date", templateTypes: ["employee_contract"] },
    { key: "base_salary", description: catalogMessage("common.general.basicSalary"), type: "number", templateTypes: ["contract", "employee_contract"] },
    { key: "email", description: catalogMessage("common.general.email"), type: "string", templateTypes: ["contract", "other"] },
    { key: "phone", description: catalogMessage("humanCapital.templatesData.mobileNumber"), type: "string", templateTypes: ["contract", "other"] }
];

// ── Mock data for preview ──
export const HR_MOCK_CONTEXT: Record<string, string> = {
    company_name: catalogMessage("common.general.alNoorTechnologyCompany"),
    company_address: catalogMessage("common.general.tahliaStreetRiyadh"),
    company_tax_id: "300123456700003",
    company_logo: "https://via.placeholder.com/150",
    today_date: "2026-02-21",
    reference_number: "HR-2026-00142",
    employee_name: catalogMessage("humanCapital.templatesData.ahmedMohammedAlOtaibi"),
    employee_code: "EMP-0057",
    employee_national_id: "1098765432",
    department: catalogMessage("common.general.informationTechnology"),
    role: catalogMessage("humanCapital.templatesData.seniorSoftwareDeveloper"),
    hire_date: "2023-06-15",
    certificate_date: "2026-02-21",
    contract_type: catalogMessage("common.general.fullTime"),
    start_date: "2023-06-15",
    end_date: "2025-06-14",
    base_salary: catalogMessage("humanCapital.templatesData.message12500"),
    email: catalogMessage("humanCapital.templatesData.ahmedMAlnoorTechSa"),
    phone: catalogMessage("humanCapital.templatesData.message966551234567")
};

// ── Bilingual labels for every template type ──
export const templateTypeLabels: Record<string, string> = {
    contract: catalogMessage("common.general.employmentContract"),
    clearance: catalogMessage("humanCapital.templatesData.clearanceForm"),
    warning: catalogMessage("humanCapital.templatesData.warningLetter"),
    id_card: catalogMessage("humanCapital.templatesData.idCard"),
    handover: catalogMessage("humanCapital.templatesData.deliveryForm"),
    certificate: catalogMessage("common.general.certificate"),
    memo: catalogMessage("humanCapital.templatesData.memo"),
    other: catalogMessage("common.general.other"),
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


