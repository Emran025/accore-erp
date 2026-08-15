"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, ConfirmDialog, ReturnData, SalesReturnDialog, SelectableInvoice, SelectableInvoiceItem, SelectedItem, showAlert, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { User, checkAuth, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { parseNumber } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { InvoiceDetailsDialog } from "@/components/ui";
import { LedgerFilterDialog } from "../components/LedgerFilterDialog";
import { LedgerStatsCards } from "../components/LedgerStatsCards";
import { LedgerTable } from "../components/LedgerTable";
import { SupplierInfoSection } from "../components/SupplierInfoSection";
import { TransactionFormDialog } from "../components/TransactionFormDialog";
import { DetailedInvoiceSuppliers, LedgerStatsSuppliers, LedgerTransaction, Pagination, Supplier } from "@/types";

function APLedgerPageContent() {
    const { t: i18n } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierId = searchParams.get("supplier_id");

  const [user, setUser] = useState<User | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [stats, setStats] = useState<LedgerStatsSuppliers>({
    total_debit: 0,
    total_credit: 0,
    total_returns: 0,
    total_payments: 0,
    balance: 0,
    transaction_count: 0,
  });

  const [pagination, setPagination] = useState<Pagination>({
    total_records: 0,
    total_pages: 0,
    current_page: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    date_from: "",
    date_to: "",
  });

  // Dialogs
  const [filterDialog, setFilterDialog] = useState(false);
  const [transactionDialog, setTransactionDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(null);
  const [restoreTransactionId, setRestoreTransactionId] = useState<number | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<DetailedInvoiceSuppliers | null>(null);

  // Returns state
  const [selectedReturnItems, setSelectedReturnItems] = useState<SelectedItem[]>([]);
  const [returnDialog, setReturnDialog] = useState(false);
  const [invoicesMap, setInvoicesMap] = useState<Record<number, SelectableInvoice>>({});
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  // Form
  const [currentTransactionId, setCurrentTransactionId] = useState<number | null>(null);
  const [transactionType, setTransactionType] = useState<"payment" | "invoice">("payment");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0]);
  const [transactionDescription, setTransactionDescription] = useState("");

  const itemsPerPage = 20;

  useEffect(() => {
    if (!supplierId) {
      router.push("/04-supply-chain/supplier-sourcing/supplier-master/suppliers-list");
      return;
    }
  }, [supplierId, router]);

  const loadSupplierDetails = useCallback(async () => {
    if (!supplierId) return;

    try {
      const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.SUPPLIERS.BASE}?id=${supplierId}`);
      if (response.success && response.data) {
        const supplierData = Array.isArray(response.data) ? response.data[0] : response.data;
        setSupplier(supplierData as Supplier);
      }
    } catch {
      showToast(i18n.catalog["supplyChain.supplierLedger.errorLoadingSupplierData"], "error");
    }
  }, [supplierId]);

  const loadLedger = useCallback(
    async (page: number = 1) => {
      if (!supplierId) return;

      try {
        setIsLoading(true);
        const offset = (page - 1) * itemsPerPage;
        let params = `supplier_id=${supplierId}&limit=${itemsPerPage}&offset=${offset}&show_deleted=${showDeleted}`;
        if (filters.search) params += `&search=${encodeURIComponent(filters.search)}`;
        if (filters.type) params += `&type=${filters.type}`;
        if (filters.date_from) params += `&date_from=${filters.date_from}`;
        if (filters.date_to) params += `&date_to=${filters.date_to}`;

        const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.SUPPLIERS.LEDGER}?${params}`);
        if (response.success && response.data) {
          const rawTransactions = response.data as any[];
          const mappedTransactions: LedgerTransaction[] = rawTransactions.map((item) => ({
            ...item,
            type: item.type,
            invoice_number: item.reference_id ? catalogText(i18n, "common.general.ref", { value0: item.reference_id }) : `TRX-${item.id}`,
            total_amount: item.amount,
            subtotal: item.amount,
            vat_amount: 0,
            discount_amount: 0,
            payment_type: item.type === "invoice" ? "credit" : "cash",
            created_at: item.transaction_date,
          }));

          setTransactions(mappedTransactions);
          if (response.stats) {
            setStats(response.stats as LedgerStatsSuppliers);
          }

          if (response.pagination) {
            setPagination(response.pagination as Pagination);
          }
          const total = Number(pagination.total_records) || 0;
          setTotalPages(Math.ceil(total / itemsPerPage));
          setCurrentPage(page);
        } else {
          showAlert("alert-container", response.message || i18n.catalog["common.general.failedLoadOperations"], "error");
        }
      } catch {
        showAlert("alert-container", i18n.catalog["common.general.errorConnectingServer"], "error");
      } finally {
        setIsLoading(false);
      }
    },
    [supplierId, showDeleted, filters]
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

  // Load ledger whenever loadLedger or loadSupplierDetails changes
  useEffect(() => {
    loadSupplierDetails();
    loadLedger();
  }, [loadSupplierDetails, loadLedger]);

  const openAddTransactionDialog = () => {
    setCurrentTransactionId(null);
    setTransactionType("payment");
    setTransactionAmount("");
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setTransactionDescription("");
    setTransactionDialog(true);
  };

  const openEditTransaction = (transaction: LedgerTransaction) => {
    setCurrentTransactionId(transaction.id);
    setTransactionType(transaction.type === "invoice" ? "invoice" : "payment");
    setTransactionAmount(String(transaction.amount));
    const d = new Date(transaction.transaction_date);
    setTransactionDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    setTransactionDescription(transaction.description || "");
    setTransactionDialog(true);
  };

  const saveTransaction = async () => {
    if (!transactionAmount || parseNumber(transactionAmount) <= 0) {
      showToast(i18n.catalog["common.general.amountRequired"], "error");
      return;
    }

    try {
      const data: any = {
        supplier_id: supplierId,
        type: transactionType,
        amount: parseNumber(transactionAmount),
        date: transactionDate,
        description: transactionDescription,
      };
      if (currentTransactionId) data.id = currentTransactionId;

      const method = currentTransactionId ? "PUT" : "POST";
      const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.PROCUREMENT.SUPPLIERS.TRANSACTIONS, {
        method,
        body: JSON.stringify(data),
      });

      if (response.success) {
        showToast(i18n.catalog["common.general.savedSuccessfully"], "success");
        setTransactionDialog(false);
        await loadLedger(currentPage);
        await loadSupplierDetails();
      } else {
        showToast(response.message || i18n.catalog["common.general.error.alternative2"], "error");
      }
    } catch {
      showToast(i18n.catalog["common.general.errorSaving"], "error");
    }
  };

  const viewInvoice = async (id: number) => {
    try {
      const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE}?id=${id}`);
      if (response.success && response.data) {
        setSelectedInvoice(response.data as DetailedInvoiceSuppliers);
        setViewDialog(true);
      }
    } catch {
      showAlert("alert-container", i18n.catalog["common.general.errorFetchingDetails"], "error");
    }
  };

  const getInvoiceItems = async (item: LedgerTransaction): Promise<SelectableInvoiceItem[]> => {
    if (item.type === "payment") return [];
    if (!item.reference_id) return [];

    const endpoint = item.reference_type === "purchase_returns"
      ? `${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE}?id=${item.reference_id}&type=return`
      : `${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE}?id=${item.reference_id}`;

    try {
      const response = await fetchAPI(endpoint);
      if (response.success && response.data) {
        const data = response.data as DetailedInvoiceSuppliers;
        return (data.items as SelectableInvoiceItem[]) || [];
      }
      return [];
    } catch (error) {
      console.error(i18n.catalog["common.general.failedFetchItems"], error);
      return [];
    }
  };

  const handleReturnSelection = useCallback((items: SelectedItem[]) => {
    setSelectedReturnItems(items);
  }, []);

  const openReturnDialog = async () => {
    if (selectedReturnItems.length === 0) {
      showToast(i18n.catalog["common.general.pleaseSelectItemsReturnFirst"], "warning");
      return;
    }

    const uniqueInvoiceIds = Array.from(new Set(selectedReturnItems.map(i => i.invoiceId)));
    const missingIds = uniqueInvoiceIds.filter(id => !invoicesMap[id]);

    if (missingIds.length > 0) {
      setIsLoadingInvoices(true);
      try {
        const newMap = { ...invoicesMap };
        await Promise.all(missingIds.map(async (id) => {
          const res = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE}?id=${id}`);
          if (res.success && res.data) {
            newMap[id] = res.data as SelectableInvoice;
          }
        }));
        setInvoicesMap(newMap);
      } catch (error) {
        console.error(i18n.catalog["common.general.failedLoadInvoiceDetails.alternative2"], error);
        showToast(i18n.catalog["common.general.failedLoadInvoiceData"], "error");
      } finally {
        setIsLoadingInvoices(false);
      }
    }

    setReturnDialog(true);
  };

  const handleConfirmReturn = async (data: ReturnData | ReturnData[]) => {
    const dataArray = Array.isArray(data) ? data : [data];

    try {
      for (const returnData of dataArray) {
        const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE, {
          method: "POST",
          body: JSON.stringify({ ...returnData, type: "return" }),
        });

        if (!response.success) {
          throw new Error(response.message || i18n.catalog["common.general.failedRegisterReturn"]);
        }
      }

      showToast(i18n.catalog["common.general.returnRecordedSuccessfully"], "success");
    } catch (error: any) {
      showToast(error.message || i18n.catalog["common.general.errorRegisteringReturn"], "error");
      throw error;
    }
  };

  const confirmDeleteTransaction = (id: number) => {
    setDeleteTransactionId(id);
    setConfirmDialog(true);
  };

  const deleteTransaction = async () => {
    if (!deleteTransactionId) return;

    try {
      const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.SUPPLIERS.TRANSACTIONS}?id=${deleteTransactionId}`, {
        method: "DELETE",
      });
      if (response.success) {
        showToast(i18n.catalog["common.general.deletedSuccessfully"], "success");
        setConfirmDialog(false);
        setDeleteTransactionId(null);
        await loadLedger(currentPage);
      } else {
        showToast(response.message || i18n.catalog["common.general.error.alternative2"], "error");
      }
    } catch {
      showToast(i18n.catalog["common.general.deletionError"], "error");
    }
  };

  const confirmRestoreTransaction = (id: number) => {
    setRestoreTransactionId(id);
    setConfirmDialog(true);
  };

  const restoreTransaction = async () => {
    if (!restoreTransactionId) return;

    try {
      const response = await fetchAPI(API_ENDPOINTS.COMMERCIAL.PROCUREMENT.SUPPLIERS.TRANSACTIONS, {
        method: "PUT",
        body: JSON.stringify({ id: restoreTransactionId, restore: true }),
      });
      if (response.success) {
        showToast(i18n.catalog["common.general.restoredSuccessfully"], "success");
        setConfirmDialog(false);
        setRestoreTransactionId(null);
        await loadLedger(currentPage);
      } else {
        showToast(response.message || i18n.catalog["common.general.error.alternative2"], "error");
      }
    } catch {
      showToast(i18n.catalog["common.general.errorRestoring"], "error");
    }
  };

  const applyFilters = () => {
    setFilterDialog(false);
    loadLedger(1);
  };

  const handleConfirm = () => {
    if (deleteTransactionId) {
      deleteTransaction();
    } else if (restoreTransactionId) {
      restoreTransaction();
    }
  };

  if (!supplierId) {
    return null;
  }

  return (
    <MainLayout>
      <PageSubHeader
        user={user}
        actions={
          <>
            <Button
              variant="secondary"
              icon="search"
              onClick={() => setFilterDialog(true)}
            >
              {i18n.catalog["common.general.filter"]}</Button>
            <Button
              variant="primary"
              icon="plus"
              onClick={openAddTransactionDialog}
            >
              {i18n.catalog["common.general.newOperation"]}</Button>
          </>
        }
      />

      <SupplierInfoSection
        supplier={supplier}
        showDeleted={showDeleted}
        onShowDeletedChange={(checked) => {
          setShowDeleted(checked);
          loadLedger(1);
        }}
      />

      <LedgerStatsCards stats={stats} />

      <div id="alert-container"></div>

      <LedgerTable
        transactions={transactions}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        handleReturnSelection={handleReturnSelection}
        setSearch={(query) => setFilters({ ...filters, search: query })}
        onPageChange={loadLedger}
        getInvoiceItems={getInvoiceItems}
        openReturnDialog={openReturnDialog}
        onViewInvoice={viewInvoice}
        onEditTransaction={openEditTransaction}
        onDeleteTransaction={confirmDeleteTransaction}
        onRestoreTransaction={confirmRestoreTransaction}
      />

      <LedgerFilterDialog
        isOpen={filterDialog}
        onClose={() => setFilterDialog(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={applyFilters}
      />

      <TransactionFormDialog
        isOpen={transactionDialog}
        onClose={() => setTransactionDialog(false)}
        isCustomId={!!currentTransactionId}
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

      <InvoiceDetailsDialog
        isOpen={viewDialog}
        onClose={() => setViewDialog(false)}
        selectedInvoice={selectedInvoice}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={() => {
          setConfirmDialog(false);
          setDeleteTransactionId(null);
          setRestoreTransactionId(null);
        }}
        onConfirm={handleConfirm}
        title={i18n.catalog["common.general.confirmAction"]}
        message={
          deleteTransactionId
            ? i18n.catalog["common.general.areYouSureYouWantDeleteThisOperation"]
            : i18n.catalog["common.general.areYouSureYouWantRestoreThisOperation"]
        }
        confirmText={i18n.catalog["common.general.confirm"]}
        confirmVariant={deleteTransactionId ? "danger" : "primary"}
      />

      {/* Purchase Return Dialog */}
      <SalesReturnDialog
        isOpen={returnDialog}
        onClose={() => setReturnDialog(false)}
        selectedItems={selectedReturnItems}
        invoicesMap={invoicesMap}
        onConfirmReturn={handleConfirmReturn}
        onSuccess={() => {
          setReturnDialog(false);
          setSelectedReturnItems([]);
          loadLedger(currentPage);
          loadSupplierDetails();
        }}
      />
    </MainLayout>
  );
}

export default function APLedgerPage() {
    const { t: i18n } = useI18n();
  return (
    <Suspense fallback={<div className="p-4 text-center">{i18n.catalog["common.general.loading"]}</div>}>
      <APLedgerPageContent />
    </Suspense>
  );
}
