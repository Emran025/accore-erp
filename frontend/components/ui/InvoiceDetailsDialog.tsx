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
            title={catalogMessage("common.general.invoiceDetails")}
        // size="large"
        >
            {selectedInvoice && (
                <div>
                    <div style={{ marginBottom: "2rem", borderBottom: "2px solid var(--border-color)", paddingBottom: "1rem" }}>
                        <div className="form-row">
                            <div className="summary-stat">
                                <span className="stat-label">{catalogMessage("common.general.invoiceNumber.alternative2")}</span>
                                <span className="stat-value">{selectedInvoice.invoice_number}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">{catalogMessage("common.general.date.alternative7")}</span>
                                <span className="stat-value">{formatDate(selectedInvoice.created_at)}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">{catalogMessage("common.general.paymentType.alternative2")}</span>
                                <span className="stat-value">
                                    <span
                                        className={`badge ${selectedInvoice.payment_type === "credit" ? "badge-warning" : "badge-success"
                                            }`}
                                    >
                                        {selectedInvoice.payment_type === "credit" ? catalogMessage("common.general.creditReceivables") : catalogMessage("common.general.cash")}
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
                                    <span className="stat-label">{catalogMessage("common.general.customer")}</span>
                                    <span className="stat-value">{selectedInvoice.customer_name}</span>
                                </div>
                                {selectedInvoice.customer_phone && (
                                    <div className="summary-stat">
                                        <span className="stat-label">{catalogMessage("common.general.phone")}</span>
                                        <span className="stat-value">{selectedInvoice.customer_phone}</span>
                                    </div>
                                )}
                                {selectedInvoice.customer_tax && (
                                    <div className="summary-stat">
                                        <span className="stat-label">{catalogMessage("common.general.taxNumber")}</span>
                                        <span className="stat-value">{selectedInvoice.customer_tax}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedInvoice.payment_type === "credit" && (
                            <div className="form-row" style={{ marginTop: "1rem" }}>
                                <div className="summary-stat">
                                    <span className="stat-label">{catalogMessage("common.general.amountPaid.alternative2")}</span>
                                    <span className="stat-value" style={{ color: "var(--success-color)" }}>
                                        {formatCurrency(selectedInvoice.amount_paid || 0)}
                                    </span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">{catalogMessage("common.general.remainingAmount")}</span>
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
                        <h4 style={{ marginBottom: "1rem" }}>{catalogMessage("common.general.productsSold")}</h4>
                        {selectedInvoice.items.map((item, idx) => (
                            <div key={idx} className="item-row-minimal">
                                <div className="item-info-pkg">
                                    <span className="item-name-pkg">{item.product_name}</span>
                                    <span className="item-meta-pkg">{catalogMessage("common.general.unitPrice")}{formatCurrency(item.unit_price)}</span>
                                </div>
                                <div className="item-info-pkg" style={{ textAlign: "left" }}>
                                    <span className="item-name-pkg">{formatCurrency(item.subtotal)}</span>
                                    <span className="item-meta-pkg">{catalogMessage("common.general.quantity")}{item.quantity}</span>
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
                                {catalogMessage("common.general.totalAmount")}</span>
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
