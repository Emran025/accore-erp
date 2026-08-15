"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { DomainCardRow, KPICardRow } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { useCallback, useEffect, useState } from "react";
import {
    DOMAIN_ICONS,
    QuickActionItem,
    StatusBar,
    StatusItem,
} from "../(pages)/ui/index";

interface Statistics {
    total_nodes: number;
    active_nodes: number;
    inactive_nodes: number;
    archived_nodes: number;
    total_links: number;
    active_links: number;
    total_rules: number;
    total_meta_types: number;
    domain_breakdown: Record<string, number>;
    type_breakdown: Record<string, number>;
    orphan_count: number;
    recent_changes_7d: number;
}

const DOMAIN_LABELS_AR: Record<string, string> = {
    Enterprise: catalogMessage("text_099e362a9574"),
    Financial: catalogMessage("text_66fe73615494"),
    Controlling: catalogMessage("text_78ca0930470e"),
    Logistics: catalogMessage("text_5f3f25dd00d8"),
    Sales: catalogMessage("text_7bf1b13416bc"),
    HR: catalogMessage("text_6c30b5a7d30b"),
    Project: catalogMessage("text_5818066ebd9f"),
};

export function DashboardTab() {
    const { t: i18n } = useI18n();
    const [stats, setStats] = useState<Statistics | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadStats = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.STATISTICS);
            if (res.statistics) {
                setStats(res.statistics as Statistics);
            }
        } catch { /* silently fail — fallback below */ }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    if (isLoading) {
        return <div className="loading-spinner" style={{ margin: "2rem auto" }} />;
    }

    const domains = ["Enterprise", "Financial", "Controlling", "Logistics", "Sales", "HR", "Project"];

    return (
        <div className="animate-fade">
            <PageSubHeader
                titleIcon="dashboard"
                title={i18n.catalog["text_fb14be6b0005"]}
                subTitle={i18n.catalog["text_092d75636f04"]}
            />

            {/* KPI Cards Row */}
            <KPICardRow
                KPICards={[
                    { icon: "sitemap", label: i18n.catalog["text_3b3879e748a9"], value: stats?.total_nodes ?? 0, subtitle: catalogText(i18n, "text_c67a812bac40", { value0: stats?.active_nodes ?? 0 }) },
                    { icon: "link", label: i18n.catalog["text_32502d2e7cc4"], value: stats?.total_links ?? 0, subtitle: catalogText(i18n, "text_c67a812bac40", { value0: stats?.active_links ?? 0 }) },
                    { icon: "route", label: i18n.catalog["text_542f085490ea"], value: stats?.total_rules ?? 0, subtitle: i18n.catalog["text_b53de7559c09"] },
                    { icon: "box", label: i18n.catalog["text_ed5104e388c6"], value: stats?.total_meta_types ?? 0, subtitle: i18n.catalog["text_ed995dd1afcf"] },
                    { icon: "alertTriangle", label: i18n.catalog["text_4a9ffe71a029"], value: stats?.orphan_count ?? 0, color: stats?.orphan_count ? "#ef4444" : "#10b981", subtitle: i18n.catalog["text_5a6b076df4b1"] },
                    { icon: "history", label: i18n.catalog["text_8ce51ae53ec8"], value: stats?.recent_changes_7d ?? 0, subtitle: i18n.catalog["text_3f506ba7c244"] },
                ]}
            />


            {/* Dimension Grid */}
            <h4 style={{ margin: "0 0 1rem", color: "var(--text-primary)" }}>{getIcon("tree")} {i18n.catalog["text_6c01418bc8ba"]}</h4>
            <DomainCardRow
                domainCards={domains.map((domain) => ({
                    key: domain,
                    domain: domain,
                    domainAr: DOMAIN_LABELS_AR[domain],
                    icon: DOMAIN_ICONS[domain] || "cube",
                    count: stats?.domain_breakdown?.[domain] ?? 0,
                    description: i18n.catalog["text_ff9c5d5938a3"]
                }))}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                {/* Health Status */}
                <div className="sales-card">
                    <h4 style={{ margin: "0 0 1rem" }}>{getIcon("check-circle")} {i18n.catalog["text_976f50ec9863"]}</h4>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        <StatusItem label={i18n.catalog["text_5da852e58539"]} active={(stats?.domain_breakdown?.Enterprise ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["text_faf5fb7b1373"]} active={(stats?.domain_breakdown?.Financial ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["text_d477a616901a"]} active={(stats?.domain_breakdown?.Controlling ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["text_274b0e146c61"]} active={(stats?.domain_breakdown?.Logistics ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["text_1e6183107952"]} active={(stats?.domain_breakdown?.Sales ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["text_ee817e415b3a"]} active={(stats?.domain_breakdown?.HR ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["text_2aecbd722280"]} active={(stats?.domain_breakdown?.Project ?? 0) > 0} />
                    </div>
                </div>

                {/* Node Status Breakdown + SPRO Quick Actions */}
                <div className="sales-card">
                    <h4 style={{ margin: "0 0 1rem" }}>{getIcon("settings")} {i18n.catalog["text_1036cb5afa81"]}</h4>

                    {/* Status bars */}
                    <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        <StatusBar label={i18n.catalog["text_45bde9fdafc3"]} count={stats?.active_nodes ?? 0} total={stats?.total_nodes || 1} color="#10b981" />
                        <StatusBar label={i18n.catalog["text_ad16cd513d7f"]} count={stats?.inactive_nodes ?? 0} total={stats?.total_nodes || 1} color="#f59e0b" />
                        <StatusBar label={i18n.catalog["text_a1251f0700cd"]} count={stats?.archived_nodes ?? 0} total={stats?.total_nodes || 1} color="#6b7280" />
                    </div>

                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                        {i18n.catalog["text_50de90529654"]}</p>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <QuickActionItem label={i18n.catalog["text_fcf50cdbacbe"]} icon="plus" color="#3b82f6" />
                        <QuickActionItem label={i18n.catalog["text_7fc2a8fb0bf0"]} icon="route" color="#8b5cf6" />
                        <QuickActionItem label={i18n.catalog["text_3c2f0a5b0c0b"]} icon="dollar" color="#10b981" />
                        <QuickActionItem label={i18n.catalog["text_7bfbc6737fcc"]} icon="truck" color="#f59e0b" />
                        <QuickActionItem label={i18n.catalog["text_ade5e02dc7ec"]} icon="check-shield" color="#ef4444" />
                    </div>
                </div>
            </div>

            {/* Type Breakdown Table */}
            {stats?.type_breakdown && Object.keys(stats.type_breakdown).length > 0 && (
                <div className="sales-card" style={{ marginTop: "1.5rem" }}>
                    <h4 style={{ margin: "0 0 1rem" }}>{getIcon("chart-bar")} {i18n.catalog["text_0638ff78eed0"]}</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.5rem" }}>
                        {Object.entries(stats.type_breakdown).sort(([, a], [, b]) => b - a).map(([typeId, count]) => (
                            <div key={typeId} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "0.5rem 0.75rem", background: "var(--bg-secondary)", borderRadius: "6px"
                            }}>
                                <code style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{typeId}</code>
                                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
