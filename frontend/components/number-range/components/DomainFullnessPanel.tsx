"use client";

import { useI18n, catalogMessage } from "@/lib/i18n";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui";
import type { NrInterval } from "../types";

interface DomainFullnessPanelProps {
    intervals: NrInterval[];
    numberLength: number;
    onExpand: (iv: NrInterval) => void;
    onViewLogs: (intervalId: number) => void;
}

const STATUS_CONFIG = {
    healthy: { label: catalogMessage("common.general.valid.alternative2"), color: "#10b981", bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)", icon: "check-circle" },
    warning: { label: catalogMessage("common.general.warning"), color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.2)", icon: "alert-triangle" },
    critical: { label: catalogMessage("common.general.critical"), color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.2)", icon: "alert-circle" },
};

export function DomainFullnessPanel({ intervals, numberLength, onExpand, onViewLogs }: DomainFullnessPanelProps) {
    const { t: i18n } = useI18n();
    const maxNumber = Number("9".repeat(numberLength));
    const totalCapacity = intervals.reduce((s, iv) => s + iv.capacity, 0);
    const totalUsed = intervals.reduce((s, iv) => s + iv.used, 0);
    const totalRemaining = totalCapacity - totalUsed;
    const overallFullness = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100 * 100) / 100 : 0;

    const critical = intervals.filter(iv => iv.status === "critical");
    const warning = intervals.filter(iv => iv.status === "warning");
    const healthy = intervals.filter(iv => iv.status === "healthy");

    return critical.length > 0 || warning.length > 0 || intervals.length > 0 ? (
        <div className="sales-card compact">
            {/* Alerts for Critical & Warning Intervals */}
            {critical.length > 0 && (
                <div className="nr-fullness-alert nr-fullness-alert-critical">
                    <div className="nr-fullness-alert-header">
                        {getIcon("alert-circle")}
                        <strong>{i18n.catalog["numberRange.domainfullness.criticalAlertRangesAreNearingCapacity"]}</strong>
                    </div>
                    <p>{i18n.catalog["numberRange.domainfullness.followingRangesHaveReachedMoreThan95Their"]}</p>
                    <div className="nr-fullness-alert-list">
                        {critical.map(iv => (
                            <div key={iv.id} className="nr-fullness-alert-item">
                                <span className="nr-fullness-alert-code">{iv.code}</span>
                                <span>{i18n.catalog["common.general.remaining"]}{iv.remaining.toLocaleString()} {i18n.catalog["numberRange.domainfullness.numbersOnly"]}{iv.fullness_percent}%)</span>
                                <Button variant="primary" onClick={() => onExpand(iv)} icon="maximize-2">
                                    {i18n.catalog["common.general.expand"]}</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {warning.length > 0 && (
                <div className="nr-fullness-alert nr-fullness-alert-warning">
                    <div className="nr-fullness-alert-header">
                        {getIcon("alert-triangle")}
                        <strong>{i18n.catalog["numberRange.domainfullness.warningRangesNearingCapacity"]}</strong>
                    </div>
                    <p>{i18n.catalog["numberRange.domainfullness.followingRangesAreBetween8095TheirCapacity"]}</p>
                    <div className="nr-fullness-alert-list">
                        {warning.map(iv => (
                            <div key={iv.id} className="nr-fullness-alert-item">
                                <span className="nr-fullness-alert-code">{iv.code}</span>
                                <span>{i18n.catalog["common.general.remaining"]}{iv.remaining.toLocaleString()} {i18n.catalog["numberRange.domainfullness.number"]}{iv.fullness_percent}%)</span>
                                <Button variant="secondary" onClick={() => onExpand(iv)} icon="maximize-2">
                                    {i18n.catalog["common.general.expand"]}</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detailed Breakdown */}
            <div className="nr-fullness-details">
                <h4>{i18n.catalog["numberRange.domainfullness.detailsRange"]}</h4>
                <div className="nr-fullness-grid">
                    {intervals.map(iv => {
                        const cfg = STATUS_CONFIG[iv.status];
                        return (
                            <div
                                key={iv.id}
                                className="nr-fullness-card"
                                style={{ borderColor: cfg.border, background: cfg.bg }}
                            >
                                <div className="nr-fullness-card-header">
                                    <span
                                        className="nr-fullness-card-status"
                                        style={{ color: cfg.color }}
                                    >
                                        {getIcon(cfg.icon)} {cfg.label}
                                    </span>
                                    <span className="nr-fullness-card-code">{iv.code}</span>
                                </div>

                                <div className="nr-fullness-card-bar">
                                    <div
                                        className="nr-fullness-card-bar-fill"
                                        style={{
                                            width: `${Math.min(iv.fullness_percent, 100)}%`,
                                            background: cfg.color,
                                        }}
                                    />
                                </div>

                                <div className="nr-fullness-card-stats">
                                    <div>
                                        <span className="nr-stat-label">{i18n.catalog["common.general.range"]}</span>
                                        <span className="nr-stat-value" style={{ fontFamily: "monospace" }}>
                                            {iv.from_number.toLocaleString()} → {iv.to_number.toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="nr-stat-label">{i18n.catalog["numberRange.domainfullness.capacity"]}</span>
                                        <span className="nr-stat-value">{iv.capacity.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="nr-stat-label">{i18n.catalog["common.general.user"]}</span>
                                        <span className="nr-stat-value">{iv.used.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="nr-stat-label">{i18n.catalog["common.general.remaining.alternative2"]}</span>
                                        <span className="nr-stat-value" style={{ color: iv.remaining < 100 ? "#ef4444" : "inherit" }}>
                                            {iv.remaining.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="nr-fullness-card-actions">
                                    <Button variant="secondary" onClick={() => onExpand(iv)} icon="maximize-2">
                                        {i18n.catalog["common.general.expand"]}</Button>
                                    <Button variant="secondary" onClick={() => onViewLogs(iv.id)} icon="activity">
                                        {i18n.catalog["numberRange.domainfullness.record"]}</Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    ) : null;
}
