"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { Button, Dialog } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Select } from "@/components/ui/select";
import { getIcon } from "@/lib/icons";
import { ReactNode, useMemo, useState } from "react";
import { DOMAIN_COLORS, DOMAIN_ICONS } from "../(pages)/ui/index";
import { MetaGrid, MetaItem } from "../(pages)/ui/MetaItem";
import { CheckItem } from "../(pages)/ui/StatusWidgets";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

export interface NodeFormData {
    node_type_id: string;
    code: string;
    status: string;
    target_node_uuid: string;
    validate_constraints: boolean;
    valid_from: string;
    valid_to: string;
}

/* ------------------------------------------------------------------ */
/*  Internal sub-components                                            */
/* ------------------------------------------------------------------ */

/** Section divider with icon + title */
function FormSection({ icon, title, subtitle, children }: {
    icon: string; title: string; subtitle?: string; children: ReactNode;
}) {
    return (
        <div style={{ marginBottom: "1.25rem" }}>
            <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                marginBottom: "0.6rem",
                paddingBottom: "0.4rem",
                borderBottom: "1px solid var(--border-color)",
            }}>
                <span style={{ color: "var(--primary)", fontSize: "1rem" }}>{getIcon(icon)}</span>
                <div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{title}</span>
                    {subtitle && (
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginInlineStart: "0.5rem" }}>
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

