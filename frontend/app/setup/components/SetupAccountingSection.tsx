import { Button } from "@/components/ui";
import { getTextDirection } from "@/lib/utils";
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
  onAccountCodeChange: (value: string) => void;
  onAccountNameChange: (value: string) => void;
  onAccountTypeChange: (value: AccountType) => void;
  onPeriodNameChange: (value: string) => void;
  onPeriodStartChange: (value: string) => void;
  onPeriodEndChange: (value: string) => void;
  onCreateAccount: () => void;
  onCreatePeriod: () => void;
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
  onAccountCodeChange,
  onAccountNameChange,
  onAccountTypeChange,
  onPeriodNameChange,
  onPeriodStartChange,
  onPeriodEndChange,
  onCreateAccount,
  onCreatePeriod,
}: SetupAccountingSectionProps) {
  return (
    <SetupSection id="setup-accounting" title={title} description={description}>
      {chartReady ? <p className="readiness-notice success">{accountNameLabel}: {completeLabel}</p> : null}
      {!chartReady ? <>
      <div className="settings-form-grid setup-form-grid">
        <SetupField id="setup-account-code" label={accountCodeLabel} required>
          <input id="setup-account-code" className="setup-input" dir="ltr" value={accountCode} onChange={(event) => onAccountCodeChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-account-name" label={accountNameLabel} required>
          <input id="setup-account-name" className="setup-input" dir={getTextDirection(accountName, "rtl")} value={accountName} onChange={(event) => onAccountNameChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-account-type" label={accountTypeLabel}>
          <select id="setup-account-type" className="setup-input" value={accountType} onChange={(event) => onAccountTypeChange(event.target.value as AccountType)}>
            {accountTypes.map((type) => <option key={type} value={type}>{accountTypeLabels[type]}</option>)}
          </select>
        </SetupField>
      </div>
      <div className="setup-actions">
        <Button type="button" onClick={onCreateAccount} isLoading={isSaving}>{createAccountLabel}</Button>
      </div>
      </> : null}
      {periodReady ? <p className="readiness-notice success">{periodNameLabel}: {completeLabel}</p> : null}
      {!periodReady ? <>
      <div className="settings-form-grid setup-form-grid">
        <SetupField id="setup-period-name" label={periodNameLabel} required>
          <input id="setup-period-name" className="setup-input" dir={getTextDirection(periodName, "rtl")} value={periodName} onChange={(event) => onPeriodNameChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-period-start" label={startDateLabel} required>
          <input id="setup-period-start" className="setup-input" type="date" value={periodStart} onChange={(event) => onPeriodStartChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-period-end" label={endDateLabel} required>
          <input id="setup-period-end" className="setup-input" type="date" value={periodEnd} onChange={(event) => onPeriodEndChange(event.target.value)} required />
        </SetupField>
      </div>
      <div className="setup-actions">
        <Button type="button" onClick={onCreatePeriod} isLoading={isSaving}>{createPeriodLabel}</Button>
      </div>
      </> : null}
      <p className="setup-context-summary">{recordSummary}</p>
    </SetupSection>
  );
}
