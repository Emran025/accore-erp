"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, Column, DateRangePicker, FilterActions, FilterSection, TabNavigation, Table, showToast } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { User, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

/**
 * Represents a single journal entry in the General Ledger.
 */
interface JournalEntry {
  id: number;
  entry_number: string;
  entry_date: string;
  description: string;
  debit_account: string;
  credit_account: string;
  amount: number;
  reference?: string;
  created_at: string;
}

/**
 * Represents a row in the Trial Balance report.
 */
interface TrialBalanceItem {
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  balance: number;
}

/**
 * Represents a transaction in the account history view.
 */
interface AccountHistoryItem {
  id: number;
  entry_date: string;
  description: string;
  debit: number;
  credit: number;
  running_balance: number;
}

/**
 * Represents a Chart of Account for the account selector dropdown.
 */
interface Account {
  id: number;
  code: string;
  name: string;
}

/**
 * General Ledger Page Component.
 * Provides three views:
 * - Journal Entries: Paginated list of GL entries with date filters
 * - Trial Balance: Summary of all account debit/credit balances
 * - Account History: Transaction history for a selected account
 * 
 * @returns The General Ledger page component
 */
export default function GeneralLedgerPage() {
    const { t: i18n } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("journal");
  const [isLoading, setIsLoading] = useState(true);

  // Journal Entries
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalPage, setJournalPage] = useState(1);
  const [journalTotalPages, setJournalTotalPages] = useState(1);
  const [journalDateFrom, setJournalDateFrom] = useState("");
  const [journalDateTo, setJournalDateTo] = useState("");

  // Trial Balance
  const [trialBalance, setTrialBalance] = useState<TrialBalanceItem[]>([]);
  const [trialTotals, setTrialTotals] = useState({ debit: 0, credit: 0, balance: 0 });

  // Account History
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [accountHistory, setAccountHistory] = useState<AccountHistoryItem[]>([]);
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");

  const itemsPerPage = 15;

  const loadJournalEntries = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      let url = `${API_ENDPOINTS.FINANCE.GENERAL_LEDGER.ENTRIES}?page=${page}&limit=${itemsPerPage}`;
      if (journalDateFrom) url += `&date_from=${journalDateFrom}`;
      if (journalDateTo) url += `&date_to=${journalDateTo}`;

      const response = await fetchAPI(url);
      setJournalEntries(response.entries as JournalEntry[] || []);
      setJournalTotalPages(Math.ceil((response.total as number || 0) / itemsPerPage));
      setJournalPage(page);
    } catch {
      showToast(i18n.catalog["finance.generalLedgerBook.errorLoadingEntries"], "error");
    } finally {
      setIsLoading(false);
    }
  }, [journalDateFrom, journalDateTo]);

  const loadTrialBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchAPI(API_ENDPOINTS.FINANCE.GENERAL_LEDGER.TRIAL_BALANCE);
      setTrialBalance(response.items as TrialBalanceItem[] || []);
      setTrialTotals({
        debit: response.total_debit as number || 0,
        credit: response.total_credit as number || 0,
        balance: response.balance as number || 0,
      });
    } catch {
      showToast(i18n.catalog["finance.generalLedgerBook.errorLoadingTrialBalance"], "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      const response = await fetchAPI(API_ENDPOINTS.FINANCE.ACCOUNTS.BASE);
      setAccounts(response.accounts as Account[] || []);
    } catch {
      console.error(i18n.catalog["common.general.errorLoadingAccounts"]);
    }
  }, []);

  const loadAccountHistory = useCallback(async () => {
    if (!selectedAccountId) return;

    try {
      setIsLoading(true);
      const account = accounts.find(a => a.id.toString() === selectedAccountId);
      if (!account) return;

      const params = new URLSearchParams();
      params.append('account_code', account.code);
      params.append('interval', 'day'); // Default to daily for a more detailed history view
      if (historyDateFrom) params.append('start_date', historyDateFrom);
      if (historyDateTo) params.append('end_date', historyDateTo);

      const url = `${API_ENDPOINTS.FINANCE.GENERAL_LEDGER.BALANCE_HISTORY}?${params.toString()}`;

      const response = await fetchAPI(url);

      // Map backend response fields to what the table expects
      const mappedHistory = (response.history as any[] || []).map(item => ({
        ...item,
        entry_date: item.period,
        debit: item.debits,
        credit: item.credits,
        running_balance: item.balance,
        description: catalogText(i18n, "finance.generalLedgerBook.accumulatedBalanceDay", { value0: item.period }) // "Summary balance for day..."
      }));

      setAccountHistory(mappedHistory as AccountHistoryItem[]);
    } catch {
      showToast(i18n.catalog["finance.generalLedgerBook.errorLoadingAccountRecord"], "error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccountId, historyDateFrom, historyDateTo]);

  useEffect(() => {
    // Set default dates to current month
    const today = new Date().toISOString().split("T")[0];
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    setJournalDateFrom(firstDay);
    setJournalDateTo(today);
    setHistoryDateFrom(firstDay);
    setHistoryDateTo(today);

    const storedUser = getStoredUser();
    setUser(storedUser);
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (activeTab === "journal") {
      loadJournalEntries();
    } else if (activeTab === "trial") {
      loadTrialBalance();
    } else if (activeTab === "history" && selectedAccountId) {
      loadAccountHistory();
    }
  }, [activeTab, loadJournalEntries, loadTrialBalance, loadAccountHistory, selectedAccountId]);

  const handleExport = () => {
    showToast(i18n.catalog["finance.generalLedgerBook.exportingData"], "info");
  };

  const handleRefresh = () => {
    if (activeTab === "journal") {
      loadJournalEntries(journalPage);
    } else if (activeTab === "trial") {
      loadTrialBalance();
    } else if (activeTab === "history") {
      loadAccountHistory();
    }
  };

  const journalColumns: Column<JournalEntry>[] = [
    { key: "entry_number", header: i18n.catalog["common.general.entryNumber"], dataLabel: i18n.catalog["common.general.entryNumber"] },
    {
      key: "entry_date",
      header: i18n.catalog["common.general.date.alternative7"],
      dataLabel: i18n.catalog["common.general.date.alternative7"],
      render: (item) => formatDate(item.entry_date),
    },
    { key: "description", header: i18n.catalog["common.general.statement"], dataLabel: i18n.catalog["common.general.statement"] },
    { key: "debit_account", header: i18n.catalog["common.general.debitAccount"], dataLabel: i18n.catalog["common.general.debitAccount"] },
    { key: "credit_account", header: i18n.catalog["common.general.creditAccount"], dataLabel: i18n.catalog["common.general.creditAccount"] },
    {
      key: "amount",
      header: i18n.catalog["common.general.amount"],
      dataLabel: i18n.catalog["common.general.amount"],
      render: (item) => formatCurrency(item.amount),
    },
    { key: "reference", header: i18n.catalog["common.general.reference"], dataLabel: i18n.catalog["common.general.reference"] },
  ];

  const trialColumns: Column<TrialBalanceItem>[] = [
    { key: "account_code", header: i18n.catalog["common.general.accountNumber"], dataLabel: i18n.catalog["common.general.accountNumber"] },
    { key: "account_name", header: i18n.catalog["common.general.accountName"], dataLabel: i18n.catalog["common.general.accountName"] },
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
      key: "balance",
      header: i18n.catalog["common.general.balance"],
      dataLabel: i18n.catalog["common.general.balance"],
      render: (item) => (
        <span className={item.balance >= 0 ? "text-success" : "text-danger"}>
          {formatCurrency(Math.abs(item.balance))} {item.balance >= 0 ? i18n.catalog["common.general.debit"] : i18n.catalog["common.general.credit"]}
        </span>
      ),
    },
  ];

  const historyColumns: Column<AccountHistoryItem>[] = [
    {
      key: "entry_date",
      header: i18n.catalog["common.general.date.alternative7"],
      dataLabel: i18n.catalog["common.general.date.alternative7"],
      render: (item) => formatDate(item.entry_date),
    },
    { key: "description", header: i18n.catalog["common.general.statement"], dataLabel: i18n.catalog["common.general.statement"] },
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
      key: "running_balance",
      header: i18n.catalog["common.general.balance"],
      dataLabel: i18n.catalog["common.general.balance"],
      render: (item) => (
        <span className={item.running_balance >= 0 ? "text-success" : "text-danger"}>
          {formatCurrency(Math.abs(item.running_balance))}
        </span>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="settings-wrapper animate-fade">
        <PageSubHeader
          user={user}
          actions={
            <>
              <Button variant="secondary" onClick={handleExport} icon="download">
                {i18n.catalog["common.general.export"]}</Button>
              <Button variant="primary" onClick={handleRefresh} icon="refresh">
                {i18n.catalog["common.general.update"]}</Button>
            </>
          }
        />
        <TabNavigation
          tabs={[
            { key: "journal", label: i18n.catalog["common.general.journalEntries"], icon: "fa-book" },
            { key: "trial", label: i18n.catalog["finance.generalLedgerBook.trialBalance"], icon: "fa-balance-scale" },
            { key: "history", label: i18n.catalog["finance.generalLedgerBook.accountRecord"], icon: "fa-history" },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key)}
        />

        {/* Journal Entries Tab */}
        <div className={`tab-content ${activeTab === "journal" ? "active" : ""}`}>
          <div className="sales-card">
            <PageSubHeader
              title={i18n.catalog["common.general.journalEntries"]}
              titleIcon="chart-line"
              actions={
                <>
                  <DateRangePicker
                    // label="فترة التقرير"
                    startDate={journalDateFrom}
                    endDate={journalDateTo}
                    onStartDateChange={setJournalDateFrom}
                    onEndDateChange={setJournalDateTo}
                  />
                  <FilterActions>
                    <Button
                      onClick={() => loadJournalEntries(1)}
                      icon="search"
                      variant="primary"
                    >
                      {i18n.catalog["common.general.search.alternative2"]}</Button>
                  </FilterActions>
                </>
              } />
            <Table
              columns={journalColumns}
              data={journalEntries}
              keyExtractor={(item) => item.id}
              emptyMessage={i18n.catalog["finance.generalLedgerBook.noEntries"]}
              isLoading={isLoading}
              pagination={{
                currentPage: journalPage,
                totalPages: journalTotalPages,
                onPageChange: loadJournalEntries,
              }}
            />
          </div>
        </div>

        {/* Trial Balance Tab */}
        <div className={`tab-content ${activeTab === "trial" ? "active" : ""}`}>
          <div className="sales-card">
            <Table
              columns={trialColumns}
              data={trialBalance}
              keyExtractor={(item) => item.account_code}
              emptyMessage={i18n.catalog["common.general.noData"]}
              isLoading={isLoading}
            />

            {trialBalance.length > 0 && (
              <div className="summary-stat-box" style={{ marginTop: "1.5rem" }}>
                <div className="stat-item">
                  <span className="stat-label">{i18n.catalog["common.general.totalDebit"]}</span>
                  <span className="stat-value">{formatCurrency(trialTotals.debit)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{i18n.catalog["common.general.totalCredit"]}</span>
                  <span className="stat-value">{formatCurrency(trialTotals.credit)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{i18n.catalog["common.general.teams"]}</span>
                  <span className={`stat-value ${trialTotals.balance === 0 ? "text-success" : "text-danger"}`}>
                    {formatCurrency(trialTotals.balance)}
                    {trialTotals.balance === 0 && " ✓"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account History Tab */}
        <div className={`tab-content ${activeTab === "history" ? "active" : ""}`}>
          <div className="sales-card">
            <FilterSection>
              <Select
                label={i18n.catalog["common.general.account"]}
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                options={[
                  { value: "", label: i18n.catalog["common.general.selectAccount"] },
                  ...accounts.map(acc => ({ value: acc.id, label: catalogText(i18n, "common.general.notAvailable", { value0: acc.code, value1: acc.name }) }))
                ]}
              />
              <DateRangePicker
                label={i18n.catalog["common.general.period"]}
                startDate={historyDateFrom}
                endDate={historyDateTo}
                onStartDateChange={setHistoryDateFrom}
                onEndDateChange={setHistoryDateTo}
              />
              <FilterActions>
                <Button
                  onClick={loadAccountHistory}
                  disabled={!selectedAccountId}
                  icon="search"
                >
                  {i18n.catalog["common.general.view"]}</Button>
              </FilterActions>
            </FilterSection>

            {selectedAccountId ? (
              <Table
                columns={historyColumns}
                data={accountHistory}
                keyExtractor={(item) => item.id}
                emptyMessage={i18n.catalog["finance.generalLedgerBook.noTransactions"]}
                isLoading={isLoading}
              />
            ) : (
              <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>
                {i18n.catalog["finance.generalLedgerBook.selectAccountViewTransactionHistory"]}</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
