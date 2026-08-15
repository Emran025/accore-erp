"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, NumberInput, Table, showAlert } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAPI } from "@/lib/api";
import { User, checkAuth, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate, parseNumber } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface Reconciliation {
  id: number;
  reconciliation_date: string;
  bank_balance: number;
  ledger_balance: number;
  difference: number;
  notes?: string;
}

export default function ReconciliationPage() {
    const { t: i18n } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedReconciliation, setSelectedReconciliation] = useState<Reconciliation | null>(null);

  // Form
  const [reconciliationDate, setReconciliationDate] = useState(new Date().toISOString().split("T")[0]);
  const [bankBalance, setBankBalance] = useState("");
  const [reconciliationNotes, setReconciliationNotes] = useState("");
  const [ledgerBalance, setLedgerBalance] = useState(0);

  const itemsPerPage = 20;

  const loadReconciliations = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetchAPI(`${API_ENDPOINTS.FINANCE.RECONCILIATION}?page=${page}&limit=${itemsPerPage}`);
      if (response.success && Array.isArray(response.data)) {
        const reconciliations = response.data as Reconciliation[];
        setReconciliations(reconciliations);
        const pagination = response.pagination as { total_pages?: number } | undefined;
        setTotalPages(pagination?.total_pages ?? Math.max(1, Math.ceil(reconciliations.length / itemsPerPage)));
        setCurrentPage(page);
      } else {
        showAlert("alert-container", response.message || i18n.catalog["text_74f488a92a0f"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["text_22fa79f17c32"], "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const authenticated = await checkAuth();
      if (!authenticated) return;

      const storedUser = getStoredUser();
      setUser(storedUser);
      await loadReconciliations();
    };
    init();
  }, [loadReconciliations]);

  const openCreateDialog = () => {
    setReconciliationDate(new Date().toISOString().split("T")[0]);
    setBankBalance("");
    setReconciliationNotes("");
    setLedgerBalance(0);
    setCreateDialog(true);
  };

  const calculateReconciliation = async () => {
    if (!reconciliationDate) {
      showAlert("alert-container", i18n.catalog["text_79d1b5ee0338"], "warning");
      return;
    }

    try {
      // Get ledger balance from API
      const response = await fetchAPI(`${API_ENDPOINTS.FINANCE.RECONCILIATION}?action=calculate&date=${reconciliationDate}`);
      if (response.success) {
        const balance = response.ledger_balance ?? (response.data as Partial<Reconciliation> | undefined)?.ledger_balance;
        setLedgerBalance(Number(balance) || 0);
      }
    } catch {
      // Ignore - will show in form
    }
  };

  const saveReconciliation = async () => {
    if (!reconciliationDate) {
      showAlert("alert-container", i18n.catalog["text_79d1b5ee0338"], "warning");
      return;
    }

    try {
      const response = await fetchAPI(API_ENDPOINTS.FINANCE.RECONCILIATION, {
        method: "POST",
        body: JSON.stringify({
          reconciliation_date: reconciliationDate,
          physical_balance: parseNumber(bankBalance),
          notes: reconciliationNotes,
        }),
      });

      if (response.success) {
        showAlert("alert-container", i18n.catalog["text_a391ac7c5b88"], "success");
        setCreateDialog(false);
        await loadReconciliations(1);
      } else {
        showAlert("alert-container", response.message || i18n.catalog["text_415fc43738ae"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["text_01026837328d"], "error");
    }
  };

  const viewReconciliation = (reconciliation: Reconciliation) => {
    setSelectedReconciliation(reconciliation);
    setViewDialog(true);
  };

  const createAdjustment = async (reconciliationId: number) => {
    const amount = prompt(i18n.catalog["text_c412242a4413"]);
    if (!amount || parseNumber(amount) <= 0) return;

    const description = prompt(i18n.catalog["text_4d3340cf8b22"]);
    if (!description) return;

    const entryType = confirm(i18n.catalog["text_368662e49b5b"])
      ? "DEBIT"
      : "CREDIT";

    try {
      const response = await fetchAPI(`${API_ENDPOINTS.FINANCE.RECONCILIATION}?action=adjust`, {
        method: "PUT",
        body: JSON.stringify({
          reconciliation_id: reconciliationId,
          amount: parseNumber(amount),
          entry_type: entryType,
          description: description,
        }),
      });

      if (response.success) {
        showAlert("alert-container", i18n.catalog["text_2ac6bd2dc04e"], "success");
        await loadReconciliations(currentPage);
      } else {
        showAlert("alert-container", response.message || i18n.catalog["text_5fab83e3712e"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["text_5065c6d80765"], "error");
    }
  };

  const getDifferenceClass = (diff: number) => {
    return Math.abs(diff) < 0.01 ? "text-success" : "text-danger";
  };

  const columns: Column<Reconciliation>[] = [
    {
      key: "reconciliation_date",
      header: i18n.catalog["text_d90c384199ac"],
      dataLabel: i18n.catalog["text_d90c384199ac"],
      render: (item) => formatDate(item.reconciliation_date),
    },
    {
      key: "bank_balance",
      header: i18n.catalog["text_99376192028a"],
      dataLabel: i18n.catalog["text_99376192028a"],
      render: (item) => formatCurrency(item.bank_balance),
    },
    {
      key: "ledger_balance",
      header: i18n.catalog["text_dafaab0107f7"],
      dataLabel: i18n.catalog["text_dafaab0107f7"],
      render: (item) => formatCurrency(item.ledger_balance),
    },
    {
      key: "difference",
      header: i18n.catalog["text_0b5254487af9"],
      dataLabel: i18n.catalog["text_0b5254487af9"],
      render: (item) => (
        <span className={getDifferenceClass(item.difference)}>
          {formatCurrency(item.difference)}
        </span>
      ),
    },
    {
      key: "notes",
      header: i18n.catalog["text_d446d2dc6b81"],
      dataLabel: i18n.catalog["text_d446d2dc6b81"],
      render: (item) => item.notes || "-",
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
              onClick: () => viewReconciliation(item)
            },
            {
              icon: "edit",
              title: i18n.catalog["text_7816efbf663c"],
              variant: "edit",
              onClick: () => createAdjustment(item.id),
              hidden: Math.abs(item.difference) <= 0.01
            }
          ]}
        />
      ),
    },
  ];

  return (
    <MainLayout>

      <div id="alert-container"></div>

      <div className="sales-card animate-fade">
        <PageSubHeader
          user={user}
          actions={
            <Button variant="primary" icon="plus" onClick={openCreateDialog}>
              {i18n.catalog["text_350a900989e6"]}</Button>
          }
        />
        <Table
          columns={columns}
          data={reconciliations}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["text_69207d0435ea"]}
          isLoading={isLoading}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: loadReconciliations,
          }}
        />
      </div>

      {/* Create Reconciliation Dialog */}
      <Dialog
        isOpen={createDialog}
        onClose={() => setCreateDialog(false)}
        title={i18n.catalog["text_350a900989e6"]}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateDialog(false)}>
              {i18n.catalog["text_9a30dc2a96b8"]}</Button>
            <Button variant="primary" onClick={saveReconciliation}>
              {i18n.catalog["text_ddfcaf9d0144"]}</Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveReconciliation();
          }}
          className="space-y-4"
        >
          <TextInput
            type="date"
            label={i18n.catalog["text_fc1570608208"]}
            id="reconciliation-date"
            value={reconciliationDate}
            onChange={(e) => {
              setReconciliationDate(e.target.value);
              calculateReconciliation();
            }}
            required
          />

          <NumberInput
            label={i18n.catalog["text_a80bda0939c5"]}
            id="bank-balance"
            value={bankBalance}
            onChange={(val) => setBankBalance(val)}
            step={0.01}
            required
          />

          {ledgerBalance > 0 && (
            <div className="summary-stat-box">
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["text_dafaab0107f7"]}</span>
                <span className="stat-value">{formatCurrency(ledgerBalance)}</span>
              </div>
            </div>
          )}

          <Textarea
            label={i18n.catalog["text_d446d2dc6b81"]}
            id="reconciliation-notes"
            value={reconciliationNotes}
            onChange={(e) => setReconciliationNotes(e.target.value)}
            rows={3}
          />
        </form>
      </Dialog>

      {/* View Reconciliation Dialog */}
      <Dialog
        isOpen={viewDialog}
        onClose={() => setViewDialog(false)}
        title={i18n.catalog["text_b312d1a22803"]}
      >
        {selectedReconciliation && (
          <div>
            <div className="summary-stat-box">
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["text_99376192028a"]}</span>
                <span className="stat-value">
                  {formatCurrency(selectedReconciliation.bank_balance)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["text_dafaab0107f7"]}</span>
                <span className="stat-value">
                  {formatCurrency(selectedReconciliation.ledger_balance)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["text_0b5254487af9"]}</span>
                <span className={`stat-value ${getDifferenceClass(selectedReconciliation.difference)}`}>
                  {formatCurrency(selectedReconciliation.difference)}
                </span>
              </div>
            </div>
            {selectedReconciliation.notes && (
              <p style={{ marginTop: "1rem" }}>
                <strong>{i18n.catalog["text_8c9d1b5aec34"]}</strong> {selectedReconciliation.notes}
              </p>
            )}
          </div>
        )}
      </Dialog>
    </MainLayout>
  );
}

