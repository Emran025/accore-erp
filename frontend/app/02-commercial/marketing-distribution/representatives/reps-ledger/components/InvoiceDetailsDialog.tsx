import { catalogMessage } from "@/lib/i18n";
import { Dialog } from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { DetailedInvoiceRepresentatives } from "@/types";

interface InvoiceDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedInvoice: DetailedInvoiceRepresentatives | null;
}

export function InvoiceDetailsDialog({ isOpen, onClose, selectedInvoice }: InvoiceDetailsDialogProps) {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={catalogMessage("text_e603e7637507")}
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
                                <span className="stat-value">{formatDateTime(selectedInvoice.created_at)}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">{catalogMessage("text_4059aaa08477")}</span>
                                <span className="stat-value">
                                    <span className={`badge badge-primary`}>
                                        {selectedInvoice.salesperson_name || catalogMessage("text_5a0374f3ff5a")}
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
                                {catalogMessage("text_74a7fa42d1c9")}</span>
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
