"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { importCopy } from "@/lib/i18n/import-copy";
import { MainLayout } from "@/components/layout";
import { Button, DocumentPreview, SelectOption, showAlert } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

type ReportDomain = "commercial" | "supply-chain";
type ReportKey =
    | "sales-statement"
    | "customer-statement"
    | "sales-returns"
    | "quotation-register"
    | "purchase-statement"
    | "supplier-statement"
    | "purchase-returns"
    | "inventory-balance";

interface ReportDefinition {
    key: ReportKey;
    domain: ReportDomain;
    title: string;
    description: string;
    icon: string;
    requiresParty?: "customer" | "supplier";
}

interface ReportColumn {
    key: string;
    label: string;
    value: (row: Record<string, unknown>) => string | number;
    numeric?: boolean;
}

interface ReportPayload {
    title: string;
    subtitle: string;
    recordLabel: string;
    rows: Record<string, unknown>[];
    columns: ReportColumn[];
    summary: Array<{ label: string; value: string; emphasis?: boolean }>;
    note?: string;
    partyName?: string;
    templateId?: string;
    fieldKeys?: string[];
}

interface Party {
    id: number;
    name: string;
    code?: string;
}

interface InventoryTemplate {
    id: number;
    template_name_ar?: string;
    template_name_en?: string;
    template_key?: string;
    template_type?: string;
}

const reportDefinitions: ReportDefinition[] = [
    { key: "sales-statement", domain: "commercial", title: catalogMessage("ui.operationalreports.salesReport"), description: catalogMessage("ui.operationalreports.salesInvoicesLogSelectedPeriodTotalActivity"), icon: "cart" },
    { key: "customer-statement", domain: "commercial", title: catalogMessage("common.general.customerAccountStatement"), description: catalogMessage("ui.operationalreports.customerSalesCollectionsReturnsCurrentBalance"), icon: "book-open", requiresParty: "customer" },
    { key: "sales-returns", domain: "commercial", title: catalogMessage("ui.operationalreports.salesReturnsReport"), description: catalogMessage("ui.operationalreports.recordReturnsLinkedSalesInvoicesTheirValue"), icon: "history" },
    { key: "quotation-register", domain: "commercial", title: catalogMessage("common.general.quotesLog"), description: catalogMessage("ui.operationalreports.offersExpiryDatesStatusFinancialValue"), icon: "file-text" },
    { key: "purchase-statement", domain: "supply-chain", title: catalogMessage("ui.operationalreports.purchasesReport"), description: catalogMessage("ui.operationalreports.recordPurchaseInvoicesAmountsPaymentStatus"), icon: "receipt" },
    { key: "supplier-statement", domain: "supply-chain", title: catalogMessage("ui.operationalreports.supplierAccountStatement"), description: catalogMessage("ui.operationalreports.supplierInvoicesPaymentsReturnsOutstandingBalance"), icon: "book-open", requiresParty: "supplier" },
    { key: "purchase-returns", domain: "supply-chain", title: catalogMessage("ui.operationalreports.purchaseReturnsReport"), description: catalogMessage("ui.operationalreports.supplierReturnsLogValuesPurchaseReferences"), icon: "history" },
    { key: "inventory-balance", domain: "supply-chain", title: catalogMessage("ui.operationalreports.inventoryBalancesReport"), description: catalogMessage("ui.operationalreports.itemBalancesPricesEstimatedValuationAvailableInventory"), icon: "box" },
];

const salesColumns: ReportColumn[] = [
    { key: "date", label: catalogMessage("common.general.date.alternative7"), value: (row) => String(row.date || "—") },
    { key: "reference", label: catalogMessage("common.general.reference"), value: (row) => String(row.reference || "—") },
    { key: "party", label: catalogMessage("common.general.customer"), value: (row) => String(row.party || catalogMessage("common.general.cash")) },
    { key: "method", label: catalogMessage("ui.operationalreports.paymentMethod"), value: (row) => String(row.method || "—") },
    { key: "amount", label: catalogMessage("common.general.total.alternative3"), value: (row) => String(row.amount || "0"), numeric: true },
];

