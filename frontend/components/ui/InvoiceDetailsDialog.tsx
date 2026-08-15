import { catalogMessage } from "@/lib/i18n";
import { Dialog } from "@/components/ui";
import { TaxBreakdown } from "@/components/tax/TaxBreakdown";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DetailedInvoiceCustomers } from "@/types";

interface InvoiceDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedInvoice: DetailedInvoiceCustomers | null;
}

export function InvoiceDetailsDialog({ isOpen, onClose, selectedInvoice }: InvoiceDetailsDialogProps) {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={catalogMessage("text_e603e7637507")}
        // size="large"
        >
            {selectedInvoice && (
                <div>
                    <div style={{ marginBottom: "2rem", borderBottom: "2px solid var(--border-color)", paddingBottom: "1rem" }}>
                        <div className="form-row">
                            <div className="summary-stat">
                                <span className="stat-label">{catalogMessage("text_b6e71278be04")}</span>
                                <span className="stat-value">{selectedInvoice.invoice_number}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">{catalogMessage("text_d90c384199ac")}</span>
                                <span className="stat-value">{formatDate(selectedInvoice.created_at)}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">{catalogMessage("text_d31f653fcdaf")}</span>
                                <span className="stat-value">
                                    <span
                                        className={`badge ${selectedInvoice.payment_type === "credit" ? "badge-warning" : "badge-success"
                                            }`}
                                    >
                                        {selectedInvoice.payment_type === "credit" ? catalogMessage("text_70122ff036ec") : catalogMessage("text_1beb05a45173")}
                                    </span>
                                </span>
                            </div>
                        </div>
                        {selectedInvoice.customer_name && (
                            <div
                                className="form-row"
                                style={{
                                    marginTop: "1rem",
                                    background: "var(--surface-hover)",
                                    padding: "1rem",
                                    borderRadius: "var(--radius-md)",
                                }}
                            >
                                <div className="summary-stat">
                                    <span className="stat-label">{catalogMessage("text_a042411e90be")}</span>
                                    <span className="stat-value">{selectedInvoice.customer_name}</span>
                                </div>
                                {selectedInvoice.customer_phone && (
                                    <div className="summary-stat">
                                        <span className="stat-label">{catalogMessage("text_94b59a5125fb")}</span>
                                        <span className="stat-value">{selectedInvoice.customer_phone}</span>
                                    </div>
                                )}
                                {selectedInvoice.customer_tax && (
                                    <div className="summary-stat">
                                        <span className="stat-label">{catalogMessage("text_74b3eeb4b88d")}</span>
                                        <span className="stat-value">{selectedInvoice.customer_tax}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedInvoice.payment_type === "credit" && (
                            <div className="form-row" style={{ marginTop: "1rem" }}>
                                <div className="summary-stat">
                                    <span className="stat-label">{catalogMessage("text_558ab4456b6f")}</span>
                                    <span className="stat-value" style={{ color: "var(--success-color)" }}>
                                        {formatCurrency(selectedInvoice.amount_paid || 0)}
                                    </span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">{catalogMessage("text_a707de32d885")}</span>
                                    <span
                                        className="stat-value"
                                        style={{ color: "var(--danger-color)", fontWeight: 700 }}
                                    >
                                        {formatCurrency(
                                            (selectedInvoice.total_amount || 0) - (selectedInvoice.amount_paid || 0)
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 style={{ marginBottom: "1rem" }}>{catalogMessage("text_1cc454c94b3b")}</h4>
                        {selectedInvoice.items.map((item, idx) => (
                            <div key={idx} className="item-row-minimal">
                                <div className="item-info-pkg">
                                    <span className="item-name-pkg">{item.product_name}</span>
                                    <span className="item-meta-pkg">{catalogMessage("text_91f3a71d4d14")}{formatCurrency(item.unit_price)}</span>
                                </div>
                                <div className="item-info-pkg" style={{ textAlign: "left" }}>
                                    <span className="item-name-pkg">{formatCurrency(item.subtotal)}</span>
                                    <span className="item-meta-pkg">{catalogMessage("text_6936d56084ca")}{item.quantity}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {(selectedInvoice.tax_lines?.length ?? 0) > 0 || (selectedInvoice.vat_amount ?? 0) > 0 ? (
                        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--surface-hover)", borderRadius: "var(--radius-md)" }}>
                            <TaxBreakdown
                                taxLines={selectedInvoice.tax_lines}
                                vatAmount={selectedInvoice.vat_amount}
                                vatRate={selectedInvoice.vat_rate != null ? (typeof selectedInvoice.vat_rate === 'number' && selectedInvoice.vat_rate <= 1 ? selectedInvoice.vat_rate : selectedInvoice.vat_rate / 100) : undefined}
                            />
                        </div>
                    ) : null}

                    <div
                        className="sales-summary-bar"
                        style={{
                            marginTop: "2rem",
                            background: "var(--grad-primary)",
                            color: "white",
                        }}
                    >
                        <div className="summary-stat">
                            <span className="stat-label" style={{ color: "rgba(255,255,255,0.8)" }}>
                                {catalogMessage("text_1f4a626bcba2")}</span>
                            <span className="stat-value highlight" style={{ color: "white" }}>
                                {formatCurrency(selectedInvoice.total_amount)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </Dialog>
    );
}