/** Wizard step indicator */
function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
    return (
        <div style={{
            display: "flex", justifyContent: "center", gap: "0.5rem",
            marginBottom: "1.5rem", padding: "0.75rem 0",
        }}>
            {steps.map((label, idx) => {
                const isActive = idx === current;
                const isDone = idx < current;
                return (
                    <div key={idx} style={{
                        display: "flex", alignItems: "center", gap: "0.35rem",
                    }}>
                        {idx > 0 && (
                            <div style={{
                                width: "28px", height: "2px",
                                background: isDone ? "var(--primary)" : "var(--border-color)",
                                transition: "background 0.3s",
                            }} />
                        )}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "0.35rem",
                            padding: "4px 10px", borderRadius: "20px",
                            background: isActive ? "var(--primary)" : isDone ? "var(--primary)" + "18" : "var(--bg-secondary)",
                            color: isActive ? "white" : isDone ? "var(--primary)" : "var(--text-muted)",
                            fontSize: "0.72rem", fontWeight: isActive ? 700 : 500,
                            transition: "all 0.3s",
                            whiteSpace: "nowrap",
                        }}>
                            {isDone ? getIcon("check") : (
                                <span style={{
                                    width: "16px", height: "16px", borderRadius: "50%",
                                    background: isActive ? "rgba(255,255,255,0.25)" : "var(--border-color)",
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.65rem", fontWeight: 700,
                                    color: isActive ? "white" : "var(--text-muted)",
                                }}>{idx + 1}</span>
                            )}
                            {label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  NodeFormContent — the actual form (used in both dialog & inline)   */
/* ------------------------------------------------------------------ */

interface NodeFormContentProps {
    formData: NodeFormData;
    setFormData: (data: NodeFormData) => void;
    dynamicAttrs: Record<string, string>;
    setDynamicAttrs: (attrs: Record<string, string>) => void;
    metaTypes: MetaType[];
    nodes: StructureNode[];
    topologyRules: TopologyRule[];
    selectedNode: StructureNode | null;
    getTypeLabel: (id: string) => string;
}

export function NodeFormContent({
    formData, setFormData, dynamicAttrs, setDynamicAttrs,
    metaTypes, nodes, topologyRules, selectedNode, getTypeLabel,
}: NodeFormContentProps) {
    const { t: i18n } = useI18n();
    const currentType = metaTypes.find(t => t.id === formData.node_type_id);
    const currentAttrs = currentType?.attributes || [];
    const domain = currentType?.level_domain || "";
    const domainColor = DOMAIN_COLORS[domain] || "#6b7280";

    const linkableNodes = useMemo(() => {
        if (selectedNode) return [];
        return nodes.filter(n =>
            topologyRules.some(r =>
                r.source_node_type_id === formData.node_type_id &&
                r.target_node_type_id === n.node_type_id
            )
        );
    }, [nodes, topologyRules, formData.node_type_id, selectedNode]);

    // grouped meta types by domain
    const domainGroups = useMemo(() => {
        const map = new Map<string, MetaType[]>();
        metaTypes.forEach(t => {
            const list = map.get(t.level_domain) || [];
            list.push(t);
            map.set(t.level_domain, list);
        });
        return map;
    }, [metaTypes]);

    return (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
            {/* ── Section 1: Node Type ── */}
            <FormSection icon="cube" title={i18n.catalog["text_0b7ee6a6a05b"]} subtitle={i18n.catalog["text_c2c7b1fab568"]}>
                {/* Domain indicator */}
                {domain && (
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "0.4rem",
                        marginBottom: "0.75rem", padding: "4px 10px",
                        borderRadius: "6px", background: domainColor + "12",
                        fontSize: "0.75rem", fontWeight: 600, color: domainColor,
                    }}>
                        {getIcon(DOMAIN_ICONS[domain] || "folder")} {domain}
                    </div>
                )}
                <div className="form-row">
                    <div className="form-group">
                        <Select
                            label={i18n.catalog["text_82248ad05ee3"]}
                            value={formData.node_type_id}
                            onChange={(e) => {
                                setFormData({ ...formData, node_type_id: e.target.value });
                                setDynamicAttrs({});
                            }}
                            disabled={!!selectedNode}
                        >
                            <option value="" disabled>{i18n.catalog["text_4e58e0bb0937"]}</option>
                            {Array.from(domainGroups.entries()).map(([groupDomain, types]) => (
                                <optgroup key={groupDomain} label={groupDomain}>
                                    {types.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.display_name_ar || t.display_name}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </Select>
                    </div>
                    <div className="form-group">
                        <TextInput
                            label={i18n.catalog["text_db5a52e0d40a"]}
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder={i18n.catalog["text_f3c8f331561b"]}
                        />
                    </div>
                </div>
            </FormSection>

            {/* ── Section 2: Dynamic Attributes ── */}
            {currentAttrs.length > 0 && (
                <FormSection
                    icon="clipboard-list"
                    title={i18n.catalog["text_8e5f319dd13f"]}
                    subtitle={catalogText(i18n, "text_7c6dc2294423", { value0: currentAttrs.filter(a => a.is_mandatory).length })}
                >
                    <div className="form-row" style={{ flexWrap: "wrap" }}>
                        {currentAttrs.map(attr => (
                            <div className="form-group" key={attr.attribute_key} style={{ minWidth: "200px" }}>
                                <TextInput
                                    label={catalogText(i18n, "text_82032eb13b31", { value0: attr.attribute_key, value1: attr.is_mandatory ? i18n.catalog["text_684888c0ebb1"] : "" })}
                                    value={dynamicAttrs[attr.attribute_key] || ""}
                                    onChange={(e) => setDynamicAttrs({
                                        ...dynamicAttrs,
                                        [attr.attribute_key]: e.target.value,
                                    })}
                                    placeholder={attr.is_mandatory ? i18n.catalog["text_c2c05049aa06"] : i18n.catalog["text_33408684704e"]}
                                />
                            </div>
                        ))}
                    </div>
                </FormSection>
            )}

            {/* ── Section 3: Effective Dating ── */}
            <FormSection icon="calendar" title={i18n.catalog["text_0a3d340761f4"]} subtitle={i18n.catalog["text_0c4fce9aa5c7"]}>
                <div className="form-row">
                    <div className="form-group">
                        <TextInput
                            label={i18n.catalog["text_7cc6a1a4756f"]}
                            type="date"
                            value={formData.valid_from}
                            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <TextInput
                            label={i18n.catalog["text_817b190b2a5c"]}
                            type="date"
                            value={formData.valid_to}
                            onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                        />
                    </div>
                </div>
            </FormSection>

            {/* ── Section 4: Link ── */}
            {!selectedNode && linkableNodes.length > 0 && (
                <FormSection icon="link" title={i18n.catalog["text_f75945dc12d4"]} subtitle={i18n.catalog["text_981775460360"]}>
                    <Select
                        label={i18n.catalog["text_10005f23c159"]}
                        value={formData.target_node_uuid}
                        onChange={(e) => setFormData({ ...formData, target_node_uuid: e.target.value })}
                    >
                        <option value="">{i18n.catalog["text_e73c5594d648"]}</option>
                        {linkableNodes.map(n => (
                            <option key={n.node_uuid} value={n.node_uuid}>
                                {n.code} — {getTypeLabel(n.node_type_id)}
                                {(n.attributes_json as Record<string, unknown>)?.name
                                    ? catalogText(i18n, "text_239f04bc2797", { value0: (n.attributes_json as Record<string, unknown>).name })
                                    : ""}
                            </option>
                        ))}
                    </Select>
                </FormSection>
            )}

            {/* ── Section 5: Status ── */}
            <FormSection icon="toggle-on" title={i18n.catalog["text_c3a4749caed4"]} subtitle="Status">
                <Select
                    label={i18n.catalog["text_c3a4749caed4"]}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                        { value: "active", label: i18n.catalog["text_45bde9fdafc3"] },
                        { value: "inactive", label: i18n.catalog["text_ad16cd513d7f"] },
                        { value: "archived", label: i18n.catalog["text_a1251f0700cd"] },
                    ]}
                />
            </FormSection>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  NodeFormDialog — wrapper Dialog (for subsequent adds / edits)      */
/* ------------------------------------------------------------------ */

interface NodeFormDialogProps extends NodeFormContentProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

export function NodeFormDialog({
    isOpen, onClose, onSubmit, selectedNode, ...formProps
}: NodeFormDialogProps) {
    const { t: i18n } = useI18n();
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={selectedNode ? i18n.catalog["text_382d355a1e42"] : i18n.catalog["text_cc7088ed3648"]}
            maxWidth="680px"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                    <Button variant="primary" icon="check" onClick={onSubmit}>
                        {selectedNode ? i18n.catalog["text_00eab31f95b7"] : i18n.catalog["text_d52453ac627d"]}
                    </Button>
                </>
            }
        >
            <NodeFormContent selectedNode={selectedNode} {...formProps} />
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/*  InitialNodeSetup — inline wizard for first-time node creation     */
/* ------------------------------------------------------------------ */

interface InitialNodeSetupProps extends NodeFormContentProps {
    onSubmit: () => void;
    isSubmitting?: boolean;
}

export function InitialNodeSetup({
    onSubmit, isSubmitting,
    formData, setFormData, dynamicAttrs, setDynamicAttrs,
    metaTypes, nodes, topologyRules, selectedNode, getTypeLabel,
}: InitialNodeSetupProps) {
    const { t: i18n } = useI18n();
    const [step, setStep] = useState(0);
    const STEPS = [i18n.catalog["text_3c51222bba70"], i18n.catalog["text_d8944574e4aa"], i18n.catalog["text_d2d4b7f9cfb5"]];

    const currentType = metaTypes.find(t => t.id === formData.node_type_id);
    const domain = currentType?.level_domain || "";
    const domainColor = DOMAIN_COLORS[domain] || "#6b7280";
    const currentAttrs = currentType?.attributes || [];

    // grouped meta types by domain for step 0
    const domainGroups = useMemo(() => {
        const map = new Map<string, MetaType[]>();
        metaTypes.forEach(t => {
            const list = map.get(t.level_domain) || [];
            list.push(t);
            map.set(t.level_domain, list);
        });
        return map;
    }, [metaTypes]);

    const canProceedStep0 = !!formData.node_type_id;
    const canProceedStep1 = formData.code.trim().length > 0 && currentAttrs
        .filter(a => a.is_mandatory)
        .every(a => (dynamicAttrs[a.attribute_key] || "").trim().length > 0);

    /* ── Step 0: Choose Domain & Type ── */
    const renderStep0 = () => (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Welcome header */}
            <div style={{
                textAlign: "center", marginBottom: "2rem",
                padding: "1.5rem", borderRadius: "12px",
                background: "linear-gradient(135deg, var(--primary)08, var(--primary)15)",
                border: "1px solid var(--primary)20",
            }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem", opacity: 0.8 }}>
                    {getIcon("sitemap")}
                </div>
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
                    {i18n.catalog["text_748536b699b7"]}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                    {i18n.catalog["text_a1c14902f908"]}</p>
            </div>

            {/* Domain cards grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "0.75rem", marginBottom: "1.5rem",
            }}>
                {Array.from(domainGroups.entries()).map(([groupDomain, types]) => {
                    const isSelected = domain === groupDomain;
                    const color = DOMAIN_COLORS[groupDomain] || "#6b7280";
                    const icon = DOMAIN_ICONS[groupDomain] || "folder";
                    return (
                        <div
                            key={groupDomain}
                            onClick={() => {
                                const firstType = types[0];
                                if (firstType) {
                                    setFormData({ ...formData, node_type_id: firstType.id });
                                    setDynamicAttrs({});
                                }
                            }}
                            style={{
                                padding: "1rem",
                                borderRadius: "10px",
                                border: `2px solid ${isSelected ? color : "var(--border-color)"}`,
                                background: isSelected ? color + "10" : "var(--bg-primary)",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                textAlign: "center",
                            }}
                            onMouseEnter={e => {
                                if (!isSelected) e.currentTarget.style.borderColor = color + "60";
                            }}
                            onMouseLeave={e => {
                                if (!isSelected) e.currentTarget.style.borderColor = "var(--border-color)";
                            }}
                        >
                            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color }}>{getIcon(icon)}</div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: isSelected ? color : "var(--text-primary)" }}>
                                {groupDomain}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                {types.length} {types.length === 1 ? i18n.catalog["text_b55501074dc5"] : i18n.catalog["text_74c3199f344e"]}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Type selector within chosen domain */}
            {domain && (
                <div style={{
                    padding: "1rem", borderRadius: "10px",
                    border: `1px solid ${domainColor}30`,
                    background: domainColor + "06",
                    animation: "fadeIn 0.25s ease",
                }}>
                    <div style={{
                        fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.6rem",
                        color: domainColor, display: "flex", alignItems: "center", gap: "0.35rem",
                    }}>
                        {getIcon(DOMAIN_ICONS[domain] || "folder")} {i18n.catalog["text_ed505c084d6a"]}{domain}
                    </div>
                    <div style={{ display: "grid", gap: "0.35rem" }}>
                        {(domainGroups.get(domain) || []).map(t => {
                            const isActive = formData.node_type_id === t.id;
                            return (
                                <div
                                    key={t.id}
                                    onClick={() => {
                                        setFormData({ ...formData, node_type_id: t.id });
                                        setDynamicAttrs({});
                                    }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "0.6rem",
                                        padding: "0.55rem 0.75rem",
                                        borderRadius: "8px",
                                        border: `1.5px solid ${isActive ? domainColor : "transparent"}`,
                                        background: isActive ? domainColor + "15" : "var(--bg-primary)",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    <span style={{
                                        width: "8px", height: "8px", borderRadius: "50%",
                                        background: isActive ? domainColor : "var(--border-color)",
                                        flexShrink: 0, transition: "background 0.2s",
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: "0.82rem", fontWeight: isActive ? 600 : 400,
                                            color: isActive ? domainColor : "var(--text-primary)",
                                        }}>
                                            {t.display_name_ar || t.display_name}
                                        </div>
                                        {t.display_name_ar && (
                                            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                                                {t.display_name}
                                            </div>
                                        )}
                                    </div>
                                    {t.attributes && t.attributes.length > 0 && (
                                        <span style={{
                                            fontSize: "0.65rem", color: "var(--text-muted)",
                                            background: "var(--bg-secondary)", padding: "1px 6px",
                                            borderRadius: "4px",
                                        }}>
                                            {t.attributes.length} {i18n.catalog["text_92f869bc3475"]}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    /* ── Step 1: Fill Details ── */
    const renderStep1 = () => (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Type badge summary */}
            {currentType && (
                <div style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    marginBottom: "1.25rem", padding: "0.75rem 1rem",
                    borderRadius: "10px", background: domainColor + "08",
                    borderRight: `4px solid ${domainColor}`,
                }}>
                    <span style={{ fontSize: "1.5rem", color: domainColor }}>{getIcon(DOMAIN_ICONS[domain] || "folder")}</span>
                    <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: domainColor }}>
                            {currentType.display_name_ar || currentType.display_name}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {domain} • {currentAttrs.length} {i18n.catalog["text_92f869bc3475"]}</div>
                    </div>
                </div>
            )}

            <NodeFormContent
                formData={formData}
                setFormData={setFormData}
                dynamicAttrs={dynamicAttrs}
                setDynamicAttrs={setDynamicAttrs}
                metaTypes={metaTypes}
                nodes={nodes}
                topologyRules={topologyRules}
                selectedNode={selectedNode}
                getTypeLabel={getTypeLabel}
            />
        </div>
    );

    /* ── Step 2: Review & Confirm ── */
    const renderStep2 = () => (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{
                textAlign: "center", marginBottom: "1.5rem",
                padding: "1.25rem", borderRadius: "12px",
                background: "linear-gradient(135deg, var(--success)08, var(--success)18)",
                border: "1px solid var(--success)25",
            }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem", color: "var(--success)" }}>
                    {getIcon("check-circle")}
                </div>
                <h4 style={{ margin: "0 0 0.4rem" }}>{i18n.catalog["text_32b3ceb396da"]}</h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                    {i18n.catalog["text_54869277fac2"]}</p>
            </div>

            {/* Review card */}
            <div className="sales-card" style={{ padding: "1.25rem" }}>
                <MetaGrid items={[
                    { label: i18n.catalog["text_caa3f2bb4a36"], value: currentType?.display_name_ar || currentType?.display_name || "-" },
                    { label: i18n.catalog["text_d197ebe8e67a"], value: domain || "-" },
                    { label: i18n.catalog["text_589c6420ea10"], value: formData.code || "-" },
                    { label: i18n.catalog["text_c3a4749caed4"], value: formData.status === "active" ? i18n.catalog["text_629e90b3af3d"] : formData.status === "inactive" ? i18n.catalog["text_b719ac8add4e"] : i18n.catalog["text_9d1b78e3b949"] },
                    ...(formData.valid_from ? [{ label: i18n.catalog["text_7cc6a1a4756f"], value: formData.valid_from }] : []),
                    ...(formData.valid_to ? [{ label: i18n.catalog["text_817b190b2a5c"], value: formData.valid_to }] : []),
                ]} />

                {/* Dynamic attrs review */}
                {Object.keys(dynamicAttrs).filter(k => dynamicAttrs[k]).length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                            {getIcon("clipboard-list")} {i18n.catalog["text_8e5f319dd13f"]}</div>
                        <MetaGrid
                            items={Object.entries(dynamicAttrs)
                                .filter(([, v]) => v)
                                .map(([k, v]) => ({ label: k, value: v }))}
                            minItemWidth="140px"
                        />
                    </div>
                )}

                {/* Link review */}
                {formData.target_node_uuid && (
                    <div style={{ marginTop: "1rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                            {getIcon("link")} {i18n.catalog["text_f75945dc12d4"]}</div>
                        <MetaItem
                            label={i18n.catalog["text_c863b73432eb"]}
                            value={(() => {
                                const target = nodes.find(n => n.node_uuid === formData.target_node_uuid);
                                return target
                                    ? `${target.code} — ${getTypeLabel(target.node_type_id)}`
                                    : formData.target_node_uuid;
                            })()}
                        />
                    </div>
                )}
            </div>

            {/* Validation checks */}
            <div style={{
                display: "flex", flexWrap: "wrap", gap: "0.5rem",
                marginTop: "1rem", justifyContent: "center",
            }}>
                <CheckItem label={i18n.catalog["text_9f018af139b4"]} icon={formData.node_type_id ? "check" : "times"} color={formData.node_type_id ? "var(--success)" : "var(--danger)"} />
                <CheckItem label={i18n.catalog["text_4dede5e7b31f"]} icon={formData.code ? "check" : "times"} color={formData.code ? "var(--success)" : "var(--danger)"} />
                {currentAttrs.filter(a => a.is_mandatory).map(a => (
                    <CheckItem
                        key={a.attribute_key}
                        label={a.attribute_key}
                        icon={(dynamicAttrs[a.attribute_key] || "").trim() ? "check" : "times"}
                        color={(dynamicAttrs[a.attribute_key] || "").trim() ? "var(--success)" : "var(--danger)"}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="sales-card animate-fade" style={{ padding: "2rem" }}>
            <StepIndicator steps={STEPS} current={step} />

            {/* Step content */}
            {step === 0 && renderStep0()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}

            {/* Navigation */}
            <div style={{
                display: "flex", justifyContent: "space-between",
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--border-color)",
            }}>
                <div>
                    {step > 0 && (
                        <Button variant="secondary" icon="chevron-right" onClick={() => setStep(s => s - 1)}>
                            {i18n.catalog["text_a9e9d067101a"]}</Button>
                    )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {step < STEPS.length - 1 ? (
                        <Button
                            variant="primary"
                            icon="chevron-left"
                            iconPosition="right"
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
                        >
                            {i18n.catalog["text_5cf7af74fd3a"]}</Button>
                    ) : (
                        <Button
                            variant="success"
                            icon="check"
                            onClick={onSubmit}
                            isLoading={isSubmitting}
                            disabled={!canProceedStep1}
                        >
                            {i18n.catalog["text_a8754370c55c"]}</Button>
                    )}
                </div>
            </div>
        </div>
    );
}
