"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { useState, useEffect, useCallback } from "react";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Dialog, ConfirmDialog, Button, showAlert, Table, Column, ActionButtons, TabNavigation, Tab } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { NumberInput } from "@/components/ui/NumberInput";
import { getIcon } from "@/lib/icons";
import { NrObjectHeader } from "./components/NrObjectHeader";
import { DomainFullnessPanel } from "./components/DomainFullnessPanel";
import { ExpansionLogsPanel } from "./components/ExpansionLogsPanel";
import type { NrObject, NrGroup, NrInterval, NrAssignment, NrObjectFull } from "./types";
import { PageSubHeader } from "../layout";

// ══════════════════════════════════════════════════════════════
//  Props
// ══════════════════════════════════════════════════════════════

interface NumberRangeManagerProps {
    /** The entity type key must match a registered NR Object (e.g. "employees", "customers") */
    objectType: string;
    /** Arabic title to display */
    title?: string;
    /** Whether to show the initial object setup if none exists */
    allowObjectCreation?: boolean;
    /** Default numbering config used when auto-creating the NR Object */
    defaultConfig?: {
        name: string;
        name_en?: string;
        number_length?: number;
        prefix?: string;
    };
}

// ══════════════════════════════════════════════════════════════
//  Component
// ══════════════════════════════════════════════════════════════