const ledgerColumns: ReportColumn[] = [
    { key: "date", label: catalogMessage("common.general.date.alternative7"), value: (row) => String(row.date || "—") },
    { key: "reference", label: catalogMessage("common.general.reference"), value: (row) => String(row.reference || "—") },
    { key: "type", label: catalogMessage("common.general.transactionType"), value: (row) => String(row.type || "—") },
    { key: "description", label: catalogMessage("common.general.statement"), value: (row) => String(row.description || "—") },
    { key: "debit", label: catalogMessage("common.general.debit"), value: (row) => String(row.debit || "0"), numeric: true },
    { key: "credit", label: catalogMessage("common.general.credit"), value: (row) => String(row.credit || "0"), numeric: true },
    { key: "balance", label: catalogMessage("ui.operationalreports.currentBalance"), value: (row) => String(row.balance || "0"), numeric: true },
];

const quotationColumns: ReportColumn[] = [
    { key: "date", label: catalogMessage("common.general.issueDate"), value: (row) => String(row.date || "—") },
    { key: "reference", label: catalogMessage("common.general.quoteNumber"), value: (row) => String(row.reference || "—") },
    { key: "party", label: catalogMessage("common.general.customer"), value: (row) => String(row.party || "—") },
    { key: "validity", label: catalogMessage("common.general.validUntil"), value: (row) => String(row.validity || "—") },
    { key: "status", label: catalogMessage("common.general.status.alternative2"), value: (row) => String(row.status || "—") },
    { key: "amount", label: catalogMessage("common.general.value"), value: (row) => String(row.amount || "0"), numeric: true },
];

const inventoryColumns: ReportColumn[] = [
    { key: "reference", label: catalogMessage("ui.operationalreports.itemCode"), value: (row) => String(row.reference || "—") },
    { key: "item", label: catalogMessage("ui.operationalreports.item"), value: (row) => String(row.item || "—") },
    { key: "unit", label: catalogMessage("common.general.unit.alternative2"), value: (row) => String(row.unit || "—") },
    { key: "quantity", label: catalogMessage("ui.operationalreports.availableBalance"), value: (row) => String(row.quantity || "0"), numeric: true },
    { key: "price", label: catalogMessage("ui.operationalreports.costPrice"), value: (row) => String(row.price || "0"), numeric: true },
    { key: "value", label: catalogMessage("ui.operationalreports.inventoryValue"), value: (row) => String(row.value || "0"), numeric: true },
];

const statusLabels: Record<string, string> = {
    draft: catalogMessage("common.general.draft"), sent: catalogMessage("common.general.sender"), accepted: catalogMessage("common.general.accepted"), rejected: catalogMessage("common.general.rejected"), expired: catalogMessage("common.general.expired"),
    cash: catalogMessage("common.general.cash"), credit: catalogMessage("common.general.deferred"), invoice: catalogMessage("ui.operationalreports.invoice"), receipt: catalogMessage("common.general.receiptVoucher"), payment: catalogMessage("ui.operationalreports.paymentVoucher"), return: catalogMessage("common.general.return"),
};

function unwrapList(value: unknown): Record<string, unknown>[] {
    if (Array.isArray(value)) return value as Record<string, unknown>[];
    if (!value || typeof value !== "object") return [];
    const record = value as { data?: unknown };
    return Array.isArray(record.data) ? record.data as Record<string, unknown>[] : [];
}

function numberValue(value: unknown): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function reportDate(value: unknown): string {
    if (!value) return "—";
    try { return formatDate(String(value)); } catch { return String(value); }
}

function amount(value: unknown): string {
    return catalogMessage("ui.operationalreports.sar", { value0: formatCurrency(numberValue(value)) });
}

