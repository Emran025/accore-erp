"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ConfirmDialog, showToast, showAlert, Button, SalesReturnDialog, SelectedItem, SelectableInvoiceItem } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { parseNumber } from "@/lib/utils";
import { User, getStoredUser, checkAuth } from "@/lib/auth";

import { LedgerTransaction, LedgerStatsRepresentatives, Representative, DetailedInvoiceRepresentatives } from "@/types";
import { RepresentativeInfoSection } from "../components/RepresentativeInfoSection";
import { LedgerStatsCards } from "../components/LedgerStatsCards";
import { LedgerTable } from "../components/LedgerTable";
import { LedgerFilterDialog } from "../components/LedgerFilterDialog";
import { TransactionFormDialog } from "../components/TransactionFormDialog";
import { InvoiceDetailsDialog } from "@/components/ui";

function LedgerPageContent() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const searchParams = useSearchParams();
    const representativeId = searchParams.get("sales_representative_id");

    const [user, setUser] = useState<User | null>(null);
    const [representative, setRepresentative] = useState<Representative | null>(null);
    const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
    const [stats, setStats] = useState<LedgerStatsRepresentatives>({
        total_commissions: 0,
        total_payments: 0,
        total_returns: 0,
        balance: 0,
        transaction_count: 0,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleted, setShowDeleted] = useState(false);

    const [filters, setFilters] = useState({
        search: "",
        type: "",
        date_from: "",
        date_to: "",
    });

    const [filterDialog, setFilterDialog] = useState(false);
    const [transactionDialog, setTransactionDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [viewInvoiceDialog, setViewInvoiceDialog] = useState(false);
    const [returnDialog, setReturnDialog] = useState(false);

    const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<DetailedInvoiceRepresentatives | null>(null);
    const [selectedReturnItems, setSelectedReturnItems] = useState<SelectedItem[]>([]);

    const [transactionType, setTransactionType] = useState<"payment" | "adjustment">("payment");
    const [transactionAmount, setTransactionAmount] = useState("");
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0]);
    const [transactionDescription, setTransactionDescription] = useState("");
    const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);

    const itemsPerPage = 20;

    useEffect(() => {
        if (!representativeId) {
            router.push("/02-commercial/marketing-distribution/representatives/reps-list");
            return;
        }
    }, [representativeId, router]);

    const loadLedger = useCallback(async (page: number = 1) => {
        if (!representativeId) return;

        try {
            setIsLoading(true);
            let params = `sales_representative_id=${representativeId}&page=${page}&per_page=${itemsPerPage}`;
            if (showDeleted) params += `&show_deleted=1`;
            if (filters.search) params += `&search=${encodeURIComponent(filters.search)}`;
            if (filters.type) params += `&type=${filters.type}`;
            if (filters.date_from) params += `&date_from=${filters.date_from}`;
            if (filters.date_to) params += `&date_to=${filters.date_to}`;

            const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.SALES.REPRESENTATIVES.LEDGER}?${params}`);
            if (response.success && response.data) {
                const dataObj = (response as any).data;
                setTransactions(dataObj.data || []);
                if (dataObj.stats) setStats(dataObj.stats);
                if (dataObj.representative) setRepresentative(dataObj.representative);
                if (dataObj.pagination) setTotalPages(dataObj.pagination.total_pages);
                setCurrentPage(page);
            } else {
                showAlert("alert-container", response.message || i18n.catalog["text_40b69645bd46"], "error");
            }
        } catch {
            showAlert("alert-container", i18n.catalog["text_22fa79f17c32"], "error");
        } finally {
            setIsLoading(false);
        }
    }, [representativeId, showDeleted, filters]);

    useEffect(() => {
        const init = async () => {
            const authenticated = await checkAuth();
            if (!authenticated || !authenticated.isAuthenticated) return;
            setUser(getStoredUser());
            await loadLedger();
        };
        init();
    }, [loadLedger]);

    const openAddTransactionDialog = () => {
        setEditingTransactionId(null);
        setTransactionType("payment");
        setTransactionAmount("");
        setTransactionDate(new Date().toISOString().split("T")[0]);
        setTransactionDescription("");
        setTransactionDialog(true);
    };

    const editTransaction = (transaction: LedgerTransaction) => {
        if (transaction.type !== "payment" && transaction.type !== "adjustment") {
            showToast(i18n.catalog["text_5371cd7fbbe5"], "error");
            return;
        }

        setEditingTransactionId(transaction.id);
        setTransactionType(transaction.type);
        setTransactionAmount(String(Math.abs(transaction.amount)));
        setTransactionDate(transaction.transaction_date.split("T")[0]);
        setTransactionDescription(transaction.description || "");
        setTransactionDialog(true);
    };

    const saveTransaction = async () => {
        if (!transactionAmount || parseNumber(transactionAmount) <= 0) {
            showToast(i18n.catalog["text_133a7ff54dff"], "error");
            return;
        }

        try {
            const isNegative = transactionType === "payment" || (transactionType === "adjustment" && parseNumber(transactionAmount) < 0);

            const data: any = {
                sales_representative_id: representativeId,
                type: transactionType,
                amount: parseNumber(transactionAmount),
                date: transactionDate,
                description: transactionDescription,
            };

            let response;
            if (editingTransactionId) {
                data.id = editingTransactionId;
                response = await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.COMMERCIAL.SALES.REPRESENTATIVES.TRANSACTIONS, value1: editingTransactionId }), {
                    method: "PUT",
                    body: JSON.stringify(data),
                });
            } else {
                response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.SALES.REPRESENTATIVES.TRANSACTIONS, {
                    method: "POST",
                    body: JSON.stringify(data),
                });
            }

            if (response.success) {
                showToast(i18n.catalog["text_ff783ee2826d"], "success");
                setTransactionDialog(false);
                await loadLedger(currentPage);
            } else {
                showToast(response.message || i18n.catalog["text_acc74dcf4c2f"], "error");
            }
        } catch {
            showToast(i18n.catalog["text_c574313242be"], "error");
        }
    };

    const confirmDeleteTransaction = (id: number) => {
        setDeleteTransactionId(id);
        setConfirmDialog(true);
    };

    const deleteTransaction = async () => {
        if (!deleteTransactionId) return;

        try {
            const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.SALES.REPRESENTATIVES.TRANSACTIONS, {
                method: "DELETE",
                body: JSON.stringify({ id: deleteTransactionId })
            });

            if (response.success) {
                showToast(i18n.catalog["text_12b6e3813b40"], "success");
                setConfirmDialog(false);
                setDeleteTransactionId(null);
                await loadLedger(currentPage);
            } else {
                showToast(response.message || i18n.catalog["text_acc74dcf4c2f"], "error");
            }
        } catch {
            showToast(i18n.catalog["text_3bdb299872fb"], "error");
        }
    };

    const restoreTransaction = async (id: number) => {
        try {
            const response = await fetchAPI(catalogText(i18n, "text_d9cbe9889e23", { value0: API_ENDPOINTS.COMMERCIAL.SALES.REPRESENTATIVES.TRANSACTIONS, value1: id }), {
                method: "POST",
            });

            if (response.success) {
                showToast(i18n.catalog["text_aa78a43df0d6"], "success");
                await loadLedger(currentPage);
            } else {
                showToast(response.message || i18n.catalog["text_acc74dcf4c2f"], "error");
            }
        } catch {
            showToast(i18n.catalog["text_f456a605d85c"], "error");
        }
    };

    const viewInvoice = async (id: number) => {
        try {
            const response = await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.COMMERCIAL.SALES.INVOICES, value1: id }));
            if (response.success && response.data) {
                setSelectedInvoice(response.data as DetailedInvoiceRepresentatives);
                setViewInvoiceDialog(true);
            } else {
                showToast(i18n.catalog["text_e9aa689cdb35"], "error");
            }
        } catch (error) {
            console.error(error);
            showToast(i18n.catalog["text_b8c14ea4b319"], "error");
        }
    };

    const fetchInvoiceItems = async (transaction: LedgerTransaction): Promise<SelectableInvoiceItem[]> => {
        if (!transaction.reference_id || transaction.reference_type !== "invoices") {
            return [];
        }
        try {
            const res = await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.COMMERCIAL.SALES.INVOICES, value1: transaction.reference_id }));
            if (res.success && res.data) {
                return (res.data as any).items.map((item: any) => ({
                    id: item.id || Math.random(),
                    product_id: item.product_id,
                    display_name: item.product_name,
                    quantity: item.quantity,
                    original_quantity: item.original_quantity || item.quantity,
                    unit_price: item.unit_price,
                    subtotal: item.subtotal,
                }));
            }
            return [];
        } catch (error) {
            console.error(i18n.catalog["text_148759ded034"], error);
            return [];
        }
    };


    if (!representativeId) return null;

    return (
        <MainLayout >
            <PageSubHeader
                user={user}
                actions={
                    <>
                        <Button variant="secondary" icon="filter" onClick={() => setFilterDialog(true)}>
                            {i18n.catalog["text_a826a913e567"]}</Button>
                        <Button variant="primary" icon="plus" onClick={openAddTransactionDialog}>
                            {i18n.catalog["text_15db20a15bbe"]}</Button>
                    </>
                }
            />

            <div id="alert-container"></div>

            <RepresentativeInfoSection
                representative={representative}
                showDeleted={showDeleted}
                onShowDeletedChange={setShowDeleted}
            />

            <LedgerStatsCards stats={stats} />

            <div className="table-controls mb-4 flex gap-4">
                <input
                    type="text"
                    placeholder={i18n.catalog["text_f6d32ad7b4a9"]}
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    onBlur={() => loadLedger(1)}
                    onKeyDown={(e) => e.key === 'Enter' && loadLedger(1)}
                    className="form-control"
                    style={{ maxWidth: '300px' }}
                />
            </div>

            <LedgerTable
                transactions={transactions}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                handleReturnSelection={setSelectedReturnItems}
                setSearch={(query: string) => {
                    setFilters({ ...filters, search: query });
                    loadLedger(1);
                }}
                onPageChange={loadLedger}
                getInvoiceItems={fetchInvoiceItems}
                openReturnDialog={() => setReturnDialog(true)}
                onViewInvoice={viewInvoice}
                onEditTransaction={editTransaction}
                onDeleteTransaction={confirmDeleteTransaction}
                onRestoreTransaction={restoreTransaction}
            />

            <TransactionFormDialog
                isOpen={transactionDialog}
                onClose={() => setTransactionDialog(false)}
                isCustomId={!!editingTransactionId}
                transactionType={transactionType}
                transactionAmount={transactionAmount}
                transactionDate={transactionDate}
                transactionDescription={transactionDescription}
                setTransactionType={setTransactionType}
                setTransactionAmount={setTransactionAmount}
                setTransactionDate={setTransactionDate}
                setTransactionDescription={setTransactionDescription}
                onSave={saveTransaction}
            />

            <LedgerFilterDialog
                isOpen={filterDialog}
                onClose={() => setFilterDialog(false)}
                filters={filters}
                setFilters={setFilters}
                onApply={() => {
                    setFilterDialog(false);
                    loadLedger(1);
                }}
            />

            <InvoiceDetailsDialog
                isOpen={viewInvoiceDialog}
                onClose={() => setViewInvoiceDialog(false)}
                selectedInvoice={selectedInvoice}
            />

            <SalesReturnDialog
                isOpen={returnDialog}
                onClose={() => setReturnDialog(false)}
                selectedItems={selectedReturnItems}
                invoicesMap={{}}
                onConfirmReturn={async () => { }}
                onSuccess={() => {
                    setReturnDialog(false);
                    setSelectedReturnItems([]);
                    loadLedger(currentPage);
                }}
            />

            <ConfirmDialog
                isOpen={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={deleteTransaction}
                title={i18n.catalog["text_5f9cb54dc136"]}
                message={i18n.catalog["text_28988ea29267"]}
                confirmVariant="danger"
            />
        </MainLayout>
    );
}

export default function LedgerPage() {
    const { t: i18n } = useI18n();
    return (
        <Suspense fallback={<div className="p-4 text-center">{i18n.catalog["text_ceac78d7f5d3"]}</div>}>
            <LedgerPageContent />
        </Suspense>
    );
}
