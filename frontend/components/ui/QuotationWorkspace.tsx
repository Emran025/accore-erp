"use client";

import { MainLayout } from "@/components/layout";
import {
    ActionButtons,
    Button,
    Column,
    Dialog,
    DocumentPreview,
    NumberInput,
    Table,
    TextInput,
    showAlert,
} from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate, parseNumber } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

interface QuoteItemDraft {
    id: string;
    description: string;
    sku: string;
    unit: string;
    quantity: string;
    unit_price: string;
    discount_amount: string;
    is_optional: boolean;
}

interface QuotationItem {
    id: number;
    description: string;
    sku?: string | null;
    unit?: string | null;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    line_total: number;
    is_optional: boolean;
}

interface SalesQuotation {
    id: number;
    quote_number: string;
    status: QuotationStatus;
    issue_date: string;
    valid_until?: string | null;
    currency: string;
    customer: {
        id?: number | null;
        name: string;
        contact?: string | null;
        email?: string | null;
        phone?: string | null;
    };
    scope_summary?: string | null;
    payment_terms?: string | null;
    terms_conditions?: string | null;
    notes?: string | null;
    tax_rate: number;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    items?: QuotationItem[];
}

interface QuoteDraft {
    customer_name: string;
    customer_contact: string;
    customer_email: string;
    customer_phone: string;
    issue_date: string;
    valid_until: string;
    currency: string;
    tax_rate: string;
    discount_amount: string;
    scope_summary: string;
    payment_terms: string;
    terms_conditions: string;
    notes: string;
    items: QuoteItemDraft[];
}

const statusLabels: Record<QuotationStatus, string> = {
    draft: "مسودة",
    sent: "مرسل",
    accepted: "مقبول",
    rejected: "مرفوض",
    expired: "منتهي",
};

const statusClasses: Record<QuotationStatus, string> = {
    draft: "quote-status quote-status-draft",
    sent: "quote-status quote-status-sent",
    accepted: "quote-status quote-status-accepted",
    rejected: "quote-status quote-status-rejected",
    expired: "quote-status quote-status-expired",
};

const today = () => new Date().toISOString().slice(0, 10);

const createItem = (): QuoteItemDraft => ({
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: "",
    sku: "",
    unit: "قطعة",
    quantity: "1",
    unit_price: "0",
    discount_amount: "0",
    is_optional: false,
});

const createDraft = (): QuoteDraft => ({
    customer_name: "",
    customer_contact: "",
    customer_email: "",
    customer_phone: "",
    issue_date: today(),
    valid_until: "",
    currency: "SAR",
    tax_rate: "15",
    discount_amount: "0",
    scope_summary: "",
    payment_terms: "دفعة مستحقة عند الاعتماد ما لم يُتفق على خلاف ذلك.",
    terms_conditions: "هذا العرض صالح خلال فترة الصلاحية الموضحة أعلاه. أي تغيير في النطاق أو الكميات يتطلب عرض سعر محدثاً.",
    notes: "",
    items: [createItem()],
});

