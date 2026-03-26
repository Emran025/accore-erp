"use client";

import {
    InvoiceTableColumn,
    SelectableInvoiceItem,
    SelectableInvoiceTable,
    SelectedItem,
} from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { TabSubNavigation } from "@/components/navigation/TabNavigation";

/** Minimal service invoice row */
export interface ServiceInvoiceRow {
    id: number;
    invoice_number: string;
    total_amount: number;
    subtotal: number;
    vat_amount: number;
    discount_amount: number;
    payment_type: string;
    customer?: { id: number; name: string };
    customer_name?: string;
    items?: SelectableInvoiceItem[];
    items_count?: number;
    created_at: string;
}

interface ServiceInvoiceSelectionTabProps {
    onSelectionChange: (items: SelectedItem[]) => void;
    openReturnDialog: () => void;
}

export function ServiceInvoiceSelectionTab({
    onSelectionChange,
    openReturnDialog,
}: ServiceInvoiceSelectionTabProps) {
    const [invoices, setInvoices] = useState<ServiceInvoiceRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeFilter, setActiveFilter] = useState("all");
    const itemsPerPage = 20;

    const filterTabs = [
        { key: "all", label: "جميع الفواتير", icon: "list" },
        { key: "cash", label: "فواتير نقدية", icon: "dollar" },
        { key: "credit", label: "فواتير آجل", icon: "file-text" },
    ];

    const loadInvoices = useCallback(
        async (page: number = 1, search: string = "", paymentType: string = activeFilter) => {
            try {
                setIsLoading(true);
                let params = `per_page=${itemsPerPage}&page=${page}`;
                if (search) params += `&search=${encodeURIComponent(search)}`;
                if (paymentType && paymentType !== "all") params += `&payment_type=${paymentType}`;

                const response = await fetchAPI(
                    `${API_ENDPOINTS.COMMERCIAL.SERVICES.SALES}?${params}`
                );

                if (response.success && response.data) {
                    const data = response.data as any;
                    const list: ServiceInvoiceRow[] = Array.isArray(data) ? data : (data.data || []);
                    setInvoices(list);

                    const totalPagesCount = (response.pagination as any)?.total_pages || data.last_page || 1;
                    setTotalPages(Number(totalPagesCount));
                    setCurrentPage(page);
                }
            } catch (error) {
                console.error("Failed to load service invoices", error);
            } finally {
                setIsLoading(false);
            }
        },
        [activeFilter]
    );

    useEffect(() => {
        loadInvoices(1, "", activeFilter);
    }, [activeFilter, loadInvoices]);

    /** Fetch individual line-items when a row is expanded */
    const getInvoiceItems = async (
        invoice: ServiceInvoiceRow
    ): Promise<SelectableInvoiceItem[]> => {
        try {
            const response = await fetchAPI(
                `${API_ENDPOINTS.COMMERCIAL.SERVICES.INVOICE_DETAILS}?id=${invoice.id}`
            );
            if (response.success && response.data) {
                return ((response.data as any).items as SelectableInvoiceItem[]) || [];
            }
            return [];
        } catch {
            return [];
        }
    };

    const columns: InvoiceTableColumn<ServiceInvoiceRow>[] = [
        {
            key: "invoice_number",
            header: "رقم الفاتورة",
            dataLabel: "رقم الفاتورة",
            render: (item) => (
                <span style={{ color: "var(--primary-color)", fontWeight: "bold" }}>
                    {item.invoice_number}
                </span>
            ),
        },
        {
            key: "created_at",
            header: "التاريخ",
            dataLabel: "التاريخ",
            render: (item) => (
                <span style={{ fontSize: "0.9em" }}>
                    {formatDateTime(item.created_at)}
                </span>
            ),
        },
        {
            key: "customer_name" as any,
            header: "العميل",
            dataLabel: "العميل",
            render: (item) => (
                <span style={{ fontWeight: 500 }}>
                    {item.customer?.name || item.customer_name || "—"}
                </span>
            ),
        },
        {
            key: "payment_type",
            header: "نوع البيع",
            dataLabel: "نوع البيع",
            render: (item) => (
                <span
                    className={`badge ${item.payment_type === "credit" ? "badge-warning" : "badge-success"
                        }`}
                >
                    {item.payment_type === "credit" ? "آجل (ذمم)" : "نقدي"}
                </span>
            ),
        },
        {
            key: "total_amount",
            header: "إجمالي الفاتورة",
            dataLabel: "الإجمالي",
            render: (item) => (
                <span style={{ fontWeight: "bold" }}>
                    {formatCurrency(item.total_amount)}
                </span>
            ),
        },
    ];

    return (
        <div className="sales-card animate-fade">
            <SelectableInvoiceTable
                columns={columns}
                invoices={invoices}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                onSelectionChange={onSelectionChange}
                onSearch={(query) => loadInvoices(1, query)}
                getInvoiceItems={getInvoiceItems}
                emptyMessage="لا توجد فواتير خدمات"
                multiInvoiceSelection={true}
                invoiceIdExtractor={(item) => item.id}
                isExpandable={() => true}
                openReturnDialog={openReturnDialog}
                searchPlaceholder="بحث برقم الفاتورة أو اسم العميل..."
                pagination={{
                    currentPage,
                    totalPages,
                    onPageChange: (page) => loadInvoices(page),
                }}
                FilterTabNavigation={
                    <TabSubNavigation
                        tabs={filterTabs}
                        activeTab={activeFilter}
                        onTabChange={(key) => setActiveFilter(key)}
                    />
                }
            />
        </div>
    );
}
