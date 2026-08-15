"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { useMemo, useState } from "react";
import { PageSubHeader } from "@/components/layout";
import { Select, Table, KPICardRow } from "@/components/ui";
import type { Column } from "@/components/ui";
import { getIcon } from "@/lib/icons";
import { allDomains } from "@/lib/navigation";
import type { Domain, NavScreen } from "@/types/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ScreenStatus = "operational" | "in_progress" | "pending";

interface DerivedScreenEntry {
  domainId: string;
  domainTitle: string;
  domainIcon: string;
  capabilityId: string;
  capabilityTitle: string;
  capabilityIcon: string;
  featureGroupTitle: string;
  screenId: string;
  screenTitle: string;
  screenIcon: string;
  href: string;
  status: ScreenStatus;
}

interface DomainSummary {
  id: string;
  title: string;
  icon: string;
  total: number;
  operational: number;
  inProgress: number;
  pending: number;
  percentage: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Derivation Logic
// ─────────────────────────────────────────────────────────────────────────────

function deriveStatus(screen: NavScreen): ScreenStatus {
  if (screen.status) return screen.status;
  const desc = screen.description;
  if (desc.includes(catalogMessage("common.general.comingSoon")) || desc.includes(catalogMessage("enterpriseCore.modulesstatus.comingSoon")) || desc.includes(catalogMessage("enterpriseCore.modulesstatus.comingSoon.alternative2"))) {
    return "pending";
  }
  return "operational";
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Derivation from Navigation Tree
// ─────────────────────────────────────────────────────────────────────────────

function deriveModuleData(domains: Domain[]): DerivedScreenEntry[] {
  const entries: DerivedScreenEntry[] = [];
  for (const domain of domains) {
    for (const cap of domain.capabilities) {
      for (const group of cap.groups) {
        for (const screen of group.screens) {
          entries.push({
            domainId: domain.id,
            domainTitle: domain.title,
            domainIcon: domain.icon,
            capabilityId: cap.id,
            capabilityTitle: cap.title,
            capabilityIcon: cap.icon,
            featureGroupTitle: group.title,
            screenId: screen.id,
            screenTitle: screen.title,
            screenIcon: screen.icon,
            href: screen.href,
            status: deriveStatus(screen),
          });
        }
      }
    }
  }
  return entries;
}

function buildDomainSummaries(entries: DerivedScreenEntry[]): DomainSummary[] {
  const map = new Map<string, DomainSummary>();
  for (const e of entries) {
    if (!map.has(e.domainId)) {
      map.set(e.domainId, {
        id: e.domainId,
        title: e.domainTitle,
        icon: e.domainIcon,
        total: 0,
        operational: 0,
        inProgress: 0,
        pending: 0,
        percentage: 0,
      });
    }
    const s = map.get(e.domainId)!;
    s.total++;
    if (e.status === "operational") s.operational++;
    else if (e.status === "in_progress") s.inProgress++;
    else s.pending++;
  }
  for (const s of map.values()) {
    s.percentage = s.total === 0 ? 0 : Math.round((s.operational / s.total) * 100);
  }
  return Array.from(map.values());
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ScreenStatus, { label: string; bg: string; color: string }> = {
  operational: { label: catalogMessage("common.general.operational"),      bg: "rgba(16,185,129,0.12)",  color: "#10b981" },
  in_progress: { label: catalogMessage("common.general.development"), bg: "rgba(245,158,11,0.12)",  color: "#f59e0b" },
  pending:     { label: catalogMessage("common.general.comingSoon"),      bg: "rgba(148,163,184,0.12)", color: "#94a3b8" },
};

const DOMAIN_PALETTE: Record<number, { accent: string; glow: string }> = {
  0: { accent: "#6366f1", glow: "#6366f120" },
  1: { accent: "#10b981", glow: "#10b98120" },
  2: { accent: "#3b82f6", glow: "#3b82f620" },
  3: { accent: "#f59e0b", glow: "#f59e0b20" },
  4: { accent: "#ec4899", glow: "#ec489920" },
  5: { accent: "#06b6d4", glow: "#06b6d420" },
  6: { accent: "#8b5cf6", glow: "#8b5cf620" },
  7: { accent: "#14b8a6", glow: "#14b8a620" },
  8: { accent: "#f97316", glow: "#f9731620" },
  9: { accent: "#a855f7", glow: "#a855f720" },
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge — small local presentational component (no HTML table logic)
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ScreenStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}30`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.color,
          display: "inline-block",
          flexShrink: 0,
          ...(status === "operational" ? { boxShadow: `0 0 5px ${cfg.color}` } : {}),
        }}
      />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DomainSummaryCard — local presentational component
// ─────────────────────────────────────────────────────────────────────────────

function DomainSummaryCard({
  summary,
  index,
  isActive,
  onClick,
}: {
  summary: DomainSummary;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const palette = DOMAIN_PALETTE[index % 10];
  return (
    <div
      onClick={onClick}
      style={{
        background: isActive
          ? `linear-gradient(135deg, var(--bg-secondary) 0%, ${palette.glow} 100%)`
          : "var(--bg-secondary)",
        border: isActive ? `1.5px solid ${palette.accent}50` : "1.5px solid var(--border-color)",
        borderRadius: 14,
        padding: "1rem 1.1rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Active accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: isActive ? palette.accent : "transparent",
          borderRadius: "14px 14px 0 0",
          transition: "background 0.2s",
        }}
      />

      {/* Icon + title */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: isActive ? palette.accent : `${palette.accent}20`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: isActive ? "#fff" : palette.accent,
            transition: "all 0.2s", flexShrink: 0,
          }}
        >
          {getIcon(summary.icon, undefined, 16)}
        </div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
          {summary.title}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: "var(--border-color)", borderRadius: 99, marginBottom: "0.55rem", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${summary.percentage}%`,
            background: summary.percentage === 100 ? "#10b981" : summary.percentage > 60 ? palette.accent : "#f59e0b",
            borderRadius: 99,
            transition: "width 0.6s ease",
          }}
        />
      </div>

