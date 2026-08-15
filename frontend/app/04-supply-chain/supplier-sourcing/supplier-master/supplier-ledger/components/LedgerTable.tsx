import { catalogMessage } from "@/lib/i18n";
import { ActionButtons, Button, InvoiceTableColumn, SelectableInvoiceItem, SelectableInvoiceTable, SelectedItem } from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { LedgerTransaction } from "@/types";
import { useState } from "react";
import { TabSubNavigation } from "@/components/navigation/TabNavigation";

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
        { key: "invoice", label: catalogMessage("text_acd86802dbfe"), icon: "file-text" },
        { key: "payment", label: catalogMessage("text_93ceaa70a8c2"), icon: "receipt" },
        { key: "return", label: catalogMessage("text_239156a671f5"), icon: "repeat" },
    ];

    const filteredTransactions = transactions.filter(t => activeTab === 'all' || t.type === activeTab);

    const getTypeName = (type: string) => {
        const types: Record<string, string> = {
            invoice: catalogMessage("text_02015c5a300c"),
            payment: catalogMessage("text_e701825f9b12"),
            return: catalogMessage("text_f996c544ba6c"),
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
                    className={item.reference_type === "purchase_invoices" ? "clickable-id" : ""}
                    onClick={() => item.reference_type === "purchase_invoices" && onViewInvoice(item.reference_id!)}
                    style={{ cursor: item.reference_type === "purchase_invoices" ? "pointer" : "default", fontWeight: "bold", color: item.reference_type === "purchase_invoices" ? "var(--primary-color)" : "inherit" }}
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
                    className={`badge ${item.type === "invoice" ? "badge-primary" : "badge-success"
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
                    className={item.reference_type === "purchase_invoices" ? "clickable-desc" : ""}
                    onClick={() => item.reference_type === "purchase_invoices" && onViewInvoice(item.reference_id!)}
                    style={{ cursor: item.reference_type === "purchase_invoices" ? "pointer" : "default" }}
                >
                    {item.description || "-"} {item.is_deleted && catalogMessage("text_13a743673003")}
                </div>
            ),
        },
        {
            key: "debit",
            header: catalogMessage("text_d4a34518d08b"),
            dataLabel: catalogMessage("text_d4a34518d08b"),
            render: (item) => (
                <span className="text-success font-bold">
                    {item.type !== "invoice" ? formatCurrency(item.amount) : "-"}
                </span>
            ),
        },
        {
            key: "credit",
            header: catalogMessage("text_c0d38d02f9f1"),
            dataLabel: catalogMessage("text_c0d38d02f9f1"),
            render: (item) => (
                <span className="text-danger font-bold">
                    {item.type === "invoice" ? formatCurrency(item.amount) : "-"}
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
                            hidden: item.is_deleted || item.type === "invoice"
                        },
                        {
                            icon: "eye",
                            title: catalogMessage("text_64fb0d77cd4e"),
                            variant: "view",
                            onClick: () => onViewInvoice(item.reference_id!),
                            hidden: item.is_deleted || item.reference_type !== "purchase_invoices"
                        }
                    ]}
                />
            ),
        },
    ];

    const renderPaymentDetails = (item: LedgerTransaction) => {
        if (item.type !== "payment" || !item.reference_id) return null;

        return (
            <div style={{ padding: "1.5rem", background: "var(--surface-hover)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "bold" }}>{catalogMessage("text_7d67b98ad6f6")}</span>
                    <span
                        style={{ color: "var(--primary-color)", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
                        onClick={() => onViewInvoice(item.reference_id!)}
                    >
                        #{item.reference_id} ({item.invoice_number})
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "bold" }}>{catalogMessage("text_254f4472bdb8")}</span>
                    <span style={{ color: "var(--success-color)", fontWeight: "bold", fontSize: "1.1em" }}>
                        {formatCurrency(item.amount)}
                    </span>
                </div>
                <Button
                    variant="secondary"
                    icon="eye"
                    onClick={() => onViewInvoice(item.reference_id!)}
                >
                    {catalogMessage("text_43c2a09fb9e4")}</Button>
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
                isExpandable={(item: LedgerTransaction) => !!item.reference_id && (item.reference_type === "purchase_invoices" || item.reference_type === "purchase_returns")}
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
