import { catalogMessage } from "@/lib/i18n";
import { TemplateField } from "@/components/template-editor/types";
import { importCopy } from "@/lib/i18n/import-copy";

export const SYSTEM_APPROVED_KEYS: TemplateField[] = [
    // Common
    { key: "company_name", description: catalogMessage("common.general.organizationName"), type: "string" },
    { key: "company_address", description: catalogMessage("common.general.organizationAddress"), type: "string" },
    { key: "company_tax_id", description: catalogMessage("common.general.taxNumber"), type: "string" },
    { key: "company_logo", description: catalogMessage("common.general.companyLogo"), type: "string" },
    { key: "today_date", description: catalogMessage("common.general.todaySDate"), type: "date" },
    { key: "reference_number", description: catalogMessage("common.general.referenceNumber"), type: "string" },
    // Sales Invoice
    { key: "invoice_number", description: catalogMessage("common.general.invoiceNumber.alternative2"), type: "string", templateTypes: ["sales_invoice"] },
    { key: "invoice_date", description: catalogMessage("common.general.invoiceDate"), type: "date", templateTypes: ["sales_invoice"] },
    { key: "customer_name", description: catalogMessage("common.general.customerName"), type: "string", templateTypes: ["sales_invoice", "quotation", "receipt", "customer_statement"] },
    { key: "customer_tax_id", description: catalogMessage("commercial.templatesData.customerTaxNumber"), type: "string", templateTypes: ["sales_invoice"] },
    { key: "subtotal", description: catalogMessage("common.general.totalAmount"), type: "number", templateTypes: ["sales_invoice"] },
    { key: "vat_amount", description: catalogMessage("commercial.templatesData.taxAmount"), type: "number", templateTypes: ["sales_invoice"] },
    { key: "total_amount", description: catalogMessage("commercial.templatesData.totalTax"), type: "number", templateTypes: ["sales_invoice", "quotation", "purchase_order"] },
    { key: "items", description: catalogMessage("commercial.templatesData.invoiceItems"), type: "list", templateTypes: ["sales_invoice"] },
    // Quotation
    { key: "quotation_number", description: catalogMessage("commercial.templatesData.quoteNumber"), type: "string", templateTypes: ["quotation"] },
    { key: "quotation_date", description: catalogMessage("commercial.templatesData.offerDate"), type: "date", templateTypes: ["quotation"] },
    { key: "valid_until", description: catalogMessage("common.general.validUntil"), type: "date", templateTypes: ["quotation"] },
    // Receipt
    { key: "receipt_number", description: catalogMessage("common.general.voucherNumber"), type: "string", templateTypes: ["receipt"] },
    { key: "receipt_date", description: catalogMessage("common.general.voucherDate"), type: "date", templateTypes: ["receipt"] },
    { key: "amount", description: catalogMessage("common.general.amount"), type: "number", templateTypes: ["receipt", "payment_note"] },
    { key: "payment_method", description: catalogMessage("common.general.paymentMethod"), type: "string", templateTypes: ["receipt", "payment_note"] },
    // Purchase Order
    { key: "po_number", description: catalogMessage("commercial.templatesData.purchaseOrderNumber"), type: "string", templateTypes: ["purchase_order"] },
    { key: "po_date", description: catalogMessage("commercial.templatesData.orderDate"), type: "date", templateTypes: ["purchase_order"] },
    { key: "supplier_name", description: catalogMessage("common.general.supplierName"), type: "string", templateTypes: ["purchase_order"] },
    { key: "supplier_tax_id", description: catalogMessage("commercial.templatesData.supplierTaxNumber"), type: "string", templateTypes: ["purchase_order"] },
    // Customer Statement
    { key: "statement_date", description: catalogMessage("commercial.templatesData.detectionDate"), type: "date", templateTypes: ["customer_statement"] },
    { key: "opening_balance", description: catalogMessage("commercial.templatesData.openingBalance"), type: "number", templateTypes: ["customer_statement"] },
    { key: "closing_balance", description: catalogMessage("common.general.closingBalance"), type: "number", templateTypes: ["customer_statement"] },
    { key: "transactions", description: catalogMessage("common.general.transactions"), type: "list", templateTypes: ["customer_statement"] },
    // Payment Note
    { key: "payment_number", description: catalogMessage("common.general.voucherNumber"), type: "string", templateTypes: ["payment_note"] },
    { key: "payment_date", description: catalogMessage("common.general.voucherDate"), type: "date", templateTypes: ["payment_note"] },
    { key: "payee_name", description: catalogMessage("commercial.templatesData.recipientName"), type: "string", templateTypes: ["payment_note"] },
    // Inventory reports
    { key: "inventory_items", description: importCopy("records"), type: "list", templateTypes: ["inventory_report"] },
    { key: "inventory_quantity", description: importCopy("inventory"), type: "number", templateTypes: ["inventory_report"] },
    { key: "inventory_value", description: importCopy("inventoryReport"), type: "number", templateTypes: ["inventory_report"] },
    { key: "inventory_cost_price", description: importCopy("reportTemplate"), type: "number", templateTypes: ["inventory_report"] },
    { key: "inventory_class", description: importCopy("classFirst"), type: "string", templateTypes: ["inventory_report"] }
];

