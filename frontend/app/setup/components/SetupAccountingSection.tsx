"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { useI18n, catalogText } from "@/lib/i18n";
import { getIcon } from "@/lib/icons";
import { SetupField } from "./SetupField";
import { SetupSection } from "./SetupSection";

type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

interface SetupAccountingSectionProps {
  title: string;
  description: string;
  accountCodeLabel: string;
  accountNameLabel: string;
  accountTypeLabel: string;
  createAccountLabel: string;
  periodNameLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  createPeriodLabel: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  accountTypes: readonly AccountType[];
  accountTypeLabels: Record<AccountType, string>;
  periodName: string;
  periodStart: string;
  periodEnd: string;
  recordSummary: string;
  chartReady: boolean;
  periodReady: boolean;
  completeLabel: string;
  isSaving: boolean;
  fieldErrors?: Record<string, string[]>;
  onAccountCodeChange: (value: string) => void;
  onAccountNameChange: (value: string) => void;
  onAccountTypeChange: (value: AccountType) => void;
  onPeriodNameChange: (value: string) => void;
  onPeriodStartChange: (value: string) => void;
  onPeriodEndChange: (value: string) => void;
  onCreateAccount: () => void;
  onCreatePeriod: () => void;
  onApproveDefaultChart?: () => Promise<void>;
  onGenerateFiscalPeriods?: (year: number, variant: "calendar" | "quarterly" | "hijri") => Promise<void>;
  existingAccounts?: Array<{ id?: number; code: string; name: string; type: string }>;
  existingPeriods?: Array<{ id?: number; period_name: string; start_date: string; end_date: string; is_closed?: boolean }>;
}

