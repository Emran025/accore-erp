import { catalogMessage } from "@/lib/i18n";
import { TemplateField } from "@/components/template-editor/types";

export const SYSTEM_APPROVED_KEYS: TemplateField[] = [
    // Common
    { key: "company_name", description: catalogMessage("text_fa3c0f576ae4"), type: "string" },
    { key: "company_address", description: catalogMessage("text_ec14191cefe9"), type: "string" },
    { key: "company_tax_id", description: catalogMessage("text_74b3eeb4b88d"), type: "string" },
    { key: "company_logo", description: catalogMessage("text_63ecf3c484aa"), type: "string" },
    { key: "today_date", description: catalogMessage("text_669d64b5c69e"), type: "date" },
    { key: "reference_number", description: catalogMessage("text_d84c49840d85"), type: "string" },
    // Sales Invoice
    { key: "invoice_number", description: catalogMessage("text_b6e71278be04"), type: "string", templateTypes: ["sales_invoice"] },
    { key: "invoice_date", description: catalogMessage("text_4994aa18979f"), type: "date", templateTypes: ["sales_invoice"] },
    { key: "customer_name", description: catalogMessage("text_70771eb8320f"), type: "string", templateTypes: ["sales_invoice", "quotation", "receipt", "customer_statement"] },
    { key: "customer_tax_id", description: catalogMessage("text_69d74dfbfee8"), type: "string", templateTypes: ["sales_invoice"] },
    { key: "subtotal", description: catalogMessage("text_1f4a626bcba2"), type: "number", templateTypes: ["sales_invoice"] },
    { key: "vat_amount", description: catalogMessage("text_c882881634cb"), type: "number", templateTypes: ["sales_invoice"] },
    { key: "total_amount", description: catalogMessage("text_bca944dae91a"), type: "number", templateTypes: ["sales_invoice", "quotation", "purchase_order"] },
    { key: "items", description: catalogMessage("text_c479a02de265"), type: "list", templateTypes: ["sales_invoice"] },
    // Quotation
    { key: "quotation_number", description: catalogMessage("text_e9828c8dd908"), type: "string", templateTypes: ["quotation"] },
    { key: "quotation_date", description: catalogMessage("text_237d8bf6b792"), type: "date", templateTypes: ["quotation"] },
    { key: "valid_until", description: catalogMessage("text_817b190b2a5c"), type: "date", templateTypes: ["quotation"] },
    // Receipt
    { key: "receipt_number", description: catalogMessage("text_b1f955190176"), type: "string", templateTypes: ["receipt"] },
    { key: "receipt_date", description: catalogMessage("text_f8078d469c1f"), type: "date", templateTypes: ["receipt"] },
    { key: "amount", description: catalogMessage("text_1cd480f91b24"), type: "number", templateTypes: ["receipt", "payment_note"] },
    { key: "payment_method", description: catalogMessage("text_ae2d60052976"), type: "string", templateTypes: ["receipt", "payment_note"] },
    // Purchase Order
    { key: "po_number", description: catalogMessage("text_3fe328e4e6ff"), type: "string", templateTypes: ["purchase_order"] },
    { key: "po_date", description: catalogMessage("text_cbbed919a6d9"), type: "date", templateTypes: ["purchase_order"] },
    { key: "supplier_name", description: catalogMessage("text_63df5e485ac7"), type: "string", templateTypes: ["purchase_order"] },
    { key: "supplier_tax_id", description: catalogMessage("text_6d1606624d69"), type: "string", templateTypes: ["purchase_order"] },
    // Customer Statement
    { key: "statement_date", description: catalogMessage("text_318b28144525"), type: "date", templateTypes: ["customer_statement"] },
    { key: "opening_balance", description: catalogMessage("text_bd86e7bcacd5"), type: "number", templateTypes: ["customer_statement"] },
    { key: "closing_balance", description: catalogMessage("text_18cc04f74ee6"), type: "number", templateTypes: ["customer_statement"] },
    { key: "transactions", description: catalogMessage("text_af7fb819a8a2"), type: "list", templateTypes: ["customer_statement"] },
    // Payment Note
    { key: "payment_number", description: catalogMessage("text_b1f955190176"), type: "string", templateTypes: ["payment_note"] },
    { key: "payment_date", description: catalogMessage("text_f8078d469c1f"), type: "date", templateTypes: ["payment_note"] },
    { key: "payee_name", description: catalogMessage("text_c4f5570ad690"), type: "string", templateTypes: ["payment_note"] }
];

export const SYSTEM_MOCK_CONTEXT: Record<string, any> = {
    company_name: catalogMessage("text_2bd95777c0bf"),
    company_address: catalogMessage("text_7e2f9e632d62"),
    company_tax_id: "300123456700003",
    company_logo: "https://via.placeholder.com/150",
    today_date: "2026-02-21",
    reference_number: "REF-2026-001",
    invoice_number: "INV-2026-0001",
    invoice_date: "2026-02-21",
    customer_name: catalogMessage("text_91c2d724888c"),
    customer_tax_id: "300987654300003",
    subtotal: catalogMessage("text_cf76664ae6af"),
    vat_amount: "225.00",
    total_amount: catalogMessage("text_8666acd87f99"),
    items: [],
    quotation_number: "QT-2026-005",
    quotation_date: "2026-02-21",
    valid_until: "2026-03-21",
    receipt_number: "RC-2026-010",
    receipt_date: "2026-02-21",
    amount: catalogMessage("text_cf76664ae6af"),
    payment_method: catalogMessage("text_5385ccd1ff51"),
    po_number: "PO-2026-0089",
    po_date: "2026-02-21",
    supplier_name: catalogMessage("text_2d38baea9b4d"),
    supplier_tax_id: "300123999900003",
    statement_date: "2026-02-21",
    opening_balance: catalogMessage("text_8722cd427be3"),
    closing_balance: catalogMessage("text_97e47b250054"),
    transactions: [],
    payment_number: "PN-2026-002",
    payment_date: "2026-02-21",
    payee_name: catalogMessage("text_ea502c20fbd0")
};

export const templateTypeLabels: Record<string, string> = {
    sales_invoice: catalogMessage("text_88b1dd50dc91"),
    quotation: catalogMessage("text_679403c38f0b"),
    receipt: catalogMessage("text_3412df9cc7ec"),
    purchase_order: catalogMessage("text_37526bc89afa"),
    customer_statement: catalogMessage("text_79b673d7fc3e"),
    payment_note: catalogMessage("text_4d470e083ff3"),
    other_system: catalogMessage("text_17a9f38e22b6")
};

export const templateTypeBadgeClass: Record<string, string> = {
    sales_invoice: "badge-primary",
    quotation: "badge-info",
    receipt: "badge-success",
    purchase_order: "badge-warning",
    customer_statement: "badge-purple",
    payment_note: "badge-rose",
    other_system: "badge-secondary"
};


