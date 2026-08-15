import { catalogMessage } from "@/lib/i18n";
import { useState } from "react";
import { ActionButtons, SelectableInvoiceTable, SelectedItem, SelectableInvoiceItem, InvoiceTableColumn } from "@/components/ui";
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
        { key: "commission", label: catalogMessage("common.general.commissions"), icon: "dollar-sign" },
        { key: "payment", label: catalogMessage("common.general.paymentsRepresentative"), icon: "credit-card" },
        { key: "return", label: catalogMessage("commercial.ledgertable.returns"), icon: "repeat" },
        { key: "adjustment", label: catalogMessage("commercial.ledgertable.settlements"), icon: "settings" },
    ];

    const filteredTransactions = transactions.filter(t => activeTab === 'all' || t.type === activeTab);

    const getTypeName = (type: string) => {
        const types: Record<string, string> = {
            commission: catalogMessage("commercial.ledgertable.salesCommission"),
            payment: catalogMessage("commercial.ledgertable.paidInstallment"),
            return: catalogMessage("common.general.return"),
            adjustment: catalogMessage("commercial.ledgertable.settlement")
        };
        return types[type] || type;
    };

    const canEdit = (transaction: LedgerTransaction) => {
        if (transaction.is_deleted) return false;
        if (transaction.type === "commission" || transaction.type === "return") return false;
        const transactionDate = new Date(transaction.transaction_date);
        const now = new Date();
        const diffMs = now.getTime() - transactionDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours < 48; // Allow edit within 48 hours for payments and adjustments
    };

    const columns: InvoiceTableColumn<LedgerTransaction>[] = [
        {
            key: "id",
            header: "#",
            dataLabel: "#",
            render: (item) => (
                <span
                    className={item.reference_type === "invoices" ? "clickable-id" : ""}
                    onClick={() => item.reference_type === "invoices" && onViewInvoice(Number(item.reference_id))}
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
                    className={`badge ${item.type === "commission" ? "badge-success" : item.type === "payment" ? "badge-primary" : item.type === "return" ? "badge-danger" : "badge-warning"
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
                    onClick={() => item.reference_type === "invoices" && onViewInvoice(Number(item.reference_id))}
                    style={{ cursor: item.reference_type === "invoices" ? "pointer" : "default" }}
                >
                    {item.description || "-"} {item.is_deleted && catalogMessage("common.general.deleted")}
                </div>
            ),
        },
        {
            key: "credit",
            header: catalogMessage("commercial.ledgertable.commissionEarningsRepresentative"),
            dataLabel: catalogMessage("commercial.ledgertable.commissionEarnings"),
            render: (item) => (
                <span className="text-success font-bold">
                    {item.type === "commission" || (item.type === "adjustment" && item.amount > 0) ? formatCurrency(Math.abs(item.amount)) : "-"}
                </span>
            ),
        },
        {
            key: "debit",
            header: catalogMessage("commercial.ledgertable.discountPaymentRepresentative"),
            dataLabel: catalogMessage("commercial.ledgertable.deductPay"),
            render: (item) => (
                <span className="text-danger font-bold">
                    {item.type === "return" || item.type === "payment" || (item.type === "adjustment" && item.amount < 0) ? formatCurrency(Math.abs(item.amount)) : "-"}
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
                            hidden: item.is_deleted || item.type === "commission" || item.type === "return"
                        },
                        {
                            icon: "eye",
                            title: catalogMessage("common.general.viewInvoice"),
                            variant: "view",
                            onClick: () => onViewInvoice(Number(item.reference_id)),
                            hidden: item.is_deleted || item.reference_type !== "invoices"
                        }
                    ]}
                />
            ),
        },
    ];

    const renderCustomExpandedRow = (item: LedgerTransaction) => {
        return null; // Expandability not currently required heavily for reps unless custom logic needed
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
                renderCustomExpandedRow={renderCustomExpandedRow}
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
                isExpandable={(item: LedgerTransaction) => !!item.reference_id && item.reference_type === "invoices"}
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