export const SYSTEM_MOCK_CONTEXT: Record<string, any> = {
    company_name: catalogMessage("common.general.alNoorTechnologyCompany"),
    company_address: catalogMessage("common.general.tahliaStreetRiyadh"),
    company_tax_id: "300123456700003",
    company_logo: "https://via.placeholder.com/150",
    today_date: "2026-02-21",
    reference_number: "REF-2026-001",
    invoice_number: "INV-2026-0001",
    invoice_date: "2026-02-21",
    customer_name: catalogMessage("commercial.templatesData.advancedTechnologyCompany"),
    customer_tax_id: "300987654300003",
    subtotal: catalogMessage("common.general.message150000"),
    vat_amount: "225.00",
    total_amount: catalogMessage("commercial.templatesData.message172500"),
    items: [],
    quotation_number: "QT-2026-005",
    quotation_date: "2026-02-21",
    valid_until: "2026-03-21",
    receipt_number: "RC-2026-010",
    receipt_date: "2026-02-21",
    amount: catalogMessage("common.general.message150000"),
    payment_method: catalogMessage("commercial.templatesData.bankTransfer"),
    po_number: "PO-2026-0089",
    po_date: "2026-02-21",
    supplier_name: catalogMessage("commercial.templatesData.supplyOrganization"),
    supplier_tax_id: "300123999900003",
    statement_date: "2026-02-21",
    opening_balance: catalogMessage("commercial.templatesData.message500000"),
    closing_balance: catalogMessage("commercial.templatesData.message350000"),
    transactions: [],
    payment_number: "PN-2026-002",
    payment_date: "2026-02-21",
    payee_name: catalogMessage("commercial.templatesData.quickMaintenanceCompany"),
    inventory_items: [],
    inventory_quantity: "1250",
    inventory_value: "345000",
    inventory_cost_price: "275.00",
    inventory_class: "product"
};

export const templateTypeLabels: Record<string, string> = {
    sales_invoice: catalogMessage("common.general.salesInvoice"),
    quotation: catalogMessage("commercial.templatesData.quotation"),
    receipt: catalogMessage("common.general.receiptVoucher"),
    purchase_order: catalogMessage("commercial.templatesData.purchaseOrder"),
    customer_statement: catalogMessage("common.general.customerAccountStatement"),
    payment_note: catalogMessage("commercial.templatesData.paymentDisbursementVoucher"),
    inventory_report: importCopy("inventoryReport"),
    other_system: catalogMessage("common.general.other")
};

export const templateTypeBadgeClass: Record<string, string> = {
    sales_invoice: "badge-primary",
    quotation: "badge-info",
    receipt: "badge-success",
    purchase_order: "badge-warning",
    customer_statement: "badge-purple",
    payment_note: "badge-rose",
    inventory_report: "badge-info",
    other_system: "badge-secondary"
};


