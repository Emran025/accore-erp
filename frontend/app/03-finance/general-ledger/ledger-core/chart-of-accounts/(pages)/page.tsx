"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, SearchableSelect, Table, showToast } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { Permission, User, canAccess, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  parent_id?: number;
  parent_name?: string;
  balance: number;
  is_active: boolean;
  description?: string;
}

const accountTypes = [
  { value: "asset", label: catalogMessage("finance.chartOfAccounts.assets") },
  { value: "liability", label: catalogMessage("finance.chartOfAccounts.liabilities") },
  { value: "equity", label: catalogMessage("finance.chartOfAccounts.ownershipRights") },
  { value: "revenue", label: catalogMessage("finance.chartOfAccounts.revenue") },
  { value: "expense", label: catalogMessage("finance.chartOfAccounts.expenses") },
];

export default function ChartOfAccountsPage() {
    const { t: i18n } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialogs
  const [formDialog, setFormDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "asset",
    parent_id: "",
    description: "",
    is_active: true,
  });

  const loadAccounts = useCallback(async (search: string = "") => {
    try {
      setIsLoading(true);
      const response = await fetchAPI(`${API_ENDPOINTS.FINANCE.ACCOUNTS.BASE}?search=${encodeURIComponent(search)}`);
      const rawAccounts = Array.isArray(response.data) ? response.data : [];
      setAccounts(rawAccounts.map((account: Record<string, unknown>): Account => ({
        id: Number(account.id),
        code: String(account.account_code ?? account.code ?? ''),
        name: String(account.account_name ?? account.name ?? ''),
        type: String(account.account_type ?? account.type ?? '').toLowerCase(),
        parent_id: account.parent_id == null ? undefined : Number(account.parent_id),
        parent_name: typeof account.parent === 'object' && account.parent !== null
          ? String((account.parent as Record<string, unknown>).account_name ?? '')
          : undefined,
        balance: Number(account.balance ?? 0),
        is_active: Boolean(account.is_active),
        description: typeof account.description === 'string' ? account.description : undefined,
      })));
    } catch {
      showToast(i18n.catalog["common.general.errorLoadingAccounts.alternative2"], "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    const storedPermissions = getStoredPermissions();
    setUser(storedUser);
    setPermissions(storedPermissions);
    loadAccounts();
  }, [loadAccounts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    loadAccounts(value);
  };

  const openAddDialog = () => {
    setSelectedAccount(null);
    setFormData({
      code: "",
      name: "",
      type: "asset",
      parent_id: "",
      description: "",
      is_active: true,
    });
    setFormDialog(true);
  };

  const openEditDialog = (account: Account) => {
    setSelectedAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      parent_id: account.parent_id ? String(account.parent_id) : "",
      description: account.description || "",
      is_active: account.is_active,
    });
    setFormDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      showToast(i18n.catalog["common.general.pleaseFillAllRequiredFields"], "error");
      return;
    }

    const payload = {
      code: formData.code,
      name: formData.name,
      type: formData.type,
      parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
      description: formData.description,
      is_active: formData.is_active,
    };

    try {
      if (selectedAccount) {
        await fetchAPI(catalogText(i18n, "common.general.message", { value0: API_ENDPOINTS.FINANCE.ACCOUNTS.BASE, value1: selectedAccount.id }), {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast(i18n.catalog["finance.chartOfAccounts.accountUpdatedSuccessfully"], "success");
      } else {
        await fetchAPI(API_ENDPOINTS.FINANCE.ACCOUNTS.BASE, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast(i18n.catalog["finance.chartOfAccounts.accountAddedSuccessfully"], "success");
      }
      setFormDialog(false);
      loadAccounts(searchTerm);
    } catch {
      showToast(i18n.catalog["finance.chartOfAccounts.errorSavingAccount"], "error");
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await fetchAPI(catalogText(i18n, "common.general.message", { value0: API_ENDPOINTS.FINANCE.ACCOUNTS.BASE, value1: deleteId }), { method: "DELETE" });
      showToast(i18n.catalog["finance.chartOfAccounts.accountDeleted"], "success");
      loadAccounts(searchTerm);
    } catch {
      showToast(i18n.catalog["finance.chartOfAccounts.failedDeleteAccount"], "error");
    }
  };

  const getTypeLabel = (type: string) => {
    const found = accountTypes.find((t) => t.value === type);
    return found?.label || type;
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "asset":
        return "badge-primary";
      case "liability":
        return "badge-danger";
      case "equity":
        return "badge-info";
      case "revenue":
        return "badge-success";
      case "expense":
        return "badge-warning";
      default:
        return "badge-secondary";
    }
  };

  const columns: Column<Account>[] = [
    { key: "code", header: i18n.catalog["common.general.accountNumber"], dataLabel: i18n.catalog["common.general.accountNumber"] },
    { key: "name", header: i18n.catalog["common.general.accountName"], dataLabel: i18n.catalog["common.general.accountName"] },
    {
      key: "type",
      header: i18n.catalog["common.general.type.alternative3"],
      dataLabel: i18n.catalog["common.general.type.alternative3"],
      render: (item) => (
        <span className={`badge ${getTypeBadgeClass(item.type)}`}>
          {getTypeLabel(item.type)}
        </span>
      ),
    },
    {
      key: "parent_name",
      header: i18n.catalog["common.general.primaryAccount"],
      dataLabel: i18n.catalog["common.general.primaryAccount"],
      render: (item) => item.parent_name || "-",
    },
    {
      key: "balance",
      header: i18n.catalog["common.general.balance"],
      dataLabel: i18n.catalog["common.general.balance"],
      render: (item) => (
        <span className={item.balance >= 0 ? "text-success" : "text-danger"}>
          {formatCurrency(Math.abs(item.balance))}
        </span>
      ),
    },
    {
      key: "is_active",
      header: i18n.catalog["common.general.status.alternative2"],
      dataLabel: i18n.catalog["common.general.status.alternative2"],
      render: (item) => (
        <span className={`badge ${item.is_active ? "badge-success" : "badge-secondary"}`}>
          {item.is_active ? i18n.catalog["common.general.active"] : i18n.catalog["common.general.inactive"]}
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
              icon: "edit",
              title: i18n.catalog["common.general.edit"],
              variant: "edit",
              onClick: () => openEditDialog(item),
              hidden: !canAccess(permissions, "chart_of_accounts", "edit")
            },
            {
              icon: "trash",
              title: i18n.catalog["common.general.delete"],
              variant: "delete",
              onClick: () => confirmDelete(item.id),
              hidden: !canAccess(permissions, "chart_of_accounts", "delete")
            }
          ]}
        />
      ),
    },
  ];

  return (
    <MainLayout >
      {/* 
      <div className="filter-section animate-fade" style={{ marginBottom: "1.5rem" }}>
      <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
      <input
      
      />
      </div>
      </div> */}

      <div className="sales-card animate-fade">
        <PageSubHeader
          title=""
          searchInput={
            <SearchableSelect
              placeholder={i18n.catalog["finance.chartOfAccounts.searchNumberName"]}
              value={searchTerm}
              onSearch={(term) => {
                setSearchTerm(term);
                loadAccounts(term);
              }}
              onChange={(val) => {
                const term = val?.toString() || "";
                setSearchTerm(term);
                loadAccounts(term);
              }}
              options={accounts.map(acc => ({ value: acc.id, label: catalogText(i18n, "common.general.notAvailable", { value0: acc.code, value1: acc.name }) }))}
              className="header-search-bar"
            />
          }
          actions={
            canAccess(permissions, "chart_of_accounts", "create") && (
              <Button variant="primary" icon="plus" onClick={openAddDialog}>
                {i18n.catalog["finance.chartOfAccounts.addAccount"]}</Button>
            )
          }
        />
        <Table
          columns={columns}
          data={accounts}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["finance.chartOfAccounts.noAccounts"]}
          isLoading={isLoading}
        />
      </div>

      {/* Form Dialog */}
      <Dialog
        isOpen={formDialog}
        onClose={() => setFormDialog(false)}
        title={selectedAccount ? i18n.catalog["finance.chartOfAccounts.editAccount"] : i18n.catalog["finance.chartOfAccounts.addNewAccount"]}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormDialog(false)}>
              {i18n.catalog["common.general.cancel"]}</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {selectedAccount ? i18n.catalog["common.general.update"] : i18n.catalog["common.general.add"]}
            </Button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group pb-0">
            <TextInput
              label={i18n.catalog["finance.chartOfAccounts.accountNumber"]}
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <div className="form-group">
            <Select
              label={i18n.catalog["finance.chartOfAccounts.type"]}
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {accountTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="form-group">
          <TextInput
            label={i18n.catalog["finance.chartOfAccounts.accountName"]}
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <Select
            label={i18n.catalog["common.general.primaryAccount"]}
            id="parent_id"
            value={formData.parent_id}
            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
          >
            <option value="">{i18n.catalog["finance.chartOfAccounts.noMainAccount"]}</option>
            {accounts
              .filter((acc) => acc.id !== selectedAccount?.id)
              .map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.code} - {acc.name}
                </option>
              ))}
          </Select>
        </div>

        <div className="form-group">
          <Textarea
            label={i18n.catalog["common.general.description.alternative2"]}
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />
        </div>

        <div className="form-group">
          <Checkbox
            label={i18n.catalog["common.general.active"]}
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
        </div>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={handleDelete}
        title={i18n.catalog["common.general.confirmDeletion"]}
        message={i18n.catalog["finance.chartOfAccounts.areYouSureYouWantDeleteThisAccount"]}
        confirmText={i18n.catalog["common.general.delete"]}
        confirmVariant="danger"
      />
    </MainLayout>
  );
}

