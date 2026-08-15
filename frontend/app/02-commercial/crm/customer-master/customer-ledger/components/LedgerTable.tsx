import { catalogMessage } from "@/lib/i18n";
import { useState } from "react";
import { ActionButtons, SelectableInvoiceTable, SelectedItem, SelectableInvoiceItem, InvoiceTableColumn, Button } from "@/components/ui";
import { TabSubNavigation } from "@/components/navigation/TabNavigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { LedgerTransaction } from "@/types";

interface LedgerTableProps {
    transactions: LedgerTransaction[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    handleReturnSelection: (items: SelectedItem[]) => void;
    setSearch: (query: string) => void;
    onPageChange: (page: number) => void;
    getInvoiceItems: (item: LedgerTransaction) => Promise<SelectableInvoiceItem[]>;
    openReturnDialog: () => void;
    onViewInvoice: (id: number) => void;
    onEditTransaction: (transaction: LedgerTransaction) => void;
    onDeleteTransaction: (id: number) => void;
    onRestoreTransaction: (id: number) => void;
}

export function LedgerTable({
    transactions,
    isLoading,
    currentPage,
    totalPages,
    handleReturnSelection,
    setSearch,
    onPageChange,
    getInvoiceItems,
    openReturnDialog,
    onViewInvoice,
    onEditTransaction,
    onDeleteTransaction,
    onRestoreTransaction,
}: LedgerTableProps) {
    const [activeTab, setActiveTab] = useState("all");

    const tabs = [
        { key: "all", label: catalogMessage("common.general.allOperations"), icon: "list" },
        { key: "invoice", label: catalogMessage("common.general.salesInvoices"), icon: "file-text" },
        { key: "receipt", label: catalogMessage("commercial.ledgertable.receiptVouchers"), icon: "receipt" },
        { key: "return", label: catalogMessage("common.general.returns"), icon: "repeat" },
    ];

    const filteredTransactions = transactions.filter(t => activeTab === 'all' || t.type === activeTab);

    const getTypeName = (type: string) => {
        const types: Record<string, string> = {
            invoice: catalogMessage("common.general.salesInvoice"),
            receipt: catalogMessage("common.general.receiptVoucher"),
            return: catalogMessage("common.general.return"),
        };
        return types[type] || type;
    };

    const canEdit = (transaction: LedgerTransaction) => {
        if (transaction.is_deleted) return false;
        const transactionDate = new Date(transaction.transaction_date);
        const now = new Date();
        const diffMs = now.getTime() - transactionDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours < 48;
    };

    const columns: InvoiceTableColumn<LedgerTransaction>[] = [
        {
            key: "id",
            header: "#",
            dataLabel: "#",
            render: (item) => (
                <span
                    className={item.reference_type === "invoices" ? "clickable-id" : ""}
                    onClick={() => item.reference_type === "invoices" && onViewInvoice(item.reference_id!)}
                    style={{ cursor: item.reference_type === "invoices" ? "pointer" : "default", fontWeight: "bold", color: item.reference_type === "invoices" ? "var(--primary-color)" : "inherit" }}
                >
                    {item.id}
                </span>
            ),
        },
        {
            key: "transaction_date",
            header: catalogMessage("common.general.date.alternative7"),
            dataLabel: catalogMessage("common.general.date.alternative7"),
            render: (item) => (
                <span style={{ fontSize: "0.9em" }}>
                    {formatDateTime(item.transaction_date)}
                </span>
            ),
        },
        {
            key: "type",
            header: catalogMessage("common.general.transactionType"),
            dataLabel: catalogMessage("common.general.transactionType"),
            render: (item) => (
                <span
                    className={`badge ${item.type === "invoice" ? "badge-primary" : "badge-success"
                        }`}
                >
                    {getTypeName(item.type)}
                </span>
            ),
        },
        {
            key: "description",
            header: catalogMessage("common.general.description.alternative2"),
            dataLabel: catalogMessage("common.general.description.alternative2"),
            render: (item) => (
                <div
                    className={item.reference_type === "invoices" ? "clickable-desc" : ""}
                    onClick={() => item.reference_type === "invoices" && onViewInvoice(item.reference_id!)}
                    style={{ cursor: item.reference_type === "invoices" ? "pointer" : "default" }}
                >
                    {item.description || "-"} {item.is_deleted && catalogMessage("common.general.deleted")}
                </div>
            ),
        },
        {
            key: "debit",
            header: catalogMessage("common.general.debitYouOwe"),
            dataLabel: catalogMessage("common.general.debitYouOwe"),
            render: (item) => (
                <span className="text-danger font-bold">
                    {item.type === "invoice" ? formatCurrency(item.amount) : "-"}
                </span>
            ),
        },
        {
            key: "credit",
            header: catalogMessage("common.general.creditYou"),
            dataLabel: catalogMessage("common.general.creditYou"),
            render: (item) => (
                <span className="text-success font-bold">
                    {item.type !== "invoice" ? formatCurrency(item.amount) : "-"}
                </span>
            ),
        },
        {
            key: "created_by",
            header: catalogMessage("common.general.user"),
            dataLabel: catalogMessage("common.general.user"),
            render: (item) => item.created_by || "-",
        },
        {
            key: "actions",
            header: catalogMessage("common.general.actions"),
            dataLabel: catalogMessage("common.general.actions"),
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "check",
                            title: catalogMessage("common.general.restore"),
                            variant: "edit",
                            onClick: () => onRestoreTransaction(item.id),
                            hidden: !item.is_deleted
                        },
                        {
                            icon: "edit",
                            title: catalogMessage("common.general.edit"),
                            variant: "edit",
                            onClick: () => onEditTransaction(item),
                            hidden: item.is_deleted || !canEdit(item)
                        },
                        {
                            icon: "trash",
                            title: catalogMessage("common.general.delete"),
                            variant: "delete",
                            onClick: () => onDeleteTransaction(item.id),
                            hidden: item.is_deleted || item.type === "invoice"
                        },
                        {
                            icon: "eye",
                            title: catalogMessage("common.general.viewInvoice"),
                            variant: "view",
                            onClick: () => onViewInvoice(item.reference_id!),
                            hidden: item.is_deleted || item.reference_type !== "invoices"
                        }
                    ]}
                />
            ),
        },
    ];

    const renderPaymentDetails = (item: LedgerTransaction) => {
        if (item.type !== "receipt" || !item.reference_id) return null;

        return (
            <div style={{ padding: "1.5rem", background: "var(--surface-hover)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "bold" }}>{catalogMessage("common.general.paymentInvoice")}</span>
                    <span
                        style={{ color: "var(--primary-color)", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
                        onClick={() => onViewInvoice(item.reference_id!)}
                    >
                        #{item.reference_id} ({item.invoice_number})
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "bold" }}>{catalogMessage("common.general.amountPaid")}</span>
                    <span style={{ color: "var(--success-color)", fontWeight: "bold", fontSize: "1.1em" }}>
                        {formatCurrency(item.amount)}
                    </span>
                </div>
                <Button
                    variant="secondary"
                    icon="eye"
                    onClick={() => onViewInvoice(item.reference_id!)}
                >
                    {catalogMessage("common.general.viewPaidInvoice")}</Button>
            </div>
        );
    };

    return (
        <div className="sales-card animate-fade">
            <SelectableInvoiceTable
                columns={columns}
                invoices={filteredTransactions}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                onSelectionChange={handleReturnSelection}
                onSearch={setSearch}
                getInvoiceItems={getInvoiceItems}
                renderCustomExpandedRow={renderPaymentDetails}
                emptyMessage={catalogMessage("common.general.noOperations")}
                FilterTabNavigation={
                    <TabSubNavigation
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                }
                multiInvoiceSelection={true}
                invoiceIdExtractor={(item) => Number(item.reference_id || item.id)}
                isExpandable={(item: LedgerTransaction) => !!item.reference_id && (item.reference_type === "invoices" || item.reference_type === "sales_returns")}
                pagination={{
                    currentPage,
                    totalPages,
                    onPageChange,
                }}
                openReturnDialog={openReturnDialog}
            />
        </div>
    );
}
