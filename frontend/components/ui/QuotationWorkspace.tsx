"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
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
    draft: catalogMessage("text_552aec56f591"),
    sent: catalogMessage("text_756615880a6a"),
    accepted: catalogMessage("text_f5fde9cba1be"),
    rejected: catalogMessage("text_5d969a71dad3"),
    expired: catalogMessage("text_6217883aee8e"),
};

const statusClasses: Record<QuotationStatus, string> = {
    draft: catalogMessage("text_736170525e3c"),
    sent: catalogMessage("text_d5c2a07e7fcc"),
    accepted: catalogMessage("text_be75048bdcda"),
    rejected: catalogMessage("text_62fae4789b01"),
    expired: catalogMessage("text_ea340bf0553c"),
};

const today = () => new Date().toISOString().slice(0, 10);

const createItem = (): QuoteItemDraft => ({
    id: catalogMessage("text_a78a65371033", { value0: Date.now(), value1: Math.random().toString(36).slice(2, 7) }),
    description: "",
    sku: "",
    unit: catalogMessage("text_848514abbbfd"),
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
    payment_terms: catalogMessage("text_216e89e19cfe"),
    terms_conditions: catalogMessage("text_7d3779e47aa7"),
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
            <td><strong>${escapeHtml(item.description)}</strong>${item.sku ? `<span class="sku">${escapeHtml(item.sku)}</span>` : ""}${item.is_optional ? catalogMessage("text_6b81bbfaba46") : ""}</td>
            <td>${escapeHtml(item.unit || "-")}</td>
            <td>${item.quantity.toLocaleString("en-US", { maximumFractionDigits: 3 })}</td>
            <td>${formatCurrency(item.unit_price)} ${escapeHtml(currency)}</td>
            <td>${item.discount_amount > 0 ? catalogMessage("text_54ef3bb1085e", { value0: formatCurrency(item.discount_amount), value1: escapeHtml(currency) }) : "—"}</td>
            <td><strong>${formatCurrency(item.line_total)} ${escapeHtml(currency)}</strong></td>
        </tr>`).join("");

    return catalogMessage("text_8d96a8d450b8", { value0: escapeHtml(quotation.quote_number), value1: escapeHtml(statusLabels[quotation.status]), value2: escapeHtml(quotation.customer.name), value3: quotation.customer.contact ? catalogMessage("text_60c66cd3c197", { value0: escapeHtml(quotation.customer.contact) }) : "", value4: quotation.customer.email ? catalogMessage("text_60c66cd3c197", { value0: escapeHtml(quotation.customer.email) }) : "", value5: quotation.customer.phone ? catalogMessage("text_60c66cd3c197", { value0: escapeHtml(quotation.customer.phone) }) : "", value6: escapeHtml(formatDate(quotation.issue_date)), value7: quotation.valid_until ? escapeHtml(formatDate(quotation.valid_until)) : catalogMessage("text_5a0374f3ff5a"), value8: escapeHtml(currency), value9: quotation.tax_rate, value10: quotation.scope_summary ? catalogMessage("text_7a3003358027", { value0: escapeHtml(quotation.scope_summary) }) : "", value11: items.length, value12: itemRows, value13: escapeHtml(quotation.payment_terms || catalogMessage("text_c7fd4b15a133")), value14: formatCurrency(quotation.subtotal), value15: escapeHtml(currency), value16: formatCurrency(quotation.discount_amount), value17: escapeHtml(currency), value18: quotation.tax_rate, value19: formatCurrency(quotation.tax_amount), value20: escapeHtml(currency), value21: formatCurrency(quotation.total_amount), value22: escapeHtml(currency), value23: escapeHtml(quotation.terms_conditions || catalogMessage("text_45fe3f24274e")), value24: quotation.notes ? catalogMessage("text_8fc0f715a62f", { value0: escapeHtml(quotation.notes) }) : "" });
}

export function QuotationWorkspace() {
    const { t: i18n } = useI18n();
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
            showAlert("quotation-alerts", i18n.catalog["text_e70735b1b580"], "error");
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
            showAlert("quotation-alerts", i18n.catalog["text_f825e5a764ec"], "error");
        }
    };

    const saveQuotation = async () => {
        const validItems = draft.items.filter((item) => item.description.trim());
        if (!draft.customer_name.trim() || validItems.length === 0) {
            showAlert("quotation-alerts", i18n.catalog["text_ff0913dec1db"], "error");
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
                throw new Error(i18n.catalog["text_80cafcb66f6e"]);
            }

            setIsEditorOpen(false);
            setPreviewQuote(response.data as SalesQuotation);
            await loadQuotations();
            showAlert("quotation-alerts", i18n.catalog["text_8198ba29a588"], "success");
        } catch {
            showAlert("quotation-alerts", i18n.catalog["text_56d266205539"], "error");
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
            if (!response.success) throw new Error(i18n.catalog["text_67ceb280551e"]);
            await loadQuotations();
        } catch {
            showAlert("quotation-alerts", i18n.catalog["text_2357f0ee22eb"], "error");
        }
    };

    const columns: Column<SalesQuotation>[] = [
        { key: "quote_number", header: i18n.catalog["text_ca7eb691cd25"], dataLabel: i18n.catalog["text_ca7eb691cd25"], render: (quote) => <strong>{quote.quote_number}</strong> },
        { key: "customer", header: i18n.catalog["text_a042411e90be"], dataLabel: i18n.catalog["text_a042411e90be"], render: (quote) => <div><strong>{quote.customer.name}</strong><span className="quote-table-secondary">{quote.customer.contact || quote.customer.email || "—"}</span></div> },
        { key: "issue_date", header: i18n.catalog["text_a64d1f179d71"], dataLabel: i18n.catalog["text_a64d1f179d71"], render: (quote) => <div><span>{formatDate(quote.issue_date)}</span><span className="quote-table-secondary">{i18n.catalog["text_08b034994862"]}{quote.valid_until ? formatDate(quote.valid_until) : i18n.catalog["text_5a0374f3ff5a"]}</span></div> },
        { key: "total_amount", header: i18n.catalog["text_fc253ec59271"], dataLabel: i18n.catalog["text_fc253ec59271"], render: (quote) => <strong>{formatCurrency(quote.total_amount)} {quote.currency}</strong> },
        { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (quote) => <span className={statusClasses[quote.status]}>{statusLabels[quote.status]}</span> },
        { key: "actions", header: i18n.catalog["text_7797240d6caf"], dataLabel: i18n.catalog["text_7797240d6caf"], render: (quote) => <ActionButtons actions={[
            { icon: "eye", title: i18n.catalog["text_92ad0d774e56"], onClick: () => openPreview(quote), variant: "view" },
            { icon: "send", title: i18n.catalog["text_7ff9e3a8ce4a"], onClick: () => updateStatus(quote, "sent"), variant: "primary", hidden: quote.status !== "draft" },
            { icon: "check", title: i18n.catalog["text_25238bf2b001"], onClick: () => updateStatus(quote, "accepted"), variant: "success", hidden: quote.status !== "sent" },
        ]} /> },
    ];

    if (previewQuote) {
        return (
            <MainLayout requiredModule="sales" requiredAction="view">
                <DocumentPreview
                    title={catalogText(i18n, "text_ae439eb08e67", { value0: previewQuote.quote_number })}
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
                        <p className="quote-kicker">{i18n.catalog["text_bae5ad0f5918"]}</p>
                        <h1>{i18n.catalog["text_6ca2c33f29f9"]}</h1>
                        <p>{i18n.catalog["text_cf77b313f13e"]}</p>
                    </div>
                    <Button variant="primary" icon="plus" onClick={openEditor}>{i18n.catalog["text_b3d8e6578879"]}</Button>
                </div>

                <div className="quote-metric-row">
                    <div className="quote-metric"><span>{i18n.catalog["text_0ca7e1aa81b4"]}</span><strong>{quotations.length}</strong></div>
                    <div className="quote-metric"><span>{i18n.catalog["text_6af07b28761a"]}</span><strong>{quotations.filter((quote) => quote.status === "sent").length}</strong></div>
                    <div className="quote-metric"><span>{i18n.catalog["text_0eed6e1d67a6"]}</span><strong>{formatCurrency(quotations.filter((quote) => quote.status === "sent").reduce((sum, quote) => sum + quote.total_amount, 0))} SAR</strong></div>
                </div>

                <div className="sales-card quote-list-card">
                    <div className="quote-list-heading"><div><h2>{i18n.catalog["text_f29073a16394"]}</h2><p>{i18n.catalog["text_4e37fca5bf6e"]}</p></div></div>
                    <Table columns={columns} data={quotations} keyExtractor={(quote) => quote.id} isLoading={isLoading} emptyMessage={i18n.catalog["text_4bd811aefece"]} />
                </div>
            </section>

            <Dialog
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                title={i18n.catalog["text_c8068c1ec743"]}
                maxWidth="1100px"
                footer={<><Button variant="secondary" onClick={() => setIsEditorOpen(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" icon="check" onClick={saveQuotation} disabled={isSaving}>{isSaving ? i18n.catalog["text_331d11181d00"] : i18n.catalog["text_bd0d53661148"]}</Button></>}
            >
                <div className="quote-editor">
                    <section className="quote-editor-section">
                        <div className="quote-editor-heading"><span>01</span><div><h3>{i18n.catalog["text_f950485dc47c"]}</h3><p>{i18n.catalog["text_0d78384e94d1"]}</p></div></div>
                        <div className="quote-form-grid">
                            <TextInput label={i18n.catalog["text_a77f8954b8c7"]} value={draft.customer_name} onChange={(event) => setDraft({ ...draft, customer_name: event.target.value })} required />
                            <TextInput label={i18n.catalog["text_12d7fa1332c0"]} value={draft.customer_contact} onChange={(event) => setDraft({ ...draft, customer_contact: event.target.value })} />
                            <TextInput label={i18n.catalog["text_ddf0fca39a4f"]} type="email" value={draft.customer_email} onChange={(event) => setDraft({ ...draft, customer_email: event.target.value })} />
                            <TextInput label={i18n.catalog["text_42095a7a6c15"]} value={draft.customer_phone} onChange={(event) => setDraft({ ...draft, customer_phone: event.target.value })} />
                            <TextInput label={i18n.catalog["text_4e5892a34a06"]} type="date" value={draft.issue_date} onChange={(event) => setDraft({ ...draft, issue_date: event.target.value })} required />
                            <TextInput label={i18n.catalog["text_817b190b2a5c"]} type="date" value={draft.valid_until} onChange={(event) => setDraft({ ...draft, valid_until: event.target.value })} min={draft.issue_date} />
                        </div>
                    </section>

                    <section className="quote-editor-section">
                        <div className="quote-editor-heading"><span>02</span><div><h3>{i18n.catalog["text_b729f945a8b9"]}</h3><p>{i18n.catalog["text_639ec6cc43ee"]}</p></div><Button variant="secondary" icon="plus" onClick={() => setDraft({ ...draft, items: [...draft.items, createItem()] })}>{i18n.catalog["text_5f22a0b05e6c"]}</Button></div>
                        <div className="quote-items-editor">
                            {draft.items.map((item, index) => (
                                <div className="quote-item-row" key={item.id}>
                                    <span className="quote-item-index">{String(index + 1).padStart(2, "0")}</span>
                                    <div className="quote-item-description"><TextInput label={i18n.catalog["text_95023fc76e1b"]} value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} placeholder={i18n.catalog["text_79a54002f7a1"]} /></div>
                                    <TextInput label={i18n.catalog["text_589c6420ea10"]} value={item.sku} onChange={(event) => updateItem(item.id, { sku: event.target.value })} placeholder={i18n.catalog["text_f88ba99c9b34"]} />
                                    <TextInput label={i18n.catalog["text_9a08d7d4bf73"]} value={item.unit} onChange={(event) => updateItem(item.id, { unit: event.target.value })} />
                                    <NumberInput label={i18n.catalog["text_935e21853946"]} value={item.quantity} onChange={(value) => updateItem(item.id, { quantity: String(value) })} min={0.001} step={0.001} />
                                    <NumberInput label={i18n.catalog["text_c274e3ec351e"]} value={item.unit_price} onChange={(value) => updateItem(item.id, { unit_price: String(value) })} min={0} step={0.01} />
                                    <NumberInput label={i18n.catalog["text_dd9222e726f6"]} value={item.discount_amount} onChange={(value) => updateItem(item.id, { discount_amount: String(value) })} min={0} step={0.01} />
                                    <label className="quote-optional-toggle"><input type="checkbox" checked={item.is_optional} onChange={(event) => updateItem(item.id, { is_optional: event.target.checked })} /> {i18n.catalog["text_33408684704e"]}</label>
                                    <button className="icon-btn delete" type="button" title={i18n.catalog["text_8815edd3127f"]} disabled={draft.items.length === 1} onClick={() => setDraft({ ...draft, items: draft.items.filter((entry) => entry.id !== item.id) })}>×</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="quote-editor-section quote-editor-bottom-grid">
                        <div>
                            <div className="quote-editor-heading"><span>03</span><div><h3>{i18n.catalog["text_0567b5961fc0"]}</h3><p>{i18n.catalog["text_1f7db325965d"]}</p></div></div>
                            <label className="quote-textarea-label">{i18n.catalog["text_e1a62095d876"]}<textarea value={draft.scope_summary} onChange={(event) => setDraft({ ...draft, scope_summary: event.target.value })} placeholder={i18n.catalog["text_5e696d233db0"]} /></label>
                            <label className="quote-textarea-label">{i18n.catalog["text_a97195003727"]}<textarea value={draft.payment_terms} onChange={(event) => setDraft({ ...draft, payment_terms: event.target.value })} /></label>
                            <label className="quote-textarea-label">{i18n.catalog["text_370b1e9cba0a"]}<textarea value={draft.terms_conditions} onChange={(event) => setDraft({ ...draft, terms_conditions: event.target.value })} /></label>
                            <label className="quote-textarea-label">{i18n.catalog["text_6d5915f0cda5"]}<textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
                        </div>
                        <aside className="quote-calculation-card">
                            <p>{i18n.catalog["text_723608e5ccb0"]}</p>
                            <TextInput label={i18n.catalog["text_30ce3a1dae2c"]} value={draft.currency} maxLength={3} onChange={(event) => setDraft({ ...draft, currency: event.target.value.toUpperCase() })} />
                            <NumberInput label={i18n.catalog["text_adf9c1b57c2f"]} value={draft.tax_rate} onChange={(value) => setDraft({ ...draft, tax_rate: String(value) })} min={0} max={100} step={0.01} />
                            <NumberInput label={i18n.catalog["text_f6ab002cd1be"]} value={draft.discount_amount} onChange={(value) => setDraft({ ...draft, discount_amount: String(value) })} min={0} step={0.01} />
                            <div className="quote-calculation-lines"><div><span>{i18n.catalog["text_76165bc3874a"]}</span><strong>{formatCurrency(calculatedTotals.subtotal)} {draft.currency}</strong></div><div><span>{i18n.catalog["text_95225d7e9c03"]}</span><strong>{formatCurrency(calculatedTotals.tax)} {draft.currency}</strong></div><div className="quote-calculation-total"><span>{i18n.catalog["text_fc253ec59271"]}</span><strong>{formatCurrency(calculatedTotals.total)} {draft.currency}</strong></div></div>
                        </aside>
                    </section>
                </div>
            </Dialog>
        </MainLayout>
    );
}
