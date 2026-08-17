import { Button } from "@/components/ui";
import { Readiness } from "../types";

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
  const statusClass = readiness?.ready ? "is-ready" : "is-blocked";

  return (
    <header className={`sales-card setup-summary ${statusClass}`} aria-live="polite">
      <div className="setup-summary-header">
        <div>
          <h1 className="setup-summary-title">{title}</h1>
          <p className="setup-summary-description">{description}</p>
        </div>
        <div className="setup-actions">
          <Button variant="secondary" type="button" onClick={onRefresh} isLoading={isLoading}>
            {refreshLabel}
          </Button>
          <Button type="button" disabled={!canOpenDashboard} onClick={onOpenDashboard}>
            {openDashboardLabel}
          </Button>
        </div>
      </div>
      <div className="setup-readiness-checks" aria-label={title}>
        {checks.map((check) => (
          <span
            key={check.key}
            className={`badge ${check.complete ? "badge-success" : "badge-warning"}`}
          >
            {readinessLabels[check.key] || check.key}: {check.complete ? completeLabel : incompleteLabel}
          </span>
        ))}
      </div>
    </header>
  );
}
