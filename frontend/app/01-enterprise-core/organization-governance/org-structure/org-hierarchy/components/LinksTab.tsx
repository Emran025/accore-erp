"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Checkbox, Column, ConfirmDialog, Dialog, showToast, Table } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { useCallback, useEffect, useState } from "react";
import { DOMAIN_COLORS } from "../(pages)/ui/index";

interface MetaType { id: string; display_name: string; display_name_ar?: string; level_domain: string; }
interface StructureNode { node_uuid: string; node_type_id: string; code: string; attributes_json?: Record<string, unknown>; status: string; meta_type?: MetaType; }
interface StructureLink {
    id: number; source_node_uuid: string; target_node_uuid: string; link_type: string;
    topology_rule_id: number; priority: number; valid_from?: string; valid_to?: string;
    source_node?: StructureNode; target_node?: StructureNode;
    topology_rule?: { cardinality: string; description?: string };
}
interface TopologyRule { id: number; source_node_type_id: string; target_node_type_id: string; cardinality: string; description?: string; }

export function LinksTab() {
    const { t: i18n } = useI18n();
    const [nodes, setNodes] = useState<StructureNode[]>([]);
    const [metaTypes, setMetaTypes] = useState<MetaType[]>([]);
    const [topologyRules, setTopologyRules] = useState<TopologyRule[]>([]);
    const [links, setLinks] = useState<StructureLink[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [addDialog, setAddDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedLink, setSelectedLink] = useState<StructureLink | null>(null);
    const [sourceUuid, setSourceUuid] = useState("");
    const [targetUuid, setTargetUuid] = useState("");
    const [linkType, setLinkType] = useState("assignment");
    const [priority, setPriority] = useState("0");
    const [validFrom, setValidFrom] = useState("");
    const [validTo, setValidTo] = useState("");
    const [filterSourceType, setFilterSourceType] = useState("");
    const [filterTargetType, setFilterTargetType] = useState("");
    const [filterLinkType, setFilterLinkType] = useState("");
    const [showActiveOnly, setShowActiveOnly] = useState(false);

    const loadAll = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (filterSourceType) params.set("source_type", filterSourceType);
            if (filterTargetType) params.set("target_type", filterTargetType);
            if (filterLinkType) params.set("link_type", filterLinkType);
            if (showActiveOnly) params.set("active_only", "1");

            const [linksRes, nodesRes, metaRes, rulesRes] = await Promise.all([
                fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.ORG.LINKS}?${params}`),
                fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODES),
                fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.META_TYPES),
                fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.TOPOLOGY_RULES),
            ]);
            setLinks((linksRes.links as StructureLink[]) || []);
            setNodes((nodesRes.nodes as StructureNode[]) || []);
            setMetaTypes((metaRes.meta_types as MetaType[]) || []);
            setTopologyRules((rulesRes.topology_rules as TopologyRule[]) || []);
        } catch { showToast(i18n.catalog["text_f10d2b4c7fe1"], "error"); }
        finally { setIsLoading(false); }
    }, [filterSourceType, filterTargetType, filterLinkType, showActiveOnly]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const getTypeLabel = (id: string) => metaTypes.find((t) => t.id === id)?.display_name_ar || metaTypes.find((t) => t.id === id)?.display_name || id;
    const getTypeDomain = (id: string) => metaTypes.find((t) => t.id === id)?.level_domain || "";
    const getNodeLabel = (node?: StructureNode) => {
        if (!node) return "—";
        const name = (node.attributes_json?.name as string) || "";
        const domain = getTypeDomain(node.node_type_id);
        const color = DOMAIN_COLORS[domain] || "#6b7280";
        return (
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ padding: "1px 6px", borderRadius: "4px", background: color + "18", color, fontSize: "0.7rem", fontWeight: 600 }}>
                    {getTypeLabel(node.node_type_id)}
                </span>
                <strong style={{ fontSize: "0.85rem" }}>{node.code}</strong>
                {name && <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>({name})</span>}
            </div>
        );
    };

    const isLinkActive = (link: StructureLink) => {
        if (!link.valid_to) return true;
        return new Date(link.valid_to) >= new Date();
    };

    const handleCreateLink = async () => {
        if (!sourceUuid || !targetUuid) { showToast(i18n.catalog["text_d74281aef4a9"], "error"); return; }
        try {
            await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.LINKS, {
                method: "POST",
                body: JSON.stringify({
                    source_node_uuid: sourceUuid, target_node_uuid: targetUuid,
                    link_type: linkType, priority: parseInt(priority) || 0,
                    valid_from: validFrom || null, valid_to: validTo || null,
                }),
            });
            showToast(i18n.catalog["text_140d2acd0163"], "success");
            resetForm(); setAddDialog(false); loadAll();
        } catch (e: unknown) {
            showToast((e as { message?: string })?.message || i18n.catalog["text_2e0042b09f88"], "error");
        }
    };

    const openEditDialog = (link: StructureLink) => {
        setSelectedLink(link);
        setLinkType(link.link_type || "assignment");
        setPriority(String(link.priority || 0));
        setValidFrom(link.valid_from?.substring(0, 10) || "");
        setValidTo(link.valid_to?.substring(0, 10) || "");
        setEditDialog(true);
    };

    const handleUpdateLink = async () => {
        if (!selectedLink) return;
        try {
            await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.LINK(selectedLink.id), {
                method: "PUT",
                body: JSON.stringify({
                    link_type: linkType, priority: parseInt(priority) || 0,
                    valid_from: validFrom || null, valid_to: validTo || null,
                }),
            });
            showToast(i18n.catalog["text_477c01458f77"], "success");
            setEditDialog(false); setSelectedLink(null); loadAll();
        } catch (e: unknown) {
            showToast((e as { message?: string })?.message || i18n.catalog["text_133019abccaa"], "error");
        }
    };

    const confirmDeleteLink = (link: StructureLink) => {
        setSelectedLink(link);
        setDeleteDialog(true);
    };

    const handleDeleteLink = async () => {
        if (!selectedLink) return;
        try {
            await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.LINK(selectedLink.id), { method: "DELETE" });
            showToast(i18n.catalog["text_e3b49d492a2a"], "success");
            setDeleteDialog(false); setSelectedLink(null); loadAll();
        } catch (e: unknown) {
            showToast((e as { message?: string })?.message || i18n.catalog["text_3bdb299872fb"], "error");
        }
    };

    const resetForm = () => {
        setSourceUuid(""); setTargetUuid(""); setLinkType("assignment");
        setPriority("0"); setValidFrom(""); setValidTo("");
    };

    // Get valid targets based on topology rules
    const getValidTargets = () => {
        if (!sourceUuid) return [];
        const sourceNode = nodes.find((n) => n.node_uuid === sourceUuid);
        if (!sourceNode) return [];
        const validTargetTypes = topologyRules
            .filter((r) => r.source_node_type_id === sourceNode.node_type_id)
            .map((r) => r.target_node_type_id);
        return nodes.filter((n) => validTargetTypes.includes(n.node_type_id) && n.node_uuid !== sourceUuid);
    };

    const uniqueTypes = [...new Set(metaTypes.map(t => t.id))];

    const linkColumns: Column<StructureLink>[] = [
        { key: "id", header: "#", dataLabel: "#", render: (l) => <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{l.id}</span> },
        { key: "source", header: i18n.catalog["text_b09a92d06205"], dataLabel: i18n.catalog["text_64660bb87d89"], render: (l) => getNodeLabel(l.source_node) },
        {
            key: "arrow", header: "", dataLabel: "",
            render: (l) => {
                const card = l.topology_rule?.cardinality || "—";
                return (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ color: "var(--primary)", fontSize: "1rem" }}>→</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{card}</div>
                    </div>
                );
            },
        },
        { key: "target", header: i18n.catalog["text_d46024b07e28"], dataLabel: i18n.catalog["text_acd37606a532"], render: (l) => getNodeLabel(l.target_node) },
        {
            key: "link_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"],
            render: (l) => <span className="badge badge-primary" style={{ fontSize: "0.72rem" }}>{l.link_type || "assignment"}</span>,
        },
        {
            key: "priority", header: i18n.catalog["text_4c3e5a87f1e4"], dataLabel: i18n.catalog["text_4c3e5a87f1e4"],
            render: (l) => <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{l.priority ?? 0}</span>,
        },
        {
            key: "validity", header: i18n.catalog["text_9f9b2c7c5fa3"], dataLabel: i18n.catalog["text_9f9b2c7c5fa3"],
            render: (l) => {
                const active = isLinkActive(l);
                if (!l.valid_from && !l.valid_to) return <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{i18n.catalog["text_027ff6a71aca"]}</span>;
                return (
                    <div style={{ fontSize: "0.72rem" }}>
                        <span style={{ color: active ? "var(--text-secondary)" : "var(--danger)" }}>
                            {l.valid_from?.substring(0, 10) || "∞"} → {l.valid_to?.substring(0, 10) || "∞"}
                        </span>
                        {!active && <span className="badge badge-danger" style={{ fontSize: "0.6rem", marginRight: "4px" }}>{i18n.catalog["text_6217883aee8e"]}</span>}
                    </div>
                );
            },
        },
        {
            key: "actions",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (l) => (
                <ActionButtons
                    actions={[
                        { icon: "edit", title: i18n.catalog["text_113d570d6555"], variant: "edit", onClick: () => openEditDialog(l) },
                        { icon: "trash", title: i18n.catalog["text_59ca629220a6"], variant: "delete", onClick: () => confirmDeleteLink(l) },
                    ]}
                />
            ),
        },
    ];

    return (
        <>
            <div className="sales-card animate-fade">
                <PageSubHeader
                    title={i18n.catalog["text_eeb19f5c12b4"]}
                    subTitle={i18n.catalog["text_321c9b05d85e"]}
                    titleIcon="link"
                    actions={
                        <>
                            <Select value={filterSourceType} onChange={(e) => setFilterSourceType(e.target.value)} style={{ maxWidth: "160px" }}
                                options={[
                                    { value: "", label: i18n.catalog["text_08ae725dc95b"] },
                                    ...uniqueTypes.map(t => ({ value: t, label: getTypeLabel(t) }))
                                ]}
                                />
                            <Select value={filterTargetType} onChange={(e) => setFilterTargetType(e.target.value)} style={{ maxWidth: "160px" }}
                                options={[
                                    { value: "", label: i18n.catalog["text_f610b41ff83b"] },
                                    ...uniqueTypes.map(t => ({ value: t, label: getTypeLabel(t) }))
                                ]}
                                />
                            <Select value={filterLinkType} onChange={(e) => setFilterLinkType(e.target.value)} style={{ maxWidth: "130px" }}
                                options={[
                                    { value: "", label: i18n.catalog["text_1b83e218a94e"] },
                                    { value: "assignment", label: i18n.catalog["text_961e2be91215"] },
                                    { value: "reporting", label: i18n.catalog["text_a4f428ac9186"] }
                                ]}
                                />
                            <Checkbox
                                label={i18n.catalog["text_9878ba4f645f"]}
                                checked={showActiveOnly}
                                onChange={(e) => setShowActiveOnly(e.target.checked)}
                            />

                            <Button variant="primary" icon="plus" onClick={() => { resetForm(); setAddDialog(true); }}>{i18n.catalog["text_d0b4e4ad3969"]}</Button>
                        </>}
                />

                {/* Summary stats */}
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", fontSize: "0.8rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{i18n.catalog["text_97bd2075da0f"]}<strong>{links.length}</strong></span>
                    <span style={{ color: "#10b981" }}>{i18n.catalog["text_e51dbd6a615c"]}<strong>{links.filter(l => isLinkActive(l)).length}</strong></span>
                    <span style={{ color: "#ef4444" }}>{i18n.catalog["text_d06f63422796"]}<strong>{links.filter(l => !isLinkActive(l)).length}</strong></span>
                </div>

                <Table columns={linkColumns} data={links} keyExtractor={(l) => String(l.id)} emptyMessage={i18n.catalog["text_0064b6c86937"]} isLoading={isLoading} />
            </div>

            {/* Create Link Dialog */}
            <Dialog isOpen={addDialog} onClose={() => setAddDialog(false)} title={i18n.catalog["text_3b668df62e4b"]}
                footer={<><Button variant="secondary" onClick={() => setAddDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleCreateLink}>{i18n.catalog["text_a820f3590d36"]}</Button></>}>
                <div className="form-group">
                    <Select label={i18n.catalog["text_a2cb6b31b114"]} value={sourceUuid} onChange={(e) => { setSourceUuid(e.target.value); setTargetUuid(""); }}>
                        <option value="">{i18n.catalog["text_b12d1b28a69f"]}</option>
                        {nodes.map((n) => <option key={n.node_uuid} value={n.node_uuid}>{n.code} — {getTypeLabel(n.node_type_id)}{(n.attributes_json?.name as string) ? catalogText(i18n, "text_239f04bc2797", { value0: n.attributes_json?.name }) : ""}</option>)}
                    </Select>
                </div>
                <div className="form-group">
                    <Select label={i18n.catalog["text_0e7983e3f1d4"]} value={targetUuid} onChange={(e) => setTargetUuid(e.target.value)} disabled={!sourceUuid}>
                        <option value="">{i18n.catalog["text_599100cb5f57"]}</option>
                        {getValidTargets().map((n) => <option key={n.node_uuid} value={n.node_uuid}>{n.code} — {getTypeLabel(n.node_type_id)}{(n.attributes_json?.name as string) ? catalogText(i18n, "text_239f04bc2797", { value0: n.attributes_json?.name }) : ""}</option>)}
                    </Select>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <Select label={i18n.catalog["text_5b78766d649e"]} value={linkType} onChange={(e) => setLinkType(e.target.value)}>
                            <option value="assignment">{i18n.catalog["text_14fca48a1f80"]}</option>
                            <option value="reporting">{i18n.catalog["text_6194e0349207"]}</option>
                        </Select>
                    </div>
                    <div className="form-group">
                        <TextInput label={i18n.catalog["text_4c3e5a87f1e4"]} type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
                    </div>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.5rem 0 0.25rem" }}>
                    {getIcon("calendar")} {i18n.catalog["text_6519c8c79051"]}</p>
                <div className="form-row">
                    <div className="form-group">
                        <TextInput label={i18n.catalog["text_4d7d679f7b4c"]} type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <TextInput label={i18n.catalog["text_08b034994862"]} type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
                    </div>
                </div>
                {sourceUuid && (
                    <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: "var(--bg-secondary)", borderRadius: "6px", fontSize: "0.75rem" }}>
                        <strong>{i18n.catalog["text_69c6b9109c48"]}</strong>
                        {topologyRules
                            .filter((r) => r.source_node_type_id === nodes.find((n) => n.node_uuid === sourceUuid)?.node_type_id)
                            .map((r) => (
                                <div key={r.id} style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                                    → {getTypeLabel(r.target_node_type_id)} ({r.cardinality}) — {r.description || ""}
                                </div>
                            ))}
                    </div>
                )}
            </Dialog>

            {/* Edit Link Dialog */}
            <Dialog isOpen={editDialog} onClose={() => setEditDialog(false)} title={i18n.catalog["text_91dbf81d524c"]}
                footer={<><Button variant="secondary" onClick={() => setEditDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button><Button variant="primary" onClick={handleUpdateLink}>{i18n.catalog["text_00eab31f95b7"]}</Button></>}>
                {selectedLink && (
                    <>
                        <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                <strong>{selectedLink.source_node?.code}</strong>
                                <span style={{ color: "var(--primary)" }}>→</span>
                                <strong>{selectedLink.target_node?.code}</strong>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                    ({selectedLink.topology_rule?.cardinality || "—"})
                                </span>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <Select label={i18n.catalog["text_5b78766d649e"]} value={linkType} onChange={(e) => setLinkType(e.target.value)}>
                                    <option value="assignment">{i18n.catalog["text_14fca48a1f80"]}</option>
                                    <option value="reporting">{i18n.catalog["text_6194e0349207"]}</option>
                                </Select>
                            </div>
                            <div className="form-group">
                                <TextInput label={i18n.catalog["text_4c3e5a87f1e4"]} type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
                            </div>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.5rem 0 0.25rem" }}>
                            {getIcon("calendar")} {i18n.catalog["text_0a3d340761f4"]}</p>
                        <div className="form-row">
                            <div className="form-group">
                                <TextInput label={i18n.catalog["text_4d7d679f7b4c"]} type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <TextInput label={i18n.catalog["text_08b034994862"]} type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
                            </div>
                        </div>
                    </>
                )}
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog isOpen={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDeleteLink}
                title={i18n.catalog["text_e3ae438dd709"]}
                message={catalogText(i18n, "text_5a290c8d037e", { value0: selectedLink?.source_node?.code || "?", value1: selectedLink?.target_node?.code || "?" })}
                confirmText={i18n.catalog["text_59ca629220a6"]} confirmVariant="danger" />
        </>
    );
}
