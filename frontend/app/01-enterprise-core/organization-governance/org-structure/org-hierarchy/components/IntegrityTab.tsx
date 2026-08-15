"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Button, showToast, StatsCard } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { useCallback, useEffect, useState } from "react";
import {
    CheckItem,
    EmptyState,
    FilterChip,
    IssueRow,
} from "../(pages)/ui/index";

interface IntegrityIssue {
    type: "ERROR" | "WARNING" | "INFO";
    category: string;
    message: string;
    message_ar?: string;
    node_uuid?: string;
    node_code?: string;
    node_type?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    missing_attribute: catalogMessage("enterpriseCore.integrity.missingRequiredAttributes"),
    orphan_node: catalogMessage("common.general.isolatedUnits"),
    missing_parent: catalogMessage("enterpriseCore.integrity.requiredLinksMissing"),
    cardinality_violation: catalogMessage("enterpriseCore.integrity.relationshipMultiplicityViolations"),
    expired_link: catalogMessage("enterpriseCore.integrity.expiredLinks"),
    inactive_with_links: catalogMessage("enterpriseCore.integrity.inactiveUnitsAssociations"),
};

export function IntegrityTab() {
    const { t: i18n } = useI18n();
    const [issues, setIssues] = useState<IntegrityIssue[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [summary, setSummary] = useState({ total: 0, errors: 0, warnings: 0, info: 0 });
    const [filterType, setFilterType] = useState<string>("");
    const [filterCategory, setFilterCategory] = useState<string>("");

    const runScan = useCallback(async () => {
        try {
            setIsScanning(true);
            setIssues([]);

            const res = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.INTEGRITY_CHECK);

            if (res.success) {
                setIssues((res.issues as IntegrityIssue[]) || []);
                setSummary({
                    total: res.total as number || 0,
                    errors: res.errors as number || 0,
                    warnings: res.warnings as number || 0,
                    info: res.info as number || 0,
                });
                showToast(catalogText(i18n, "enterpriseCore.integrity.inspectionCompletedNoteSFound", { value0: res.total }), "info");
            }
        } catch {
            showToast(i18n.catalog["enterpriseCore.integrity.failedRunSafetyCheck"], "error");
        } finally {
            setIsScanning(false);
        }
    }, []);

    useEffect(() => { runScan(); }, [runScan]);

    const categories = [...new Set(issues.map(i => i.category))].sort();

    const filteredIssues = issues.filter(i => {
        if (filterType && i.type !== filterType) return false;
        if (filterCategory && i.category !== filterCategory) return false;
        return true;
    });

    const groupedByCategory = filteredIssues.reduce((acc, issue) => {
        if (!acc[issue.category]) acc[issue.category] = [];
        acc[issue.category].push(issue);
        return acc;
    }, {} as Record<string, IntegrityIssue[]>);

    return (
        <div className="sales-card animate-fade">
            {/* Header */}
            <PageSubHeader
                titleIcon="shield-check"
                title={i18n.catalog["enterpriseCore.integrity.organizationalStructureConsistencyCheckConsistencyCheck"]}
                subTitle={i18n.catalog["enterpriseCore.integrity.comprehensiveVerificationAssignmentsAttributesRelationshipsEmulatingSapC"]}
                actions={
                    <>
                        <Button variant="primary" onClick={runScan} disabled={isScanning}>
                            {isScanning ? i18n.catalog["enterpriseCore.integrity.checking"] : i18n.catalog["enterpriseCore.integrity.restartScan"]}
                        </Button>
                    </>
                }
            />

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <StatsCard
                    title={i18n.catalog["enterpriseCore.integrity.totalResults"]}
                    value={summary.total}
                    icon={getIcon("list")}
                    colorClass="total"
                    onClick={() => setFilterType("")}
                />
                <StatsCard
                    title={i18n.catalog["enterpriseCore.integrity.errorsBlockers"]}
                    value={summary.errors}
                    icon={getIcon("alert")}
                    colorClass="alert"
                    onClick={() => setFilterType(filterType === "ERROR" ? "" : "ERROR")}
                />
                <StatsCard
                    title={i18n.catalog["enterpriseCore.integrity.warnings"]}
                    value={summary.warnings}
                    icon={getIcon("alertTriangle")}
                    colorClass="default"
                    onClick={() => setFilterType(filterType === "WARNING" ? "" : "WARNING")}
                />
                <StatsCard
                    title={i18n.catalog["enterpriseCore.integrity.notifications"]}
                    value={summary.info}
                    icon={getIcon("eye")}
                    colorClass="sales"
                    onClick={() => setFilterType(filterType === "INFO" ? "" : "INFO")}
                />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <FilterChip label={i18n.catalog["common.general.all"]} active={!filterCategory} onClick={() => setFilterCategory("")} />
                    {categories.map(cat => {
                        const count = issues.filter(i => i.category === cat && (!filterType || i.type === filterType)).length;
                        return (
                            <FilterChip
                                key={cat}
                                label={CATEGORY_LABELS[cat] || cat}
                                active={filterCategory === cat}
                                onClick={() => setFilterCategory(filterCategory === cat ? "" : cat)}
                                count={count}
                            />
                        );
                    })}
                </div>
            )}

            {/* Results */}
            {issues.length === 0 && !isScanning ? (
                <EmptyState
                    icon="check-circle"
                    title={i18n.catalog["enterpriseCore.integrity.structureIntact100"]}
                    description={i18n.catalog["enterpriseCore.integrity.thereAreNoConflictsMissingRequiredAttributesViolations"]}
                    iconColor="var(--success)"
                >
                    <CheckItem label={i18n.catalog["enterpriseCore.integrity.mandatoryAttributes"]} />
                    <CheckItem label={i18n.catalog["enterpriseCore.integrity.primaryLinks"]} />
                    <CheckItem label={i18n.catalog["enterpriseCore.integrity.multiplicityRules"]} />
                    <CheckItem label={i18n.catalog["enterpriseCore.integrity.linkValidity"]} />
                    <CheckItem label={i18n.catalog["enterpriseCore.integrity.isolatedUnits"]} />
                </EmptyState>
            ) : isScanning ? (
                <div className="sales-card" style={{ textAlign: "center", padding: "3rem" }}>
                    <div className="loading-spinner" style={{ margin: "0 auto 1rem" }} />
                    <p style={{ color: "var(--text-muted)" }}>{i18n.catalog["enterpriseCore.integrity.checkingOrganizationalUnitsLinksRules"]}</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                    {Object.entries(groupedByCategory).map(([category, categoryIssues]) => (
                        <div key={category} className="sales-card">
                            <h4 style={{ margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "4px", background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                                    {categoryIssues.length}
                                </span>
                                {CATEGORY_LABELS[category] || category}
                            </h4>
                            <div style={{ display: "grid", gap: "0.5rem" }}>
                                {categoryIssues.map((issue, idx) => (
                                    <IssueRow
                                        key={idx}
                                        type={issue.type}
                                        message={issue.message_ar || issue.message}
                                        meta={
                                            <>
                                                {i18n.catalog["enterpriseCore.integrity.unit"]}<strong>{issue.node_code}</strong>
                                                <span style={{ marginRight: "0.5rem", marginLeft: "0.5rem" }}>|</span>
                                                {i18n.catalog["common.general.type"]}<code style={{ fontSize: "0.75rem" }}>{issue.node_type}</code>
                                                {issue.node_uuid && (
                                                    <span style={{ marginRight: "0.5rem", color: "var(--text-muted)", fontSize: "0.72rem" }}>
                                                        {i18n.catalog["enterpriseCore.integrity.id"]}{issue.node_uuid.substring(0, 8)}...)
                                                    </span>
                                                )}
                                            </>
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
