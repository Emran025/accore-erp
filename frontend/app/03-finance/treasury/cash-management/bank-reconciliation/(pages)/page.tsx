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
        showAlert("alert-container", response.message || i18n.catalog["common.general.failedLoadReconciliations"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["common.general.errorConnectingServer"], "error");
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
      showAlert("alert-container", i18n.catalog["common.general.pleaseEnterSettlementDate"], "warning");
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
      showAlert("alert-container", i18n.catalog["common.general.pleaseEnterSettlementDate"], "warning");
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
        showAlert("alert-container", i18n.catalog["common.general.reconciliationSavedSuccessfully"], "success");
        setCreateDialog(false);
        await loadReconciliations(1);
      } else {
        showAlert("alert-container", response.message || i18n.catalog["common.general.failedSaveSettlement"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["common.general.errorSavingSettlement"], "error");
    }
  };

  const viewReconciliation = (reconciliation: Reconciliation) => {
    setSelectedReconciliation(reconciliation);
    setViewDialog(true);
  };

  const createAdjustment = async (reconciliationId: number) => {
    const amount = prompt(i18n.catalog["common.general.enterSettlementAmount"]);
    if (!amount || parseNumber(amount) <= 0) return;

    const description = prompt(i18n.catalog["common.general.enterSettlementEntryDescription"]);
    if (!description) return;

    const entryType = confirm(i18n.catalog["common.general.isThisDebitAmountYesDebitNo"])
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
        showAlert("alert-container", i18n.catalog["common.general.settlementEntryCreatedSuccessfully"], "success");
        await loadReconciliations(currentPage);
      } else {
        showAlert("alert-container", response.message || i18n.catalog["common.general.failedCreateSettlementEntry"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["common.general.errorCreatingSettlementEntry"], "error");
    }
  };

  const getDifferenceClass = (diff: number) => {
    return Math.abs(diff) < 0.01 ? "text-success" : "text-danger";
  };

  const columns: Column<Reconciliation>[] = [
    {
      key: "reconciliation_date",
      header: i18n.catalog["common.general.date.alternative7"],
      dataLabel: i18n.catalog["common.general.date.alternative7"],
      render: (item) => formatDate(item.reconciliation_date),
    },
    {
      key: "bank_balance",
      header: i18n.catalog["common.general.bankBalance"],
      dataLabel: i18n.catalog["common.general.bankBalance"],
      render: (item) => formatCurrency(item.bank_balance),
    },
    {
      key: "ledger_balance",
      header: i18n.catalog["common.general.ledgerBalance"],
      dataLabel: i18n.catalog["common.general.ledgerBalance"],
      render: (item) => formatCurrency(item.ledger_balance),
    },
    {
      key: "difference",
      header: i18n.catalog["common.general.teams"],
      dataLabel: i18n.catalog["common.general.teams"],
      render: (item) => (
        <span className={getDifferenceClass(item.difference)}>
          {formatCurrency(item.difference)}
        </span>
      ),
    },
    {
      key: "notes",
      header: i18n.catalog["common.general.notes.alternative2"],
      dataLabel: i18n.catalog["common.general.notes.alternative2"],
      render: (item) => item.notes || "-",
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
              onClick: () => viewReconciliation(item)
            },
            {
              icon: "edit",
              title: i18n.catalog["common.general.createSettlementEntry"],
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
              {i18n.catalog["common.general.newSettlement"]}</Button>
          }
        />
        <Table
          columns={columns}
          data={reconciliations}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["common.general.noSettlements"]}
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
        title={i18n.catalog["common.general.newSettlement"]}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateDialog(false)}>
              {i18n.catalog["common.general.cancel"]}</Button>
            <Button variant="primary" onClick={saveReconciliation}>
              {i18n.catalog["common.general.save"]}</Button>
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
            label={i18n.catalog["common.general.settlementDate"]}
            id="reconciliation-date"
            value={reconciliationDate}
            onChange={(e) => {
              setReconciliationDate(e.target.value);
              calculateReconciliation();
            }}
            required
          />

          <NumberInput
            label={i18n.catalog["common.general.bankBalance.alternative2"]}
            id="bank-balance"
            value={bankBalance}
            onChange={(val) => setBankBalance(val)}
            step={0.01}
            required
          />

          {ledgerBalance > 0 && (
            <div className="summary-stat-box">
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["common.general.ledgerBalance"]}</span>
                <span className="stat-value">{formatCurrency(ledgerBalance)}</span>
              </div>
            </div>
          )}

          <Textarea
            label={i18n.catalog["common.general.notes.alternative2"]}
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
        title={i18n.catalog["common.general.settlementDetails"]}
      >
        {selectedReconciliation && (
          <div>
            <div className="summary-stat-box">
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["common.general.bankBalance"]}</span>
                <span className="stat-value">
                  {formatCurrency(selectedReconciliation.bank_balance)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["common.general.ledgerBalance"]}</span>
                <span className="stat-value">
                  {formatCurrency(selectedReconciliation.ledger_balance)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{i18n.catalog["common.general.teams"]}</span>
                <span className={`stat-value ${getDifferenceClass(selectedReconciliation.difference)}`}>
                  {formatCurrency(selectedReconciliation.difference)}
                </span>
              </div>
            </div>
            {selectedReconciliation.notes && (
              <p style={{ marginTop: "1rem" }}>
                <strong>{i18n.catalog["common.general.notes"]}</strong> {selectedReconciliation.notes}
              </p>
            )}
          </div>
        )}
      </Dialog>
    </MainLayout>
  );
}