export function NumberRangeManager({
    objectType,
    title,
    allowObjectCreation = true,
    defaultConfig,
}: NumberRangeManagerProps) {
    const { t: i18n } = useI18n();
    // ── State ─────────────────────────────────────────────────
    const [objectData, setObjectData] = useState<NrObjectFull | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("groups");

    // Object setup dialog
    const [setupDialog, setSetupDialog] = useState(false);
    const [setupName, setSetupName] = useState(defaultConfig?.name || "");
    const [setupNameEn, setSetupNameEn] = useState(defaultConfig?.name_en || "");
    const [setupLength, setSetupLength] = useState(String(defaultConfig?.number_length || 8));
    const [setupPrefix, setSetupPrefix] = useState(defaultConfig?.prefix || "");

    // Group dialog
    const [groupDialog, setGroupDialog] = useState(false);
    const [editGroupId, setEditGroupId] = useState<number | null>(null);
    const [groupCode, setGroupCode] = useState("");
    const [groupName, setGroupName] = useState("");
    const [groupNameEn, setGroupNameEn] = useState("");
    const [groupDesc, setGroupDesc] = useState("");

    // Interval dialog
    const [intervalDialog, setIntervalDialog] = useState(false);
    const [editIntervalId, setEditIntervalId] = useState<number | null>(null);
    const [intCode, setIntCode] = useState("");
    const [intDesc, setIntDesc] = useState("");
    const [intFrom, setIntFrom] = useState("");
    const [intTo, setIntTo] = useState("");
    const [intExternal, setIntExternal] = useState("false");

    // Assignment dialog
    const [assignDialog, setAssignDialog] = useState(false);
    const [assignGroupId, setAssignGroupId] = useState("");
    const [assignIntervalId, setAssignIntervalId] = useState("");

    // Expansion dialog
    const [expandDialog, setExpandDialog] = useState(false);
    const [expandIntervalId, setExpandIntervalId] = useState<number | null>(null);
    const [expandNewTo, setExpandNewTo] = useState("");
    const [expandReason, setExpandReason] = useState("");

    // Expansion logs
    const [logsDialog, setLogsDialog] = useState(false);
    const [logsIntervalId, setLogsIntervalId] = useState<number | null>(null);

    // Delete confirm
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: number } | null>(null);

    // ── Load Data ─────────────────────────────────────────────
    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.OBJECTS.byType(objectType));
            if (res.success && res.id) {
                setObjectData(res as unknown as NrObjectFull);
            } else {
                setObjectData(null);
            }
        } catch {
            setObjectData(null);
        } finally {
            setIsLoading(false);
        }
    }, [objectType]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── Object Setup ──────────────────────────────────────────
    const createObject = async () => {
        if (!setupName || !setupLength) {
            showAlert("nr-alert", i18n.catalog["text_7b758312f829"], "error");
            return;
        }
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.OBJECTS.BASE, {
                method: "POST",
                body: JSON.stringify({
                    object_type: objectType,
                    name: setupName,
                    name_en: setupNameEn || null,
                    number_length: parseInt(setupLength),
                    prefix: setupPrefix || null,
                }),
            });
            if (res.success) {
                showAlert("nr-alert", i18n.catalog["text_85eabbc05825"], "success");
                setSetupDialog(false);
                await loadData();
            } else {
                showAlert("nr-alert", res.message || i18n.catalog["text_33807b6d3510"], "error");
            }
        } catch {
            showAlert("nr-alert", i18n.catalog["text_1ac65f6d78f4"], "error");
        }
    };

    // ── Group CRUD ─────────────────────────────────────────────
    const openAddGroup = () => {
        setEditGroupId(null);
        setGroupCode("");
        setGroupName("");
        setGroupNameEn("");
        setGroupDesc("");
        setGroupDialog(true);
    };

    const openEditGroup = (g: NrGroup) => {
        setEditGroupId(g.id);
        setGroupCode(g.code);
        setGroupName(g.name);
        setGroupNameEn(g.name_en || "");
        setGroupDesc(g.description || "");
        setGroupDialog(true);
    };

    const saveGroup = async () => {
        if (!groupCode || !groupName || !objectData) {
            showAlert("nr-alert", i18n.catalog["text_5ebd47e3ad9f"], "error");
            return;
        }
        try {
            const isEdit = editGroupId !== null;
            const url = isEdit
                ? API_ENDPOINTS.PLATFORM.NUMBER_RANGES.GROUPS.update(editGroupId!)
                : API_ENDPOINTS.PLATFORM.NUMBER_RANGES.GROUPS.create(objectData.id);
            const method = isEdit ? "PUT" : "POST";

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify({
                    code: groupCode,
                    name: groupName,
                    name_en: groupNameEn || null,
                    description: groupDesc || null,
                }),
            });
            if (res.success) {
                showAlert("nr-alert", isEdit ? i18n.catalog["text_9b163de55441"] : i18n.catalog["text_882db2502743"], "success");
                setGroupDialog(false);
                await loadData();
            } else {
                showAlert("nr-alert", res.message || i18n.catalog["text_b0dbba00004b"], "error");
            }
        } catch {
            showAlert("nr-alert", i18n.catalog["text_1ac65f6d78f4"], "error");
        }
    };

    // ── Interval CRUD ─────────────────────────────────────────
    const openAddInterval = () => {
        setEditIntervalId(null);
        setIntCode("");
        setIntDesc("");
        setIntFrom("");
        setIntTo("");
        setIntExternal("false");
        setIntervalDialog(true);
    };

    const openEditInterval = (iv: NrInterval) => {
        setEditIntervalId(iv.id);
        setIntCode(iv.code);
        setIntDesc(iv.description || "");
        setIntFrom(String(iv.from_number));
        setIntTo(String(iv.to_number));
        setIntExternal(iv.is_external ? "true" : "false");
        setIntervalDialog(true);
    };

    const saveInterval = async () => {
        if (!intCode || !intFrom || !intTo || !objectData) {
            showAlert("nr-alert", i18n.catalog["text_7b758312f829"], "error");
            return;
        }
        try {
            const isEdit = editIntervalId !== null;
            const url = isEdit
                ? API_ENDPOINTS.PLATFORM.NUMBER_RANGES.INTERVALS.update(editIntervalId!)
                : API_ENDPOINTS.PLATFORM.NUMBER_RANGES.INTERVALS.create(objectData.id);
            const method = isEdit ? "PUT" : "POST";

            const body: Record<string, unknown> = {
                code: intCode,
                description: intDesc || null,
                is_external: intExternal === "true",
            };
            if (!isEdit) {
                body.from_number = parseInt(intFrom);
                body.to_number = parseInt(intTo);
            }

            const res = await fetchAPI(url, { method, body: JSON.stringify(body) });
            if (res.success) {
                showAlert("nr-alert", isEdit ? i18n.catalog["text_753fa01bea3d"] : i18n.catalog["text_87d7138539e4"], "success");
                setIntervalDialog(false);
                await loadData();
            } else {
                showAlert("nr-alert", res.message || i18n.catalog["text_b0dbba00004b"], "error");
            }
        } catch {
            showAlert("nr-alert", i18n.catalog["text_1ac65f6d78f4"], "error");
        }
    };

    // ── Assignment CRUD ───────────────────────────────────────
    const openAssignment = () => {
        setAssignGroupId("");
        setAssignIntervalId("");
        setAssignDialog(true);
    };

    const saveAssignment = async () => {
        if (!assignGroupId || !assignIntervalId || !objectData) {
            showAlert("nr-alert", i18n.catalog["text_40ec18cd675a"], "error");
            return;
        }
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.ASSIGNMENTS.create(objectData.id), {
                method: "POST",
                body: JSON.stringify({
                    nr_group_id: parseInt(assignGroupId),
                    nr_interval_id: parseInt(assignIntervalId),
                }),
            });
            if (res.success) {
                showAlert("nr-alert", i18n.catalog["text_7abf4fcd9dd0"], "success");
                setAssignDialog(false);
                await loadData();
            } else {
                showAlert("nr-alert", res.message || i18n.catalog["text_71819ae001d1"], "error");
            }
        } catch {
            showAlert("nr-alert", i18n.catalog["text_1ac65f6d78f4"], "error");
        }
    };

    // ── Expand Interval ───────────────────────────────────────
    const openExpand = (iv: NrInterval) => {
        setExpandIntervalId(iv.id);
        setExpandNewTo("");
        setExpandReason("");
        setExpandDialog(true);
    };

    const saveExpansion = async () => {
        if (!expandNewTo || !expandIntervalId) {
            showAlert("nr-alert", i18n.catalog["text_5b36a560d44f"], "error");
            return;
        }
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.INTERVALS.expand(expandIntervalId), {
                method: "POST",
                body: JSON.stringify({
                    new_to: parseInt(expandNewTo),
                    reason: expandReason || null,
                }),
            });
            if (res.success) {
                showAlert("nr-alert", i18n.catalog["text_107f5ee706f8"], "success");
                setExpandDialog(false);
                await loadData();
            } else {
                showAlert("nr-alert", res.message || i18n.catalog["text_7875cc0d732c"], "error");
            }
        } catch {
            showAlert("nr-alert", i18n.catalog["text_1ac65f6d78f4"], "error");
        }
    };

    // ── Delete Handler ────────────────────────────────────────
    const triggerDelete = (type: string, id: number) => {
        setDeleteTarget({ type, id });
        setConfirmDelete(true);
    };

    const executeDelete = async () => {
        if (!deleteTarget) return;
        try {
            let url = "";
            if (deleteTarget.type === "group") url = API_ENDPOINTS.PLATFORM.NUMBER_RANGES.GROUPS.delete(deleteTarget.id);
            else if (deleteTarget.type === "interval") url = API_ENDPOINTS.PLATFORM.NUMBER_RANGES.INTERVALS.delete(deleteTarget.id);
            else if (deleteTarget.type === "assignment") url = API_ENDPOINTS.PLATFORM.NUMBER_RANGES.ASSIGNMENTS.delete(deleteTarget.id);

            const res = await fetchAPI(url, { method: "DELETE" });
            if (res.success) {
                showAlert("nr-alert", i18n.catalog["text_12b6e3813b40"], "success");
                setConfirmDelete(false);
                setDeleteTarget(null);
                await loadData();
            } else {
                showAlert("nr-alert", res.message || i18n.catalog["text_f46bfc521612"], "error");
            }
        } catch {
            showAlert("nr-alert", i18n.catalog["text_1ac65f6d78f4"], "error");
        }
    };

    // ── Expansion Logs ────────────────────────────────────────
    const openLogs = (intervalId: number) => {
        setLogsIntervalId(intervalId);
        setLogsDialog(true);
    };

    // ── Tab Definitions ───────────────────────────────────────
    const tabs: Tab[] = [
        { key: "groups", label: i18n.catalog["text_d9f131dd2174"], icon: "layers" },
        { key: "intervals", label: i18n.catalog["text_c6419d513cea"], icon: "hash" },
        { key: "assignments", label: i18n.catalog["text_6df2d7ab183d"], icon: "link" },
        { key: "fullness", label: i18n.catalog["text_f1ad9f76489d"], icon: "pie-chart" },
    ];

    // ── Table Columns ─────────────────────────────────────────

    const groupColumns: Column<NrGroup>[] = [
        {
            key: "code", header: i18n.catalog["text_e28ef005ab68"], dataLabel: i18n.catalog["text_e28ef005ab68"],
            render: (item) => (
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent-primary)" }}>
                    {item.code}
                </span>
            ),
        },
        {
            key: "name", header: i18n.catalog["text_52ab09847cf8"], dataLabel: i18n.catalog["text_52ab09847cf8"], render: (item) => (
                <div>
                    <strong>{item.name}</strong>
                    {item.name_en && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.name_en}</div>}
                </div>
            )
        },
        { key: "description", header: i18n.catalog["text_95023fc76e1b"], dataLabel: i18n.catalog["text_95023fc76e1b"], render: (item) => item.description || "—" },
        {
            key: "is_active", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"],
            render: (item) => (
                <span className={`badge ${item.is_active ? "badge-success" : "badge-danger"}`}>
                    {item.is_active ? i18n.catalog["text_629e90b3af3d"] : i18n.catalog["text_21dc96b9f9f8"]}
                </span>
            ),
        },
        {
            key: "actions", header: i18n.catalog["text_7797240d6caf"], dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons actions={[
                    { icon: "edit", title: i18n.catalog["text_113d570d6555"], variant: "edit", onClick: () => openEditGroup(item) },
                    { icon: "trash", title: i18n.catalog["text_59ca629220a6"], variant: "delete", onClick: () => triggerDelete("group", item.id) },
                ]} />
            ),
        },
    ];

    const intervalColumns: Column<NrInterval>[] = [
        {
            key: "code", header: i18n.catalog["text_e28ef005ab68"], dataLabel: i18n.catalog["text_e28ef005ab68"],
            render: (item) => (
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent-primary)" }}>
                    {item.code}
                </span>
            ),
        },
        {
            key: "range", header: i18n.catalog["text_0713b3646ee7"], dataLabel: i18n.catalog["text_0713b3646ee7"],
            render: (item) => (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "monospace" }}>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>{item.from_number.toLocaleString()}</span>
                    <span style={{ color: "var(--text-muted)" }}>→</span>
                    <span style={{ color: "#3b82f6", fontWeight: 600 }}>{item.to_number.toLocaleString()}</span>
                </div>
            ),
        },
        {
            key: "current", header: i18n.catalog["text_35246be561fe"], dataLabel: i18n.catalog["text_0ca5d92c6fdf"],
            render: (item) => (
                <span style={{ fontFamily: "monospace", fontWeight: 600, color: item.current_number > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {item.current_number > 0 ? item.current_number.toLocaleString() : i18n.catalog["text_ad3e6bb12ee8"]}
                </span>
            ),
        },
        {
            key: "fullness", header: i18n.catalog["text_a0058b6e3c2d"], dataLabel: i18n.catalog["text_a0058b6e3c2d"],
            render: (item) => {
                const color = item.status === "critical" ? "#ef4444" : item.status === "warning" ? "#f59e0b" : "#10b981";
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{
                            width: "80px", height: "8px", borderRadius: "4px",
                            background: "var(--bg-tertiary)", overflow: "hidden",
                        }}>
                            <div style={{
                                width: `${Math.min(item.fullness_percent, 100)}%`,
                                height: "100%", borderRadius: "4px",
                                background: color, transition: "width 0.4s ease",
                            }} />
                        </div>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color, minWidth: "42px" }}>
                            {item.fullness_percent}%
                        </span>
                    </div>
                );
            },
        },
        {
            key: "remaining", header: i18n.catalog["text_b2127e3a35be"], dataLabel: i18n.catalog["text_b2127e3a35be"],
            render: (item) => (
                <span style={{ fontFamily: "monospace", color: item.remaining < 100 ? "#ef4444" : "var(--text-secondary)" }}>
                    {item.remaining.toLocaleString()}
                </span>
            ),
        },
        {
            key: "type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"],
            render: (item) => (
                <span className={`badge ${item.is_external ? "badge-warning" : "badge-primary"}`}>
                    {item.is_external ? i18n.catalog["text_48b8964443c2"] : i18n.catalog["text_2b1d660384e0"]}
                </span>
            ),
        },
        {
            key: "actions", header: i18n.catalog["text_7797240d6caf"], dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons actions={[
                    { icon: "maximize-2", title: i18n.catalog["text_c92a323a1343"], variant: "primary" as const, onClick: () => openExpand(item) },
                    { icon: "activity", title: i18n.catalog["text_e52cb276310f"], variant: "view" as const, onClick: () => openLogs(item.id) },
                    { icon: "edit", title: i18n.catalog["text_113d570d6555"], variant: "edit", onClick: () => openEditInterval(item) },
                    { icon: "trash", title: i18n.catalog["text_59ca629220a6"], variant: "delete", onClick: () => triggerDelete("interval", item.id), hidden: item.current_number > 0 },
                ]} />
            ),
        },
    ];

    const assignmentColumns: Column<NrAssignment>[] = [
        {
            key: "group", header: i18n.catalog["text_a73be01ddb83"], dataLabel: i18n.catalog["text_a73be01ddb83"],
            render: (item) => (
                <div>
                    <span className="badge badge-secondary" style={{ fontFamily: "monospace", marginInlineEnd: "0.4rem" }}>
                        {item.group?.code}
                    </span>
                    {item.group?.name}
                </div>
            ),
        },
        {
            key: "interval", header: i18n.catalog["text_0713b3646ee7"], dataLabel: i18n.catalog["text_0713b3646ee7"],
            render: (item) => (
                <div style={{ fontFamily: "monospace" }}>
                    <span className="badge badge-primary" style={{ marginInlineEnd: "0.4rem" }}>
                        {item.interval?.code}
                    </span>
                    <span style={{ color: "#10b981" }}>{item.interval?.from_number?.toLocaleString()}</span>
                    <span style={{ color: "var(--text-muted)", padding: "0 0.25rem" }}>→</span>
                    <span style={{ color: "#3b82f6" }}>{item.interval?.to_number?.toLocaleString()}</span>
                </div>
            ),
        },
        {
            key: "actions", header: i18n.catalog["text_7797240d6caf"], dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons actions={[
                    { icon: "trash", title: i18n.catalog["text_f684b7cd80d6"], variant: "delete", onClick: () => triggerDelete("assignment", item.id) },
                ]} />
            ),
        },
    ];

    // ── Loading State ─────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="nr-manager-loading">
                <div className="nr-spinner" />
                <p>{i18n.catalog["text_fb5cce8aee1f"]}</p>
            </div>
        );
    }

    // ── No Object — Setup Prompt ──────────────────────────────
    if (!objectData && allowObjectCreation) {
        return (
            <div className="nr-manager-container">
                <div id="nr-alert" />
                <div className="nr-setup-prompt">
                    <div className="nr-setup-icon">{getIcon("hash")}</div>
                    <h3>{i18n.catalog["text_1fb2f7d0de99"]}</h3>
                    <p>{i18n.catalog["text_ddbd5f016a39"]}</p>
                    <Button variant="primary" onClick={() => setSetupDialog(true)} icon="plus">
                        {i18n.catalog["text_1fb2f7d0de99"]}</Button>
                </div>

                <Dialog
                    isOpen={setupDialog}
                    onClose={() => setSetupDialog(false)}
                    title={i18n.catalog["text_1fb2f7d0de99"]}
                    maxWidth="520px"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setSetupDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                            <Button variant="primary" onClick={createObject}>{i18n.catalog["text_a820f3590d36"]}</Button>
                        </>
                    }
                >
                    <form onSubmit={(e) => { e.preventDefault(); createObject(); }}>
                        <div className="nr-info-banner">
                            <span className="nr-info-icon">{getIcon("info")}</span>
                            <span>{i18n.catalog["text_a2dd0448fcdc"]}</span>
                        </div>
                        <div className="form-row">
                            <TextInput label={i18n.catalog["text_b90b881d800d"]} id="nr-setup-name" value={setupName} onChange={(e) => setSetupName(e.target.value)} required className="flex-1" />
                            <TextInput label={i18n.catalog["text_07450d9ff8ed"]} id="nr-setup-name-en" value={setupNameEn} onChange={(e) => setSetupNameEn(e.target.value)} className="flex-1" />
                        </div>
                        <div className="form-row">
                            <NumberInput label={i18n.catalog["text_1cb26fb66890"]} id="nr-setup-length" value={setupLength} onChange={setSetupLength} min={1} max={20} className="flex-1" />
                            <TextInput label={i18n.catalog["text_de683d06206e"]} id="nr-setup-prefix" value={setupPrefix} onChange={(e) => setSetupPrefix(e.target.value)} className="flex-1" placeholder={i18n.catalog["text_5be93de51cfb"]} />
                        </div>
                    </form>
                </Dialog>
            </div>
        );
    }

    if (!objectData) return null;

    // ── Main Render ───────────────────────────────────────────
    return (
        <div className="nr-manager-container">
            <div id="nr-alert" />

            {/* ── Header ──────────────────────────────────────── */}
            <NrObjectHeader objectData={objectData} title={title} />

            {/* ── Tab Navigation ──────────────────────────────── */}
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {/* ── Tab Content ─────────────────────────────────── */}
            <div className="sales-card compact">

                {/* Groups Tab */}
                {activeTab === "groups" && (
                    <div>
                        <PageSubHeader
                            title={i18n.catalog["text_d9f131dd2174"]}
                            titleIcon="layers"
                            actions={
                                <Button variant="primary" icon="plus" onClick={openAddGroup}>
                                    {i18n.catalog["text_d36d9170c3cb"]}</Button>
                            }
                        />
                        <Table
                            columns={groupColumns}
                            data={objectData.groups || []}
                            keyExtractor={(item) => item.id}
                            emptyMessage={i18n.catalog["text_fd10a2b6dd0f"]}
                        />
                    </div>
                )}

                {/* Intervals Tab */}
                {activeTab === "intervals" && (
                    <div>
                        <PageSubHeader
                            title={i18n.catalog["text_c6419d513cea"]}
                            titleIcon="hash"
                            actions={
                                <Button variant="primary" icon="plus" onClick={openAddInterval}>
                                    {i18n.catalog["text_2dad54aebcc4"]}</Button>
                            }
                        />
                        <Table
                            columns={intervalColumns}
                            data={objectData.intervals || []}
                            keyExtractor={(item) => item.id}
                            emptyMessage={i18n.catalog["text_17b816b84544"]}
                        />
                    </div>
                )}

                {/* Assignments Tab */}
                {activeTab === "assignments" && (
                    <div>
                        <PageSubHeader
                            title={i18n.catalog["text_6df2d7ab183d"]}
                            titleIcon="link"
                            actions={
                                <Button variant="primary" icon="plus" onClick={openAssignment}>
                                    {i18n.catalog["text_e9d3483e8518"]}</Button>
                            }
                        />
                        <Table
                            columns={assignmentColumns}
                            data={objectData.assignments || []}
                            keyExtractor={(item) => item.id}
                            emptyMessage={i18n.catalog["text_dba3710e408f"]}
                        />
                    </div>
                )}

                {/* Fullness Tab */}
                {activeTab === "fullness" && (
                    <DomainFullnessPanel
                        intervals={objectData.intervals || []}
                        numberLength={objectData.number_length}
                        onExpand={openExpand}
                        onViewLogs={openLogs}
                    />
                )}
            </div>

            {/* ══════════════════ Dialogs ═══════════════════════ */}

            {/* Group Dialog */}
            <Dialog
                isOpen={groupDialog}
                onClose={() => setGroupDialog(false)}
                title={editGroupId ? i18n.catalog["text_7c57cf4e1134"] : i18n.catalog["text_6dfce4a268a5"]}
                maxWidth="520px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setGroupDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button variant="primary" onClick={saveGroup}>{i18n.catalog["text_ddfcaf9d0144"]}</Button>
                    </>
                }
            >
                <form onSubmit={(e) => { e.preventDefault(); saveGroup(); }}>
                    <div className="form-row">
                        <TextInput label={i18n.catalog["text_d7e401b615ba"]} id="grp-code" value={groupCode} onChange={(e) => setGroupCode(e.target.value)} required className="flex-1" placeholder={i18n.catalog["text_3a0b123c69c9"]} />
                    </div>
                    <div className="form-row">
                        <TextInput label={i18n.catalog["text_b90b881d800d"]} id="grp-name" value={groupName} onChange={(e) => setGroupName(e.target.value)} required className="flex-1" />
                        <TextInput label={i18n.catalog["text_07450d9ff8ed"]} id="grp-name-en" value={groupNameEn} onChange={(e) => setGroupNameEn(e.target.value)} className="flex-1" />
                    </div>
                    <Textarea label={i18n.catalog["text_95023fc76e1b"]} id="grp-desc" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} rows={2} />
                </form>
            </Dialog>

            {/* Interval Dialog */}
            <Dialog
                isOpen={intervalDialog}
                onClose={() => setIntervalDialog(false)}
                title={editIntervalId ? i18n.catalog["text_65d9cbc39add"] : i18n.catalog["text_a65c4621a72a"]}
                maxWidth="560px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIntervalDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button variant="primary" onClick={saveInterval}>{i18n.catalog["text_ddfcaf9d0144"]}</Button>
                    </>
                }
            >
                <form onSubmit={(e) => { e.preventDefault(); saveInterval(); }}>
                    <div className="nr-info-banner">
                        <span className="nr-info-icon">{getIcon("info")}</span>
                        <span>{i18n.catalog["text_98e9c9e2c7c6"]}{Number("9".repeat(objectData.number_length)).toLocaleString()}{i18n.catalog["text_543ae764b5c2"]}</span>
                    </div>
                    <div className="form-row">
                        <TextInput label={i18n.catalog["text_d7e401b615ba"]} id="int-code" value={intCode} onChange={(e) => setIntCode(e.target.value)} required className="flex-1" placeholder={i18n.catalog["text_be93852f887b"]} />
                        <Select
                            label={i18n.catalog["text_caa3f2bb4a36"]}
                            id="int-type"
                            value={intExternal}
                            onChange={(e) => setIntExternal(e.target.value)}
                            className="flex-1"
                            options={[
                                { value: "false", label: i18n.catalog["text_230d2cbaba15"] },
                                { value: "true", label: i18n.catalog["text_136bf8bd5b76"] },
                            ]}
                        />
                    </div>
                    {!editIntervalId && (
                        <div className="form-row">
                            <NumberInput label={i18n.catalog["text_650a13ff0c45"]} id="int-from" value={intFrom} onChange={setIntFrom} min={1} className="flex-1" />
                            <NumberInput label={i18n.catalog["text_f3177d026e93"]} id="int-to" value={intTo} onChange={setIntTo} min={1} className="flex-1" />
                        </div>
                    )}
                    {editIntervalId && (
                        <div className="nr-info-banner" style={{ background: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.3)" }}>
                            <span className="nr-info-icon" style={{ color: "#f59e0b" }}>{getIcon("alert-triangle")}</span>
                            <span>{i18n.catalog["text_ae9a74e54ff8"]}</span>
                        </div>
                    )}
                    <Textarea label={i18n.catalog["text_95023fc76e1b"]} id="int-desc" value={intDesc} onChange={(e) => setIntDesc(e.target.value)} rows={2} />
                </form>
            </Dialog>

            {/* Assignment Dialog */}
            <Dialog
                isOpen={assignDialog}
                onClose={() => setAssignDialog(false)}
                title={i18n.catalog["text_389eef0c2c4c"]}
                maxWidth="480px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setAssignDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button variant="primary" onClick={saveAssignment}>{i18n.catalog["text_8840978a5919"]}</Button>
                    </>
                }
            >
                <form onSubmit={(e) => { e.preventDefault(); saveAssignment(); }}>
                    <Select
                        label={i18n.catalog["text_b4d2e9c57446"]}
                        id="assign-group"
                        value={assignGroupId}
                        onChange={(e) => setAssignGroupId(e.target.value)}
                        options={[
                            { value: "", label: i18n.catalog["text_7954f0831481"] },
                            ...(objectData.groups || []).map(g => ({ value: String(g.id), label: catalogText(i18n, "text_ec39c7cc0c64", { value0: g.code, value1: g.name }) })),
                        ]}
                    />
                    <Select
                        label={i18n.catalog["text_3d9e903b1ce4"]}
                        id="assign-interval"
                        value={assignIntervalId}
                        onChange={(e) => setAssignIntervalId(e.target.value)}
                        options={[
                            { value: "", label: i18n.catalog["text_e094cb7c305d"] },
                            ...(objectData.intervals || []).map(iv => ({
                                value: String(iv.id),
                                label: catalogText(i18n, "text_c3ef9f4b12fa", { value0: iv.code, value1: iv.from_number.toLocaleString(), value2: iv.to_number.toLocaleString() }),
                            })),
                        ]}
                    />
                </form>
            </Dialog>

            {/* Expand Dialog */}
            <Dialog
                isOpen={expandDialog}
                onClose={() => setExpandDialog(false)}
                title={i18n.catalog["text_3c8b4eeae181"]}
                maxWidth="480px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setExpandDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button variant="primary" onClick={saveExpansion}>{i18n.catalog["text_e3f5bab05753"]}</Button>
                    </>
                }
            >
                <form onSubmit={(e) => { e.preventDefault(); saveExpansion(); }}>
                    <div className="nr-info-banner" style={{ background: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.3)" }}>
                        <span className="nr-info-icon" style={{ color: "#f59e0b" }}>{getIcon("alert-triangle")}</span>
                        <span>{i18n.catalog["text_5c49c2aac290"]}</span>
                    </div>
                    <NumberInput label={i18n.catalog["text_80f09dcbe4f0"]} id="expand-new-to" value={expandNewTo} onChange={setExpandNewTo} min={1} />
                    <Textarea label={i18n.catalog["text_13463bd693d0"]} id="expand-reason" value={expandReason} onChange={(e) => setExpandReason(e.target.value)} rows={2} placeholder={i18n.catalog["text_d724ac3e58c5"]} />
                </form>
            </Dialog>

            {/* Expansion Logs */}
            {logsDialog && logsIntervalId && (
                <ExpansionLogsPanel
                    intervalId={logsIntervalId}
                    isOpen={logsDialog}
                    onClose={() => setLogsDialog(false)}
                />
            )}

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={confirmDelete}
                onClose={() => { setConfirmDelete(false); setDeleteTarget(null); }}
                onConfirm={executeDelete}
                title={i18n.catalog["text_5f9cb54dc136"]}
                message={
                    deleteTarget?.type === "group" ? i18n.catalog["text_1cf407f0853b"]
                        : deleteTarget?.type === "interval" ? i18n.catalog["text_adf144448fae"]
                            : i18n.catalog["text_2eeb1db10345"]
                }
                confirmText={i18n.catalog["text_59ca629220a6"]}
                confirmVariant="danger"
            />
        </div>
    );
}
