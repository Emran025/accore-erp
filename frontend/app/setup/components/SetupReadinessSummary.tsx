import { Button } from "@/components/ui";
import { Readiness } from "../types";
import styles from "../setup.module.css";

interface SetupReadinessSummaryProps {
  title: string;
  description: string;
  refreshLabel: string;
  openDashboardLabel: string;
  completeLabel: string;
  incompleteLabel: string;
  readiness: Readiness | null;
  readinessLabels: Record<string, string>;
  isLoading: boolean;
  canOpenDashboard: boolean;
  onRefresh: () => void;
  onOpenDashboard: () => void;
}

export function SetupReadinessSummary({
  title,
  description,
  refreshLabel,
  openDashboardLabel,
  completeLabel,
  incompleteLabel,
  readiness,
  readinessLabels,
  isLoading,
  canOpenDashboard,
  onRefresh,
  onOpenDashboard,
}: SetupReadinessSummaryProps) {
  const checks = readiness?.checks ?? [];
  const statusClass = readiness?.ready ? styles.summaryReady : styles.summaryBlocked;

  return (
    <header className={`${styles.summary} ${statusClass}`} aria-live="polite">
      <div className={styles.summaryHeader}>
        <div>
          <h1 className={styles.summaryTitle}>{title}</h1>
          <p className={styles.summaryDescription}>{description}</p>
        </div>
        <div className={styles.summaryActions}>
          <Button variant="secondary" type="button" onClick={onRefresh} isLoading={isLoading}>
            {refreshLabel}
          </Button>
          <Button type="button" disabled={!canOpenDashboard} onClick={onOpenDashboard}>
            {openDashboardLabel}
          </Button>
        </div>
      </div>
      <div className={styles.checkList} aria-label={title}>
        {checks.map((check) => (
          <span
            key={check.key}
            className={`${styles.checkBadge} ${check.complete ? styles.checkComplete : styles.checkIncomplete}`}
          >
            {readinessLabels[check.key] || check.key}: {check.complete ? completeLabel : incompleteLabel}
          </span>
        ))}
      </div>
    </header>
  );
}
