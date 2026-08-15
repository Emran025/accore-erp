import { catalogMessage } from "@/lib/i18n";
import {
    InvoiceTableColumn,
    SelectableInvoiceItem,
    SelectableInvoiceTable
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useState } from "react";
import { TabSubNavigation } from "@/components/navigation/TabNavigation";
import { LedgerTransaction } from "@/types"


interface ReturnsTableProps {
    transactions: LedgerTransaction[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    setSearch: (query: string) => void;
    onPageChange: (page: number) => void;
    getInvoiceItems: (item: LedgerTransaction) => Promise<SelectableInvoiceItem[]>;
    onViewInvoice: (id: number) => void;
}

export function ReturnsTable({
    transactions,
    isLoading,
    currentPage,
    totalPages,
    setSearch,
    onPageChange,
    getInvoiceItems,
    onViewInvoice,
}: ReturnsTableProps) {
    const [activeTab, setActiveTab] = useState("all");

    const tabs = [
        { key: "all", label: catalogMessage("text_dd1712a2b1bc"), icon: "list" },
        { key: "cash", label: catalogMessage("text_eb286e2d1542"), icon: "dollar" },
        { key: "credit", label: catalogMessage("text_447d3445b7f1"), icon: "file-text" },
    ];

    // Filter by payment_type stored in the mapped transaction's payment_type field
    const filteredTransactions = transactions.filter((t) => {
        if (activeTab === "all") return true;
        return (t as any).payment_type === activeTab;
    });

    const getPaymentTypeName = (paymentType: string) => {
        const types: Record<string, string> = {
            cash: catalogMessage("text_1beb05a45173"),
            credit: catalogMessage("text_70122ff036ec"),
        };
        return types[paymentType] || paymentType;
    };

    const columns: InvoiceTableColumn<LedgerTransaction>[] = [
        {
            key: "id",
            header: "#",
            dataLabel: "#",
            render: (item) => (
                <span style={{ fontWeight: "bold" }}>
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
            key: "customer_name" as any,
            header: catalogMessage("text_a042411e90be"),
            dataLabel: catalogMessage("text_a042411e90be"),
            render: (item) => (
                <span style={{ fontWeight: 500 }}>
                    {(item as any).customer_name || "—"}
                </span>
            ),
        },
        {
            key: "payment_type" as any,
            header: catalogMessage("text_1670fc15da04"),
            dataLabel: catalogMessage("text_1670fc15da04"),
            render: (item) => (
                <span
                    className={`badge ${(item as any).payment_type === "credit" ? "badge-warning" : "badge-success"}`}
                >
                    {getPaymentTypeName((item as any).payment_type ?? "")}
                </span>
            ),
        },
        {
            key: "description",
            header: catalogMessage("text_32d887d68e89"),
            dataLabel: catalogMessage("text_32d887d68e89"),
            render: (item) => (
                <div>
                    {item.description || "—"}
                </div>
            ),
        },
        {
            key: "related_invoice_number" as any,
            header: catalogMessage("text_3a682728f828"),
            dataLabel: catalogMessage("text_b6e71278be04"),
            render: (item) => (
                <span style={{ color: "var(--primary-color)", fontWeight: "bold" }}>
                    {(item as any).related_invoice_number || item.invoice_number || "—"}
                </span>
            ),
        },
        {
            key: "amount",
            header: catalogMessage("text_7be7892e0ba6"),
            dataLabel: catalogMessage("text_ad81c0b4e84a"),
            render: (item) => (
                <span className="text-success font-bold">
                    {formatCurrency(item.amount)}
                </span>
            ),
        },
        {
            key: "created_by",
            header: catalogMessage("text_2fb01868740d"),
            dataLabel: catalogMessage("text_2fb01868740d"),
            render: (item) => item.created_by || "—",
        },
    ];

    const renderReturnDetails = (item: LedgerTransaction) => {
        const paymentType = (item as any).payment_type;
        const customerName = (item as any).customer_name;
        const relatedInvoice = (item as any).related_invoice_number;

        return (
            <div
                style={{
                    padding: "1.5rem",
                    background: "var(--surface-hover)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "bold" }}>{catalogMessage("text_18cabbb2affc")}</span>
                    <span style={{ color: "var(--primary-color)", fontWeight: "bold" }}>
                        {relatedInvoice || item.invoice_number || "—"}
                    </span>
                </div>
                {customerName && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "bold" }}>{catalogMessage("text_a9fd8b729e26")}</span>
                        <span>{customerName}</span>
                    </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "bold" }}>{catalogMessage("text_75bd3b347558")}</span>
                    <span
                        className={`badge ${paymentType === "credit" ? "badge-warning" : "badge-success"}`}
                    >
                        {getPaymentTypeName(paymentType ?? "")}
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "bold" }}>{catalogMessage("text_c50fb897b3c3")}</span>
                    <span style={{ color: "var(--success-color)", fontWeight: "bold", fontSize: "1.1em" }}>
                        {formatCurrency(item.amount)}
                    </span>
                </div>
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
                onSelectionChange={() => { /* read-only, no selection needed */ }}
                onSearch={setSearch}
                getInvoiceItems={getInvoiceItems}
                renderCustomExpandedRow={renderReturnDetails}
                emptyMessage={catalogMessage("text_249e9cbff310")}
                FilterTabNavigation={
                    <TabSubNavigation
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                }
                /* Returns are non-selectable — disable checkbox-based selection */
                multiInvoiceSelection={false}
                invoiceIdExtractor={(item) => Number(item.reference_id || item.id)}
                isExpandable={(item: LedgerTransaction) => !!item.reference_id}
                pagination={{
                    currentPage,
                    totalPages,
                    onPageChange,
                }}
                /* No return dialog needed on this read-only page */
                openReturnDialog={() => { }}
            />
        </div>
    );
}
