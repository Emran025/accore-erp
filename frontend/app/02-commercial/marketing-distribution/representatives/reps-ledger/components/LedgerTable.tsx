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
        { key: "all", label: catalogMessage("text_b8080d923b38"), icon: "list" },
        { key: "commission", label: catalogMessage("text_5c7f63974760"), icon: "dollar-sign" },
        { key: "payment", label: catalogMessage("text_89fef1e7d7d5"), icon: "credit-card" },
        { key: "return", label: catalogMessage("text_87c752574f28"), icon: "repeat" },
        { key: "adjustment", label: catalogMessage("text_9db6abc1db97"), icon: "settings" },
    ];

    const filteredTransactions = transactions.filter(t => activeTab === 'all' || t.type === activeTab);

    const getTypeName = (type: string) => {
        const types: Record<string, string> = {
            commission: catalogMessage("text_615f84ef8576"),
            payment: catalogMessage("text_986382af6232"),
            return: catalogMessage("text_f996c544ba6c"),
            adjustment: catalogMessage("text_402ad7c2cbd4")
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
            header: catalogMessage("text_d90c384199ac"),
            dataLabel: catalogMessage("text_d90c384199ac"),
            render: (item) => (
                <span style={{ fontSize: "0.9em" }}>
                    {formatDateTime(item.transaction_date)}
                </span>
            ),
        },
        {
            key: "type",
            header: catalogMessage("text_4567eb273df3"),
            dataLabel: catalogMessage("text_4567eb273df3"),
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
            header: catalogMessage("text_95023fc76e1b"),
            dataLabel: catalogMessage("text_95023fc76e1b"),
            render: (item) => (
                <div
                    className={item.reference_type === "invoices" ? "clickable-desc" : ""}
                    onClick={() => item.reference_type === "invoices" && onViewInvoice(Number(item.reference_id))}
                    style={{ cursor: item.reference_type === "invoices" ? "pointer" : "default" }}
                >
                    {item.description || "-"} {item.is_deleted && catalogMessage("text_13a743673003")}
                </div>
            ),
        },
        {
            key: "credit",
            header: catalogMessage("text_4353646f7085"),
            dataLabel: catalogMessage("text_253a506d231f"),
            render: (item) => (
                <span className="text-success font-bold">
                    {item.type === "commission" || (item.type === "adjustment" && item.amount > 0) ? formatCurrency(Math.abs(item.amount)) : "-"}
                </span>
            ),
        },
        {
            key: "debit",
            header: catalogMessage("text_3ee801c5b6c3"),
            dataLabel: catalogMessage("text_c3b5e0d27481"),
            render: (item) => (
                <span className="text-danger font-bold">
                    {item.type === "return" || item.type === "payment" || (item.type === "adjustment" && item.amount < 0) ? formatCurrency(Math.abs(item.amount)) : "-"}
                </span>
            ),
        },
        {
            key: "created_by",
            header: catalogMessage("text_2fb01868740d"),
            dataLabel: catalogMessage("text_2fb01868740d"),
            render: (item) => item.created_by || "-",
        },
        {
            key: "actions",
            header: catalogMessage("text_7797240d6caf"),
            dataLabel: catalogMessage("text_7797240d6caf"),
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "check",
                            title: catalogMessage("text_56f1dce3e781"),
                            variant: "edit",
                            onClick: () => onRestoreTransaction(item.id),
                            hidden: !item.is_deleted
                        },
                        {
                            icon: "edit",
                            title: catalogMessage("text_113d570d6555"),
                            variant: "edit",
                            onClick: () => onEditTransaction(item),
                            hidden: item.is_deleted || !canEdit(item)
                        },
                        {
                            icon: "trash",
                            title: catalogMessage("text_59ca629220a6"),
                            variant: "delete",
                            onClick: () => onDeleteTransaction(item.id),
                            hidden: item.is_deleted || item.type === "commission" || item.type === "return"
                        },
                        {
                            icon: "eye",
                            title: catalogMessage("text_64fb0d77cd4e"),
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
                emptyMessage={catalogMessage("text_96dede8eb705")}
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
