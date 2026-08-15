"use client";

import { useI18n } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Column, Select, StatsCard, Table, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { useCallback, useEffect, useState } from "react";
import { DOMAIN_COLORS, DOMAIN_ICONS } from "../(pages)/ui/index";

interface MetaType {
    id: string; display_name: string; display_name_ar?: string;
    level_domain: string; description?: string; is_assignable: boolean; sort_order: number;
    attributes?: { attribute_key: string; is_mandatory: boolean; attribute_type: string; sort_order: number }[];
}

export function MetaTypesTab() {
    const { t: i18n } = useI18n();
    const [metaTypes, setMetaTypes] = useState<MetaType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedType, setExpandedType] = useState<string | null>(null);
    const [filterDomain, setFilterDomain] = useState("");

    const loadMetaTypes = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.META_TYPES);
            setMetaTypes((response.meta_types as MetaType[]) || []);
        } catch { showToast(i18n.catalog["text_e1fa4693db09"], "error"); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { loadMetaTypes(); }, [loadMetaTypes]);

    const domains = [...new Set(metaTypes.map((t) => t.level_domain))].sort();
    const filtered = filterDomain ? metaTypes.filter((t) => t.level_domain === filterDomain) : metaTypes;

    const metaTypeColumns: Column<MetaType>[] = [
        { key: "id", header: i18n.catalog["text_1e1c955cdb06"], dataLabel: i18n.catalog["text_1e1c955cdb06"], render: (t) => <code style={{ fontSize: "0.8rem" }}>{t.id}</code> },
        { key: "display_name", header: i18n.catalog["text_0f8a877eac48"], dataLabel: i18n.catalog["text_52ab09847cf8"] },
        { key: "display_name_ar", header: i18n.catalog["text_3b6b8d2d0bb4"], dataLabel: i18n.catalog["text_e904f3e9b933"] },
        {
            key: "level_domain", header: i18n.catalog["text_d197ebe8e67a"], dataLabel: i18n.catalog["text_d197ebe8e67a"],
            render: (t) => {
                const color = DOMAIN_COLORS[t.level_domain] || "#6b7280";
                return (
                    <span style={{ padding: "2px 8px", borderRadius: "4px", background: color + "18", color, fontWeight: 600, fontSize: "0.8rem" }}>
                        {t.level_domain}
                    </span>
                );
            },
        },
        {
            key: "attributes_count", header: i18n.catalog["text_8e5f319dd13f"], dataLabel: i18n.catalog["text_8e5f319dd13f"],
            render: (t) => {
                const total = t.attributes?.length || 0;
                const mandatory = t.attributes?.filter((a) => a.is_mandatory).length || 0;
                return (
                    <span style={{ fontSize: "0.8rem", cursor: "pointer", color: "var(--primary)" }} onClick={() => setExpandedType(expandedType === t.id ? null : t.id)}>
                        {total} ({mandatory} {i18n.catalog["text_500253426833"]}{getIcon(expandedType === t.id ? "chevron-up" : "chevron-down")}
                    </span>
                );
            },
        },
        {
            key: "is_assignable", header: i18n.catalog["text_548688715a36"], dataLabel: i18n.catalog["text_548688715a36"],
            render: (t) => t.is_assignable ? (
                <span style={{ color: "var(--success)" }}>{getIcon("check")}</span>
            ) : (
                <span style={{ color: "var(--text-muted)" }}>{getIcon("close")}</span>
            ),
        },
    ];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["text_3169917a579b"]}
                subTitle={i18n.catalog["text_90e7fbc84abd"]}
                titleIcon="box"
                actions={
                    <>
                        <Select
                            placeholder={i18n.catalog["text_89a4eea1bc00"]}
                            className="form-control"
                            value={filterDomain}
                            options={domains.map((d) => ({ value: d, label: d }))}
                            onChange={(e) => setFilterDomain(e.target.value)}
                            style={{
                                maxWidth: "200px",
                                fontSize: "1rem"
                            }}
                        />
                    </>
                }
            />

            {/* Domain Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.5rem", marginBottom: "1rem" }}>
                {domains.map((d) => {
                    const count = metaTypes.filter((t) => t.level_domain === d).length;
                    const isActive = filterDomain === d;
                    return (
                        <StatsCard
                            hight={80}
                            key={d}
                            title={d}
                            value={count}
                            icon={getIcon(DOMAIN_ICONS[d] || "box")}
                            colorClass={isActive ? "sales" : "total"}
                            onClick={() => setFilterDomain(isActive ? "" : d)}
                        />
                    );
                })}
            </div>

            <Table columns={metaTypeColumns} data={filtered} keyExtractor={(t) => t.id} emptyMessage={i18n.catalog["text_82b897b2492f"]} isLoading={isLoading} />

            {/* Expanded Attributes for selected type */}
            {expandedType && (
                <div style={{ marginTop: "1rem", background: "var(--bg-secondary)", borderRadius: "8px", padding: "1rem" }}>
                    <h4 style={{ margin: "0 0 0.5rem" }}>
                        {i18n.catalog["text_b9474b7104ee"]}{metaTypes.find((t) => t.id === expandedType)?.display_name_ar || expandedType}
                    </h4>
                    <div style={{ display: "grid", gap: "0.25rem" }}>
                        {metaTypes.find((t) => t.id === expandedType)?.attributes?.map((attr) => (
                            <div key={attr.attribute_key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "4px 0", borderBottom: "1px solid var(--border-color)" }}>
                                <code style={{ fontSize: "0.8rem", minWidth: "180px" }}>{attr.attribute_key}</code>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{attr.attribute_type}</span>
                                {attr.is_mandatory && <span className="badge badge-danger" style={{ fontSize: "0.65rem" }}>{i18n.catalog["text_0f0c206363a3"]}</span>}
                            </div>
                        )) || <p style={{ color: "var(--text-muted)", margin: 0 }}>{i18n.catalog["text_f0bf2ae5f022"]}</p>}
                    </div>
                </div>
            )}

            <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {i18n.catalog["text_97bd2075da0f"]}{filtered.length} {i18n.catalog["text_ef74a26920dc"]}{metaTypes.length}
            </div>
        </div>
    );
}
