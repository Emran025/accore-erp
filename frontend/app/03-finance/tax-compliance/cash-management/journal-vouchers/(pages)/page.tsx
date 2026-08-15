"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, NumberInput, Table, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { Permission, User, canAccess, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface Account {
  id: number;
  code: string;
  name: string;
}

interface CenterOption {
  id: number;
  code: string;
  name: string;
}

interface VoucherLine {
  account_id: number;
  account_name?: string;
  debit: number;
  credit: number;
  description?: string;
  cost_center_id?: number;
  cost_center_name?: string;
  profit_center_id?: number;
  profit_center_name?: string;
}

interface Voucher {
  id: number;
  voucher_number: string;
  voucher_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: "draft" | "posted";
  lines: VoucherLine[];
  created_at: string;
}

export default function JournalVouchersPage() {
    const { t: i18n } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CenterOption[]>([]);
  const [profitCenters, setProfitCenters] = useState<CenterOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs
  const [formDialog, setFormDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form
  const [formData, setFormData] = useState({
    voucher_date: new Date().toISOString().split("T")[0],
    description: "",
    lines: [
      { account_id: "", debit: "", credit: "", description: "", cost_center_id: "", profit_center_id: "" },
      { account_id: "", debit: "", credit: "", description: "", cost_center_id: "", profit_center_id: "" },
    ] as Array<{ account_id: string; debit: string; credit: string; description: string; cost_center_id: string; profit_center_id: string }>,
  });

  const itemsPerPage = 10;

  const loadVouchers = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetchAPI(`${API_ENDPOINTS.FINANCE.TREASURY.VOUCHERS.BASE}?page=${page}&limit=${itemsPerPage}`);
      if (!response.success || !Array.isArray(response.data)) {
        throw new Error(response.message || i18n.catalog["common.general.failedLoadVouchers"]);
      }
      setVouchers(response.data as Voucher[]);
      const pagination = response.pagination as { total_pages?: number } | undefined;
      setTotalPages(pagination?.total_pages ?? 1);
      setCurrentPage(page);
    } catch {
      showToast(i18n.catalog["common.general.errorLoadingVouchers"], "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      const [accountsRes, ccRes, pcRes] = await Promise.all([
        fetchAPI(`${API_ENDPOINTS.FINANCE.ACCOUNTS.BASE}?is_active=true`),
        fetchAPI(`${API_ENDPOINTS.FINANCE.COST_CENTERS.BASE}?is_active=true&limit=500`),
        fetchAPI(`${API_ENDPOINTS.FINANCE.PROFIT_CENTERS.BASE}?is_active=true&limit=500`),
      ]);
      const rawAccounts = Array.isArray(accountsRes.data) ? accountsRes.data : [];
      setAccounts(rawAccounts.map((account: Record<string, unknown>): Account => ({
        id: Number(account.id),
        code: String(account.account_code ?? account.code ?? ''),
        name: String(account.account_name ?? account.name ?? ''),
      })));
      if (ccRes.success && ccRes.data) setCostCenters(ccRes.data as CenterOption[]);
      if (pcRes.success && pcRes.data) setProfitCenters(pcRes.data as CenterOption[]);
    } catch {
      console.error(i18n.catalog["common.general.errorLoadingLookups"]);
    }
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    const storedPermissions = getStoredPermissions();
    setUser(storedUser);
    setPermissions(storedPermissions);
    loadVouchers();
    loadAccounts();
  }, [loadVouchers, loadAccounts]);

  const openAddDialog = () => {
    setSelectedVoucher(null);
    setFormData({
      voucher_date: new Date().toISOString().split("T")[0],
      description: "",
      lines: [
        { account_id: "", debit: "", credit: "", description: "", cost_center_id: "", profit_center_id: "" },
        { account_id: "", debit: "", credit: "", description: "", cost_center_id: "", profit_center_id: "" },
      ],
    });
    setFormDialog(true);
  };

  const openViewDialog = async (voucher: Voucher) => {
    try {
      const response = await fetchAPI(API_ENDPOINTS.FINANCE.TREASURY.VOUCHERS.withId(voucher.id));
      setSelectedVoucher(response.voucher as Voucher || voucher);
      setViewDialog(true);
    } catch {
      showToast(i18n.catalog["common.general.errorLoadingVoucherDetails"], "error");
    }
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account_id: "", debit: "", credit: "", description: "", cost_center_id: "", profit_center_id: "" }],
    });
  };

  const removeLine = (index: number) => {
    if (formData.lines.length <= 2) {
      showToast(i18n.catalog["common.general.voucherMustContainLeastTwoLines"], "error");
      return;
    }
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const updateLine = (index: number, field: string, value: string) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const getTotalDebit = () => {
    return formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  };

  const getTotalCredit = () => {
    return formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  };

  const isBalanced = () => {
    return Math.abs(getTotalDebit() - getTotalCredit()) < 0.01;
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      showToast(i18n.catalog["common.general.pleaseEnterVoucherDescription"], "error");
      return;
    }

    const validLines = formData.lines.filter(
      (line) => line.account_id && (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0)
    );

    if (validLines.length < 2) {
      showToast(i18n.catalog["common.general.leastTwoLinesRequired"], "error");
      return;
    }

    if (!isBalanced()) {
      showToast(i18n.catalog["common.general.unbalancedVoucherDebitDoesNotEqualCredit"], "error");
      return;
    }

    const payload = {
      voucher_date: formData.voucher_date,
      description: formData.description,
      lines: validLines.map((line) => ({
        account_id: parseInt(line.account_id),
        debit: parseFloat(line.debit) || 0,
        credit: parseFloat(line.credit) || 0,
        description: line.description,
        cost_center_id: line.cost_center_id ? parseInt(line.cost_center_id) : null,
        profit_center_id: line.profit_center_id ? parseInt(line.profit_center_id) : null,
      })),
    };

    try {
      await fetchAPI(API_ENDPOINTS.FINANCE.TREASURY.VOUCHERS.BASE, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast(i18n.catalog["common.general.voucherCreatedSuccessfully"], "success");
      setFormDialog(false);
      loadVouchers(currentPage);
    } catch {
      showToast(i18n.catalog["common.general.errorSavingVoucher"], "error");
    }
  };

  const postVoucher = async (id: number) => {
    try {
      await fetchAPI(API_ENDPOINTS.FINANCE.TREASURY.VOUCHERS.POST(id), { method: "POST" });
      showToast(i18n.catalog["common.general.voucherPosted"], "success");
      loadVouchers(currentPage);
    } catch {
      showToast(i18n.catalog["common.general.errorPostingVoucher"], "error");
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await fetchAPI(API_ENDPOINTS.FINANCE.TREASURY.VOUCHERS.withId(deleteId), { method: "DELETE" });
      showToast(i18n.catalog["common.general.voucherDeleted"], "success");
      loadVouchers(currentPage);
    } catch {
      showToast(i18n.catalog["common.general.errorDeletingVoucher"], "error");
    }
  };

  const columns: Column<Voucher>[] = [
    { key: "voucher_number", header: i18n.catalog["common.general.voucherNumber"], dataLabel: i18n.catalog["common.general.voucherNumber"] },
    {
      key: "voucher_date",
      header: i18n.catalog["common.general.date.alternative7"],
      dataLabel: i18n.catalog["common.general.date.alternative7"],
      render: (item) => formatDate(item.voucher_date),
    },
    { key: "description", header: i18n.catalog["common.general.description.alternative2"], dataLabel: i18n.catalog["common.general.description.alternative2"] },
    {
      key: "total_debit",
      header: i18n.catalog["common.general.debtor"],
      dataLabel: i18n.catalog["common.general.debtor"],
      render: (item) => formatCurrency(item.total_debit),
    },
    {
      key: "total_credit",
      header: i18n.catalog["common.general.creditor"],
      dataLabel: i18n.catalog["common.general.creditor"],
      render: (item) => formatCurrency(item.total_credit),
    },
    {
      key: "status",
      header: i18n.catalog["common.general.status.alternative2"],
      dataLabel: i18n.catalog["common.general.status.alternative2"],
      render: (item) => (
        <span className={`badge ${item.status === "posted" ? "badge-success" : "badge-warning"}`}>
          {item.status === "posted" ? i18n.catalog["common.general.posted"] : i18n.catalog["common.general.draft"]}
        </span>
      ),
    },
    {
      key: "actions",
      header: i18n.catalog["common.general.actions"],
      dataLabel: i18n.catalog["common.general.actions"],
      render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["common.general.view"],
              variant: "view",
              onClick: () => openViewDialog(item)
            },
            {
              icon: "check",
              title: i18n.catalog["common.general.migrate"],
              variant: "edit",
              onClick: () => postVoucher(item.id),
              hidden: item.status !== "draft" || !canAccess(permissions, "journal_vouchers", "edit")
            },
            {
              icon: "trash",
              title: i18n.catalog["common.general.delete"],
              variant: "delete",
              onClick: () => confirmDelete(item.id),
              hidden: item.status !== "draft" || !canAccess(permissions, "journal_vouchers", "delete")
            }
          ]}
        />
      ),
    },
  ];

  const voucherLineColumns: Column<any>[] = [
    {
      key: "account_id",
      header: i18n.catalog["common.general.account"],
      render: (line, index) => (
        <Select
          value={line.account_id}
          onChange={(e) => updateLine(index, "account_id", e.target.value)}
          className="w-full"
          options={[
            { value: "", label: i18n.catalog["common.general.selectAccount"] },
            ...accounts.map(acc => ({ value: acc.id, label: catalogText(i18n, "common.general.notAvailable", { value0: acc.code, value1: acc.name }) }))
          ]}
        />
      ),
    },
    {
      key: "debit",
      header: i18n.catalog["common.general.debit"],
      render: (line, index) => (
        <NumberInput
          value={line.debit}
          onChange={(val) => updateLine(index, "debit", val)}
          min={0}
          step={0.01}
          className="w-full"
        />
      ),
    },
    {
      key: "credit",
      header: i18n.catalog["common.general.credit"],
      render: (line, index) => (
        <NumberInput
          value={line.credit}
          onChange={(val) => updateLine(index, "credit", val)}
          min={0}
          step={0.01}
          className="w-full"
        />
      ),
    },
    {
      key: "description",
      header: i18n.catalog["common.general.statement"],
      render: (line, index) => (
        <TextInput
          value={line.description}
          onChange={(e) => updateLine(index, "description", e.target.value)}
          placeholder={i18n.catalog["common.general.optionalStatement"]}
          className="w-full"
        />
      ),
    },
    {
      key: "cost_center_id",
      header: i18n.catalog["common.general.costCenter"],
      render: (line, index) => (
        <Select
          value={line.cost_center_id}
          onChange={(e) => updateLine(index, "cost_center_id", e.target.value)}
          className="w-full"
          options={[
            { value: "", label: i18n.catalog["common.general.notAvailable.alternative8"] },
            ...costCenters.map(cc => ({ value: cc.id, label: catalogText(i18n, "common.general.notAvailable", { value0: cc.code, value1: cc.name }) }))
          ]}
        />
      ),
    },
    {
      key: "profit_center_id",
      header: i18n.catalog["common.general.profitCenter"],
      render: (line, index) => (
        <Select
          value={line.profit_center_id}
          onChange={(e) => updateLine(index, "profit_center_id", e.target.value)}
          className="w-full"
          options={[
            { value: "", label: i18n.catalog["common.general.notAvailable.alternative8"] },
            ...profitCenters.map(pc => ({ value: pc.id, label: catalogText(i18n, "common.general.notAvailable", { value0: pc.code, value1: pc.name }) }))
          ]}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (_, index) => (
        <button
          type="button"
          className="icon-btn delete"
          onClick={() => removeLine(index)}
          disabled={formData.lines.length <= 2}
        >
          {getIcon("trash")}
        </button>
      ),
    },
  ];

  const viewVoucherColumns: Column<VoucherLine>[] = [
    { key: "account_name", header: i18n.catalog["common.general.account"], dataLabel: i18n.catalog["common.general.account"] },
    {
      key: "debit",
      header: i18n.catalog["common.general.debit"],
      dataLabel: i18n.catalog["common.general.debit"],
      render: (item) => (item.debit > 0 ? formatCurrency(item.debit) : "-"),
    },
    {
      key: "credit",
      header: i18n.catalog["common.general.credit"],
      dataLabel: i18n.catalog["common.general.credit"],
      render: (item) => (item.credit > 0 ? formatCurrency(item.credit) : "-"),
    },
    {
      key: "cost_center_name",
      header: i18n.catalog["common.general.costCtr"],
      dataLabel: i18n.catalog["common.general.costCtr"],
      render: (item) => item.cost_center_name ? (
        <span className="badge badge-secondary">{item.cost_center_name}</span>
      ) : "-",
    },
    {
      key: "profit_center_name",
      header: i18n.catalog["common.general.profitMargin"],
      dataLabel: i18n.catalog["common.general.profitMargin"],
      render: (item) => item.profit_center_name ? (
        <span className="badge badge-secondary">{item.profit_center_name}</span>
      ) : "-",
    },
    {
      key: "description",
      header: i18n.catalog["common.general.statement"],
      dataLabel: i18n.catalog["common.general.statement"],
      render: (item) => item.description || "-",
    },
  ];

  return (
    <MainLayout>


      <div className="sales-card animate-fade">
        <PageSubHeader
          user={user}
          actions={
            canAccess(permissions, "journal_vouchers", "create") && (
              <Button icon="plus" onClick={openAddDialog}>
                {i18n.catalog["common.general.createVoucher"]}</Button>
            )
          }
        />
        <Table
          columns={columns}
          data={vouchers}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["common.general.noVouchers"]}
          isLoading={isLoading}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: loadVouchers,
          }}
        />
      </div>

      {/* Form Dialog */}
      <Dialog
        isOpen={formDialog}
        onClose={() => setFormDialog(false)}
        title={i18n.catalog["common.general.createJournalEntry"]}
        maxWidth="800px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormDialog(false)}>
              {i18n.catalog["common.general.cancel"]}</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {i18n.catalog["common.general.save"]}</Button>
          </>
        }
      >
        <div className="form-row">
          <TextInput
            type="date"
            label={i18n.catalog["common.general.date.alternative3"]}
            id="voucher_date"
            value={formData.voucher_date}
            onChange={(e) => setFormData({ ...formData, voucher_date: e.target.value })}
            className="flex-1"
          />
          <TextInput
            label={i18n.catalog["common.general.description.alternative3"]}
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="flex-[2]"
          />
        </div>

        <h4 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>{i18n.catalog["common.general.voucherItems"]}</h4>

        <Table
          columns={voucherLineColumns}
          data={formData.lines}
          keyExtractor={(_, index) => index}
          emptyMessage={i18n.catalog["common.general.noItems"]}
        />

        <Button
          variant="secondary"
          onClick={addLine}
          icon="plus"
          style={{ marginTop: "1rem" }}
        >
          {i18n.catalog["common.general.addLine"]}</Button>

        <div className="summary-stat-box" style={{ marginTop: "1.5rem" }}>
          <div className="stat-item">
            <span className="stat-label">{i18n.catalog["common.general.totalDebit"]}</span>
            <span className="stat-value">{formatCurrency(getTotalDebit())}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{i18n.catalog["common.general.totalCredit"]}</span>
            <span className="stat-value">{formatCurrency(getTotalCredit())}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{i18n.catalog["common.general.teams"]}</span>
            <span className={`stat-value ${isBalanced() ? "text-success" : "text-danger"}`}>
              {formatCurrency(Math.abs(getTotalDebit() - getTotalCredit()))}
              {isBalanced() && " ✓"}
            </span>
          </div>
        </div>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        isOpen={viewDialog}
        onClose={() => setViewDialog(false)}
        title={catalogText(i18n, "common.general.journalEntryNo", { value0: selectedVoucher?.voucher_number || "" })}
        maxWidth="700px"
      >
        {selectedVoucher && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <p><strong>{i18n.catalog["common.general.date"]}</strong> {formatDate(selectedVoucher.voucher_date)}</p>
              <p><strong>{i18n.catalog["common.general.description"]}</strong> {selectedVoucher.description}</p>
              <p>
                <strong>{i18n.catalog["common.general.status"]}</strong>{" "}
                <span className={`badge ${selectedVoucher.status === "posted" ? "badge-success" : "badge-warning"}`}>
                  {selectedVoucher.status === "posted" ? i18n.catalog["common.general.posted"] : i18n.catalog["common.general.draft"]}
                </span>
              </p>
            </div>

            <Table
              columns={viewVoucherColumns}
              data={selectedVoucher.lines || []}
              keyExtractor={(_, index) => index}
            />

            <div className="summary-stat-box" style={{ marginTop: "1.5rem" }}>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["common.general.totalDebit"]}</span>
                <span className="stat-value">{formatCurrency(selectedVoucher.total_debit)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["common.general.totalCredit"]}</span>
                <span className="stat-value">{formatCurrency(selectedVoucher.total_credit)}</span>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={handleDelete}
        title={i18n.catalog["common.general.confirmDeletion"]}
        message={i18n.catalog["common.general.areYouSureYouWantDeleteThisVoucher"]}
        confirmText={i18n.catalog["common.general.delete"]}
        confirmVariant="danger"
      />
    </MainLayout>
  );
}

