"use client";

import { Button } from "@/components/ui";
import { getIcon } from "@/lib/icons";
import { Onboarding, Readiness } from "../types";

export interface DynamicCheckItem {
  key: string;
  label: string;
  complete: boolean;
}

interface SetupReadinessSummaryProps {
  title: string;
  description: string;
  refreshLabel: string;
  openDashboardLabel: string;
  completeLabel: string;
  incompleteLabel: string;
  readiness: Readiness | null;
  onboarding?: Onboarding;
  templateApplied?: boolean;
  foundationLabel: string;
  templateLabel: string;
  readinessLabels: Record<string, string>;
  isLoading: boolean;
  canOpenDashboard: boolean;
  onRefresh: () => void;
  onOpenDashboard: () => void;
  dynamicChecks?: DynamicCheckItem[];
  activeStepTitle?: string;
  activeStepIndex?: number;
  totalSteps?: number;
}

export function SetupReadinessSummary({
  title,
  description,
  refreshLabel,
  openDashboardLabel,
  completeLabel,
  incompleteLabel,
  readiness,
  onboarding,
  templateApplied = false,
  foundationLabel,
  templateLabel,
  readinessLabels,
  isLoading,
  canOpenDashboard,
  onRefresh,
  onOpenDashboard,
  dynamicChecks,
  activeStepTitle,
  activeStepIndex = 1,
  totalSteps = 3,
}: SetupReadinessSummaryProps) {
  const foundationReady = onboarding?.phases.foundation.ready;

  // Resolve checks: if dynamicChecks are provided, use them; otherwise fallback to static readiness?.checks
  const items: DynamicCheckItem[] = dynamicChecks && dynamicChecks.length > 0
    ? dynamicChecks
    : (readiness?.checks ?? []).map((c) => ({
        key: c.key,
        label: readinessLabels[c.key] || c.key,
        complete: c.complete,
      }));

  const totalCount = items.length + (foundationReady !== undefined ? 1 : 0) + (templateApplied ? 1 : 0);
  const completedCount =
    items.filter((i) => i.complete).length +
    (foundationReady ? 1 : 0) +
    (templateApplied ? 1 : 0);

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllReady = progressPercent === 100 || readiness?.ready === true;
  const statusClass = isAllReady ? "is-ready" : "is-blocked";

  return (
    <header className={`sales-card setup-summary ${statusClass} bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5`} aria-live="polite">
      <div className="setup-summary-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="setup-summary-title text-xl font-bold text-slate-900">{title}</h1>
            {activeStepTitle && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                {activeStepTitle} ({activeStepIndex}/{totalSteps})
              </span>
            )}
          </div>
          <p className="setup-summary-description text-xs text-slate-500 leading-relaxed max-w-2xl">{description}</p>
        </div>

        <div className="setup-actions flex items-center gap-2.5 shrink-0">
          <Button variant="secondary" type="button" onClick={onRefresh} isLoading={isLoading} className="text-xs font-bold rounded-lg">
            {refreshLabel}
          </Button>
          <Button type="button" disabled={!canOpenDashboard} onClick={onOpenDashboard} className="text-xs font-bold rounded-lg shadow-sm">
            {openDashboardLabel}
          </Button>
        </div>
      </div>

      {/* Dynamic Progress Bar & Live Status Metric */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span className="text-blue-600">{getIcon("chart-line", "w-4 h-4")}</span>
            <span>مؤشر تقدم التهيئة والجاهزية التشغيلية:</span>
            <span className="text-blue-700 font-mono">{progressPercent}%</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-medium">
            {completedCount} من {totalCount} متطلبات منجزة
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              progressPercent === 100
                ? "bg-emerald-500"
                : progressPercent > 50
                ? "bg-blue-600"
                : "bg-amber-500"
            }`}
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Dynamic Live Readiness Badges */}
      <div className="setup-readiness-checks flex flex-wrap gap-2 pt-1" aria-label={title}>
        {foundationReady !== undefined ? (
          <span className={`badge px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
            foundationReady
              ? "badge-success bg-emerald-50 text-emerald-700 border border-emerald-300"
              : "badge-warning bg-amber-50 text-amber-800 border border-amber-300"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${foundationReady ? "bg-emerald-500" : "bg-amber-500"}`} />
            {foundationLabel}: {foundationReady ? completeLabel : incompleteLabel}
          </span>
        ) : null}

        {templateApplied ? (
          <span className="badge badge-success px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {templateLabel}: {completeLabel}
          </span>
        ) : null}

        {items.map((check) => (
          <span
            key={check.key}
            className={`badge px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              check.complete
                ? "badge-success bg-emerald-50 text-emerald-700 border border-emerald-300"
                : "badge-warning bg-amber-50 text-amber-800 border border-amber-300"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${check.complete ? "bg-emerald-500" : "bg-amber-500"}`} />
            {check.label}: {check.complete ? completeLabel : incompleteLabel}
          </span>
        ))}
      </div>
    </header>
  );
}
