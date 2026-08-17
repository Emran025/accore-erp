import { Button } from "@/components/ui";
import { SetupField } from "./SetupField";
import { SetupSection } from "./SetupSection";
import styles from "../setup.module.css";

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
      <div className={styles.grid}>
        <SetupField id="setup-account-code" label={accountCodeLabel} required>
          <input id="setup-account-code" className={styles.input} value={accountCode} onChange={(event) => onAccountCodeChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-account-name" label={accountNameLabel} required>
          <input id="setup-account-name" className={styles.input} value={accountName} onChange={(event) => onAccountNameChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-account-type" label={accountTypeLabel}>
          <select id="setup-account-type" className={styles.input} value={accountType} onChange={(event) => onAccountTypeChange(event.target.value as AccountType)}>
            {accountTypes.map((type) => <option key={type} value={type}>{accountTypeLabels[type]}</option>)}
          </select>
        </SetupField>
      </div>
      <div className={styles.actionRow}>
        <Button type="button" onClick={onCreateAccount} isLoading={isSaving}>{createAccountLabel}</Button>
      </div>
      <div className={styles.grid}>
        <SetupField id="setup-period-name" label={periodNameLabel} required>
          <input id="setup-period-name" className={styles.input} value={periodName} onChange={(event) => onPeriodNameChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-period-start" label={startDateLabel} required>
          <input id="setup-period-start" className={styles.input} type="date" value={periodStart} onChange={(event) => onPeriodStartChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-period-end" label={endDateLabel} required>
          <input id="setup-period-end" className={styles.input} type="date" value={periodEnd} onChange={(event) => onPeriodEndChange(event.target.value)} required />
        </SetupField>
      </div>
      <div className={styles.actionRow}>
        <Button type="button" onClick={onCreatePeriod} isLoading={isSaving}>{createPeriodLabel}</Button>
      </div>
      <p className={styles.contextSummary}>{recordSummary}</p>
    </SetupSection>
  );
}
