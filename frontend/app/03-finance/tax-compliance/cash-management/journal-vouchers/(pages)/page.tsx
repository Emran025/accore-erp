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
        throw new Error(response.message || i18n.catalog["text_aa47a6dab24d"]);
      }
      setVouchers(response.data as Voucher[]);
      const pagination = response.pagination as { total_pages?: number } | undefined;
      setTotalPages(pagination?.total_pages ?? 1);
      setCurrentPage(page);
    } catch {
      showToast(i18n.catalog["text_e1e1dc7023c4"], "error");
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
      console.error(i18n.catalog["text_6cbd94092239"]);
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
      showToast(i18n.catalog["text_01e0ae615b5b"], "error");
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
      showToast(i18n.catalog["text_2e8cc203a4be"], "error");
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
      showToast(i18n.catalog["text_bb2eed2ae1f8"], "error");
      return;
    }

    const validLines = formData.lines.filter(
      (line) => line.account_id && (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0)
    );

    if (validLines.length < 2) {
      showToast(i18n.catalog["text_f6278da2140e"], "error");
      return;
    }

    if (!isBalanced()) {
      showToast(i18n.catalog["text_2f2d8c1a6e59"], "error");
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
      showToast(i18n.catalog["text_1da89a2b2c05"], "success");
      setFormDialog(false);
      loadVouchers(currentPage);
    } catch {
      showToast(i18n.catalog["text_9709a87f3bfe"], "error");
    }
  };

  const postVoucher = async (id: number) => {
    try {
      await fetchAPI(API_ENDPOINTS.FINANCE.TREASURY.VOUCHERS.POST(id), { method: "POST" });
      showToast(i18n.catalog["text_c205f0fe3ac7"], "success");
      loadVouchers(currentPage);
    } catch {
      showToast(i18n.catalog["text_6f4e9e60605a"], "error");
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
      showToast(i18n.catalog["text_67fb2a1bd795"], "success");
      loadVouchers(currentPage);
    } catch {
      showToast(i18n.catalog["text_efa19ed994b9"], "error");
    }
  };

  const columns: Column<Voucher>[] = [
    { key: "voucher_number", header: i18n.catalog["text_b1f955190176"], dataLabel: i18n.catalog["text_b1f955190176"] },
    {
      key: "voucher_date",
      header: i18n.catalog["text_d90c384199ac"],
      dataLabel: i18n.catalog["text_d90c384199ac"],
      render: (item) => formatDate(item.voucher_date),
    },
    { key: "description", header: i18n.catalog["text_95023fc76e1b"], dataLabel: i18n.catalog["text_95023fc76e1b"] },
    {
      key: "total_debit",
      header: i18n.catalog["text_761dab1874ad"],
      dataLabel: i18n.catalog["text_761dab1874ad"],
      render: (item) => formatCurrency(item.total_debit),
    },
    {
      key: "total_credit",
      header: i18n.catalog["text_bb186ac310b7"],
      dataLabel: i18n.catalog["text_bb186ac310b7"],
      render: (item) => formatCurrency(item.total_credit),
    },
    {
      key: "status",
      header: i18n.catalog["text_c3a4749caed4"],
      dataLabel: i18n.catalog["text_c3a4749caed4"],
      render: (item) => (
        <span className={`badge ${item.status === "posted" ? "badge-success" : "badge-warning"}`}>
          {item.status === "posted" ? i18n.catalog["text_a88bc9f2d813"] : i18n.catalog["text_552aec56f591"]}
        </span>
      ),
    },
    {
      key: "actions",
      header: i18n.catalog["text_7797240d6caf"],
      dataLabel: i18n.catalog["text_7797240d6caf"],
      render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_3824e18ca83b"],
              variant: "view",
              onClick: () => openViewDialog(item)
            },
            {
              icon: "check",
              title: i18n.catalog["text_64a11fadf742"],
              variant: "edit",
              onClick: () => postVoucher(item.id),
              hidden: item.status !== "draft" || !canAccess(permissions, "journal_vouchers", "edit")
            },
            {
              icon: "trash",
              title: i18n.catalog["text_59ca629220a6"],
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
      header: i18n.catalog["text_66dcee1f4616"],
      render: (line, index) => (
        <Select
          value={line.account_id}
          onChange={(e) => updateLine(index, "account_id", e.target.value)}
          className="w-full"
          options={[
            { value: "", label: i18n.catalog["text_b2e1c053ebe5"] },
            ...accounts.map(acc => ({ value: acc.id, label: catalogText(i18n, "text_2a9059a3c52f", { value0: acc.code, value1: acc.name }) }))
          ]}
        />
      ),
    },
    {
      key: "debit",
      header: i18n.catalog["text_b19917a31039"],
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
      header: i18n.catalog["text_a91798231743"],
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
      header: i18n.catalog["text_15391f77cefa"],
      render: (line, index) => (
        <TextInput
          value={line.description}
          onChange={(e) => updateLine(index, "description", e.target.value)}
          placeholder={i18n.catalog["text_f02fcac93ed1"]}
          className="w-full"
        />
      ),
    },
    {
      key: "cost_center_id",
      header: i18n.catalog["text_3d8ab274b4d9"],
      render: (line, index) => (
        <Select
          value={line.cost_center_id}
          onChange={(e) => updateLine(index, "cost_center_id", e.target.value)}
          className="w-full"
          options={[
            { value: "", label: i18n.catalog["text_bda050585a00"] },
            ...costCenters.map(cc => ({ value: cc.id, label: catalogText(i18n, "text_2a9059a3c52f", { value0: cc.code, value1: cc.name }) }))
          ]}
        />
      ),
    },
    {
      key: "profit_center_id",
      header: i18n.catalog["text_22f515c45510"],
      render: (line, index) => (
        <Select
          value={line.profit_center_id}
          onChange={(e) => updateLine(index, "profit_center_id", e.target.value)}
          className="w-full"
          options={[
            { value: "", label: i18n.catalog["text_bda050585a00"] },
            ...profitCenters.map(pc => ({ value: pc.id, label: catalogText(i18n, "text_2a9059a3c52f", { value0: pc.code, value1: pc.name }) }))
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
    { key: "account_name", header: i18n.catalog["text_66dcee1f4616"], dataLabel: i18n.catalog["text_66dcee1f4616"] },
    {
      key: "debit",
      header: i18n.catalog["text_b19917a31039"],
      dataLabel: i18n.catalog["text_b19917a31039"],
      render: (item) => (item.debit > 0 ? formatCurrency(item.debit) : "-"),
    },
    {
      key: "credit",
      header: i18n.catalog["text_a91798231743"],
      dataLabel: i18n.catalog["text_a91798231743"],
      render: (item) => (item.credit > 0 ? formatCurrency(item.credit) : "-"),
    },
    {
      key: "cost_center_name",
      header: i18n.catalog["text_d7a5a7f126af"],
      dataLabel: i18n.catalog["text_d7a5a7f126af"],
      render: (item) => item.cost_center_name ? (
        <span className="badge badge-secondary">{item.cost_center_name}</span>
      ) : "-",
    },
    {
      key: "profit_center_name",
      header: i18n.catalog["text_83da58551a6f"],
      dataLabel: i18n.catalog["text_83da58551a6f"],
      render: (item) => item.profit_center_name ? (
        <span className="badge badge-secondary">{item.profit_center_name}</span>
      ) : "-",
    },
    {
      key: "description",
      header: i18n.catalog["text_15391f77cefa"],
      dataLabel: i18n.catalog["text_15391f77cefa"],
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
                {i18n.catalog["text_30e1d586ec9b"]}</Button>
            )
          }
        />
        <Table
          columns={columns}
          data={vouchers}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["text_2719caa043d5"]}
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
        title={i18n.catalog["text_d02cec3de121"]}
        maxWidth="800px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormDialog(false)}>
              {i18n.catalog["text_9a30dc2a96b8"]}</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {i18n.catalog["text_ddfcaf9d0144"]}</Button>
          </>
        }
      >
        <div className="form-row">
          <TextInput
            type="date"
            label={i18n.catalog["text_24ab9ad4f30d"]}
            id="voucher_date"
            value={formData.voucher_date}
            onChange={(e) => setFormData({ ...formData, voucher_date: e.target.value })}
            className="flex-1"
          />
          <TextInput
            label={i18n.catalog["text_c5293e340faa"]}
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="flex-[2]"
          />
        </div>

        <h4 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>{i18n.catalog["text_e6aef3285b6f"]}</h4>

        <Table
          columns={voucherLineColumns}
          data={formData.lines}
          keyExtractor={(_, index) => index}
          emptyMessage={i18n.catalog["text_69685693e77f"]}
        />

        <Button
          variant="secondary"
          onClick={addLine}
          icon="plus"
          style={{ marginTop: "1rem" }}
        >
          {i18n.catalog["text_cbba06a9c34c"]}</Button>

        <div className="summary-stat-box" style={{ marginTop: "1.5rem" }}>
          <div className="stat-item">
            <span className="stat-label">{i18n.catalog["text_9b3ffc60129b"]}</span>
            <span className="stat-value">{formatCurrency(getTotalDebit())}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{i18n.catalog["text_ccfe7f015017"]}</span>
            <span className="stat-value">{formatCurrency(getTotalCredit())}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{i18n.catalog["text_0b5254487af9"]}</span>
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
        title={catalogText(i18n, "text_07bdd6199c9b", { value0: selectedVoucher?.voucher_number || "" })}
        maxWidth="700px"
      >
        {selectedVoucher && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <p><strong>{i18n.catalog["text_174200101521"]}</strong> {formatDate(selectedVoucher.voucher_date)}</p>
              <p><strong>{i18n.catalog["text_3ec7e12fb399"]}</strong> {selectedVoucher.description}</p>
              <p>
                <strong>{i18n.catalog["text_02e196bdec60"]}</strong>{" "}
                <span className={`badge ${selectedVoucher.status === "posted" ? "badge-success" : "badge-warning"}`}>
                  {selectedVoucher.status === "posted" ? i18n.catalog["text_a88bc9f2d813"] : i18n.catalog["text_552aec56f591"]}
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
                <span className="stat-label">{i18n.catalog["text_9b3ffc60129b"]}</span>
                <span className="stat-value">{formatCurrency(selectedVoucher.total_debit)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["text_ccfe7f015017"]}</span>
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
        title={i18n.catalog["text_5f9cb54dc136"]}
        message={i18n.catalog["text_7ffa0cbbb78d"]}
        confirmText={i18n.catalog["text_59ca629220a6"]}
        confirmVariant="danger"
      />
    </MainLayout>
  );
}

