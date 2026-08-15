"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { Column, ConfirmDialog, Dialog, SearchableSelect, Table, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { Permission, User, canAccess, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { formatCurrency, formatDate, translateExpenseCategory } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface Expense {
  id: number;
  category: string;
  amount: number;
  expense_date: string;
  description?: string;
  created_at: string;
  payment_type: "cash" | "credit";
  supplier_id?: number;
}

interface Supplier {
  id: number;
  name: string;
}

const expenseCategories = [
  { value: "rent", label: catalogMessage("common.general.rent") },
  { value: "utilities", label: catalogMessage("common.general.facilities") },
  { value: "salaries", label: catalogMessage("common.general.payroll") },
  { value: "maintenance", label: catalogMessage("common.general.maintenance") },
  { value: "supplies", label: catalogMessage("common.general.supplies") },
  { value: "marketing", label: catalogMessage("common.general.marketing") },
  { value: "transport", label: catalogMessage("common.general.transfer") },
  { value: "other", label: catalogMessage("common.general.other") },
];

export default function ExpensesPage() {
    const { t: i18n } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialogs
  const [formDialog, setFormDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Form
  const [formData, setFormData] = useState({
    category: "other",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    description: "",
    payment_type: "cash" as "cash" | "credit",
    supplier_id: "",
  });

  const itemsPerPage = 10;

  const loadExpenses = useCallback(async (page: number = 1, search: string = "") => {
    try {
      setIsLoading(true);
      const response = await fetchAPI(
        `${API_ENDPOINTS.FINANCE.EXPENSES}?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(search)}`
      );
      setExpenses(response.data as Expense[] || []);
      setTotalPages((response.pagination as any)?.total_pages || 1);
      setCurrentPage(page);
    } catch {
      showToast(i18n.catalog["supplyChain.expenses.errorLoadingExpenses"], "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSuppliers = useCallback(async () => {
    try {
      const response = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.PROCUREMENT.SUPPLIERS.BASE}?limit=100`);
      setSuppliers(response.data as Supplier[] || []);
    } catch (error) {
      console.error(i18n.catalog["supplyChain.expenses.errorLoadingSuppliers"], error);
    }
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    const storedPermissions = getStoredPermissions();
    setUser(storedUser);
    setPermissions(storedPermissions);
    loadExpenses();
    loadSuppliers();
  }, [loadExpenses, loadSuppliers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    loadExpenses(1, value);
  };

  const openAddDialog = () => {
    setSelectedExpense(null);
    setFormData({
      category: "other",
      amount: "",
      expense_date: new Date().toISOString().split("T")[0],
      description: "",
      payment_type: "cash",
      supplier_id: "",
    });
    setFormDialog(true);
  };

  const openEditDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      category: expense.category,
      amount: String(expense.amount),
      expense_date: expense.expense_date.split("T")[0],
      description: expense.description || "",
      payment_type: expense.payment_type || "cash",
      supplier_id: String(expense.supplier_id || ""),
    });
    setFormDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.amount) {
      showToast(i18n.catalog["common.general.pleaseEnterAmount"], "error");
      return;
    }

    const payload = {
      category: formData.category,
      amount: parseFloat(formData.amount),
      expense_date: formData.expense_date,
      description: formData.description,
      payment_type: formData.payment_type,
      supplier_id: formData.payment_type === "credit" ? parseInt(formData.supplier_id) : null,
    };

    try {
      if (selectedExpense) {
        await fetchAPI(catalogText(i18n, "common.general.message", { value0: API_ENDPOINTS.FINANCE.EXPENSES, value1: selectedExpense.id }), {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast(i18n.catalog["supplyChain.expenses.expenseUpdatedSuccessfully"], "success");
      } else {
        await fetchAPI(API_ENDPOINTS.FINANCE.EXPENSES, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast(i18n.catalog["supplyChain.expenses.expenseAddedSuccessfully"], "success");
      }
      setFormDialog(false);
      loadExpenses(currentPage, searchTerm);
    } catch {
      showToast(i18n.catalog["supplyChain.expenses.errorSavingExpense"], "error");
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetchAPI(catalogText(i18n, "common.general.message", { value0: API_ENDPOINTS.FINANCE.EXPENSES, value1: deleteId }), { method: "DELETE" });
      showToast(i18n.catalog["supplyChain.expenses.expenseDeleted"], "success");
      loadExpenses(currentPage, searchTerm);
    } catch {
      showToast(i18n.catalog["supplyChain.expenses.errorDeletingExpense"], "error");
    }
  };

  const columns: Column<Expense>[] = [
    {
      key: "category",
      header: i18n.catalog["common.general.category"],
      dataLabel: i18n.catalog["common.general.category"],
      render: (item) => (
        <div className="flex flex-col gap-1">
          <span className="badge badge-secondary">{translateExpenseCategory(item.category)}</span>
          <span className={`text-xs ${item.payment_type === 'credit' ? 'text-warning' : 'text-success'}`}>
            {item.payment_type === 'credit' ? i18n.catalog["common.general.deferred"] : i18n.catalog["common.general.cash"]}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: i18n.catalog["common.general.amount"],
      dataLabel: i18n.catalog["common.general.amount"],
      render: (item) => <span className="text-danger">{formatCurrency(item.amount)}</span>,
    },
    {
      key: "expense_date",
      header: i18n.catalog["common.general.date.alternative7"],
      dataLabel: i18n.catalog["common.general.date.alternative7"],
      render: (item) => formatDate(item.expense_date),
    },
    {
      key: "description",
      header: i18n.catalog["common.general.description.alternative2"],
      dataLabel: i18n.catalog["common.general.description.alternative2"],
      render: (item) => item.description || "-",
    },
    {
      key: "actions",
      header: i18n.catalog["common.general.actions"],
      dataLabel: i18n.catalog["common.general.actions"],
      render: (item) => (
        <div className="action-buttons">
          {canAccess(permissions, "expenses", "edit") && (
            <button className="icon-btn edit" onClick={() => openEditDialog(item)} title={i18n.catalog["common.general.edit"]}>
              {getIcon("edit")}
            </button>
          )}
          {canAccess(permissions, "expenses", "delete") && (
            <button className="icon-btn delete" onClick={() => confirmDelete(item.id)} title={i18n.catalog["common.general.delete"]}>
              {getIcon("trash")}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <MainLayout >

      <div className="sales-card animate-fade">
      <PageSubHeader
        title=""
        user={user}
        searchInput={
          <SearchableSelect
            options={[]}
            value={null}
            onChange={() => { }}
            onSearch={(val) => {
              setSearchTerm(val);
              loadExpenses(1, val);
            }}
            placeholder={i18n.catalog["common.general.quickSearch"]}
            className="header-search-bar"
          />
        }

        actions={
          canAccess(permissions, "expenses", "create") && (
            <button className="btn btn-primary" onClick={openAddDialog}>
              {getIcon("plus")}
              {i18n.catalog["supplyChain.expenses.addExpense"]}</button>
          )
        }
      />
        <Table
          columns={columns}
          data={expenses}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["supplyChain.expenses.noExpenses"]}
          isLoading={isLoading}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: (page) => loadExpenses(page, searchTerm),
          }}
        />
      </div>

      {/* Form Dialog */}
      <Dialog
        isOpen={formDialog}
        onClose={() => setFormDialog(false)}
        title={selectedExpense ? i18n.catalog["supplyChain.expenses.editExpense"] : i18n.catalog["supplyChain.expenses.addNewExpense"]}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setFormDialog(false)}>
              {i18n.catalog["common.general.cancel"]}</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {selectedExpense ? i18n.catalog["common.general.update"] : i18n.catalog["common.general.add"]}
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">{i18n.catalog["common.general.category"]}</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {expenseCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="amount">{i18n.catalog["common.general.amount.alternative3"]}</label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="expense_date">{i18n.catalog["common.general.date.alternative7"]}</label>
          <input
            type="date"
            id="expense_date"
            value={formData.expense_date}
            onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">{i18n.catalog["common.general.description.alternative2"]}</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />
        </div>

        <div className="form-row border-t pt-4 mt-2">
          <div className="form-group">
            <label>{i18n.catalog["common.general.paymentMethod"]}</label>
            <div className="flex gap-4 items-center h-10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment_type"
                  value="cash"
                  checked={formData.payment_type === "cash"}
                  onChange={() => setFormData({ ...formData, payment_type: "cash", supplier_id: "" })}
                />
                {i18n.catalog["common.general.cash"]}</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment_type"
                  value="credit"
                  checked={formData.payment_type === "credit"}
                  onChange={() => setFormData({ ...formData, payment_type: "credit" })}
                />
                {i18n.catalog["common.general.creditReceivables"]}</label>
            </div>
          </div>

          {formData.payment_type === "credit" && (
            <div className="form-group">
              <label>{i18n.catalog["supplyChain.expenses.supplier"]}</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                required
              >
                <option value="">{i18n.catalog["supplyChain.expenses.selectSupplier"]}</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={handleDelete}
        title={i18n.catalog["common.general.confirmDeletion"]}
        message={i18n.catalog["supplyChain.expenses.areYouSureYouWantDeleteThisExpense"]}
        confirmText={i18n.catalog["common.general.delete"]}
        confirmVariant="danger"
      />
    </MainLayout>
  );
}

