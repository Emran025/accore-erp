"use client";

import { useI18n } from "@/lib/i18n";
import { useState, useMemo, useEffect } from "react";
import { Dialog } from "./Dialog";
import { type SelectedItem, type Invoice } from "./SelectableInvoiceTable";
import { formatCurrency } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Table, type Column } from "./Table";

export interface ReturnData {
  invoice_id: number;
  items: Array<{
    invoice_item_id: number;
    return_quantity: number;
  }>;
  reason: string | null;
}

interface SalesReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: SelectedItem[];
  originalInvoice?: Invoice | null; // For single invoice mode
  invoicesMap?: Record<number, Invoice>; // For multi-invoice mode
  onConfirmReturn: (returnData: ReturnData | ReturnData[]) => Promise<void>;
  onSuccess?: () => void;
}

export function SalesReturnDialog({
  isOpen,
  onClose,
  selectedItems,
  originalInvoice,
  invoicesMap,
  onConfirmReturn,
  onSuccess,
}: SalesReturnDialogProps) {
    const { t: i18n } = useI18n();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"review" | "confirm">("review");

  // Multi-invoice detection
  const isMultiInvoice = useMemo(() => {
    if (selectedItems.length === 0) return false;
    const firstId = selectedItems[0].invoiceId;
    return selectedItems.some(item => item.invoiceId !== firstId);
  }, [selectedItems]);

  // Combined invoices map
  const activeInvoices = useMemo(() => {
    const map = { ...invoicesMap };
    if (originalInvoice) map[originalInvoice.id] = originalInvoice;
    return map;
  }, [invoicesMap, originalInvoice]);

  // Initial quantities
  useEffect(() => {
    if (isOpen) {
      const initial: Record<number, number> = {};
      selectedItems.forEach(item => {
        initial[item.invoiceItemId] = item.quantity;
      });
      setQuantities(initial);
      setStep("review");
      setReason("");
    }
  }, [isOpen, selectedItems]);

  // Calculations
  const calculations = useMemo(() => {
    if (selectedItems.length === 0) return null;

    let totalSubtotal = 0;
    let totalVat = 0;
    let missingInvoices = false;

    selectedItems.forEach(item => {
      const qty = quantities[item.invoiceItemId] ?? item.quantity;
      const invoice = activeInvoices[item.invoiceId];

      if (!invoice) {
        missingInvoices = true;
        return;
      }

      const itemSubtotal = item.unitPrice * qty;
      totalSubtotal += itemSubtotal;

      // Proportional VAT
      const invoiceSubtotal = invoice.subtotal || 0;
      const invoiceVat = invoice.vat_amount || 0;
      const proportion = invoiceSubtotal > 0 ? itemSubtotal / invoiceSubtotal : 0;
      totalVat += invoiceVat * proportion;
    });

    if (missingInvoices) return null;

    return {
      subtotal: totalSubtotal,
      vat: totalVat,
      total: totalSubtotal + totalVat,
    };
  }, [selectedItems, quantities, activeInvoices]);

  const handleQuantityChange = (itemId: number, value: number, maxQty: number) => {
    const clampedValue = Math.max(1, Math.min(value, maxQty));
    setQuantities(prev => ({ ...prev, [itemId]: clampedValue }));
  };

  const handleSubmit = async () => {
    if (!calculations) return;

    if (step === "review") {
      setStep("confirm");
      return;
    }

    setIsSubmitting(true);
    try {
      // Group items by invoice
      const groupedData: Record<number, ReturnData> = {};

      selectedItems.forEach(item => {
        if (!groupedData[item.invoiceId]) {
          groupedData[item.invoiceId] = {
            invoice_id: item.invoiceId,
            items: [],
            reason: reason.trim() || null,
          };
        }
        groupedData[item.invoiceId].items.push({
          invoice_item_id: item.invoiceItemId,
          return_quantity: quantities[item.invoiceItemId] ?? item.quantity,
        });
      });

      const dataToSubmit = Object.values(groupedData);

      // Submit array if multi, or single if only one invoice
      await onConfirmReturn(isMultiInvoice ? dataToSubmit : dataToSubmit[0]);

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(i18n.catalog["common.general.returnSubmissionError"], error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const uniqueInvoicesCount = new Set(selectedItems.map(i => i.invoiceId)).size;

  const returnColumns: Column<SelectedItem>[] = [
    {
      key: "product",
      header: i18n.catalog["common.general.product"],
      render: (item) => (
        <div className="item-info">
          <span className="font-bold">{item.productName}</span>
          <span className="text-sm text-secondary block">
            {activeInvoices[item.invoiceId]?.invoice_number || `#${item.invoiceId}`}
          </span>
        </div>
      )
    },
    {
      key: "unitPrice",
      header: i18n.catalog["common.general.unitPrice.alternative3"],
      render: (item) => formatCurrency(item.unitPrice)
    },
    {
      key: "quantity",
      header: i18n.catalog["common.general.quantity.alternative3"],
      render: (item) => {
        const qty = quantities[item.invoiceItemId] ?? item.quantity;
        return (
          <div className="quantity-controls">
            {step === "review" ? (
              <div className="quantity-input">
                <button onClick={() => handleQuantityChange(item.invoiceItemId, qty - 1, item.maxQuantity)} disabled={qty <= 1}>-</button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => handleQuantityChange(item.invoiceItemId, parseInt(e.target.value) || 1, item.maxQuantity)}
                />
                <button onClick={() => handleQuantityChange(item.invoiceItemId, qty + 1, item.maxQuantity)} disabled={qty >= item.maxQuantity}>+</button>
              </div>
            ) : (
              <span className="final-qty">{qty}</span>
            )}
            <span className="max-qty">/ {item.maxQuantity}</span>
            {item.originalQuantity !== undefined && item.originalQuantity !== item.maxQuantity && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', width: '100%', textAlign: 'center' }}>
                {i18n.catalog["common.general.out"]}{item.originalQuantity})
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "total",
      header: i18n.catalog["common.general.total.alternative3"],
      render: (item) => {
        const qty = quantities[item.invoiceItemId] ?? item.quantity;
        return <span className="font-bold">{formatCurrency(item.unitPrice * qty)}</span>;
      }
    }
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={step === i18n.catalog["common.general.review"] ? i18n.catalog["ui.salesreturndialog.salesReturn"] : i18n.catalog["common.general.confirmReturn"]}
      maxWidth="800px"
      footer={
        <div className="dialog-actions">
          <button
            className="btn btn-secondary"
            onClick={step === "confirm" ? () => setStep("review") : handleClose}
            disabled={isSubmitting}
          >
            {step === "confirm" ? i18n.catalog["common.general.back.alternative3"] : i18n.catalog["common.general.cancel"]}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !calculations}
          >
            {isSubmitting ? i18n.catalog["common.general.saving"] : step === "review" ? i18n.catalog["common.general.continue"] : i18n.catalog["common.general.confirmRegisterReturn"]}
          </button>
        </div>
      }
    >
      <div className="return-dialog-content">
        {!calculations ? (
          <div className="p-8 text-center text-secondary">
            <div className="loading-spinner"></div>
            <div>{i18n.catalog["common.general.loadingProcessingData"]}</div>
          </div>
        ) : (
          <>
            <div className="return-header-stats">
              <div className="stat-card minimal">
                <Icon name="receipt" size={20} />
                <div className="stat-details">
                  <span className="label">{i18n.catalog["common.general.numberInvoices"]}</span>
                  <span className="value">{uniqueInvoicesCount}</span>
                </div>
              </div>
              <div className="stat-card minimal">
                <Icon name="box" size={20} />
                <div className="stat-details">
                  <span className="label">{i18n.catalog["common.general.productCount"]}</span>
                  <span className="value">{selectedItems.length}</span>
                </div>
              </div>
            </div>

            <div className="items-table-section">
              <Table
                columns={returnColumns}
                data={selectedItems}
                keyExtractor={(item) => item.invoiceItemId}
                emptyMessage={i18n.catalog["common.general.noItemsSelected"]}
              />
            </div>

            <div className="return-calculations-card">
              <div className="calc-row">
                <span>{i18n.catalog["common.general.totalBeforeTax"]}</span>
                <span className="amount">{formatCurrency(calculations.subtotal)}</span>
              </div>
              <div className="calc-row">
                <span>{i18n.catalog["common.general.totalTaxRefundable"]}</span>
                <span className="amount">{formatCurrency(calculations.vat)}</span>
              </div>
              <div className="calc-row total">
                <span>{i18n.catalog["common.general.finalReturnValue"]}</span>
                <span className="amount highlight">{formatCurrency(calculations.total)}</span>
              </div>
            </div>

            {step === "review" ? (
              <div className="form-group mb-0">
                <label>{i18n.catalog["common.general.returnReasonOptional"]}</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={i18n.catalog["common.general.exampleProductDamageExchangeDifferentSizeEtc"]}
                  rows={3}
                />
              </div>
            ) : (
              <div className="confirm-notice animate-fade-in">
                <div className="warning-content">
                  <Icon name="alert" size={24} />
                  <div>
                    <strong>{i18n.catalog["common.general.followingOperationsWillBePerformed"]}</strong>
                    <ul>
                      <li>{i18n.catalog["ui.salesreturndialog.createSalesReturnEntrySpecifiedAmount"]}</li>
                      <li>{i18n.catalog["ui.salesreturndialog.updateCustomerSBalanceIfAnyReturnQuantitiesInventory"]}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}
