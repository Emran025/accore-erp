"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Checkbox, Column, ConfirmDialog, Dialog, SearchableSelect, showToast, Table } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useCallback, useEffect, useState } from "react";
import { InitialNodeSetup, NodeFormData, NodeFormDialog } from "./NodeFormPanel";
import { DOMAIN_COLORS } from "../(pages)/ui/index";

interface MetaType {
    id: string;
    display_name: string;
    display_name_ar?: string;
    level_domain: string;
    attributes?: { attribute_key: string; is_mandatory: boolean; attribute_type: string }[];
}

interface StructureNode {
    node_uuid: string;
    node_type_id: string;
    code: string;
    attributes_json?: Record<string, unknown>;
    status: string;
    valid_from?: string;
    valid_to?: string;
    meta_type?: MetaType;
    outgoing_links?: { id: number }[];
    incoming_links?: { id: number }[];
}

interface TopologyRule {
    id: number;
    source_node_type_id: string;
    target_node_type_id: string;
    cardinality: string;
}

export function NodesTab() {
    const { t: i18n } = useI18n();
    const [nodes, setNodes] = useState<StructureNode[]>([]);
    const [metaTypes, setMetaTypes] = useState<MetaType[]>([]);
    const [topologyRules, setTopologyRules] = useState<TopologyRule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterDomain, setFilterDomain] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [formDialog, setFormDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [selectedNode, setSelectedNode] = useState<StructureNode | null>(null);
    const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
    const [dynamicAttrs, setDynamicAttrs] = useState<Record<string, string>>({});
    const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());
    const [bulkDialog, setBulkDialog] = useState(false);
    const [bulkStatus, setBulkStatus] = useState("active");
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    const [formData, setFormData] = useState<NodeFormData>({
        node_type_id: "", code: "", status: "active",
        target_node_uuid: "", validate_constraints: true,
        valid_from: "", valid_to: "",
    });

    const loadNodes = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.set("search", searchTerm);
            if (filterType) params.set("node_type_id", filterType);
            if (filterStatus) params.set("status", filterStatus);
            if (filterDomain) params.set("level_domain", filterDomain);
            const response = await fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODES}?${params}`);
            setNodes((response.nodes as StructureNode[]) || []);
            setInitialDataLoaded(true);
        } catch { showToast(i18n.catalog["text_19001cfc2cbf"], "error"); }
        finally { setIsLoading(false); }
    }, [searchTerm, filterType, filterStatus, filterDomain]);

    const loadMetaTypes = useCallback(async () => {
        try {
            const response = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.META_TYPES);
            setMetaTypes((response.meta_types as MetaType[]) || []);
        } catch { showToast(i18n.catalog["text_e1fa4693db09"], "error"); }
    }, []);

    const loadTopologyRules = useCallback(async () => {
        try {
            const response = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.TOPOLOGY_RULES);
            setTopologyRules((response.topology_rules as TopologyRule[]) || []);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { loadNodes(); loadMetaTypes(); loadTopologyRules(); }, [loadNodes, loadMetaTypes, loadTopologyRules]);

    const getTypeLabel = (id: string) => metaTypes.find((t) => t.id === id)?.display_name_ar || metaTypes.find((t) => t.id === id)?.display_name || id;
    const getTypeDomain = (id: string) => metaTypes.find((t) => t.id === id)?.level_domain || "";

    const filteredMetaTypes = filterDomain ? metaTypes.filter((t) => t.level_domain === filterDomain) : metaTypes;
    const domains = [...new Set(metaTypes.map((t) => t.level_domain))].sort();

    const openAddDialog = () => {
        setSelectedNode(null);
        const firstType = filteredMetaTypes[0]?.id || metaTypes[0]?.id || "";
        setFormData({ node_type_id: firstType, code: "", status: "active", target_node_uuid: "", validate_constraints: true, valid_from: "", valid_to: "" });
        setDynamicAttrs({});
        setFormDialog(true);
    };

    const openEditDialog = (node: StructureNode) => {
        setSelectedNode(node);
        const attrs = node.attributes_json || {};
        const attrMap: Record<string, string> = {};
        Object.entries(attrs).forEach(([k, v]) => { attrMap[k] = typeof v === "object" ? JSON.stringify(v) : String(v || ""); });
        setFormData({
            node_type_id: node.node_type_id, code: node.code, status: node.status,
            target_node_uuid: "", validate_constraints: true,
            valid_from: node.valid_from?.substring(0, 10) || "",
            valid_to: node.valid_to?.substring(0, 10) || "",
        });
        setDynamicAttrs(attrMap);
        setFormDialog(true);
    };

    const handleSubmit = async () => {
        if (!formData.node_type_id.trim() || !formData.code.trim()) {
            showToast(i18n.catalog["text_c9e5868f314d"], "error"); return;
        }
        setIsSubmitting(true);
        const attrs: Record<string, string> = { ...dynamicAttrs };
        const payload: Record<string, unknown> = {
            node_type_id: formData.node_type_id, code: formData.code.trim(), attributes: attrs, status: formData.status,
            valid_from: formData.valid_from || null,
            valid_to: formData.valid_to || null,
        };
        if (formData.target_node_uuid && !selectedNode) {
            payload.link = { target_node_uuid: formData.target_node_uuid, validate_constraints: formData.validate_constraints };
        }
        try {
            if (selectedNode) {
                await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODE(selectedNode.node_uuid), {
                    method: "PUT", body: JSON.stringify({
                        code: formData.code, attributes: attrs, status: formData.status,
                        valid_from: formData.valid_from || null, valid_to: formData.valid_to || null,
                    }),
                });
                showToast(i18n.catalog["text_4cd959b04c70"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODES, { method: "POST", body: JSON.stringify(payload) });
                showToast(i18n.catalog["text_ae038721ee27"], "success");
            }
            setFormDialog(false); loadNodes();
        } catch (e: unknown) {
            const err = e as { message?: string };
            showToast(err?.message || i18n.catalog["text_c574313242be"], "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (uuid: string) => { setDeleteUuid(uuid); setConfirmDialog(true); };

    const handleDelete = async () => {
        if (!deleteUuid) return;
        try {
            await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODE(deleteUuid), { method: "DELETE" });
            showToast(i18n.catalog["text_2292d78ed5cb"], "success"); loadNodes();
        } catch (e: unknown) {
            const err = e as { message?: string };
            showToast(err?.message || i18n.catalog["text_3bdb299872fb"], "error");
        }
        setConfirmDialog(false); setDeleteUuid(null);
    };

    const toggleSelect = (uuid: string) => {
        setSelectedUuids(prev => {
            const next = new Set(prev);
            next.has(uuid) ? next.delete(uuid) : next.add(uuid);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedUuids.size === nodes.length) {
            setSelectedUuids(new Set());
        } else {
            setSelectedUuids(new Set(nodes.map(n => n.node_uuid)));
        }
    };

    const handleBulkStatus = async () => {
        if (selectedUuids.size === 0) return;
        try {
            await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.BULK_STATUS, {
                method: "POST",
                body: JSON.stringify({ node_uuids: Array.from(selectedUuids), status: bulkStatus }),
            });
            showToast(catalogText(i18n, "text_63b4a5d68b48", { value0: selectedUuids.size }), "success");
            setSelectedUuids(new Set());
            setBulkDialog(false);
            loadNodes();
        } catch (e: unknown) {
            showToast((e as { message?: string })?.message || i18n.catalog["text_598f8b7818df"], "error");
        }
    };

    // Shared form props for both dialog and inline wizard
    const formProps = {
        formData, setFormData, dynamicAttrs, setDynamicAttrs,
        metaTypes, nodes, topologyRules, selectedNode, getTypeLabel,
    };

    const nodeColumns: Column<StructureNode>[] = [
        {
            key: "select", header: "", dataLabel: "",
            render: (item) => (
                <Checkbox
                    checked={selectedUuids.has(item.node_uuid)}
                    onChange={() => toggleSelect(item.node_uuid)}
                />
            ),
        },
        { key: "code", header: i18n.catalog["text_589c6420ea10"], dataLabel: i18n.catalog["text_589c6420ea10"] },
        {
            key: "node_type_id", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"],
            render: (item) => {
                const domain = getTypeDomain(item.node_type_id);
                const color = DOMAIN_COLORS[domain] || "#6b7280";
                return (<span style={{ padding: "2px 8px", borderRadius: "4px", background: color + "20", color, fontSize: "0.8rem", fontWeight: 600 }}>{getTypeLabel(item.node_type_id)}</span>);
            },
        },
        {
            key: "domain", header: i18n.catalog["text_d197ebe8e67a"], dataLabel: i18n.catalog["text_d197ebe8e67a"],
            render: (item) => {
                const domain = getTypeDomain(item.node_type_id);
                return <span style={{ color: DOMAIN_COLORS[domain] || "#6b7280", fontWeight: 500, fontSize: "0.8rem" }}>{domain}</span>;
            },
        },
        {
            key: "name", header: i18n.catalog["text_52ab09847cf8"], dataLabel: i18n.catalog["text_52ab09847cf8"],
            render: (item) => (item.attributes_json as Record<string, unknown>)?.name as string || "-",
        },
        {
            key: "links", header: i18n.catalog["text_d814da6b7a05"], dataLabel: i18n.catalog["text_d814da6b7a05"],
            render: (item) => {
                const out = item.outgoing_links?.length ?? 0;
                const inc = item.incoming_links?.length ?? 0;
                return (
                    <div style={{ display: "flex", gap: "4px", fontSize: "0.75rem" }}>
                        <span title={i18n.catalog["text_0bbca6cfeedf"]} style={{ color: "#3b82f6" }}>↑{out}</span>
                        <span title={i18n.catalog["text_32a6b085ca6d"]} style={{ color: "#10b981" }}>↓{inc}</span>
                    </div>
                );
            },
        },
        {
            key: "validity", header: i18n.catalog["text_9f9b2c7c5fa3"], dataLabel: i18n.catalog["text_9f9b2c7c5fa3"],
            render: (item) => {
                if (!item.valid_from && !item.valid_to) return <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>—</span>;
                return (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                        {item.valid_from?.substring(0, 10) || "∞"} → {item.valid_to?.substring(0, 10) || "∞"}
                    </span>
                );
            },
        },
        {
            key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"],
            render: (item) => (
                <span className={`badge ${item.status === "active" ? "badge-success" : item.status === "inactive" ? "badge-warning" : "badge-secondary"}`}>
                    {item.status === "active" ? i18n.catalog["text_629e90b3af3d"] : item.status === "inactive" ? i18n.catalog["text_b719ac8add4e"] : i18n.catalog["text_9d1b78e3b949"]}
                </span>
            ),
        },
        {
            key: "actions", header: i18n.catalog["text_7797240d6caf"], dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        { icon: "edit", title: i18n.catalog["text_113d570d6555"], variant: "edit", onClick: () => openEditDialog(item) },
                        { icon: "trash", title: i18n.catalog["text_59ca629220a6"], variant: "delete", onClick: () => confirmDelete(item.node_uuid) },
                    ]}
                />
            ),
        },
    ];

    /* ────────────────────────────────────────────── */
    /*  Initial Setup Experience (zero nodes)         */
    /* ────────────────────────────────────────────── */
    const showInitialSetup = initialDataLoaded && !isLoading && nodes.length === 0 && metaTypes.length > 0;

    if (showInitialSetup && !formDialog) {
        return (
            <>
                <InitialNodeSetup
                    {...formProps}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </>
        );
    }

    return (
        <>
            <div className="sales-card animate-fade">

                <PageSubHeader
                    title={i18n.catalog["text_c677033cfd4c"]}
                    subTitle={i18n.catalog["text_8eec5d845d11"]}
                    titleIcon="sitemap"
                    searchInput={
                        <SearchableSelect
                            value={null}
                            options={nodes.map(n => ({
                                value: n.node_uuid,
                                label: catalogText(i18n, "text_2a9059a3c52f", { value0: n.code, value1: (n.attributes_json as any)?.name || '' }),
                                subtitle: getTypeLabel(n.node_type_id)
                            }))}
                            onChange={(val) => {
                                if (val) {
                                    const node = nodes.find(n => n.node_uuid === val);
                                    if (node) openEditDialog(node);
                                }
                            }}
                            onSearch={(term) => setSearchTerm(term)}
                            placeholder={i18n.catalog["text_5707c58f40d2"]}
                        />
                    }
                    actions={
                        <>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                {selectedUuids.size > 0 && (
                                    <Button variant="secondary" icon="edit" onClick={() => setBulkDialog(true)}>
                                        {i18n.catalog["text_8786c463ec42"]}{selectedUuids.size})
                                    </Button>
                                )}
                                <Button variant="primary" icon="plus" onClick={openAddDialog}>{i18n.catalog["text_8b7ffe548e72"]}</Button>
                            </div>
                        </>
                    }
                />
                <PageSubHeader
                    searchInput={
                        nodes.length > 0 ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                <Checkbox
                                    checked={selectedUuids.size === nodes.length && nodes.length > 0}
                                    onChange={toggleSelectAll}
                                    label={catalogText(i18n, "text_34cf14a4fe2b", { value0: nodes.length })}
                                />
                            </div>
                        ) : (<Select
                            value={filterDomain}
                            onChange={(e) => { setFilterDomain(e.target.value); setFilterType(""); }}
                            style={{ maxWidth: "220px" }}
                            options={[
                                { value: "", label: i18n.catalog["text_89a4eea1bc00"] },
                                ...domains.map((d) => ({ value: d, label: d }))
                            ]}
                        />)
                    }
                    actions={
                        <>
                            {nodes.length > 0 && (<Select
                                value={filterDomain}
                                onChange={(e) => { setFilterDomain(e.target.value); setFilterType(""); }}
                                style={{ maxWidth: "220px" }}
                                options={[
                                    { value: "", label: i18n.catalog["text_89a4eea1bc00"] },
                                    ...domains.map((d) => ({ value: d, label: d }))
                                ]}
                            />)}

                            <Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{ maxWidth: "220px" }}
                                options={[
                                    { value: "", label: i18n.catalog["text_76b1679edecf"] },
                                    ...filteredMetaTypes.map((t) => ({ value: t.id, label: t.display_name_ar || t.display_name })),
                                ]}
                            />
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ maxWidth: "220px" }}
                                options={
                                    [
                                        { value: "", label: i18n.catalog["text_1ef213109d57"] },
                                        { value: "active", label: i18n.catalog["text_629e90b3af3d"] },
                                        { value: "inactive", label: i18n.catalog["text_b719ac8add4e"] },
                                        { value: "archived", label: i18n.catalog["text_9d1b78e3b949"] },
                                    ]
                                }

                            />
                            <Button variant="secondary" onClick={loadNodes}>{i18n.catalog["text_d0f6edcf6d65"]}</Button>
                        </>
                    }
                />

                <Table columns={nodeColumns} data={nodes} keyExtractor={(item) => item.node_uuid} emptyMessage={i18n.catalog["text_0ed477f32881"]} isLoading={isLoading} />
                <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {i18n.catalog["text_97bd2075da0f"]}{nodes.length} {i18n.catalog["text_584f05614c76"]}</div>
            </div >

            {/* Add/Edit Dialog */}
            <NodeFormDialog
                isOpen={formDialog}
                onClose={() => setFormDialog(false)}
                onSubmit={handleSubmit}
                {...formProps}
            />

            {/* Bulk Status Dialog */}
            <Dialog
                isOpen={bulkDialog}
                onClose={() => setBulkDialog(false)}
                title={catalogText(i18n, "text_7e5bd2fed66a", { value0: selectedUuids.size })}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setBulkDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button variant="primary" onClick={handleBulkStatus}>{i18n.catalog["text_dcf45bf69058"]}</Button>
                    </>
                }
            >
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    {i18n.catalog["text_07ce1eb3380c"]}{selectedUuids.size} {i18n.catalog["text_cb5510a0ad97"]}</p>
                <Select label={i18n.catalog["text_9c0468e01fbb"]} value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
                    options={
                        [
                            { value: "active", label: i18n.catalog["text_45bde9fdafc3"] },
                            { value: "inactive", label: i18n.catalog["text_ad16cd513d7f"] },
                            { value: "archived", label: i18n.catalog["text_a1251f0700cd"] },
                        ]
                    }
                />
            </Dialog>

            <ConfirmDialog isOpen={confirmDialog} onClose={() => setConfirmDialog(false)} onConfirm={handleDelete}
                title={i18n.catalog["text_5f9cb54dc136"]} message={i18n.catalog["text_5a31ec6592a8"]} confirmText={i18n.catalog["text_59ca629220a6"]} confirmVariant="danger" />
        </>
    );
}
