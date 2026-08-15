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
    draft: catalogMessage("common.general.draft"),
    sent: catalogMessage("common.general.sender"),
    accepted: catalogMessage("common.general.accepted"),
    rejected: catalogMessage("common.general.rejected"),
    expired: catalogMessage("common.general.expired"),
};

const statusClasses: Record<QuotationStatus, string> = {
    draft: catalogMessage("ui.quotation.quoteStatusQuoteStatusDraft"),
    sent: catalogMessage("ui.quotation.quoteStatusQuoteStatusSent"),
    accepted: catalogMessage("ui.quotation.quoteStatusQuoteStatusAccepted"),
    rejected: catalogMessage("ui.quotation.quoteStatusQuoteStatusRejected"),
    expired: catalogMessage("ui.quotation.quoteStatusQuoteStatusExpired"),
};

const today = () => new Date().toISOString().slice(0, 10);

const createItem = (): QuoteItemDraft => ({
    id: catalogMessage("ui.quotation.item", { value0: Date.now(), value1: Math.random().toString(36).slice(2, 7) }),
    description: "",
    sku: "",
    unit: catalogMessage("common.general.piece"),
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
    payment_terms: catalogMessage("ui.quotation.paymentDueUponApprovalUnlessOtherwiseAgreed"),
    terms_conditions: catalogMessage("ui.quotation.thisQuoteIsValidPeriodShownAboveAny"),
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
            <td><strong>${escapeHtml(item.description)}</strong>${item.sku ? `<span class="sku">${escapeHtml(item.sku)}</span>` : ""}${item.is_optional ? catalogMessage("ui.quotation.optional") : ""}</td>
            <td>${escapeHtml(item.unit || "-")}</td>
            <td>${item.quantity.toLocaleString("en-US", { maximumFractionDigits: 3 })}</td>
            <td>${formatCurrency(item.unit_price)} ${escapeHtml(currency)}</td>
            <td>${item.discount_amount > 0 ? catalogMessage("common.general.notAvailable.alternative3", { value0: formatCurrency(item.discount_amount), value1: escapeHtml(currency) }) : "—"}</td>
            <td><strong>${formatCurrency(item.line_total)} ${escapeHtml(currency)}</strong></td>
        </tr>`).join("");

    return catalogMessage("ui.quotation.accoreErpCommercialQuotationQuotationQuoteNumber", { value0: escapeHtml(quotation.quote_number), value1: escapeHtml(statusLabels[quotation.status]), value2: escapeHtml(quotation.customer.name), value3: quotation.customer.contact ? catalogMessage("common.general.notAvailable.alternative4", { value0: escapeHtml(quotation.customer.contact) }) : "", value4: quotation.customer.email ? catalogMessage("common.general.notAvailable.alternative4", { value0: escapeHtml(quotation.customer.email) }) : "", value5: quotation.customer.phone ? catalogMessage("common.general.notAvailable.alternative4", { value0: escapeHtml(quotation.customer.phone) }) : "", value6: escapeHtml(formatDate(quotation.issue_date)), value7: quotation.valid_until ? escapeHtml(formatDate(quotation.valid_until)) : catalogMessage("common.general.unspecified"), value8: escapeHtml(currency), value9: quotation.tax_rate, value10: quotation.scope_summary ? catalogMessage("ui.quotation.offerSummary", { value0: escapeHtml(quotation.scope_summary) }) : "", value11: items.length, value12: itemRows, value13: escapeHtml(quotation.payment_terms || catalogMessage("ui.quotation.determinedUponQuoteApproval")), value14: formatCurrency(quotation.subtotal), value15: escapeHtml(currency), value16: formatCurrency(quotation.discount_amount), value17: escapeHtml(currency), value18: quotation.tax_rate, value19: formatCurrency(quotation.tax_amount), value20: escapeHtml(currency), value21: formatCurrency(quotation.total_amount), value22: escapeHtml(currency), value23: escapeHtml(quotation.terms_conditions || catalogMessage("ui.quotation.thisOfferIsSubjectBothPartiesApprovalApproved")), value24: quotation.notes ? catalogMessage("ui.quotation.notes", { value0: escapeHtml(quotation.notes) }) : "" });
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
            showAlert("quotation-alerts", i18n.catalog["ui.quotation.unableLoadQuotationsPleaseTryAgain"], "error");
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
            showAlert("quotation-alerts", i18n.catalog["ui.quotation.unableLoadThisQuotationReport"], "error");
        }
    };

    const saveQuotation = async () => {
        const validItems = draft.items.filter((item) => item.description.trim());
        if (!draft.customer_name.trim() || validItems.length === 0) {
            showAlert("quotation-alerts", i18n.catalog["ui.quotation.pleaseEnterCustomerLeastOneQuotedItem"], "error");
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
                throw new Error(i18n.catalog["ui.quotation.quotationCreationFailed"]);
            }

            setIsEditorOpen(false);
            setPreviewQuote(response.data as SalesQuotation);
            await loadQuotations();
            showAlert("quotation-alerts", i18n.catalog["ui.quotation.quotationCreatedSuccessfully"], "success");
        } catch {
            showAlert("quotation-alerts", i18n.catalog["ui.quotation.unableCreateQuotationVerifyInformationTryAgain"], "error");
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
            if (!response.success) throw new Error(i18n.catalog["ui.quotation.quotationStatusUpdateFailed"]);
            await loadQuotations();
        } catch {
            showAlert("quotation-alerts", i18n.catalog["ui.quotation.unableUpdateQuotationStatus"], "error");
        }
    };

    const columns: Column<SalesQuotation>[] = [
        { key: "quote_number", header: i18n.catalog["common.general.quoteNumber"], dataLabel: i18n.catalog["common.general.quoteNumber"], render: (quote) => <strong>{quote.quote_number}</strong> },
        { key: "customer", header: i18n.catalog["common.general.customer"], dataLabel: i18n.catalog["common.general.customer"], render: (quote) => <div><strong>{quote.customer.name}</strong><span className="quote-table-secondary">{quote.customer.contact || quote.customer.email || "—"}</span></div> },
        { key: "issue_date", header: i18n.catalog["common.general.issuanceValidity"], dataLabel: i18n.catalog["common.general.issuanceValidity"], render: (quote) => <div><span>{formatDate(quote.issue_date)}</span><span className="quote-table-secondary">{i18n.catalog["common.general.until"]}{quote.valid_until ? formatDate(quote.valid_until) : i18n.catalog["common.general.unspecified"]}</span></div> },
        { key: "total_amount", header: i18n.catalog["common.general.totalOffer"], dataLabel: i18n.catalog["common.general.totalOffer"], render: (quote) => <strong>{formatCurrency(quote.total_amount)} {quote.currency}</strong> },
        { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (quote) => <span className={statusClasses[quote.status]}>{statusLabels[quote.status]}</span> },
        { key: "actions", header: i18n.catalog["common.general.actions"], dataLabel: i18n.catalog["common.general.actions"], render: (quote) => <ActionButtons actions={[
            { icon: "eye", title: i18n.catalog["common.general.viewReport"], onClick: () => openPreview(quote), variant: "view" },
            { icon: "send", title: i18n.catalog["ui.quotation.setAsSender"], onClick: () => updateStatus(quote, "sent"), variant: "primary", hidden: quote.status !== "draft" },
            { icon: "check", title: i18n.catalog["ui.quotation.markAsAccepted"], onClick: () => updateStatus(quote, "accepted"), variant: "success", hidden: quote.status !== "sent" },
        ]} /> },
    ];

    if (previewQuote) {
        return (
            <MainLayout requiredModule="sales" requiredAction="view">
                <DocumentPreview
                    title={catalogText(i18n, "ui.quotation.quote", { value0: previewQuote.quote_number })}
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
                        <p className="quote-kicker">{i18n.catalog["ui.quotation.salesOperations"]}</p>
                        <h1>{i18n.catalog["common.general.quotes"]}</h1>
                        <p>{i18n.catalog["ui.quotation.createClearPrintableQuotationThenTrackItsStatus"]}</p>
                    </div>
                    <Button variant="primary" icon="plus" onClick={openEditor}>{i18n.catalog["ui.quotation.newQuote"]}</Button>
                </div>

                <div className="quote-metric-row">
                    <div className="quote-metric"><span>{i18n.catalog["common.general.totalOffers"]}</span><strong>{quotations.length}</strong></div>
                    <div className="quote-metric"><span>{i18n.catalog["ui.quotation.awaitingFollowUp"]}</span><strong>{quotations.filter((quote) => quote.status === "sent").length}</strong></div>
                    <div className="quote-metric"><span>{i18n.catalog["ui.quotation.valueSubmittedBids"]}</span><strong>{formatCurrency(quotations.filter((quote) => quote.status === "sent").reduce((sum, quote) => sum + quote.total_amount, 0))} SAR</strong></div>
                </div>

                <div className="sales-card quote-list-card">
                    <div className="quote-list-heading"><div><h2>{i18n.catalog["common.general.quotesLog"]}</h2><p>{i18n.catalog["ui.quotation.displaysEachQuoteSReferenceNumberCustomerExpiryDate"]}</p></div></div>
                    <Table columns={columns} data={quotations} keyExtractor={(quote) => quote.id} isLoading={isLoading} emptyMessage={i18n.catalog["ui.quotation.noQuotesYet"]} />
                </div>
            </section>

            <Dialog
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                title={i18n.catalog["ui.quotation.createQuote"]}
                maxWidth="1100px"
                footer={<><Button variant="secondary" onClick={() => setIsEditorOpen(false)}>{i18n.catalog["common.general.cancel"]}</Button><Button variant="primary" icon="check" onClick={saveQuotation} disabled={isSaving}>{isSaving ? i18n.catalog["ui.quotation.saving"] : i18n.catalog["ui.quotation.savePreview"]}</Button></>}
            >
                <div className="quote-editor">
                    <section className="quote-editor-section">
                        <div className="quote-editor-heading"><span>01</span><div><h3>{i18n.catalog["ui.quotation.customerQuoteData"]}</h3><p>{i18n.catalog["ui.quotation.thisDataAppearsProfessionalReportHeader"]}</p></div></div>
                        <div className="quote-form-grid">
                            <TextInput label={i18n.catalog["ui.quotation.clientCompanyName"]} value={draft.customer_name} onChange={(event) => setDraft({ ...draft, customer_name: event.target.value })} required />
                            <TextInput label={i18n.catalog["ui.quotation.contactName"]} value={draft.customer_contact} onChange={(event) => setDraft({ ...draft, customer_contact: event.target.value })} />
                            <TextInput label={i18n.catalog["common.general.email"]} type="email" value={draft.customer_email} onChange={(event) => setDraft({ ...draft, customer_email: event.target.value })} />
                            <TextInput label={i18n.catalog["common.general.phoneNumber"]} value={draft.customer_phone} onChange={(event) => setDraft({ ...draft, customer_phone: event.target.value })} />
                            <TextInput label={i18n.catalog["common.general.issueDate"]} type="date" value={draft.issue_date} onChange={(event) => setDraft({ ...draft, issue_date: event.target.value })} required />
                            <TextInput label={i18n.catalog["common.general.validUntil"]} type="date" value={draft.valid_until} onChange={(event) => setDraft({ ...draft, valid_until: event.target.value })} min={draft.issue_date} />
                        </div>
                    </section>

                    <section className="quote-editor-section">
                        <div className="quote-editor-heading"><span>02</span><div><h3>{i18n.catalog["ui.quotation.productsServices"]}</h3><p>{i18n.catalog["ui.quotation.optionalItemsAppearReportButAreNotIncluded"]}</p></div><Button variant="secondary" icon="plus" onClick={() => setDraft({ ...draft, items: [...draft.items, createItem()] })}>{i18n.catalog["ui.quotation.addItem"]}</Button></div>
                        <div className="quote-items-editor">
                            {draft.items.map((item, index) => (
                                <div className="quote-item-row" key={item.id}>
                                    <span className="quote-item-index">{String(index + 1).padStart(2, "0")}</span>
                                    <div className="quote-item-description"><TextInput label={i18n.catalog["common.general.description.alternative2"]} value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} placeholder={i18n.catalog["ui.quotation.productNameServiceDescription"]} /></div>
                                    <TextInput label={i18n.catalog["common.general.code"]} value={item.sku} onChange={(event) => updateItem(item.id, { sku: event.target.value })} placeholder={i18n.catalog["ui.quotation.sku"]} />
                                    <TextInput label={i18n.catalog["common.general.unit.alternative2"]} value={item.unit} onChange={(event) => updateItem(item.id, { unit: event.target.value })} />
                                    <NumberInput label={i18n.catalog["common.general.quantity.alternative3"]} value={item.quantity} onChange={(value) => updateItem(item.id, { quantity: String(value) })} min={0.001} step={0.001} />
                                    <NumberInput label={i18n.catalog["common.general.unitPrice.alternative3"]} value={item.unit_price} onChange={(value) => updateItem(item.id, { unit_price: String(value) })} min={0} step={0.01} />
                                    <NumberInput label={i18n.catalog["ui.quotation.itemDiscount"]} value={item.discount_amount} onChange={(value) => updateItem(item.id, { discount_amount: String(value) })} min={0} step={0.01} />
                                    <label className="quote-optional-toggle"><input type="checkbox" checked={item.is_optional} onChange={(event) => updateItem(item.id, { is_optional: event.target.checked })} /> {i18n.catalog["common.general.optional"]}</label>
                                    <button className="icon-btn delete" type="button" title={i18n.catalog["ui.quotation.deleteItem"]} disabled={draft.items.length === 1} onClick={() => setDraft({ ...draft, items: draft.items.filter((entry) => entry.id !== item.id) })}>×</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="quote-editor-section quote-editor-bottom-grid">
                        <div>
                            <div className="quote-editor-heading"><span>03</span><div><h3>{i18n.catalog["ui.quotation.termsDetails"]}</h3><p>{i18n.catalog["ui.quotation.addScopeSummaryPaymentTermsClearLanguage"]}</p></div></div>
                            <label className="quote-textarea-label">{i18n.catalog["ui.quotation.offerSummary.alternative2"]}<textarea value={draft.scope_summary} onChange={(event) => setDraft({ ...draft, scope_summary: event.target.value })} placeholder={i18n.catalog["ui.quotation.briefSummaryValueScopeOfferedClient"]} /></label>
                            <label className="quote-textarea-label">{i18n.catalog["common.general.paymentTerms"]}<textarea value={draft.payment_terms} onChange={(event) => setDraft({ ...draft, payment_terms: event.target.value })} /></label>
                            <label className="quote-textarea-label">{i18n.catalog["common.general.termsConditions"]}<textarea value={draft.terms_conditions} onChange={(event) => setDraft({ ...draft, terms_conditions: event.target.value })} /></label>
                            <label className="quote-textarea-label">{i18n.catalog["ui.quotation.internalCustomerNotes"]}<textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
                        </div>
                        <aside className="quote-calculation-card">
                            <p>{i18n.catalog["ui.quotation.pricingSummary"]}</p>
                            <TextInput label={i18n.catalog["common.general.currency"]} value={draft.currency} maxLength={3} onChange={(event) => setDraft({ ...draft, currency: event.target.value.toUpperCase() })} />
                            <NumberInput label={i18n.catalog["ui.quotation.taxRate"]} value={draft.tax_rate} onChange={(value) => setDraft({ ...draft, tax_rate: String(value) })} min={0} max={100} step={0.01} />
                            <NumberInput label={i18n.catalog["ui.quotation.totalQuoteDiscount"]} value={draft.discount_amount} onChange={(value) => setDraft({ ...draft, discount_amount: String(value) })} min={0} step={0.01} />
                            <div className="quote-calculation-lines"><div><span>{i18n.catalog["ui.quotation.totalBeforeTax"]}</span><strong>{formatCurrency(calculatedTotals.subtotal)} {draft.currency}</strong></div><div><span>{i18n.catalog["ui.quotation.tax"]}</span><strong>{formatCurrency(calculatedTotals.tax)} {draft.currency}</strong></div><div className="quote-calculation-total"><span>{i18n.catalog["common.general.totalOffer"]}</span><strong>{formatCurrency(calculatedTotals.total)} {draft.currency}</strong></div></div>
                        </aside>
                    </section>
                </div>
            </Dialog>
        </MainLayout>
    );
}