      {/* Counts + percentage */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: 600 }}>{"✓ "}{summary.operational}</span>
          {summary.inProgress > 0 && (
            <span style={{ fontSize: "0.65rem", color: "#f59e0b", fontWeight: 600 }}>{"⏱ "}{summary.inProgress}</span>
          )}
          {summary.pending > 0 && (
            <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>{"○ "}{summary.pending}</span>
          )}
        </div>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: summary.percentage === 100 ? "#10b981" : palette.accent }}>
          {summary.percentage}%
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function ModulesStatus() {
    const { t: i18n } = useI18n();
  const [filterDomain, setFilterDomain] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Derive all data from the navigation tree — no static arrays
  const allEntries = useMemo(() => deriveModuleData(allDomains), []);
  const domainSummaries = useMemo(() => buildDomainSummaries(allEntries), [allEntries]);

  const filteredEntries = useMemo(() => {
    return allEntries.filter((e) => {
      if (filterDomain && e.domainId !== filterDomain) return false;
      if (filterStatus && e.status !== filterStatus) return false;
      return true;
    });
  }, [allEntries, filterDomain, filterStatus]);

  const stats = useMemo(() => {
    const total = allEntries.length;
    const operational = allEntries.filter((e) => e.status === "operational").length;
    const inProgress = allEntries.filter((e) => e.status === "in_progress").length;
    const pending = allEntries.filter((e) => e.status === "pending").length;
    const percentage = total === 0 ? 0 : Math.round((operational / total) * 100);
    return { total, operational, inProgress, pending, percentage, totalDomains: allDomains.length };
  }, [allEntries]);

  // ── KPICardRow data ────────────────────────────────────────────────────────
  const kpiCards = [
    { icon: "sitemap"      as const, label: i18n.catalog["enterpriseCore.modulesstatus.totalScreens.alternative2"], value: stats.total,       subtitle: catalogText(i18n, "enterpriseCore.modulesstatus.field", { value0: stats.totalDomains }) },
    { icon: "check-circle" as const, label: i18n.catalog["common.general.operational"],          value: stats.operational,  subtitle: i18n.catalog["enterpriseCore.modulesstatus.readyUse"], color: "#10b981" },
    { icon: "clock"        as const, label: i18n.catalog["common.general.development"],     value: stats.inProgress,   subtitle: i18n.catalog["enterpriseCore.modulesstatus.progress"],    color: "#f59e0b" },
    { icon: "hourglass"    as const, label: i18n.catalog["common.general.comingSoon"],           value: stats.pending,      subtitle: i18n.catalog["enterpriseCore.modulesstatus.planned"],         color: "#94a3b8" },
    { icon: "trending-up"  as const, label: i18n.catalog["enterpriseCore.modulesstatus.completionPercentage"],    value: stats.percentage,   subtitle: i18n.catalog["enterpriseCore.modulesstatus.totalScreens"], color: stats.percentage === 100 ? "#10b981" : "#6366f1" },
  ];

  // ── Table column definitions ───────────────────────────────────────────────
  const columns: Column<DerivedScreenEntry>[] = [
    {
      key: "domainTitle",
      header: i18n.catalog["common.general.domain"],
      dataLabel: i18n.catalog["common.general.domain"],
      render: (entry) => {
        const domainIdx = domainSummaries.findIndex((d) => d.id === entry.domainId);
        const palette = DOMAIN_PALETTE[domainIdx % 10];
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <span style={{ color: palette.accent }}>{getIcon(entry.domainIcon, undefined, 13)}</span>
            <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.77rem" }}>
              {entry.domainTitle}
            </span>
          </div>
        );
      },
    },
    {
      key: "capabilityTitle",
      header: i18n.catalog["common.general.capability"],
      dataLabel: i18n.catalog["common.general.capability"],
      render: (entry) => (
        <div style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", color: "var(--text-secondary)", fontSize: "0.77rem" }}>
          <span style={{ color: "var(--text-muted)" }}>{getIcon(entry.capabilityIcon, undefined, 12)}</span>
          {entry.capabilityTitle}
        </div>
      ),
    },
    {
      key: "featureGroupTitle",
      header: i18n.catalog["common.general.group"],
      dataLabel: i18n.catalog["common.general.group"],
      render: (entry) => (
        <span style={{ color: "var(--text-muted)", fontSize: "0.74rem", whiteSpace: "nowrap" }}>
          {entry.featureGroupTitle}
        </span>
      ),
    },
    {
      key: "screenTitle",
      header: i18n.catalog["common.general.screen"],
      dataLabel: i18n.catalog["common.general.screen"],
      render: (entry) => {
        const cfg = STATUS_CONFIG[entry.status];
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <span
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: `${cfg.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: cfg.color, flexShrink: 0,
              }}
            >
              {getIcon(entry.screenIcon, undefined, 12)}
            </span>
            <span
              style={{
                fontWeight: 600,
                fontSize: "0.78rem",
                color: entry.status === "pending" ? "var(--text-muted)" : "var(--text-primary)",
              }}
            >
              {entry.screenTitle}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: i18n.catalog["common.general.status.alternative2"],
      dataLabel: i18n.catalog["common.general.status.alternative2"],
      render: (entry) => <StatusBadge status={entry.status} />,
    },
    // {
    //   key: "href",
    //   header: "المسار",
    //   dataLabel: "المسار",
    //   render: (entry) => (
    //     <span
    //       style={{
    //         fontSize: "0.68rem",
    //         fontFamily: "monospace",
    //         color: entry.status === "pending" ? "var(--text-muted)" : "#6366f1",
    //         opacity: entry.status === "pending" ? 0.5 : 1,
    //         whiteSpace: "nowrap",
    //         overflow: "hidden",
    //         textOverflow: "ellipsis",
    //         display: "block",
    //         maxWidth: 220,
    //       }}
    //     >
    //       {entry.href}
    //     </span>
    //   ),
    // },
  ];

  const domainOptions = domainSummaries.map((d) => ({ value: d.id, label: d.title }));
  const statusOptions = [
    { value: "operational", label: i18n.catalog["common.general.operational"] },
    { value: "in_progress", label: i18n.catalog["common.general.development"] },
    { value: "pending",     label: i18n.catalog["common.general.comingSoon"] },
  ];

  return (
    <div className="sales-card animate-fade">
      <PageSubHeader
        title={i18n.catalog["common.general.unitsStatus"]}
        titleIcon="check-circle"
        actions={
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={statusOptions}
              placeholder={i18n.catalog["common.general.allStatuses"]}
              style={{ minWidth: "160px" }}
            />
            <Select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              options={domainOptions}
              placeholder={i18n.catalog["common.general.allFields"]}
              style={{ minWidth: "200px" }}
            />
          </div>
        }
      />

      {/* ── KPI Row (pre-built KPICardRow) ──────────────────────────────── */}
      <KPICardRow KPICards={kpiCards} />

      {/* ── Domain Cards Grid ────────────────────────────────────────────── */}
      {!filterDomain && !filterStatus && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {domainSummaries.map((summary, idx) => (
            <DomainSummaryCard
              key={summary.id}
              summary={summary}
              index={idx}
              isActive={filterDomain === summary.id}
              onClick={() => setFilterDomain((prev) => (prev === summary.id ? "" : summary.id))}
            />
          ))}
        </div>
      )}

      {/* ── Filter info bar ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
          {i18n.catalog["common.general.view"]}{filteredEntries.length} {i18n.catalog["common.general.notAvailable.alternative2"]}{allEntries.length} {i18n.catalog["enterpriseCore.modulesstatus.screen"]}</span>
        {(filterDomain || filterStatus) && (
          <button
            onClick={() => { setFilterDomain(""); setFilterStatus(""); }}
            style={{
              fontSize: "0.72rem", color: "#6366f1",
              background: "none", border: "none",
              cursor: "pointer", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            {getIcon("x", undefined, 12)}
            {i18n.catalog["enterpriseCore.modulesstatus.clearFilters"]}</button>
        )}
      </div>

      {/* ── Table (pre-built Table component) ───────────────────────────── */}
      <Table<DerivedScreenEntry>
        columns={columns}
        data={filteredEntries}
        keyExtractor={(entry) => `${entry.domainId}-${entry.capabilityId}-${entry.screenId}`}
        emptyMessage={i18n.catalog["enterpriseCore.modulesstatus.noResultsMatchSelectedFilter"]}
        isLoading={false}
      />
    </div>
  );
}
