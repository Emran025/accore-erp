import {
    InvoiceTableColumn,
    SelectableInvoiceItem,
    SelectableInvoiceTable,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useState } from "react";
import { TabSubNavigation } from "@/components/navigation/TabNavigation";
import { LedgerTransaction } from "@/types";

interface ServiceReturnsTableProps {
    transactions: LedgerTransaction[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    setSearch: (query: string) => void;
    onPageChange: (page: number) => void;
    getInvoiceItems: (item: LedgerTransaction) => Promise<SelectableInvoiceItem[]>;
    onViewInvoice: (id: number) => void;
}

export function ServiceReturnsTable({
    transactions,
    isLoading,
    currentPage,
    totalPages,
    setSearch,
    onPageChange,
    getInvoiceItems,
    onViewInvoice,
}: ServiceReturnsTableProps) {
    const [activeTab, setActiveTab] = useState("all");

    const tabs = [
        { key: "all", label: "جميع المرتجعات", icon: "list" },
        { key: "cash", label: "مرتجعات نقدية", icon: "dollar" },
        { key: "credit", label: "مرتجعات آجل", icon: "file-text" },
    ];

    const filteredTransactions = transactions.filter((t) => {
        if (activeTab === "all") return true;
        return (t as any).payment_type === activeTab;
    });

    const getPaymentTypeName = (paymentType: string) => {
        const types: Record<string, string> = {
            cash: "نقدي",
            credit: "آجل (ذمم)",
        };
        return types[paymentType] || paymentType;
    };

    const columns: InvoiceTableColumn<LedgerTransaction>[] = [
        {
            key: "id",
            header: "#",
            dataLabel: "#",
            render: (item) => (
                <span style={{ fontWeight: "bold" }}>{item.id}</span>
            ),
        },
        {
            key: "transaction_date",
            header: "التاريخ",
            dataLabel: "التاريخ",
            render: (item) => (
                <span style={{ fontSize: "0.9em" }}>
                    {formatDateTime(item.transaction_date)}
                </span>
            ),
        },
        {
            key: "customer_name" as any,
            header: "العميل",
            dataLabel: "العميل",
            render: (item) => (
                <span style={{ fontWeight: 500 }}>
                    {(item as any).customer_name || "—"}
                </span>
            ),
        },
        {
            key: "payment_type" as any,
            header: "نوع الفاتورة",
            dataLabel: "نوع الفاتورة",
            render: (item) => (
                <span
                    className={`badge ${(item as any).payment_type === "credit" ? "badge-warning" : "badge-success"
                        }`}
                >
                    {getPaymentTypeName((item as any).payment_type ?? "")}
                </span>
            ),
        },
        {
            key: "description",
            header: "الوصف / السبب",
            dataLabel: "الوصف / السبب",
            render: (item) => <div>{item.description || "—"}</div>,
        },
        {
            key: "related_invoice_number" as any,
            header: "رقم الفاتورة الأصلية",
            dataLabel: "رقم الفاتورة",
            render: (item) => (
                <span style={{ color: "var(--primary-color)", fontWeight: "bold" }}>
                    {(item as any).related_invoice_number || item.invoice_number || "—"}
                </span>
            ),
        },
        {
            key: "amount",
            header: "المبلغ المرتجع (دائن)",
            dataLabel: "المبلغ المرتجع",
            render: (item) => (
                <span className="text-success font-bold">
                    {formatCurrency(item.amount)}
                </span>
            ),
        },
        {
            key: "created_by",
            header: "المستخدم",
            dataLabel: "المستخدم",
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
                    <span style={{ fontWeight: "bold" }}>مرتجع من فاتورة خدمة:</span>
                    <span style={{ color: "var(--primary-color)", fontWeight: "bold" }}>
                        {relatedInvoice || item.invoice_number || "—"}
                    </span>
                </div>
                {customerName && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "bold" }}>العميل:</span>
                        <span>{customerName}</span>
                    </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "bold" }}>نوع الفاتورة:</span>
                    <span
                        className={`badge ${paymentType === "credit" ? "badge-warning" : "badge-success"
                            }`}
                    >
                        {getPaymentTypeName(paymentType ?? "")}
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "bold" }}>المبلغ المرتجع:</span>
                    <span
                        style={{
                            color: "var(--success-color)",
                            fontWeight: "bold",
                            fontSize: "1.1em",
                        }}
                    >
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
                onSelectionChange={() => { }}
                onSearch={setSearch}
                getInvoiceItems={getInvoiceItems}
                renderCustomExpandedRow={renderReturnDetails}
                emptyMessage="لا توجد مرتجعات خدمات"
                FilterTabNavigation={
                    <TabSubNavigation
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                }
                multiInvoiceSelection={false}
                invoiceIdExtractor={(item) => Number(item.reference_id || item.id)}
                isExpandable={(item: LedgerTransaction) => !!item.reference_id}
                pagination={{
                    currentPage,
                    totalPages,
                    onPageChange,
                }}
                openReturnDialog={() => { }}
            />
        </div>
    );
}