function downloadCsv(payload: ReportPayload): void {
    const heading = payload.columns.map((column) => catalogMessage("common.general.message.alternative5", { value0: column.label.replace(/"/g, '""') })).join(",");
    const rows = payload.rows.map((row) => payload.columns.map((column) => {
        const raw = column.numeric ? amount(column.value(row)) : String(column.value(row));
        return catalogMessage("common.general.message.alternative5", { value0: raw.replace(/"/g, '""') });
    }).join(","));
    const blob = new Blob([catalogMessage("common.general.notAvailable.alternative3", { value0: heading, value1: rows.join("\n") })], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = catalogMessage("ui.operationalreports.csv", { value0: payload.title.replace(/\s+/g, "-") });
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

function reportHtml(payload: ReportPayload): string {
    const tableRows = payload.rows.map((row) => catalogMessage("ui.operationalreports.notAvailable", { value0: payload.columns.map((column) => {
            const value = column.numeric ? amount(column.value(row)) : column.value(row);
            return `<td class="${column.numeric ? "numeric" : ""}">${escapeHtml(value)}</td>`;
        }).join("") })).join("");
    const summary = payload.summary.map((item) => `<div class="unified-report-summary-item ${item.emphasis ? "emphasis" : ""}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join("");

    return catalogMessage("ui.operationalreports.accoreErpDateReportNumberRecordsTypeReport", { value0: escapeHtml(payload.title), value1: escapeHtml(payload.subtitle), value2: escapeHtml(reportDate(new Date().toISOString())), value3: payload.rows.length, value4: escapeHtml(payload.recordLabel), value5: escapeHtml(payload.partyName || catalogMessage("ui.operationalreports.allEntities")), value6: payload.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join(""), value7: tableRows || catalogMessage("ui.operationalreports.noDataReport", { value0: payload.columns.length }), value8: summary, value9: payload.note ? catalogMessage("ui.operationalreports.note", { value0: escapeHtml(payload.note) }) : "" });
}

export function OperationalReportsWorkspace({ domain }: { domain: ReportDomain }) {
    const { t: i18n } = useI18n();
    const definitions = useMemo(() => reportDefinitions.filter((report) => report.domain === domain), [domain]);
    const [selectedKey, setSelectedKey] = useState<ReportKey>(definitions[0].key);
    const [customers, setCustomers] = useState<Party[]>([]);
    const [suppliers, setSuppliers] = useState<Party[]>([]);
    const [partyId, setPartyId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [payload, setPayload] = useState<ReportPayload | null>(null);
    const [inventoryTemplates, setInventoryTemplates] = useState<InventoryTemplate[]>([]);
    const [inventoryTemplateId, setInventoryTemplateId] = useState("");
    const [inventoryColumnKeys, setInventoryColumnKeys] = useState<string[]>(inventoryColumns.map((column) => column.key));

    const selected = definitions.find((report) => report.key === selectedKey) ?? definitions[0];

    const loadParties = useCallback(async () => {
        try {
            if (domain === "commercial") {
                const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.CRM.CUSTOMERS}?limit=200`);
                if (response.success) setCustomers(unwrapList(response.data).map((item) => ({ id: numberValue(item.id), name: String(item.name || item.customer_name || "—"), code: String(item.customer_code || "") })));
            } else {
                const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.SUPPLIERS.BASE}?limit=200`);
                if (response.success) setSuppliers(unwrapList(response.data).map((item) => ({ id: numberValue(item.id), name: String(item.name || item.supplier_name || "—"), code: String(item.supplier_code || "") })));
            }
        } catch {
            // The report picker remains usable for reports that do not require a party.
        }
    }, [domain]);

    useEffect(() => { loadParties(); }, [loadParties]);
    useEffect(() => {
        if (selectedKey !== "inventory-balance") return;
        fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.byType("inventory_report"))
            .then((response) => setInventoryTemplates(unwrapList(response.data) as unknown as InventoryTemplate[]))
            .catch(() => setInventoryTemplates([]));
    }, [selectedKey]);
    useEffect(() => {
        setPartyId("");
        setPayload(null);
        if (selectedKey !== "inventory-balance") setInventoryTemplateId("");
    }, [selectedKey]);

    const buildPayload = useCallback((definition: ReportDefinition, raw: unknown, party?: Party): ReportPayload => {
        const list = unwrapList(raw);
        if (definition.key === "customer-statement" || definition.key === "supplier-statement") {
            const result = raw as { data?: unknown; stats?: Record<string, unknown>; customer?: Record<string, unknown>; supplier?: Record<string, unknown> };
            let balance = 0;
            const rows = unwrapList(result.data).map((item) => {
                const transactionType = String(item.type || item.transaction_type || "—");
                const value = numberValue(item.amount || item.total_amount);
                const debit = transactionType === "invoice" ? value : 0;
                const credit = transactionType === "invoice" ? 0 : value;
                balance += debit - credit;
                return {
                    date: reportDate(item.transaction_date || item.created_at),
                    reference: item.invoice_number || item.voucher_number || item.reference_id || item.id || "—",
                    type: statusLabels[transactionType] || transactionType,
                    description: item.description || item.notes || i18n.catalog["common.general.notAvailable.alternative8"],
                    debit,
                    credit,
                    balance,
                };
            });
            const stats = result.stats ?? {};
            return {
                title: definition.title,
                subtitle: i18n.catalog["ui.operationalreports.detailedStatementTransactionsCurrentBalance"],
                recordLabel: definition.title,
                rows,
                columns: ledgerColumns,
                partyName: party?.name || String((result.customer || result.supplier || {}).name || "—"),
                summary: [
                    { label: i18n.catalog["common.general.totalDebit"], value: amount(stats.total_debit ?? rows.reduce((sum, row) => sum + numberValue(row.debit), 0)) },
                    { label: i18n.catalog["common.general.totalCredit"], value: amount(stats.total_credit ?? rows.reduce((sum, row) => sum + numberValue(row.credit), 0)) },
                    { label: i18n.catalog["common.general.closingBalance"], value: amount(stats.balance ?? balance), emphasis: true },
                ],
                note: i18n.catalog["ui.operationalreports.displaysCurrentBalanceAfterEachTransactionAccordingSystemS"],
            };
        }

        if (definition.key === "inventory-balance") {
            const rows = list.map((item) => {
                const quantity = numberValue(item.stock_quantity ?? item.quantity ?? item.available_quantity);
                const cost = numberValue(item.weighted_average_cost ?? item.purchase_price ?? item.cost_price ?? item.unit_price);
                return {
                    reference: item.barcode || item.code || item.id || "—",
                    item: item.name || item.product_name || "—",
                    unit: item.sub_unit_name || item.unit_name || i18n.catalog["common.general.piece"],
                    quantity,
                    price: cost,
                    value: quantity * cost,
                };
            });
            const totalValue = rows.reduce((sum, row) => sum + numberValue(row.value), 0);
            const selectedColumns = inventoryColumns.filter((column) => inventoryColumnKeys.includes(column.key));
            return { title: definition.title, subtitle: i18n.catalog["ui.operationalreports.quantityBalanceEstimatedValueBasedProductData"], recordLabel: definition.title, rows, columns: selectedColumns, templateId: inventoryTemplateId || undefined, fieldKeys: selectedColumns.map((column) => column.key), summary: [
                { label: i18n.catalog["common.general.numberItems.alternative2"], value: String(rows.length) },
                { label: i18n.catalog["ui.operationalreports.totalQuantity"], value: String(rows.reduce((sum, row) => sum + numberValue(row.quantity), 0)) },
                { label: i18n.catalog["ui.operationalreports.estimatedInventoryValue"], value: amount(totalValue), emphasis: true },
            ], note: i18n.catalog["ui.operationalreports.valueIsEstimatedIsCalculatedAvailableBalanceItemS"] };
        }

        if (definition.key === "quotation-register") {
            const rows = list.map((item) => ({
                date: reportDate(item.issue_date || item.created_at), reference: item.quote_number || item.id || "—",
                party: (item.customer as Record<string, unknown> | undefined)?.name || item.customer_name || "—",
                validity: reportDate(item.valid_until), status: statusLabels[String(item.status)] || item.status || "—", amount: numberValue(item.total_amount),
            }));
            return { title: definition.title, subtitle: i18n.catalog["ui.operationalreports.quotesCreditsRecordAvailablePeriod"], recordLabel: definition.title, rows, columns: quotationColumns, summary: [
                { label: i18n.catalog["common.general.totalOffers"], value: String(rows.length) },
                { label: i18n.catalog["ui.operationalreports.sentOffers"], value: String(rows.filter((row) => row.status === i18n.catalog["common.general.sender"]).length) },
                { label: i18n.catalog["ui.operationalreports.totalValue"], value: amount(rows.reduce((sum, row) => sum + numberValue(row.amount), 0)), emphasis: true },
            ] };
        }

        const isReturn = definition.key === "sales-returns" || definition.key === "purchase-returns";
        const isPurchase = definition.key === "purchase-statement" || definition.key === "purchase-returns";
        const rows = list.map((item) => ({
            date: reportDate(item.invoice_date || item.purchase_date || item.return_date || item.created_at),
            reference: item.invoice_number || item.purchase_number || item.return_number || item.id || "—",
            party: item.customer_name || item.supplier_name || (item.customer as Record<string, unknown> | undefined)?.name || (item.supplier as Record<string, unknown> | undefined)?.name || "—",
            method: statusLabels[String(item.payment_type)] || item.payment_type || (isReturn ? i18n.catalog["common.general.return"] : "—"),
            amount: numberValue(item.total_amount || item.total_price || item.invoice_price || item.amount),
        }));
        const label = isPurchase ? i18n.catalog["common.general.supplier"] : i18n.catalog["common.general.customer"];
        const columns = salesColumns.map((column) => column.key === "party" ? { ...column, label } : column);
        return { title: definition.title, subtitle: isReturn ? i18n.catalog["ui.operationalreports.registeredReturnsTheirFinancialReference"] : i18n.catalog["ui.operationalreports.invoiceMovementLogAmounts"], recordLabel: definition.title, rows, columns, summary: [
            { label: i18n.catalog["ui.operationalreports.numberDocuments"], value: String(rows.length) },
            { label: isReturn ? i18n.catalog["common.general.totalReturns"] : i18n.catalog["ui.operationalreports.totalActivity"], value: amount(rows.reduce((sum, row) => sum + numberValue(row.amount), 0)), emphasis: true },
        ] };
    }, [i18n.catalog, inventoryColumnKeys, inventoryTemplateId]);

    const createReport = async () => {
        if (selectedKey === "inventory-balance" && inventoryColumnKeys.length === 0) {
            showAlert("operational-report-alerts", importCopy("selectAtLeastOneField"), "error");
            return;
        }
        if (selected.requiresParty && !partyId) {
            showAlert("operational-report-alerts", i18n.catalog["ui.operationalreports.pleaseSelectCustomerSupplierBeforeCreatingAccountStatement"], "error");
            return;
        }
        const currentParty = selected.requiresParty === "customer" ? customers.find((party) => party.id === Number(partyId)) : suppliers.find((party) => party.id === Number(partyId));
        let endpoint = "";
        if (selectedKey === "sales-statement") endpoint = `${API_ENDPOINTS.COMMERCIAL.SALES.INVOICES}?limit=500`;
        if (selectedKey === "customer-statement") endpoint = `${API_ENDPOINTS.COMMERCIAL.CRM.CUSTOMER_LEDGER}?customer_id=${partyId}&limit=500`;
        if (selectedKey === "sales-returns") endpoint = `${API_ENDPOINTS.COMMERCIAL.SALES.RETURNS.BASE}?limit=500`;
        if (selectedKey === "quotation-register") endpoint = `${API_ENDPOINTS.COMMERCIAL.SALES.QUOTATIONS.BASE}?per_page=500`;
        if (selectedKey === "purchase-statement") endpoint = `${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE}?limit=500`;
        if (selectedKey === "supplier-statement") endpoint = `${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.SUPPLIERS.LEDGER}?supplier_id=${partyId}&limit=500`;
        if (selectedKey === "purchase-returns") endpoint = `${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.RETURNS.LEDGER}?limit=500`;
        if (selectedKey === "inventory-balance") endpoint = `${API_ENDPOINTS.SUPPLY_CHAIN.PRODUCTS}?limit=500`;

        try {
            setIsLoading(true);
            const response = await fetchAPI(endpoint);
            if (!response.success) throw new Error(i18n.catalog["ui.operationalreports.reportDataRequestFailed"]);
            setPayload(buildPayload(selected, response.data, currentParty));
        } catch {
            showAlert("operational-report-alerts", i18n.catalog["ui.operationalreports.unableLoadReportDataCheckDataValidityTry"], "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (payload) {
        return (
            <MainLayout requiredModule={domain === "commercial" ? "sales" : "products"} requiredAction="view">
                <DocumentPreview title={payload.title} htmlContent={reportHtml(payload)} onBack={() => setPayload(null)} onExportCsv={() => downloadCsv(payload)} titleIcon="file-text" />
            </MainLayout>
        );
    }

    const partyOptions: SelectOption[] = (selected.requiresParty === "customer" ? customers : suppliers).map((party) => ({ value: party.id, label: party.name, subtitle: party.code || "" }));

    return (
        <MainLayout requiredModule={domain === "commercial" ? "sales" : "products"} requiredAction="view">
            <div id="operational-report-alerts" />
            <section className="operational-reports-workspace">
                <header className="operational-reports-header">
                    <div><p>{domain === "commercial" ? i18n.catalog["ui.operationalreports.commercialIntelligence"] : i18n.catalog["ui.operationalreports.supplyChainIntelligence"]}</p><h1>{i18n.catalog["ui.operationalreports.reportsExportCenter"]}</h1><span>{i18n.catalog["ui.operationalreports.unifiedArabicTemplatesPreviewPrintingSavingPdfCsv"]}</span></div>
                    <div className="operational-reports-stamp">Cairo<br />RTL</div>
                </header>
                <div className="operational-reports-grid">
                    {definitions.map((definition) => <button type="button" key={definition.key} onClick={() => setSelectedKey(definition.key)} className={`operational-report-card ${selectedKey === definition.key ? "selected" : ""}`}><span className="operational-report-icon">{definition.icon === "box" ? "▣" : definition.icon === "history" ? "↺" : definition.icon === "book-open" ? "▤" : "▧"}</span><strong>{definition.title}</strong><small>{definition.description}</small></button>)}
                </div>
                <section className="sales-card operational-report-builder">
                    <div><p className="operational-report-overline">{i18n.catalog["ui.operationalreports.defaultTemplate"]}</p><h2>{selected.title}</h2><p>{selected.description}</p></div>
                    {selected.requiresParty && <label className="operational-party-picker"><span>{selected.requiresParty === "customer" ? i18n.catalog["common.general.customer"] : i18n.catalog["common.general.supplier"]}</span><select value={partyId} onChange={(event) => setPartyId(event.target.value)}><option value="">{i18n.catalog["common.general.select"]}{selected.requiresParty === "customer" ? i18n.catalog["common.general.customer"] : i18n.catalog["common.general.supplier"]}</option>{partyOptions.map((party) => <option key={party.value} value={party.value}>{party.label}</option>)}</select></label>}
                    {selectedKey === "inventory-balance" && <div className="inventory-report-template-controls">
                        <label><span>{importCopy("reportTemplate")}</span><select value={inventoryTemplateId} onChange={(event) => setInventoryTemplateId(event.target.value)}><option value="">{importCopy("defaultInventoryLayout")}</option>{inventoryTemplates.map((template) => <option key={template.id} value={template.id}>{template.template_name_ar || template.template_name_en || template.template_key || importCopy("template", { value0: template.id })}</option>)}</select></label>
                        <div className="inventory-report-field-picker"><span>{importCopy("visibleFields")}</span><div>{inventoryColumns.map((column) => <label key={column.key}><input type="checkbox" checked={inventoryColumnKeys.includes(column.key)} onChange={() => setInventoryColumnKeys((current) => current.includes(column.key) ? current.filter((key) => key !== column.key) : [...current, column.key])} />{column.label}</label>)}</div></div>
                    </div>}
                    <Button variant="primary" icon="eye" onClick={createReport} disabled={isLoading}>{isLoading ? i18n.catalog["ui.operationalreports.preparingReport"] : i18n.catalog["ui.operationalreports.previewReport"]}</Button>
                </section>
            </section>
        </MainLayout>
    );
}
