"use client";

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
    { key: "sales-statement", domain: "commercial", title: "كشف المبيعات", description: "سجل فواتير المبيعات خلال الفترة المحددة مع إجمالي النشاط.", icon: "cart" },
    { key: "customer-statement", domain: "commercial", title: "كشف حساب عميل", description: "حركة المبيعات والتحصيلات والمرتجعات والرصيد الجاري للعميل.", icon: "book-open", requiresParty: "customer" },
    { key: "sales-returns", domain: "commercial", title: "تقرير مرتجعات المبيعات", description: "سجل المرتجعات المرتبطة بفواتير المبيعات وقيمتها.", icon: "history" },
    { key: "quotation-register", domain: "commercial", title: "سجل عروض الأسعار", description: "العروض، تواريخ صلاحيتها، حالتها وقيمتها المالية.", icon: "file-text" },
    { key: "purchase-statement", domain: "supply-chain", title: "كشف المشتريات", description: "سجل فواتير الشراء وقيمتها وحالة السداد.", icon: "receipt" },
    { key: "supplier-statement", domain: "supply-chain", title: "كشف حساب مورد", description: "فواتير المورد والمدفوعات والمرتجعات والرصيد المستحق.", icon: "book-open", requiresParty: "supplier" },
    { key: "purchase-returns", domain: "supply-chain", title: "تقرير مرتجعات المشتريات", description: "سجل المرتجعات الموردة وقيمتها ومرجعها الشرائي.", icon: "history" },
    { key: "inventory-balance", domain: "supply-chain", title: "تقرير أرصدة المخزون", description: "رصيد الأصناف والأسعار والتقييم التقديري للمخزون المتاح.", icon: "box" },
];

const salesColumns: ReportColumn[] = [
    { key: "date", label: "التاريخ", value: (row) => String(row.date || "—") },
    { key: "reference", label: "المرجع", value: (row) => String(row.reference || "—") },
    { key: "party", label: "العميل", value: (row) => String(row.party || "نقدي") },
    { key: "method", label: "طريقة السداد", value: (row) => String(row.method || "—") },
    { key: "amount", label: "الإجمالي", value: (row) => String(row.amount || "0"), numeric: true },
];

const ledgerColumns: ReportColumn[] = [
    { key: "date", label: "التاريخ", value: (row) => String(row.date || "—") },
    { key: "reference", label: "المرجع", value: (row) => String(row.reference || "—") },
    { key: "type", label: "نوع العملية", value: (row) => String(row.type || "—") },
    { key: "description", label: "البيان", value: (row) => String(row.description || "—") },
    { key: "debit", label: "مدين", value: (row) => String(row.debit || "0"), numeric: true },
    { key: "credit", label: "دائن", value: (row) => String(row.credit || "0"), numeric: true },
    { key: "balance", label: "الرصيد الجاري", value: (row) => String(row.balance || "0"), numeric: true },
];

const quotationColumns: ReportColumn[] = [
    { key: "date", label: "تاريخ الإصدار", value: (row) => String(row.date || "—") },
    { key: "reference", label: "رقم العرض", value: (row) => String(row.reference || "—") },
    { key: "party", label: "العميل", value: (row) => String(row.party || "—") },
    { key: "validity", label: "صالح حتى", value: (row) => String(row.validity || "—") },
    { key: "status", label: "الحالة", value: (row) => String(row.status || "—") },
    { key: "amount", label: "القيمة", value: (row) => String(row.amount || "0"), numeric: true },
];

const inventoryColumns: ReportColumn[] = [
    { key: "reference", label: "رمز الصنف", value: (row) => String(row.reference || "—") },
    { key: "item", label: "الصنف", value: (row) => String(row.item || "—") },
    { key: "unit", label: "الوحدة", value: (row) => String(row.unit || "—") },
    { key: "quantity", label: "الرصيد المتاح", value: (row) => String(row.quantity || "0"), numeric: true },
    { key: "price", label: "سعر التكلفة", value: (row) => String(row.price || "0"), numeric: true },
    { key: "value", label: "قيمة المخزون", value: (row) => String(row.value || "0"), numeric: true },
];

const statusLabels: Record<string, string> = {
    draft: "مسودة", sent: "مرسل", accepted: "مقبول", rejected: "مرفوض", expired: "منتهي",
    cash: "نقدي", credit: "آجل", invoice: "فاتورة", receipt: "سند قبض", payment: "سند دفع", return: "مرتجع",
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
    return `${formatCurrency(numberValue(value))} ر.س`;
}

