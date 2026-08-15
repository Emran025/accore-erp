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
    healthy: { label: catalogMessage("text_970dd58a0500"), color: "#10b981", bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)", icon: "check-circle" },
    warning: { label: catalogMessage("text_28d716788eac"), color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.2)", icon: "alert-triangle" },
    critical: { label: catalogMessage("text_4e275d7c60ec"), color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.2)", icon: "alert-circle" },
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
                        <strong>{i18n.catalog["text_1837202dc237"]}</strong>
                    </div>
                    <p>{i18n.catalog["text_0bd260325606"]}</p>
                    <div className="nr-fullness-alert-list">
                        {critical.map(iv => (
                            <div key={iv.id} className="nr-fullness-alert-item">
                                <span className="nr-fullness-alert-code">{iv.code}</span>
                                <span>{i18n.catalog["text_7fc9bf83def7"]}{iv.remaining.toLocaleString()} {i18n.catalog["text_ca050411a2d3"]}{iv.fullness_percent}%)</span>
                                <Button variant="primary" onClick={() => onExpand(iv)} icon="maximize-2">
                                    {i18n.catalog["text_e3f5bab05753"]}</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {warning.length > 0 && (
                <div className="nr-fullness-alert nr-fullness-alert-warning">
                    <div className="nr-fullness-alert-header">
                        {getIcon("alert-triangle")}
                        <strong>{i18n.catalog["text_438c98019dd4"]}</strong>
                    </div>
                    <p>{i18n.catalog["text_8842db176b6b"]}</p>
                    <div className="nr-fullness-alert-list">
                        {warning.map(iv => (
                            <div key={iv.id} className="nr-fullness-alert-item">
                                <span className="nr-fullness-alert-code">{iv.code}</span>
                                <span>{i18n.catalog["text_7fc9bf83def7"]}{iv.remaining.toLocaleString()} {i18n.catalog["text_e7cb5dab85f4"]}{iv.fullness_percent}%)</span>
                                <Button variant="secondary" onClick={() => onExpand(iv)} icon="maximize-2">
                                    {i18n.catalog["text_e3f5bab05753"]}</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detailed Breakdown */}
            <div className="nr-fullness-details">
                <h4>{i18n.catalog["text_72489e2291bc"]}</h4>
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
                                        <span className="nr-stat-label">{i18n.catalog["text_0713b3646ee7"]}</span>
                                        <span className="nr-stat-value" style={{ fontFamily: "monospace" }}>
                                            {iv.from_number.toLocaleString()} → {iv.to_number.toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="nr-stat-label">{i18n.catalog["text_c39422e404cd"]}</span>
                                        <span className="nr-stat-value">{iv.capacity.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="nr-stat-label">{i18n.catalog["text_2fb01868740d"]}</span>
                                        <span className="nr-stat-value">{iv.used.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="nr-stat-label">{i18n.catalog["text_b2127e3a35be"]}</span>
                                        <span className="nr-stat-value" style={{ color: iv.remaining < 100 ? "#ef4444" : "inherit" }}>
                                            {iv.remaining.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="nr-fullness-card-actions">
                                    <Button variant="secondary" onClick={() => onExpand(iv)} icon="maximize-2">
                                        {i18n.catalog["text_e3f5bab05753"]}</Button>
                                    <Button variant="secondary" onClick={() => onViewLogs(iv.id)} icon="activity">
                                        {i18n.catalog["text_9dca2d96d1fb"]}</Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    ) : null;
}
