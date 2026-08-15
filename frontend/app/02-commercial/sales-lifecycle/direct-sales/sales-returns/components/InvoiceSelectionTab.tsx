"use client";

import { useI18n } from "@/lib/i18n";
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

/** Minimal invoice row – matches the /invoices API response */
export interface InvoiceRow {
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

interface InvoiceSelectionTabProps {
    onSelectionChange: (items: SelectedItem[]) => void;
    openReturnDialog: () => void;
}

export function InvoiceSelectionTab({
    onSelectionChange,
    openReturnDialog,
}: InvoiceSelectionTabProps) {
    const { t: i18n } = useI18n();
    const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeFilter, setActiveFilter] = useState("all");
    const itemsPerPage = 20;

    const filterTabs = [
        { key: "all", label: i18n.catalog["text_377c0cb35dea"], icon: "list" },
        { key: "cash", label: i18n.catalog["text_d75568def1e5"], icon: "dollar" },
        { key: "credit", label: i18n.catalog["text_0c7cb28e4ae8"], icon: "file-text" },
    ];

    const loadInvoices = useCallback(
        async (page: number = 1, search: string = "", paymentType: string = activeFilter) => {
            try {
                setIsLoading(true);
                const offset = (page - 1) * itemsPerPage;
                let params = `limit=${itemsPerPage}&offset=${offset}&page=${page}`;
                if (search) params += `&search=${encodeURIComponent(search)}`;
                if (paymentType && paymentType !== "all")
                    params += `&payment_type=${paymentType}`;

                const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.SALES.INVOICES}?${params}`);
                if (response.success && response.data) {
                    setInvoices(response.data as InvoiceRow[]);
                    if (response.pagination) {
                        const pag = response.pagination as any;
                        setTotalPages(Number(pag.total_pages) || 1);
                    }
                    setCurrentPage(page);
                }
            } catch (error) {
                console.error(i18n.catalog["text_0b0cb3f74801"], error);
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
        invoice: InvoiceRow
    ): Promise<SelectableInvoiceItem[]> => {
        try {
            const response = await fetchAPI(
                `${API_ENDPOINTS.COMMERCIAL.SALES.INVOICE_DETAILS}?id=${invoice.id}`
            );
            if (response.success && response.data) {
                return ((response.data as any).items as SelectableInvoiceItem[]) || [];
            }
            return [];
        } catch {
            return [];
        }
    };

    const columns: InvoiceTableColumn<InvoiceRow>[] = [
        {
            key: "invoice_number",
            header: i18n.catalog["text_b6e71278be04"],
            dataLabel: i18n.catalog["text_b6e71278be04"],
            render: (item) => (
                <span style={{ color: "var(--primary-color)", fontWeight: "bold" }}>
                    {item.invoice_number}
                </span>
            ),
        },
        {
            key: "created_at",
            header: i18n.catalog["text_d90c384199ac"],
            dataLabel: i18n.catalog["text_d90c384199ac"],
            render: (item) => (
                <span style={{ fontSize: "0.9em" }}>
                    {formatDateTime(item.created_at)}
                </span>
            ),
        },
        {
            key: "customer_name" as any,
            header: i18n.catalog["text_a042411e90be"],
            dataLabel: i18n.catalog["text_a042411e90be"],
            render: (item) => (
                <span style={{ fontWeight: 500 }}>
                    {item.customer?.name || (item as any).customer_name || "—"}
                </span>
            ),
        },
        {
            key: "payment_type",
            header: i18n.catalog["text_7af05079bb45"],
            dataLabel: i18n.catalog["text_7af05079bb45"],
            render: (item) => (
                <span
                    className={`badge ${item.payment_type === "credit"
                        ? "badge-warning"
                        : "badge-success"
                        }`}
                >
                    {item.payment_type === "credit" ? i18n.catalog["text_70122ff036ec"] : i18n.catalog["text_1beb05a45173"]}
                </span>
            ),
        },
        {
            key: "total_amount",
            header: i18n.catalog["text_50a90c019154"],
            dataLabel: i18n.catalog["text_baed6e999960"],
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
                emptyMessage={i18n.catalog["text_e954a549b77f"]}
                multiInvoiceSelection={true}
                invoiceIdExtractor={(item) => item.id}
                isExpandable={() => true}
                openReturnDialog={openReturnDialog}
                searchPlaceholder={i18n.catalog["text_e74be403f307"]}
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