function escapeHtml(value: string | number | null | undefined): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function quotationReportHtml(quotation: SalesQuotation): string {
    const currency = quotation.currency || "SAR";
    const items = quotation.items ?? [];
    const itemRows = items.map((item, index) => `
        <tr class="${item.is_optional ? "optional" : ""}">
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(item.description)}</strong>${item.sku ? `<span class="sku">${escapeHtml(item.sku)}</span>` : ""}${item.is_optional ? '<span class="optional-label">اختياري</span>' : ""}</td>
            <td>${escapeHtml(item.unit || "-")}</td>
            <td>${item.quantity.toLocaleString("en-US", { maximumFractionDigits: 3 })}</td>
            <td>${formatCurrency(item.unit_price)} ${escapeHtml(currency)}</td>
            <td>${item.discount_amount > 0 ? `${formatCurrency(item.discount_amount)} ${escapeHtml(currency)}` : "—"}</td>
            <td><strong>${formatCurrency(item.line_total)} ${escapeHtml(currency)}</strong></td>
        </tr>`).join("");

    return `
    <article class="quotation-report" dir="rtl">
        <header class="quotation-report-header">
            <div class="quotation-brand">
                <div class="quotation-mark">A</div>
                <div>
                    <p class="eyebrow">ACCORE ERP · COMMERCIAL</p>
                    <h1>عرض سعر</h1>
                    <p class="report-subtitle">QUOTATION</p>
                </div>
            </div>
            <div class="quotation-reference">
                <span>رقم العرض</span>
                <strong>${escapeHtml(quotation.quote_number)}</strong>
                <span class="report-status">${escapeHtml(statusLabels[quotation.status])}</span>
            </div>
        </header>

        <section class="quotation-meta-grid">
            <div class="report-card client-card">
                <p class="report-section-label">مقدم إلى</p>
                <h2>${escapeHtml(quotation.customer.name)}</h2>
                ${quotation.customer.contact ? `<p>${escapeHtml(quotation.customer.contact)}</p>` : ""}
                ${quotation.customer.email ? `<p>${escapeHtml(quotation.customer.email)}</p>` : ""}
                ${quotation.customer.phone ? `<p>${escapeHtml(quotation.customer.phone)}</p>` : ""}
            </div>
            <div class="report-card details-card">
                <p class="report-section-label">تفاصيل العرض</p>
                <dl>
                    <div><dt>تاريخ الإصدار</dt><dd>${escapeHtml(formatDate(quotation.issue_date))}</dd></div>
                    <div><dt>صالح حتى</dt><dd>${quotation.valid_until ? escapeHtml(formatDate(quotation.valid_until)) : "غير محدد"}</dd></div>
                    <div><dt>العملة</dt><dd>${escapeHtml(currency)}</dd></div>
                    <div><dt>ضريبة القيمة المضافة</dt><dd>${quotation.tax_rate}%</dd></div>
                </dl>
            </div>
        </section>

        ${quotation.scope_summary ? `<section class="scope-section"><p class="report-section-label">ملخص العرض</p><p>${escapeHtml(quotation.scope_summary)}</p></section>` : ""}

        <section class="items-section">
            <div class="section-heading"><p class="report-section-label">نطاق المنتجات والخدمات</p><span>${items.length} بند</span></div>
            <table class="report-table">
                <thead><tr><th>#</th><th>الوصف</th><th>الوحدة</th><th>الكمية</th><th>سعر الوحدة</th><th>الخصم</th><th>الإجمالي</th></tr></thead>
                <tbody>${itemRows}</tbody>
            </table>
        </section>

        <section class="quotation-summary-row">
            <div class="terms-preview">
                <p class="report-section-label">شروط الدفع</p>
                <p>${escapeHtml(quotation.payment_terms || "تحدد عند اعتماد العرض.")}</p>
            </div>
            <div class="totals-card">
                <div><span>الإجمالي قبل الضريبة</span><strong>${formatCurrency(quotation.subtotal)} ${escapeHtml(currency)}</strong></div>
                <div><span>الخصم</span><strong>− ${formatCurrency(quotation.discount_amount)} ${escapeHtml(currency)}</strong></div>
                <div><span>الضريبة (${quotation.tax_rate}%)</span><strong>${formatCurrency(quotation.tax_amount)} ${escapeHtml(currency)}</strong></div>
                <div class="grand-total"><span>إجمالي العرض</span><strong>${formatCurrency(quotation.total_amount)} ${escapeHtml(currency)}</strong></div>
            </div>
        </section>

        <section class="report-terms">
            <p class="report-section-label">الشروط والأحكام</p>
            <p>${escapeHtml(quotation.terms_conditions || "يخضع هذا العرض لموافقة الطرفين والشروط التجارية المعتمدة.")}</p>
            ${quotation.notes ? `<p class="report-note"><strong>ملاحظات:</strong> ${escapeHtml(quotation.notes)}</p>` : ""}
        </section>

        <footer class="quotation-approval">
            <div><span>إعداد</span><strong>فريق المبيعات</strong></div>
            <div><span>اعتماد العميل</span><strong>الاسم والتوقيع والتاريخ</strong></div>
        </footer>
    </article>`;
}