export function SetupAccountingSection({
  title,
  description,
  accountCodeLabel,
  accountNameLabel,
  accountTypeLabel,
  createAccountLabel,
  periodNameLabel,
  startDateLabel,
  endDateLabel,
  createPeriodLabel,
  accountCode,
  accountName,
  accountType,
  accountTypes,
  accountTypeLabels,
  periodName,
  periodStart,
  periodEnd,
  recordSummary,
  chartReady,
  periodReady,
  completeLabel,
  isSaving,
  fieldErrors = {},
  onAccountCodeChange,
  onAccountNameChange,
  onAccountTypeChange,
  onPeriodNameChange,
  onPeriodStartChange,
  onPeriodEndChange,
  onCreateAccount,
  onCreatePeriod,
  onApproveDefaultChart,
  onGenerateFiscalPeriods,
  existingAccounts = [],
  existingPeriods = [],
}: SetupAccountingSectionProps) {
  const { t: i18n } = useI18n();
  const firstError = (field: string) => fieldErrors[field]?.[0];

  const [activeTab, setActiveTab] = useState<"chart" | "periods">("chart");
  const [calcMethod, setCalcMethod] = useState<"calendar" | "quarterly" | "hijri">("calendar");
  const [fiscalYear, setFiscalYear] = useState<number>(new Date().getFullYear());
  const [autoClosePolicy, setAutoClosePolicy] = useState(true);
  const [autoOpenPolicy, setAutoOpenPolicy] = useState(true);
  const [lockPolicy, setLockPolicy] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomAccountForm, setShowCustomAccountForm] = useState(false);

  const handleApproveStandard = async () => {
    if (onApproveDefaultChart) {
      await onApproveDefaultChart();
    }
  };

  const handleGeneratePeriods = async () => {
    if (onGenerateFiscalPeriods) {
      setIsGenerating(true);
      try {
        await onGenerateFiscalPeriods(fiscalYear, calcMethod);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <SetupSection id="setup-accounting" title={title} description={description}>
      {/* Sub-phase navigation pill */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab("chart")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "chart"
              ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          {getIcon("book-open", "w-4 h-4")}
          <span>{i18n.catalog["enterpriseCore.setup.coa.stageTitle"]}</span>
          {chartReady ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("periods")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "periods"
              ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          {getIcon("calendar", "w-4 h-4")}
          <span>{i18n.catalog["enterpriseCore.setup.periods.stageTitle"]}</span>
          {periodReady ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>
      </div>

      {/* ── Sub-Phase 1: Chart of Accounts Approval & Management ── */}
      {activeTab === "chart" && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                {i18n.catalog["enterpriseCore.setup.coa.approveStandard"]}
              </h3>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                {i18n.catalog["enterpriseCore.setup.coa.approveStandardDesc"]}
              </p>
            </div>

            <Button
              type="button"
              onClick={handleApproveStandard}
              disabled={isSaving}
              className="shrink-0 px-5 py-2.5 text-xs font-bold rounded-lg shadow-sm"
            >
              {chartReady ? (
                <span className="flex items-center gap-1.5">
                  {getIcon("check-circle", "w-4 h-4")}
                  <span>{i18n.catalog["enterpriseCore.setup.coa.approvedBadge"]}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  {getIcon("check", "w-4 h-4")}
                  <span>{i18n.catalog["enterpriseCore.setup.coa.approveButton"]}</span>
                </span>
              )}
            </Button>
          </div>

          {chartReady && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                {getIcon("check-circle", "w-4 h-4 text-emerald-600")}
                <span>
                  {catalogText(i18n, "enterpriseCore.setup.coa.statusApproved", {
                    value0: existingAccounts.length,
                  })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomAccountForm((prev) => !prev)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
              >
                {showCustomAccountForm
                  ? i18n.catalog["enterpriseCore.setup.coa.hideCustomAccountForm"]
                  : i18n.catalog["enterpriseCore.setup.coa.addCustomAccount"]}
              </button>
            </div>
          )}

          {/* Custom Account Creator (Toggleable or if chart not ready) */}
          {(!chartReady || showCustomAccountForm) && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {i18n.catalog["enterpriseCore.setup.coa.customManagement"]}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SetupField id="setup-account-code" label={accountCodeLabel} required error={firstError("code")}>
                  <input
                    id="setup-account-code"
                    className="setup-input font-mono"
                    dir="ltr"
                    value={accountCode}
                    onChange={(event) => onAccountCodeChange(event.target.value)}
                    placeholder={i18n.catalog["enterpriseCore.setup.accounting.accountCodePlaceholder"]}
                    required
                  />
                </SetupField>
                <SetupField id="setup-account-name" label={accountNameLabel} required error={firstError("name")}>
                  <input
                    id="setup-account-name"
                    className="setup-input"
                    value={accountName}
                    onChange={(event) => onAccountNameChange(event.target.value)}
                    placeholder={accountNameLabel}
                    required
                  />
                </SetupField>
                <SetupField id="setup-account-type" label={accountTypeLabel} error={firstError("type")}>
                  <select
                    id="setup-account-type"
                    className="setup-input"
                    value={accountType}
                    onChange={(event) => onAccountTypeChange(event.target.value as AccountType)}
                  >
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>
                        {accountTypeLabels[type]}
                      </option>
                    ))}
                  </select>
                </SetupField>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={onCreateAccount} isLoading={isSaving} className="text-xs font-bold rounded-lg">
                  {createAccountLabel}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Sub-Phase 2: Fiscal Periods Calculation Method & Automation Policy ── */}
      {activeTab === "periods" && (
        <div className="space-y-5 animate-fadeIn">
          {/* Method definition card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {i18n.catalog["enterpriseCore.setup.periods.stageTitle"]}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {i18n.catalog["enterpriseCore.setup.periods.stageDescription"]}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {i18n.catalog["enterpriseCore.setup.periods.calcMethod"]}
                </label>
                <select
                  value={calcMethod}
                  onChange={(e) => setCalcMethod(e.target.value as "calendar" | "quarterly" | "hijri")}
                  className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="calendar">
                    {i18n.catalog["enterpriseCore.setup.periods.variantCalendar"]}
                  </option>
                  <option value="quarterly">
                    {i18n.catalog["enterpriseCore.setup.periods.variantQuarterly"]}
                  </option>
                  <option value="hijri">
                    {i18n.catalog["enterpriseCore.setup.periods.variantHijri"]}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {i18n.catalog["enterpriseCore.setup.periods.fiscalYear"]}
                </label>
                <input
                  type="number"
                  min={2020}
                  max={2040}
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 p-2 text-xs font-mono text-slate-900 rounded-lg focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Automation Policies */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {i18n.catalog["enterpriseCore.setup.periods.policyHeading"]}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer text-xs text-slate-700 hover:border-blue-300">
                  <input
                    type="checkbox"
                    checked={autoClosePolicy}
                    onChange={(e) => setAutoClosePolicy(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>{i18n.catalog["enterpriseCore.setup.periods.autoClosePolicy"]}</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer text-xs text-slate-700 hover:border-blue-300">
                  <input
                    type="checkbox"
                    checked={autoOpenPolicy}
                    onChange={(e) => setAutoOpenPolicy(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>{i18n.catalog["enterpriseCore.setup.periods.autoOpenPolicy"]}</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer text-xs text-slate-700 hover:border-blue-300">
                  <input
                    type="checkbox"
                    checked={lockPolicy}
                    onChange={(e) => setLockPolicy(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>{i18n.catalog["enterpriseCore.setup.periods.lockPolicy"]}</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">
                {periodReady
                  ? i18n.catalog["enterpriseCore.setup.periods.statusActive"]
                  : i18n.catalog["enterpriseCore.setup.periods.generateHint"]}
              </span>

              <Button
                type="button"
                onClick={handleGeneratePeriods}
                disabled={isGenerating || isSaving}
                className="w-full sm:w-auto px-6 py-2 text-xs font-bold rounded-lg shadow-sm"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    <span>{i18n.catalog["enterpriseCore.setup.periods.generating"]}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {getIcon("sparkles", "w-4 h-4")}
                    <span>{i18n.catalog["enterpriseCore.setup.periods.autoGenerate"]}</span>
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Fallback manual single period entry if needed */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {i18n.catalog["enterpriseCore.setup.periods.manualEntryTitle"]}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SetupField id="setup-period-name" label={periodNameLabel} required error={firstError("period_name")}>
                <input
                  id="setup-period-name"
                  className="setup-input"
                  value={periodName}
                  onChange={(event) => onPeriodNameChange(event.target.value)}
                  placeholder={i18n.catalog["enterpriseCore.setup.periods.periodNamePlaceholder"]}
                  required
                />
              </SetupField>
              <SetupField id="setup-period-start" label={startDateLabel} required error={firstError("start_date")}>
                <input
                  id="setup-period-start"
                  className="setup-input"
                  type="date"
                  value={periodStart}
                  onChange={(event) => onPeriodStartChange(event.target.value)}
                  required
                />
              </SetupField>
              <SetupField id="setup-period-end" label={endDateLabel} required error={firstError("end_date")}>
                <input
                  id="setup-period-end"
                  className="setup-input"
                  type="date"
                  value={periodEnd}
                  onChange={(event) => onPeriodEndChange(event.target.value)}
                  required
                />
              </SetupField>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" onClick={onCreatePeriod} isLoading={isSaving} className="text-xs font-bold rounded-lg">
                {createPeriodLabel}
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="setup-context-summary text-xs text-slate-500 pt-2 border-t border-slate-100">
        {recordSummary}
      </p>
    </SetupSection>
  );
}
