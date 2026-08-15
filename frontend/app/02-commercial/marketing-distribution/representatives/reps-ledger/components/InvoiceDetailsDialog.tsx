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
            title={catalogMessage("common.general.invoiceDetails")}
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
                                <span className="stat-value">{formatDateTime(selectedInvoice.created_at)}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">{catalogMessage("commercial.invoicedetailsdialog.representative")}</span>
                                <span className="stat-value">
                                    <span className={`badge badge-primary`}>
                                        {selectedInvoice.salesperson_name || catalogMessage("common.general.unspecified")}
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
                                {catalogMessage("commercial.invoicedetailsdialog.totalAmountSalesInvoice")}</span>
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