export function QuotationWorkspace() {
    const [quotations, setQuotations] = useState<SalesQuotation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draft, setDraft] = useState<QuoteDraft>(createDraft);
    const [previewQuote, setPreviewQuote] = useState<SalesQuotation | null>(null);

    const loadQuotations = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.SALES.QUOTATIONS.BASE);
            if (response.success && response.data) {
                const raw = response.data as { data?: SalesQuotation[] } | SalesQuotation[];
                setQuotations(Array.isArray(raw) ? raw : raw.data ?? []);
            }
        } catch {
            showAlert("quotation-alerts", "Unable to load quotations. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadQuotations();
    }, [loadQuotations]);

    const calculatedTotals = useMemo(() => {
        const subtotal = draft.items.reduce((sum, item) => {
            if (item.is_optional) return sum;
            return sum + Math.max(0, parseNumber(item.quantity) * parseNumber(item.unit_price) - parseNumber(item.discount_amount));
        }, 0);
        const discount = Math.min(Math.max(0, parseNumber(draft.discount_amount)), subtotal);
        const tax = (subtotal - discount) * (Math.max(0, parseNumber(draft.tax_rate)) / 100);
        return { subtotal, discount, tax, total: subtotal - discount + tax };
    }, [draft]);

    const updateItem = (id: string, patch: Partial<QuoteItemDraft>) => {
        setDraft((current) => ({
            ...current,
            items: current.items.map((item) => item.id === id ? { ...item, ...patch } : item),
        }));
    };

    const openEditor = () => {
        setDraft(createDraft());
        setIsEditorOpen(true);
    };

    const openPreview = async (quotation: SalesQuotation) => {
        if (quotation.items) {
            setPreviewQuote(quotation);
            return;
        }
        try {
            const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.SALES.QUOTATIONS.withId(quotation.id));
            if (response.success && response.data) {
                setPreviewQuote(response.data as SalesQuotation);
            }
        } catch {
            showAlert("quotation-alerts", "Unable to load this quotation report.", "error");
        }
    };

    const saveQuotation = async () => {
        const validItems = draft.items.filter((item) => item.description.trim());
        if (!draft.customer_name.trim() || validItems.length === 0) {
            showAlert("quotation-alerts", "Please enter a customer and at least one quoted item.", "error");
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.SALES.QUOTATIONS.BASE, {
                method: "POST",
                body: JSON.stringify({
                    ...draft,
                    tax_rate: parseNumber(draft.tax_rate),
                    discount_amount: parseNumber(draft.discount_amount),
                    valid_until: draft.valid_until || null,
                    items: validItems.map((item, index) => ({
                        description: item.description,
                        sku: item.sku || null,
                        unit: item.unit || null,
                        quantity: parseNumber(item.quantity),
                        unit_price: parseNumber(item.unit_price),
                        discount_amount: parseNumber(item.discount_amount),
                        is_optional: item.is_optional,
                        sort_order: index,
                    })),
                }),
            });

            if (!response.success || !response.data) {
                throw new Error("Quotation creation failed");
            }

            setIsEditorOpen(false);
            setPreviewQuote(response.data as SalesQuotation);
            await loadQuotations();
            showAlert("quotation-alerts", "Quotation created successfully.", "success");
        } catch {
            showAlert("quotation-alerts", "Unable to create the quotation. Verify the information and try again.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const updateStatus = async (quotation: SalesQuotation, status: QuotationStatus) => {
        try {
            const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.SALES.QUOTATIONS.STATUS(quotation.id), {
                method: "POST",
                body: JSON.stringify({ status }),
            });
            if (!response.success) throw new Error("Quotation status update failed");
            await loadQuotations();
        } catch {
            showAlert("quotation-alerts", "Unable to update the quotation status.", "error");
        }
    };

    const columns: Column<SalesQuotation>[] = [
        { key: "quote_number", header: "رقم العرض", dataLabel: "رقم العرض", render: (quote) => <strong>{quote.quote_number}</strong> },
        { key: "customer", header: "العميل", dataLabel: "العميل", render: (quote) => <div><strong>{quote.customer.name}</strong><span className="quote-table-secondary">{quote.customer.contact || quote.customer.email || "—"}</span></div> },
        { key: "issue_date", header: "الإصدار والصلاحية", dataLabel: "الإصدار والصلاحية", render: (quote) => <div><span>{formatDate(quote.issue_date)}</span><span className="quote-table-secondary">حتى {quote.valid_until ? formatDate(quote.valid_until) : "غير محدد"}</span></div> },
        { key: "total_amount", header: "إجمالي العرض", dataLabel: "إجمالي العرض", render: (quote) => <strong>{formatCurrency(quote.total_amount)} {quote.currency}</strong> },
        { key: "status", header: "الحالة", dataLabel: "الحالة", render: (quote) => <span className={statusClasses[quote.status]}>{statusLabels[quote.status]}</span> },
        { key: "actions", header: "الإجراءات", dataLabel: "الإجراءات", render: (quote) => <ActionButtons actions={[
            { icon: "eye", title: "عرض التقرير", onClick: () => openPreview(quote), variant: "view" },
            { icon: "send", title: "تعيين كمرسل", onClick: () => updateStatus(quote, "sent"), variant: "primary", hidden: quote.status !== "draft" },
            { icon: "check", title: "تعيين كمقبول", onClick: () => updateStatus(quote, "accepted"), variant: "success", hidden: quote.status !== "sent" },
        ]} /> },
    ];

    if (previewQuote) {
        return (
            <MainLayout requiredModule="sales" requiredAction="view">
                <DocumentPreview
                    title={`عرض سعر ${previewQuote.quote_number}`}
                    htmlContent={quotationReportHtml(previewQuote)}
                    onBack={() => setPreviewQuote(null)}
                    titleIcon="file-text"
                />
            </MainLayout>
        );
    }

    return (
        <MainLayout requiredModule="sales" requiredAction="view">
            <div id="quotation-alerts" />
            <section className="quote-workspace">
                <div className="quote-workspace-header">
                    <div>
                        <p className="quote-kicker">SALES OPERATIONS</p>
                        <h1>عروض الأسعار</h1>
                        <p>أنشئ عرضاً واضحاً وقابلاً للطباعة، ثم تابع حالته من المسودة إلى الاعتماد.</p>
                    </div>
                    <Button variant="primary" icon="plus" onClick={openEditor}>عرض سعر جديد</Button>
                </div>

                <div className="quote-metric-row">
                    <div className="quote-metric"><span>إجمالي العروض</span><strong>{quotations.length}</strong></div>
                    <div className="quote-metric"><span>بانتظار المتابعة</span><strong>{quotations.filter((quote) => quote.status === "sent").length}</strong></div>
                    <div className="quote-metric"><span>قيمة العروض المرسلة</span><strong>{formatCurrency(quotations.filter((quote) => quote.status === "sent").reduce((sum, quote) => sum + quote.total_amount, 0))} SAR</strong></div>
                </div>

                <div className="sales-card quote-list-card">
                    <div className="quote-list-heading"><div><h2>سجل عروض الأسعار</h2><p>يعرض كل عرض رقم مرجعي، العميل، تاريخ الصلاحية، القيمة، وحالة القرار.</p></div></div>
                    <Table columns={columns} data={quotations} keyExtractor={(quote) => quote.id} isLoading={isLoading} emptyMessage="لا توجد عروض أسعار حتى الآن" />
                </div>
            </section>

            <Dialog
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                title="إنشاء عرض سعر"
                maxWidth="1100px"
                footer={<><Button variant="secondary" onClick={() => setIsEditorOpen(false)}>إلغاء</Button><Button variant="primary" icon="check" onClick={saveQuotation} disabled={isSaving}>{isSaving ? "جارِ الحفظ..." : "حفظ ومعاينة"}</Button></>}
            >
                <div className="quote-editor">
                    <section className="quote-editor-section">
                        <div className="quote-editor-heading"><span>01</span><div><h3>بيانات العميل والعرض</h3><p>تظهر هذه البيانات في رأس التقرير المهني.</p></div></div>
                        <div className="quote-form-grid">
                            <TextInput label="اسم العميل أو المنشأة" value={draft.customer_name} onChange={(event) => setDraft({ ...draft, customer_name: event.target.value })} required />
                            <TextInput label="اسم جهة التواصل" value={draft.customer_contact} onChange={(event) => setDraft({ ...draft, customer_contact: event.target.value })} />
                            <TextInput label="البريد الإلكتروني" type="email" value={draft.customer_email} onChange={(event) => setDraft({ ...draft, customer_email: event.target.value })} />
                            <TextInput label="رقم الهاتف" value={draft.customer_phone} onChange={(event) => setDraft({ ...draft, customer_phone: event.target.value })} />
                            <TextInput label="تاريخ الإصدار" type="date" value={draft.issue_date} onChange={(event) => setDraft({ ...draft, issue_date: event.target.value })} required />
                            <TextInput label="صالح حتى" type="date" value={draft.valid_until} onChange={(event) => setDraft({ ...draft, valid_until: event.target.value })} min={draft.issue_date} />
                        </div>
                    </section>

                    <section className="quote-editor-section">
                        <div className="quote-editor-heading"><span>02</span><div><h3>المنتجات أو الخدمات</h3><p>البنود الاختيارية تظهر في التقرير ولكن لا تدخل ضمن إجمالي العرض.</p></div><Button variant="secondary" icon="plus" onClick={() => setDraft({ ...draft, items: [...draft.items, createItem()] })}>إضافة بند</Button></div>
                        <div className="quote-items-editor">
                            {draft.items.map((item, index) => (
                                <div className="quote-item-row" key={item.id}>
                                    <span className="quote-item-index">{String(index + 1).padStart(2, "0")}</span>
                                    <div className="quote-item-description"><TextInput label="الوصف" value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} placeholder="اسم المنتج أو وصف الخدمة" /></div>
                                    <TextInput label="الرمز" value={item.sku} onChange={(event) => updateItem(item.id, { sku: event.target.value })} placeholder="SKU" />
                                    <TextInput label="الوحدة" value={item.unit} onChange={(event) => updateItem(item.id, { unit: event.target.value })} />
                                    <NumberInput label="الكمية" value={item.quantity} onChange={(value) => updateItem(item.id, { quantity: String(value) })} min={0.001} step={0.001} />
                                    <NumberInput label="سعر الوحدة" value={item.unit_price} onChange={(value) => updateItem(item.id, { unit_price: String(value) })} min={0} step={0.01} />
                                    <NumberInput label="خصم البند" value={item.discount_amount} onChange={(value) => updateItem(item.id, { discount_amount: String(value) })} min={0} step={0.01} />
                                    <label className="quote-optional-toggle"><input type="checkbox" checked={item.is_optional} onChange={(event) => updateItem(item.id, { is_optional: event.target.checked })} /> اختياري</label>
                                    <button className="icon-btn delete" type="button" title="حذف البند" disabled={draft.items.length === 1} onClick={() => setDraft({ ...draft, items: draft.items.filter((entry) => entry.id !== item.id) })}>×</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="quote-editor-section quote-editor-bottom-grid">
                        <div>
                            <div className="quote-editor-heading"><span>03</span><div><h3>الشروط والتفاصيل</h3><p>أضف ملخص النطاق وشروط الدفع بلغة واضحة.</p></div></div>
                            <label className="quote-textarea-label">ملخص العرض<textarea value={draft.scope_summary} onChange={(event) => setDraft({ ...draft, scope_summary: event.target.value })} placeholder="ملخص مختصر للقيمة والنطاق المقدم للعميل" /></label>
                            <label className="quote-textarea-label">شروط الدفع<textarea value={draft.payment_terms} onChange={(event) => setDraft({ ...draft, payment_terms: event.target.value })} /></label>
                            <label className="quote-textarea-label">الشروط والأحكام<textarea value={draft.terms_conditions} onChange={(event) => setDraft({ ...draft, terms_conditions: event.target.value })} /></label>
                            <label className="quote-textarea-label">ملاحظات داخلية أو للعميل<textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
                        </div>
                        <aside className="quote-calculation-card">
                            <p>ملخص التسعير</p>
                            <TextInput label="العملة" value={draft.currency} maxLength={3} onChange={(event) => setDraft({ ...draft, currency: event.target.value.toUpperCase() })} />
                            <NumberInput label="نسبة الضريبة %" value={draft.tax_rate} onChange={(value) => setDraft({ ...draft, tax_rate: String(value) })} min={0} max={100} step={0.01} />
                            <NumberInput label="خصم إجمالي العرض" value={draft.discount_amount} onChange={(value) => setDraft({ ...draft, discount_amount: String(value) })} min={0} step={0.01} />
                            <div className="quote-calculation-lines"><div><span>الإجمالي قبل الضريبة</span><strong>{formatCurrency(calculatedTotals.subtotal)} {draft.currency}</strong></div><div><span>الضريبة</span><strong>{formatCurrency(calculatedTotals.tax)} {draft.currency}</strong></div><div className="quote-calculation-total"><span>إجمالي العرض</span><strong>{formatCurrency(calculatedTotals.total)} {draft.currency}</strong></div></div>
                        </aside>
                    </section>
                </div>
            </Dialog>
        </MainLayout>
    );
}
