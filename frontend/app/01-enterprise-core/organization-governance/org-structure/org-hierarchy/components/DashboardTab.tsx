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
    Enterprise: catalogMessage("enterpriseCore.dashboard.organization"),
    Financial: catalogMessage("common.general.finance"),
    Controlling: catalogMessage("enterpriseCore.dashboard.control"),
    Logistics: catalogMessage("enterpriseCore.dashboard.logistics"),
    Sales: catalogMessage("common.general.sales"),
    HR: catalogMessage("common.general.humanResources"),
    Project: catalogMessage("common.general.projects"),
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
                title={i18n.catalog["enterpriseCore.dashboard.organizationalOverviewSapEnterpriseStructure"]}
                subTitle={i18n.catalog["enterpriseCore.dashboard.comprehensiveCoverageCoreSystemDimensionsSimulatingSapSpro"]}
            />

            {/* KPI Cards Row */}
            <KPICardRow
                KPICards={[
                    { icon: "sitemap", label: i18n.catalog["enterpriseCore.dashboard.totalUnits"], value: stats?.total_nodes ?? 0, subtitle: catalogText(i18n, "common.general.active.alternative3", { value0: stats?.active_nodes ?? 0 }) },
                    { icon: "link", label: i18n.catalog["common.general.links"], value: stats?.total_links ?? 0, subtitle: catalogText(i18n, "common.general.active.alternative3", { value0: stats?.active_links ?? 0 }) },
                    { icon: "route", label: i18n.catalog["enterpriseCore.dashboard.topologyRules"], value: stats?.total_rules ?? 0, subtitle: i18n.catalog["enterpriseCore.dashboard.activeLinkRule"] },
                    { icon: "box", label: i18n.catalog["common.general.typesUnits"], value: stats?.total_meta_types ?? 0, subtitle: i18n.catalog["enterpriseCore.dashboard.systemIdentifierType"] },
                    { icon: "alertTriangle", label: i18n.catalog["common.general.isolatedUnits"], value: stats?.orphan_count ?? 0, color: stats?.orphan_count ? "#ef4444" : "#10b981", subtitle: i18n.catalog["enterpriseCore.dashboard.noAssociation"] },
                    { icon: "history", label: i18n.catalog["enterpriseCore.dashboard.weeklyChanges"], value: stats?.recent_changes_7d ?? 0, subtitle: i18n.catalog["enterpriseCore.dashboard.within7Days"] },
                ]}
            />


            {/* Dimension Grid */}
            <h4 style={{ margin: "0 0 1rem", color: "var(--text-primary)" }}>{getIcon("tree")} {i18n.catalog["enterpriseCore.dashboard.organizationalStructureDimensionsModuleDimensions"]}</h4>
            <DomainCardRow
                domainCards={domains.map((domain) => ({
                    key: domain,
                    domain: domain,
                    domainAr: DOMAIN_LABELS_AR[domain],
                    icon: DOMAIN_ICONS[domain] || "cube",
                    count: stats?.domain_breakdown?.[domain] ?? 0,
                    description: i18n.catalog["enterpriseCore.dashboard.registeredOrganizationalUnits"]
                }))}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                {/* Health Status */}
                <div className="sales-card">
                    <h4 style={{ margin: "0 0 1rem" }}>{getIcon("check-circle")} {i18n.catalog["enterpriseCore.dashboard.primaryStructureSafetyStatus"]}</h4>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        <StatusItem label={i18n.catalog["enterpriseCore.dashboard.clientDefinitionClientSetup"]} active={(stats?.domain_breakdown?.Enterprise ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["enterpriseCore.dashboard.companyCodes"]} active={(stats?.domain_breakdown?.Financial ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["enterpriseCore.dashboard.controllingCostAreasControlling"]} active={(stats?.domain_breakdown?.Controlling ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["enterpriseCore.dashboard.factoriesSitesLogisticsPlants"]} active={(stats?.domain_breakdown?.Logistics ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["enterpriseCore.dashboard.salesOrganizationsSalesOrgs"]} active={(stats?.domain_breakdown?.Sales ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["enterpriseCore.dashboard.hrPersonnelAreasHrPersonnelAreas"]} active={(stats?.domain_breakdown?.HR ?? 0) > 0} />
                        <StatusItem label={i18n.catalog["enterpriseCore.dashboard.projectStructureProjectSystems"]} active={(stats?.domain_breakdown?.Project ?? 0) > 0} />
                    </div>
                </div>

                {/* Node Status Breakdown + SPRO Quick Actions */}
                <div className="sales-card">
                    <h4 style={{ margin: "0 0 1rem" }}>{getIcon("settings")} {i18n.catalog["enterpriseCore.dashboard.systemCustomizationSproStyle"]}</h4>

                    {/* Status bars */}
                    <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        <StatusBar label={i18n.catalog["common.general.activeActive"]} count={stats?.active_nodes ?? 0} total={stats?.total_nodes || 1} color="#10b981" />
                        <StatusBar label={i18n.catalog["common.general.inactiveInactive"]} count={stats?.inactive_nodes ?? 0} total={stats?.total_nodes || 1} color="#f59e0b" />
                        <StatusBar label={i18n.catalog["common.general.archivedArchived"]} count={stats?.archived_nodes ?? 0} total={stats?.total_nodes || 1} color="#6b7280" />
                    </div>

                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                        {i18n.catalog["enterpriseCore.dashboard.quickAccessOrganizationInfrastructureSettings"]}</p>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <QuickActionItem label={i18n.catalog["enterpriseCore.dashboard.defineNewOrganizationalUnits"]} icon="plus" color="#3b82f6" />
                        <QuickActionItem label={i18n.catalog["enterpriseCore.dashboard.manageTopologyAssociationRules"]} icon="route" color="#8b5cf6" />
                        <QuickActionItem label={i18n.catalog["enterpriseCore.dashboard.reviewFinancialAccountingLinks"]} icon="dollar" color="#10b981" />
                        <QuickActionItem label={i18n.catalog["enterpriseCore.dashboard.storageShippingLocationDistribution"]} icon="truck" color="#f59e0b" />
                        <QuickActionItem label={i18n.catalog["enterpriseCore.dashboard.structureIntegrityCheckConsistency"]} icon="check-shield" color="#ef4444" />
                    </div>
                </div>
            </div>

            {/* Type Breakdown Table */}
            {stats?.type_breakdown && Object.keys(stats.type_breakdown).length > 0 && (
                <div className="sales-card" style={{ marginTop: "1.5rem" }}>
                    <h4 style={{ margin: "0 0 1rem" }}>{getIcon("chart-bar")} {i18n.catalog["enterpriseCore.dashboard.unitsDistributionType"]}</h4>
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