function downloadCsv(payload: ReportPayload): void {
    const heading = payload.columns.map((column) => `"${column.label.replace(/"/g, '""')}"`).join(",");
    const rows = payload.rows.map((row) => payload.columns.map((column) => {
        const raw = column.numeric ? amount(column.value(row)) : String(column.value(row));
        return `"${raw.replace(/"/g, '""')}"`;
    }).join(","));
    const blob = new Blob([`\uFEFF${heading}\n${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${payload.title.replace(/\s+/g, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

function reportHtml(payload: ReportPayload): string {
    const tableRows = payload.rows.map((row, index) => `<tr>${payload.columns.map((column) => {
        const value = column.numeric ? amount(column.value(row)) : column.value(row);
        return `<td class="${column.numeric ? "numeric" : ""}">${escapeHtml(value)}</td>`;
    }).join("")}</tr>`).join("");
    const summary = payload.summary.map((item) => `<div class="unified-report-summary-item ${item.emphasis ? "emphasis" : ""}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join("");

    return `<article class="unified-report" dir="rtl">
        <header class="unified-report-header">
            <div class="unified-report-brand"><span class="unified-report-mark">A</span><div><p>ACCORE ERP</p><h1>${escapeHtml(payload.title)}</h1><small>${escapeHtml(payload.subtitle)}</small></div></div>
            <div class="unified-report-reference"><span>تاريخ التقرير</span><strong>${escapeHtml(reportDate(new Date().toISOString()))}</strong><span>عدد السجلات: ${payload.rows.length}</span></div>
        </header>
        <section class="unified-report-context"><div><span>نوع التقرير</span><strong>${escapeHtml(payload.recordLabel)}</strong></div><div><span>الجهة</span><strong>${escapeHtml(payload.partyName || "كافة الجهات")}</strong></div><div><span>العملة</span><strong>ريال سعودي (SAR)</strong></div></section>
        <section class="unified-report-table-wrap"><table class="unified-report-table"><thead><tr>${payload.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead><tbody>${tableRows || `<tr><td colspan="${payload.columns.length}" class="empty">لا توجد بيانات ضمن نطاق التقرير.</td></tr>`}</tbody></table></section>
        <section class="unified-report-summary">${summary}</section>
        ${payload.note ? `<section class="unified-report-note"><strong>ملاحظة:</strong> ${escapeHtml(payload.note)}</section>` : ""}
        <footer class="unified-report-footer"><span>تم إصدار هذا المستند من Accore ERP</span><span>توقيع ومراجعة: ____________________</span></footer>
    </article>`;
}

export function OperationalReportsWorkspace({ domain }: { domain: ReportDomain }) {
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
                    description: item.description || item.notes || "—",
                    debit,
                    credit,
                    balance,
                };
            });
            const stats = result.stats ?? {};
            return {
                title: definition.title,
                subtitle: "كشف حساب تفصيلي بالحركة والرصيد الجاري",
                recordLabel: definition.title,
                rows,
                columns: ledgerColumns,
                partyName: party?.name || String((result.customer || result.supplier || {}).name || "—"),
                summary: [
                    { label: "إجمالي المدين", value: amount(stats.total_debit ?? rows.reduce((sum, row) => sum + numberValue(row.debit), 0)) },
                    { label: "إجمالي الدائن", value: amount(stats.total_credit ?? rows.reduce((sum, row) => sum + numberValue(row.credit), 0)) },
                    { label: "الرصيد الختامي", value: amount(stats.balance ?? balance), emphasis: true },
                ],
                note: "يعرض الرصيد الجاري بعد كل عملية وفق تسلسل الحركة المعتمد في النظام.",
            };
        }

        if (definition.key === "inventory-balance") {
            const rows = list.map((item) => {
                const quantity = numberValue(item.stock_quantity ?? item.quantity ?? item.available_quantity);
                const cost = numberValue(item.purchase_price ?? item.cost_price ?? item.unit_price);
                return {
                    reference: item.barcode || item.code || item.id || "—",
                    item: item.name || item.product_name || "—",
                    unit: item.sub_unit_name || item.unit_name || "قطعة",
                    quantity,
                    price: cost,
                    value: quantity * cost,
                };
            });
            const totalValue = rows.reduce((sum, row) => sum + numberValue(row.value), 0);
            return { title: definition.title, subtitle: "رصيد كمي وقيمة تقديرية حسب بيانات المنتجات", recordLabel: definition.title, rows, columns: inventoryColumns, summary: [
                { label: "عدد الأصناف", value: String(rows.length) },
                { label: "إجمالي الكمية", value: String(rows.reduce((sum, row) => sum + numberValue(row.quantity), 0)) },
                { label: "قيمة المخزون التقديرية", value: amount(totalValue), emphasis: true },
            ], note: "القيمة تقديرية وتُحسب من الرصيد المتاح وسعر التكلفة أو الشراء المسجل للصنف." };
        }

        if (definition.key === "quotation-register") {
            const rows = list.map((item) => ({
                date: reportDate(item.issue_date || item.created_at), reference: item.quote_number || item.id || "—",
                party: (item.customer as Record<string, unknown> | undefined)?.name || item.customer_name || "—",
                validity: reportDate(item.valid_until), status: statusLabels[String(item.status)] || item.status || "—", amount: numberValue(item.total_amount),
            }));
            return { title: definition.title, subtitle: "سجل العروض والاعتمادات خلال الفترة المتاحة", recordLabel: definition.title, rows, columns: quotationColumns, summary: [
                { label: "إجمالي العروض", value: String(rows.length) },
                { label: "عروض مرسلة", value: String(rows.filter((row) => row.status === "مرسل").length) },
                { label: "إجمالي القيمة", value: amount(rows.reduce((sum, row) => sum + numberValue(row.amount), 0)), emphasis: true },
            ] };
        }

        const isReturn = definition.key === "sales-returns" || definition.key === "purchase-returns";
        const isPurchase = definition.key === "purchase-statement" || definition.key === "purchase-returns";
        const rows = list.map((item) => ({
            date: reportDate(item.invoice_date || item.purchase_date || item.return_date || item.created_at),
            reference: item.invoice_number || item.purchase_number || item.return_number || item.id || "—",
            party: item.customer_name || item.supplier_name || (item.customer as Record<string, unknown> | undefined)?.name || (item.supplier as Record<string, unknown> | undefined)?.name || "—",
            method: statusLabels[String(item.payment_type)] || item.payment_type || (isReturn ? "مرتجع" : "—"),
            amount: numberValue(item.total_amount || item.total_price || item.invoice_price || item.amount),
        }));
        const label = isPurchase ? "المورد" : "العميل";
        const columns = salesColumns.map((column) => column.key === "party" ? { ...column, label } : column);
        return { title: definition.title, subtitle: isReturn ? "حركة المرتجعات المسجلة ومرجعها المالي" : "سجل حركة الفواتير وقيمتها المالية", recordLabel: definition.title, rows, columns, summary: [
            { label: "عدد المستندات", value: String(rows.length) },
            { label: isReturn ? "إجمالي المرتجعات" : "إجمالي الحركة", value: amount(rows.reduce((sum, row) => sum + numberValue(row.amount), 0)), emphasis: true },
        ] };
    }, []);

    const createReport = async () => {
        if (selected.requiresParty && !partyId) {
            showAlert("operational-report-alerts", "يرجى اختيار العميل أو المورد قبل إنشاء كشف الحساب.", "error");
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
            if (!response.success) throw new Error("Report data request failed");
            setPayload(buildPayload(selected, response.data, currentParty));
        } catch {
            showAlert("operational-report-alerts", "تعذر تحميل بيانات التقرير. تحقق من صلاحية البيانات أو أعد المحاولة.", "error");
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
                    <div><p>{domain === "commercial" ? "COMMERCIAL INTELLIGENCE" : "SUPPLY CHAIN INTELLIGENCE"}</p><h1>مركز التقارير والتصدير</h1><span>قوالب عربية موحدة للمعاينة والطباعة والحفظ PDF وتصدير CSV.</span></div>
                    <div className="operational-reports-stamp">Cairo<br />RTL</div>
                </header>
                <div className="operational-reports-grid">
                    {definitions.map((definition) => <button type="button" key={definition.key} onClick={() => setSelectedKey(definition.key)} className={`operational-report-card ${selectedKey === definition.key ? "selected" : ""}`}><span className="operational-report-icon">{definition.icon === "box" ? "▣" : definition.icon === "history" ? "↺" : definition.icon === "book-open" ? "▤" : "▧"}</span><strong>{definition.title}</strong><small>{definition.description}</small></button>)}
                </div>
                <section className="sales-card operational-report-builder">
                    <div><p className="operational-report-overline">القالب الافتراضي</p><h2>{selected.title}</h2><p>{selected.description}</p></div>
                    {selected.requiresParty && <label className="operational-party-picker"><span>{selected.requiresParty === "customer" ? "العميل" : "المورد"}</span><select value={partyId} onChange={(event) => setPartyId(event.target.value)}><option value="">اختر {selected.requiresParty === "customer" ? "العميل" : "المورد"}</option>{partyOptions.map((party) => <option key={party.value} value={party.value}>{party.label}</option>)}</select></label>}
                    <Button variant="primary" icon="eye" onClick={createReport} disabled={isLoading}>{isLoading ? "جارِ إعداد التقرير..." : "معاينة التقرير"}</Button>
                </section>
            </section>
        </MainLayout>
    );
}
