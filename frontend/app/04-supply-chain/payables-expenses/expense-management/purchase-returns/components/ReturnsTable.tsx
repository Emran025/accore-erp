import { catalogMessage } from "@/lib/i18n";
import { TabSubNavigation } from "@/components/navigation/TabNavigation";
import {
    InvoiceTableColumn,
    SelectableInvoiceItem,
    SelectableInvoiceTable
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useState } from "react";
import { LedgerTransaction } from "@/types";


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
    ];

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
            key: "supplier_name" as any,
            header: catalogMessage("text_4680c31a727f"),
            dataLabel: catalogMessage("text_4680c31a727f"),
            render: (item) => {
                // Determine supplier name from item or relationship
                const sName = (item as any).supplier_name || (item as any).supplier?.name || "—";
                return (
                    <span style={{ fontWeight: 500 }}>
                        {sName}
                    </span>
                );
            }
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
                    {(item as any).reference_id || item.invoice_number || "—"}
                </span>
            ),
        },
        {
            key: "amount",
            header: catalogMessage("text_eca3995791c5"),
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
            render: (item) => {
                const uName = (item as any).created_by_name || (item as any).createdBy?.name || item.created_by || "—";
                return uName;
            }
        },
    ];

    const renderReturnDetails = (item: LedgerTransaction) => {
        const paymentType = (item as any).payment_type;
        const supplierName = (item as any).supplier_name || (item as any).supplier?.name;
        const relatedInvoice = (item as any).reference_id;

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
                {supplierName && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "bold" }}>{catalogMessage("text_a5fea82496b7")}</span>
                        <span>{supplierName}</span>
                    </div>
                )}
                {paymentType && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "bold" }}>{catalogMessage("text_5ec205a92a89")}</span>
                        <span
                            className={`badge ${paymentType === "credit" ? "badge-warning" : "badge-success"}`}
                        >
                            {getPaymentTypeName(paymentType)}
                        </span>
                    </div>
                )}
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
