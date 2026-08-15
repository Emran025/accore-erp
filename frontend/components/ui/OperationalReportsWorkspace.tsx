"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
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
}

interface Party {
    id: number;
    name: string;
    code?: string;
}

const reportDefinitions: ReportDefinition[] = [
    { key: "sales-statement", domain: "commercial", title: catalogMessage("text_0fade763692b"), description: catalogMessage("text_dddee30a38db"), icon: "cart" },
    { key: "customer-statement", domain: "commercial", title: catalogMessage("text_79b673d7fc3e"), description: catalogMessage("text_16e4ba5897b5"), icon: "book-open", requiresParty: "customer" },
    { key: "sales-returns", domain: "commercial", title: catalogMessage("text_7f691d87428e"), description: catalogMessage("text_93c263d5e835"), icon: "history" },
    { key: "quotation-register", domain: "commercial", title: catalogMessage("text_f29073a16394"), description: catalogMessage("text_02a518994655"), icon: "file-text" },
    { key: "purchase-statement", domain: "supply-chain", title: catalogMessage("text_866392ee517b"), description: catalogMessage("text_9db7e5796948"), icon: "receipt" },
    { key: "supplier-statement", domain: "supply-chain", title: catalogMessage("text_2ca87871c628"), description: catalogMessage("text_cbdd0e97e43e"), icon: "book-open", requiresParty: "supplier" },
    { key: "purchase-returns", domain: "supply-chain", title: catalogMessage("text_3e0b23de46b9"), description: catalogMessage("text_ddde147859dd"), icon: "history" },
    { key: "inventory-balance", domain: "supply-chain", title: catalogMessage("text_68d35cc4cd09"), description: catalogMessage("text_d52fdde736dd"), icon: "box" },
];

const salesColumns: ReportColumn[] = [
    { key: "date", label: catalogMessage("text_d90c384199ac"), value: (row) => String(row.date || "—") },
    { key: "reference", label: catalogMessage("text_d6a838d92c8d"), value: (row) => String(row.reference || "—") },
    { key: "party", label: catalogMessage("text_a042411e90be"), value: (row) => String(row.party || catalogMessage("text_1beb05a45173")) },
    { key: "method", label: catalogMessage("text_99036c886da1"), value: (row) => String(row.method || "—") },
    { key: "amount", label: catalogMessage("text_baed6e999960"), value: (row) => String(row.amount || "0"), numeric: true },
];

const ledgerColumns: ReportColumn[] = [
    { key: "date", label: catalogMessage("text_d90c384199ac"), value: (row) => String(row.date || "—") },
    { key: "reference", label: catalogMessage("text_d6a838d92c8d"), value: (row) => String(row.reference || "—") },
    { key: "type", label: catalogMessage("text_4567eb273df3"), value: (row) => String(row.type || "—") },
    { key: "description", label: catalogMessage("text_15391f77cefa"), value: (row) => String(row.description || "—") },
    { key: "debit", label: catalogMessage("text_b19917a31039"), value: (row) => String(row.debit || "0"), numeric: true },
    { key: "credit", label: catalogMessage("text_a91798231743"), value: (row) => String(row.credit || "0"), numeric: true },
    { key: "balance", label: catalogMessage("text_d621077133be"), value: (row) => String(row.balance || "0"), numeric: true },
];

const quotationColumns: ReportColumn[] = [
    { key: "date", label: catalogMessage("text_4e5892a34a06"), value: (row) => String(row.date || "—") },
    { key: "reference", label: catalogMessage("text_ca7eb691cd25"), value: (row) => String(row.reference || "—") },
    { key: "party", label: catalogMessage("text_a042411e90be"), value: (row) => String(row.party || "—") },
    { key: "validity", label: catalogMessage("text_817b190b2a5c"), value: (row) => String(row.validity || "—") },
    { key: "status", label: catalogMessage("text_c3a4749caed4"), value: (row) => String(row.status || "—") },
    { key: "amount", label: catalogMessage("text_4c49efecd6cb"), value: (row) => String(row.amount || "0"), numeric: true },
];

const inventoryColumns: ReportColumn[] = [
    { key: "reference", label: catalogMessage("text_9ed1ce8729e2"), value: (row) => String(row.reference || "—") },
    { key: "item", label: catalogMessage("text_5b12a452b19e"), value: (row) => String(row.item || "—") },
    { key: "unit", label: catalogMessage("text_9a08d7d4bf73"), value: (row) => String(row.unit || "—") },
    { key: "quantity", label: catalogMessage("text_1a29ef328914"), value: (row) => String(row.quantity || "0"), numeric: true },
    { key: "price", label: catalogMessage("text_83925b8f1c10"), value: (row) => String(row.price || "0"), numeric: true },
    { key: "value", label: catalogMessage("text_d21f2cffcbf0"), value: (row) => String(row.value || "0"), numeric: true },
];

