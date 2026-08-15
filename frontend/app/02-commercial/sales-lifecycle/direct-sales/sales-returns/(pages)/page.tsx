"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import {
    Button,
    ReturnData,
    SalesReturnDialog,
    SelectableInvoice,
    SelectableInvoiceItem,
    SelectedItem,
    showAlert,
    showToast,
} from "@/components/ui";
import { Suspense, useCallback, useEffect, useState } from "react";

import { TabSubNavigation } from "@/components/navigation/TabNavigation";
import { fetchAPI } from "@/lib/api";
import { User, checkAuth, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";

import { DetailedInvoiceSuppliers, LedgerTransaction, Pagination } from "@/types";
import { InvoiceSelectionTab } from "../components/InvoiceSelectionTab";
import { ReturnsFilterDialog } from "../components/ReturnsFilterDialog";
import { ReturnsStats, ReturnsStatsCards } from "../components/ReturnsStatsCards";
import { ReturnsTable } from "../components/ReturnsTable";
import { InvoiceDetailsDialog } from "@/components/ui";

/** Top-level page tabs */
const PAGE_TABS = [
    { key: "records", label: catalogMessage("common.general.returnsLog"), icon: "list" },
    { key: "new-return", label: catalogMessage("common.general.addReturn"), icon: "plus" },
];

function ReturnsPageContent() {
    const { t: i18n } = useI18n();
    const [user, setUser] = useState<User | null>(null);
    const [activePage, setActivePage] = useState<"records" | "new-return">("records");

    /* ── Returns ledger ── */
    const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
    const [stats, setStats] = useState<ReturnsStats>({
        total_returns: 0,
        total_cash_returns: 0,
        total_credit_returns: 0,
        transaction_count: 0,
    });
    const [pagination, setPagination] = useState<Pagination>({ total_records: 0, total_pages: 0, current_page: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    /* ── Filters ── */
    const [filters, setFilters] = useState({ search: "", type: "", date_from: "", date_to: "" });

    /* ── Dialogs ── */
    const [filterDialog, setFilterDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<DetailedInvoiceSuppliers | null>(null);

    /* ── Return creation ── */
    const [selectedReturnItems, setSelectedReturnItems] = useState<SelectedItem[]>([]);
    const [returnDialog, setReturnDialog] = useState(false);
    const [invoicesMap, setInvoicesMap] = useState<Record<number, SelectableInvoice>>({});
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

    const itemsPerPage = 20;

    /* ──────────────────────────────────────────────
       Load returns ledger
    ────────────────────────────────────────────── */
    const loadReturns = useCallback(
        async (page: number = 1) => {
            try {
                setIsLoading(true);
                const offset = (page - 1) * itemsPerPage;
                let params = `limit=${itemsPerPage}&offset=${offset}&page=${page}`;
                if (filters.search) params += `&search=${encodeURIComponent(filters.search)}`;
                if (filters.type) params += `&type=${filters.type}`;
                if (filters.date_from) params += `&date_from=${filters.date_from}`;
                if (filters.date_to) params += `&date_to=${filters.date_to}`;

                const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.SALES.RETURNS.LEDGER}?${params}`);
                if (response.success && response.data) {
                    const mapped: LedgerTransaction[] = (response.data as any[]).map((item) => ({
                        ...item,
                        type: "return" as const,
                        invoice_number: item.invoice_number || catalogText(i18n, "common.general.rtn", { value0: item.id }),
                        total_amount: item.amount,
                        subtotal: item.subtotal ?? item.amount,
                        vat_amount: item.vat_amount ?? 0,
                        discount_amount: item.discount_amount ?? 0,
                        payment_type: item.payment_type ?? "cash",
                        created_at: item.transaction_date,
                    }));
                    setTransactions(mapped);
                    if (response.stats) setStats(response.stats as ReturnsStats);
                    if (response.pagination) {
                        const pag = response.pagination as Pagination;
                        setPagination(pag);
                        setTotalPages(Number(pag.total_pages) || 1);
                    }
                    setCurrentPage(page);
                } else {
                    showAlert("alert-container", response.message || i18n.catalog["common.general.failedLoadReturns"], "error");
                }
            } catch {
                showAlert("alert-container", i18n.catalog["common.general.errorConnectingServer"], "error");
            } finally {
                setIsLoading(false);
            }
        },
        [filters]
    );

    // Initial auth check only once on mount
    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated) return;
            setUser(getStoredUser());
        };
        init();
    }, []);

    // Load returns whenever loadReturns changes (which happens when filters change)
    useEffect(() => {
        loadReturns();
    }, [loadReturns]);

    /* ──────────────────────────────────────────────
       View original invoice details
    ────────────────────────────────────────────── */
    const viewInvoice = async (id: number) => {
        try {
            const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.SALES.INVOICE_DETAILS}?id=${id}`);
            if (response.success && response.data) {
                setSelectedInvoice(response.data as DetailedInvoiceSuppliers);
                setViewDialog(true);
            }
        } catch {
            showAlert("alert-container", i18n.catalog["common.general.failedFetchInvoiceDetails"], "error");
        }
    };

    /** Fetch return items for the expandable row in the ledger tab */
    const getReturnItems = async (item: LedgerTransaction): Promise<SelectableInvoiceItem[]> => {
        if (!item.reference_id) return [];
        try {
            const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.SALES.RETURNS.SHOW}?id=${item.reference_id}`);
            if (response.success && response.data) {
                return ((response.data as DetailedInvoiceSuppliers).items as SelectableInvoiceItem[]) || [];
            }
            return [];
        } catch {
            return [];
        }
    };

    /* ──────────────────────────────────────────────
       Return creation handlers (identical to AR Ledger)
    ────────────────────────────────────────────── */
    const handleReturnSelection = useCallback((items: SelectedItem[]) => {
        setSelectedReturnItems(items);
    }, []);

    const openReturnDialog = async () => {
        if (selectedReturnItems.length === 0) {
            showToast(i18n.catalog["common.general.pleaseSelectItemsReturnFirst"], "warning");
            return;
        }

        const uniqueInvoiceIds = Array.from(new Set(selectedReturnItems.map((i) => i.invoiceId)));
        const missingIds = uniqueInvoiceIds.filter((id) => !invoicesMap[id]);

        if (missingIds.length > 0) {
            setIsLoadingInvoices(true);
            try {
                const newMap = { ...invoicesMap };
                await Promise.all(
                    missingIds.map(async (id) => {
                        const res = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.SALES.INVOICE_DETAILS}?id=${id}`);
                        if (res.success && res.data) newMap[id] = res.data as SelectableInvoice;
                    })
                );
                setInvoicesMap(newMap);
            } catch {
                showToast(i18n.catalog["common.general.failedLoadInvoiceData"], "error");
            } finally {
                setIsLoadingInvoices(false);
            }
        }

        setReturnDialog(true);
    };

    const handleConfirmReturn = async (data: ReturnData | ReturnData[]) => {
        const dataArray = Array.isArray(data) ? data : [data];
        for (const returnData of dataArray) {
            const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.SALES.RETURNS.BASE, {
                method: "POST",
                body: JSON.stringify(returnData),
            });
            if (!response.success) {
                throw new Error(response.message || i18n.catalog["common.general.failedRegisterReturn"]);
            }
        }
        showToast(i18n.catalog["common.general.returnRecordedSuccessfully"], "success");
    };

    const applyFilters = () => {
        setFilterDialog(false);
        loadReturns(1);
    };

    /* ──────────────────────────────────────────────
       Render
    ────────────────────────────────────────────── */
    return (
        <MainLayout >
            <PageSubHeader
                actions={
                    <>
                        {
                            (<TabSubNavigation
                                tabs={PAGE_TABS}
                                activeTab={activePage}
                                onTabChange={(key) => setActivePage(key as "records" | "new-return")}
                            />)
                        }
                        {(
                            <Button
                                variant="primary"
                                icon="search"
                                onClick={() => setFilterDialog(true)}
                            >
                                {i18n.catalog["common.general.filter"]}</Button>
                        )}
                    </>
                }
            />

            {/* ── Tab: سجل المرتجعات ── */}
            {activePage === "records" && (
                <>
                    <ReturnsStatsCards stats={stats} />
                    <div id="alert-container" />
                    <ReturnsTable
                        transactions={transactions}
                        isLoading={isLoading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setSearch={(query: string) => setFilters({ ...filters, search: query })}
                        onPageChange={loadReturns}
                        getInvoiceItems={getReturnItems}
                        onViewInvoice={viewInvoice}
                    />
                </>
            )}

            {/* ── Tab: إضافة مرتجع ── */}
            {activePage === "new-return" && (
                <InvoiceSelectionTab
                    onSelectionChange={handleReturnSelection}
                    openReturnDialog={openReturnDialog}
                />
            )}

            {/* ── Shared dialogs ── */}
            <ReturnsFilterDialog
                isOpen={filterDialog}
                onClose={() => setFilterDialog(false)}
                filters={filters}
                setFilters={setFilters}
                onApply={applyFilters}
            />

            <InvoiceDetailsDialog
                isOpen={viewDialog}
                onClose={() => setViewDialog(false)}
                selectedInvoice={selectedInvoice}
            />

            {/* Sales Return Dialog */}
            <SalesReturnDialog
                isOpen={returnDialog}
                onClose={() => setReturnDialog(false)}
                selectedItems={selectedReturnItems}
                invoicesMap={invoicesMap}
                onConfirmReturn={handleConfirmReturn}
                onSuccess={() => {
                    setReturnDialog(false);
                    setSelectedReturnItems([]);
                    // Switch to records tab and refresh
                    setActivePage("records");
                    loadReturns(1);
                }}
            />
        </MainLayout>
    );
}

export default function ReturnsPage() {
    const { t: i18n } = useI18n();
    return (
        <Suspense fallback={<div className="p-4 text-center">{i18n.catalog["common.general.loading"]}</div>}>
            <ReturnsPageContent />
        </Suspense>
    );
}