const statusLabels: Record<string, string> = {
    draft: catalogMessage("text_552aec56f591"), sent: catalogMessage("text_756615880a6a"), accepted: catalogMessage("text_f5fde9cba1be"), rejected: catalogMessage("text_5d969a71dad3"), expired: catalogMessage("text_6217883aee8e"),
    cash: catalogMessage("text_1beb05a45173"), credit: catalogMessage("text_bf7775843f7c"), invoice: catalogMessage("text_46d160ab502a"), receipt: catalogMessage("text_3412df9cc7ec"), payment: catalogMessage("text_6897506ae1d1"), return: catalogMessage("text_f996c544ba6c"),
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
    return catalogMessage("text_1859ff7a8970", { value0: formatCurrency(numberValue(value)) });
}

function downloadCsv(payload: ReportPayload): void {
    const heading = payload.columns.map((column) => catalogMessage("text_d60a5875d79f", { value0: column.label.replace(/"/g, '""') })).join(",");
    const rows = payload.rows.map((row) => payload.columns.map((column) => {
        const raw = column.numeric ? amount(column.value(row)) : String(column.value(row));
        return catalogMessage("text_d60a5875d79f", { value0: raw.replace(/"/g, '""') });
    }).join(","));
    const blob = new Blob([catalogMessage("text_54ef3bb1085e", { value0: heading, value1: rows.join("\n") })], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = catalogMessage("text_43ec94de2c1a", { value0: payload.title.replace(/\s+/g, "-") });
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

function reportHtml(payload: ReportPayload): string {
    const tableRows = payload.rows.map((row, index) => catalogMessage("text_588b7802846c", { value0: payload.columns.map((column) => {
            const value = column.numeric ? amount(column.value(row)) : column.value(row);
            return `<td class="${column.numeric ? "numeric" : ""}">${escapeHtml(value)}</td>`;
        }).join("") })).join("");
    const summary = payload.summary.map((item) => `<div class="unified-report-summary-item ${item.emphasis ? "emphasis" : ""}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join("");

    return catalogMessage("text_da440babac04", { value0: escapeHtml(payload.title), value1: escapeHtml(payload.subtitle), value2: escapeHtml(reportDate(new Date().toISOString())), value3: payload.rows.length, value4: escapeHtml(payload.recordLabel), value5: escapeHtml(payload.partyName || catalogMessage("text_65487d728d88")), value6: payload.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join(""), value7: tableRows || catalogMessage("text_9149f9d07c8d", { value0: payload.columns.length }), value8: summary, value9: payload.note ? catalogMessage("text_0540d8258810", { value0: escapeHtml(payload.note) }) : "" });
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
    useEffect(() => { setPartyId(""); setPayload(null); }, [selectedKey]);

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
                    description: item.description || item.notes || i18n.catalog["text_bda050585a00"],
                    debit,
                    credit,
                    balance,
                };
            });
            const stats = result.stats ?? {};
            return {
                title: definition.title,
                subtitle: i18n.catalog["text_57a40929d1eb"],
                recordLabel: definition.title,
                rows,
                columns: ledgerColumns,
                partyName: party?.name || String((result.customer || result.supplier || {}).name || "—"),
                summary: [
                    { label: i18n.catalog["text_9b3ffc60129b"], value: amount(stats.total_debit ?? rows.reduce((sum, row) => sum + numberValue(row.debit), 0)) },
                    { label: i18n.catalog["text_ccfe7f015017"], value: amount(stats.total_credit ?? rows.reduce((sum, row) => sum + numberValue(row.credit), 0)) },
                    { label: i18n.catalog["text_18cc04f74ee6"], value: amount(stats.balance ?? balance), emphasis: true },
                ],
                note: i18n.catalog["text_7f587bc8f7c7"],
            };
        }

        if (definition.key === "inventory-balance") {
            const rows = list.map((item) => {
                const quantity = numberValue(item.stock_quantity ?? item.quantity ?? item.available_quantity);
                const cost = numberValue(item.purchase_price ?? item.cost_price ?? item.unit_price);
                return {
                    reference: item.barcode || item.code || item.id || "—",
                    item: item.name || item.product_name || "—",
                    unit: item.sub_unit_name || item.unit_name || i18n.catalog["text_848514abbbfd"],
                    quantity,
                    price: cost,
                    value: quantity * cost,
                };
            });
            const totalValue = rows.reduce((sum, row) => sum + numberValue(row.value), 0);
            return { title: definition.title, subtitle: i18n.catalog["text_d0f96d45b442"], recordLabel: definition.title, rows, columns: inventoryColumns, summary: [
                { label: i18n.catalog["text_f6f66d9545bc"], value: String(rows.length) },
                { label: i18n.catalog["text_d11290400cfa"], value: String(rows.reduce((sum, row) => sum + numberValue(row.quantity), 0)) },
                { label: i18n.catalog["text_265ada4bf6ac"], value: amount(totalValue), emphasis: true },
            ], note: i18n.catalog["text_ecf76c72989e"] };
        }

        if (definition.key === "quotation-register") {
            const rows = list.map((item) => ({
                date: reportDate(item.issue_date || item.created_at), reference: item.quote_number || item.id || "—",
                party: (item.customer as Record<string, unknown> | undefined)?.name || item.customer_name || "—",
                validity: reportDate(item.valid_until), status: statusLabels[String(item.status)] || item.status || "—", amount: numberValue(item.total_amount),
            }));
            return { title: definition.title, subtitle: i18n.catalog["text_4fec12a1e4d2"], recordLabel: definition.title, rows, columns: quotationColumns, summary: [
                { label: i18n.catalog["text_0ca7e1aa81b4"], value: String(rows.length) },
                { label: i18n.catalog["text_24d3fbc2a7f5"], value: String(rows.filter((row) => row.status === i18n.catalog["text_756615880a6a"]).length) },
                { label: i18n.catalog["text_58cc4e7dafe7"], value: amount(rows.reduce((sum, row) => sum + numberValue(row.amount), 0)), emphasis: true },
            ] };
        }

        const isReturn = definition.key === "sales-returns" || definition.key === "purchase-returns";
        const isPurchase = definition.key === "purchase-statement" || definition.key === "purchase-returns";
        const rows = list.map((item) => ({
            date: reportDate(item.invoice_date || item.purchase_date || item.return_date || item.created_at),
            reference: item.invoice_number || item.purchase_number || item.return_number || item.id || "—",
            party: item.customer_name || item.supplier_name || (item.customer as Record<string, unknown> | undefined)?.name || (item.supplier as Record<string, unknown> | undefined)?.name || "—",
            method: statusLabels[String(item.payment_type)] || item.payment_type || (isReturn ? i18n.catalog["text_f996c544ba6c"] : "—"),
            amount: numberValue(item.total_amount || item.total_price || item.invoice_price || item.amount),
        }));
        const label = isPurchase ? i18n.catalog["text_4680c31a727f"] : i18n.catalog["text_a042411e90be"];
        const columns = salesColumns.map((column) => column.key === "party" ? { ...column, label } : column);
        return { title: definition.title, subtitle: isReturn ? i18n.catalog["text_640f33fb32aa"] : i18n.catalog["text_beeaac422632"], recordLabel: definition.title, rows, columns, summary: [
            { label: i18n.catalog["text_c625f1ed0805"], value: String(rows.length) },
            { label: isReturn ? i18n.catalog["text_ccab0fda414e"] : i18n.catalog["text_7d2302bdd27c"], value: amount(rows.reduce((sum, row) => sum + numberValue(row.amount), 0)), emphasis: true },
        ] };
    }, []);

    const createReport = async () => {
        if (selected.requiresParty && !partyId) {
            showAlert("operational-report-alerts", i18n.catalog["text_05c048caa20c"], "error");
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
            if (!response.success) throw new Error(i18n.catalog["text_9cfc15d20f02"]);
            setPayload(buildPayload(selected, response.data, currentParty));
        } catch {
            showAlert("operational-report-alerts", i18n.catalog["text_7dd2c74e23ad"], "error");
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
                    <div><p>{domain === "commercial" ? i18n.catalog["text_71d193fd9b50"] : i18n.catalog["text_b5868c5a217b"]}</p><h1>{i18n.catalog["text_96d393086a43"]}</h1><span>{i18n.catalog["text_2612ac4e9e28"]}</span></div>
                    <div className="operational-reports-stamp">Cairo<br />RTL</div>
                </header>
                <div className="operational-reports-grid">
                    {definitions.map((definition) => <button type="button" key={definition.key} onClick={() => setSelectedKey(definition.key)} className={`operational-report-card ${selectedKey === definition.key ? "selected" : ""}`}><span className="operational-report-icon">{definition.icon === "box" ? "▣" : definition.icon === "history" ? "↺" : definition.icon === "book-open" ? "▤" : "▧"}</span><strong>{definition.title}</strong><small>{definition.description}</small></button>)}
                </div>
                <section className="sales-card operational-report-builder">
                    <div><p className="operational-report-overline">{i18n.catalog["text_0f52813d313e"]}</p><h2>{selected.title}</h2><p>{selected.description}</p></div>
                    {selected.requiresParty && <label className="operational-party-picker"><span>{selected.requiresParty === "customer" ? i18n.catalog["text_a042411e90be"] : i18n.catalog["text_4680c31a727f"]}</span><select value={partyId} onChange={(event) => setPartyId(event.target.value)}><option value="">{i18n.catalog["text_d6b8d3e4d508"]}{selected.requiresParty === "customer" ? i18n.catalog["text_a042411e90be"] : i18n.catalog["text_4680c31a727f"]}</option>{partyOptions.map((party) => <option key={party.value} value={party.value}>{party.label}</option>)}</select></label>}
                    <Button variant="primary" icon="eye" onClick={createReport} disabled={isLoading}>{isLoading ? i18n.catalog["text_2ce78c81de1a"] : i18n.catalog["text_d0798326777c"]}</Button>
                </section>
            </section>
        </MainLayout>
    );
}
