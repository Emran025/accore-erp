"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type {
    ComplianceProfileEditorProps,
    ComplianceProfile,
    PolicyType,
    TransmissionFormat,
    AuthType,
    SystemKey,
    EditorFormat,
} from "./types";
import { FormatEditor } from "./FormatEditor";
import { validateFormat } from "./utils";
import "./styles.css";

// ── Transmission format options ──
const formatOptions: { value: TransmissionFormat; label: string; icon: string }[] = [
    { value: "json", label: catalogMessage("text_db1a21a0bc2e"), icon: "fas fa-brackets-curly" },
    { value: "xml", label: catalogMessage("text_40658e9af8fd"), icon: "fas fa-code" },
    { value: "yml", label: catalogMessage("text_996518f221d2"), icon: "fas fa-file-alt" },
    { value: "excel", label: catalogMessage("text_48d53635551c"), icon: "fas fa-file-excel" },
];

// ── Auth type options ──
const authTypeOptions: { value: AuthType; label: string }[] = [
    { value: "none", label: catalogMessage("text_ad45158f2562") },
    { value: "bearer", label: catalogMessage("text_105f8fe557fe") },
    { value: "basic", label: catalogMessage("text_f0a792cf36e6") },
    { value: "oauth2", label: catalogMessage("text_aebabad39063") },
    { value: "api_key", label: catalogMessage("text_23189d55f697") },
];

// ── Default system keys (these would typically be fetched from API) ──
const defaultSystemKeys: SystemKey[] = [
    { key: "invoice_number", label: catalogMessage("text_b6e71278be04"), type: "string" },
    { key: "invoice_date", label: catalogMessage("text_4994aa18979f"), type: "date" },
    { key: "invoice_type", label: catalogMessage("text_1670fc15da04"), type: "string" },
    { key: "subtotal", label: catalogMessage("text_4793cceb7aa3"), type: "number" },
    { key: "total_tax", label: catalogMessage("text_d8f7fda426b0"), type: "number" },
    { key: "grand_total", label: catalogMessage("text_63c2f6768cf8"), type: "number" },
    { key: "discount_amount", label: catalogMessage("text_7d815bba7b75"), type: "number" },
    { key: "currency_code", label: catalogMessage("text_48e954a1635b"), type: "string" },
    { key: "tax_type_code", label: catalogMessage("text_9c528eb38b35"), type: "string" },
    { key: "tax_rate", label: catalogMessage("text_093feaffdf0c"), type: "number" },
    { key: "taxable_amount", label: catalogMessage("text_c2c42c8813fc"), type: "number" },
    { key: "tax_amount", label: catalogMessage("text_fa13267975f9"), type: "number" },
    { key: "tax_authority_code", label: catalogMessage("text_a5075a8961b7"), type: "string" },
    { key: "seller_name", label: catalogMessage("text_07b03bb3d5d0"), type: "string" },
    { key: "seller_vat_number", label: catalogMessage("text_b5b5dcbf0186"), type: "string" },
    { key: "seller_cr_number", label: catalogMessage("text_3767ae186e95"), type: "string" },
    { key: "seller_address", label: catalogMessage("text_1cb381b18f89"), type: "string" },
    { key: "buyer_name", label: catalogMessage("text_b86625c75377"), type: "string" },
    { key: "buyer_vat_number", label: catalogMessage("text_bb55b47b40f8"), type: "string" },
    { key: "buyer_address", label: catalogMessage("text_97bd9e9f5221"), type: "string" },
    { key: "item_name", label: catalogMessage("text_ba490b3b4be5"), type: "string" },
    { key: "item_quantity", label: catalogMessage("text_935e21853946"), type: "number" },
    { key: "item_unit_price", label: catalogMessage("text_c274e3ec351e"), type: "number" },
    { key: "item_total", label: catalogMessage("text_ca2c57c400ff"), type: "number" },
    { key: "item_tax_amount", label: catalogMessage("text_3cd9a2ef895e"), type: "number" },
    { key: "payment_method", label: catalogMessage("text_ae2d60052976"), type: "string" },
    { key: "payment_date", label: catalogMessage("text_e35687ed04c0"), type: "date" },
    { key: "payment_reference", label: catalogMessage("text_f215a289905e"), type: "string" },
];

/**
 * ComplianceProfileEditor – Main full-screen editor for configuring
 * how tax/compliance data is transmitted to external entities.
 *
 * Supports:
 * - Policy 1 (Push): We send data to entity's endpoint
 * - Policy 2 (Pull): Entity accesses our API with generated token
 * - Transmission format: JSON, XML, YML, Excel
 * - Key mapping + structure editor
 */
export function ComplianceProfileEditor({
    profile,
    authorities,
    onSave,
    onCancel,
    className = "",
}: ComplianceProfileEditorProps) {
    const { t: i18n } = useI18n();
    const isNew = !profile;

    // ── Form State ──
    const [name, setName] = useState(profile?.name || "");
    const [code, setCode] = useState(profile?.code || "");
    const [taxAuthorityId, setTaxAuthorityId] = useState<number>(profile?.tax_authority_id || (authorities[0]?.id ?? 0));
    const [policyType, setPolicyType] = useState<PolicyType>(profile?.policy_type || "push");
    const [transmissionFormat, setTransmissionFormat] = useState<TransmissionFormat>(profile?.transmission_format || "json");
    const [keyMapping, setKeyMapping] = useState<Record<string, string>>(profile?.key_mapping || {});
    const [structureTemplate, setStructureTemplate] = useState<string>(profile?.structure_template || "");
    const [isActive, setIsActive] = useState(profile?.is_active ?? true);
    const [notes, setNotes] = useState(profile?.notes || "");

    // Push-specific
    const [endpointUrl, setEndpointUrl] = useState(profile?.endpoint_url || "");
    const [authType, setAuthType] = useState<AuthType>((profile?.auth_type as AuthType) || "none");
    const [authCredentials, setAuthCredentials] = useState(profile?.auth_credentials || "");
    const [httpMethod, setHttpMethod] = useState(profile?.http_method || "POST");
    const [requestHeaders, setRequestHeaders] = useState(profile?.request_headers ? JSON.stringify(profile.request_headers, null, 2) : "");
    const [openApiSpec, setOpenApiSpec] = useState(profile?.openapi_spec ? JSON.stringify(profile.openapi_spec, null, 2) : "");

    // Pull-specific
    const [tokenPreview, setTokenPreview] = useState(profile?.token_preview || "");
    const [rawToken, setRawToken] = useState<string | null>(null); // Full token only after generate
    const [tokenExpiresAt, setTokenExpiresAt] = useState(profile?.token_expires_at || "");
    const [pullEndpointPath, setPullEndpointPath] = useState(profile?.pull_endpoint_path || "");
    const [allowedIps, setAllowedIps] = useState((profile?.allowed_ips || []).join(", "));

    // Editor state
    const [isSaving, setIsSaving] = useState(false);
    const [activeView, setActiveView] = useState<"config" | "editor">("config");

    // ── Editor format (exclude excel from editor) ──
    const editorFormat: EditorFormat = useMemo(
        () => transmissionFormat === "excel" ? "json" : transmissionFormat,
        [transmissionFormat]
    );

    // ── Sync from props ──
    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setCode(profile.code || "");
            setTaxAuthorityId(profile.tax_authority_id || (authorities[0]?.id ?? 0));
            setPolicyType(profile.policy_type || "push");
            setTransmissionFormat(profile.transmission_format || "json");
            setKeyMapping(profile.key_mapping || {});
            setStructureTemplate(profile.structure_template || "");
            setIsActive(profile.is_active ?? true);
            setNotes(profile.notes || "");
            setEndpointUrl(profile.endpoint_url || "");
            setAuthType((profile.auth_type as AuthType) || "none");
            setAuthCredentials(profile.auth_credentials || "");
            setHttpMethod(profile.http_method || "POST");
            setRequestHeaders(profile.request_headers ? JSON.stringify(profile.request_headers, null, 2) : "");
            setOpenApiSpec(profile.openapi_spec ? JSON.stringify(profile.openapi_spec, null, 2) : "");
            setTokenPreview(profile.token_preview || "");
            setRawToken(null);
            setTokenExpiresAt(profile.token_expires_at || "");
            setPullEndpointPath(profile.pull_endpoint_path || "");
            setAllowedIps((profile.allowed_ips || []).join(", "));
        }
    }, [profile, authorities]);

    // ── Save Handler ──
    const handleSave = async () => {
        if (!name.trim()) {
            showToast(i18n.catalog["text_026df915c3d4"], "error");
            return;
        }
        if (!code.trim()) {
            showToast(i18n.catalog["text_ba5d6a04a189"], "error");
            return;
        }
        if (!taxAuthorityId) {
            showToast(i18n.catalog["text_932d008fbbd5"], "error");
            return;
        }
        if (policyType === "push" && !endpointUrl.trim()) {
            showToast(i18n.catalog["text_101a3056782b"], "error");
            return;
        }

        // Validate structure if provided
        if (structureTemplate.trim() && transmissionFormat !== "excel") {
            const validation = validateFormat(structureTemplate, editorFormat);
            if (!validation.valid) {
                showToast(i18n.catalog["text_a8a80b6e15d8"], "error");
                return;
            }
        }

        setIsSaving(true);
        try {
            let parsedOpenApiSpec = null;
            if (openApiSpec.trim()) {
                try {
                    parsedOpenApiSpec = JSON.parse(openApiSpec);
                } catch {
                    showToast(i18n.catalog["text_8686034d39b6"], "error");
                    setIsSaving(false);
                    return;
                }
            }

            const data: ComplianceProfile = {
                id: profile?.id,
                tax_authority_id: taxAuthorityId,
                name,
                code,
                policy_type: policyType,
                transmission_format: transmissionFormat,
                key_mapping: Object.keys(keyMapping).length > 0 ? keyMapping : null,
                structure_template: structureTemplate.trim() || null,
                // Push fields
                endpoint_url: policyType === "push" ? endpointUrl : null,
                auth_type: policyType === "push" ? authType : null,
                auth_credentials: policyType === "push" ? authCredentials : null,
                request_headers: policyType === "push" && requestHeaders.trim() ? JSON.parse(requestHeaders) : null,
                http_method: policyType === "push" ? httpMethod : "POST",
                openapi_spec: policyType === "push" ? parsedOpenApiSpec : null,
                // Pull fields
                pull_endpoint_path: policyType === "pull" ? pullEndpointPath : null,
                allowed_ips: policyType === "pull" && allowedIps.trim()
                    ? allowedIps.split(",").map(ip => ip.trim()).filter(Boolean)
                    : null,
                // Common
                is_active: isActive,
                notes: notes.trim() || null,
            };

            await onSave(data);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Copy token to clipboard ──
    const handleCopyToken = useCallback(() => {
        if (rawToken) {
            navigator.clipboard.writeText(rawToken);
            showToast(i18n.catalog["text_69b8b3133653"], "success");
        } else if (tokenPreview) {
            showToast(i18n.catalog["text_837963cc4ee3"], "warning");
        }
    }, [rawToken, tokenPreview]);

    // ── Regenerate token ──
    const handleRegenerateToken = useCallback(async () => {
        if (!profile?.id) {
            showToast(i18n.catalog["text_57f69608c48c"], "warning");
            return;
        }
        const res = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.COMPLIANCE_PROFILES.GENERATE_TOKEN(profile.id), {
            method: "POST",
            body: JSON.stringify({ expires_in_days: 365 }),
        });
        if (res.success) {
            const newToken = (res as Record<string, unknown>).access_token as string || "";
            setRawToken(newToken);
            setTokenPreview(newToken.substring(0, 12) + '••••••••' + newToken.substring(newToken.length - 6));
            setTokenExpiresAt((res as Record<string, unknown>).token_expires_at as string || "");
            showToast(i18n.catalog["text_0dabe0c6f86a"], "success");
        } else {
            showToast(res.message || i18n.catalog["text_6d95e4a69876"], "error");
        }
    }, [profile?.id]);

    // ── Revoke token ──
    const handleRevokeToken = useCallback(async () => {
        if (!profile?.id) return;
        const res = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.COMPLIANCE_PROFILES.REVOKE_TOKEN(profile.id), {
            method: "POST",
        });
        if (res.success) {
            setTokenPreview("");
            setRawToken(null);
            setTokenExpiresAt("");
            showToast(i18n.catalog["text_86a553b2c8bb"], "success");
        } else {
            showToast(res.message || i18n.catalog["text_af1c943cff83"], "error");
        }
    }, [profile?.id]);

    // ── Build pull endpoint display ──
    const pullEndpoint = useMemo(() => {
        const base = pullEndpointPath || "compliance-data";
        return `/api/compliance-pull/${code || "CODE"}/${base}`;
    }, [code, pullEndpointPath]);

    // ═══════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════
    return (
        <div className={`compliance-editor ${className}`}>
            {/* ── Top Bar ── */}
            <div className="ce-topbar">
                <div className="ce-topbar-right">
                    <div className="ce-topbar-title">
                        <i className="fas fa-shield-alt" />
                        <span>
                            {isNew
                                ? i18n.catalog["text_03622bfee2c5"]
                                : catalogText(i18n, "text_5ac6e84eaa5a", { value0: profile?.name || "" })}
                        </span>
                    </div>
                    <div className="ce-status-badges">
                        <span className={`ce-badge ce-badge-${policyType}`}>
                            <i className={`fas fa-${policyType === "push" ? "paper-plane" : "download"}`} />
                            {policyType === "push" ? i18n.catalog["text_80c19dc251b2"] : i18n.catalog["text_582efd7f4b25"]}
                        </span>
                        <span className="ce-badge ce-badge-format">
                            <i className="fas fa-file-code" />
                            {transmissionFormat.toUpperCase()}
                        </span>
                        <span className={`ce-badge ${isActive ? "ce-badge-active" : "ce-badge-inactive"}`}>
                            <i className={`fas fa-${isActive ? "check-circle" : "times-circle"}`} />
                            {isActive ? i18n.catalog["text_629e90b3af3d"] : i18n.catalog["text_b719ac8add4e"]}
                        </span>
                    </div>
                </div>
                <div className="ce-topbar-actions">
                    <Button size="sm" variant="secondary" icon="times" onClick={onCancel}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                    <Button
                        size="sm"
                        variant="primary"
                        icon="save"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? i18n.catalog["text_8688b0ff5f34"] : isNew ? i18n.catalog["text_a820f3590d36"] : i18n.catalog["text_6c03d6737c2f"]}
                    </Button>
                </div>
            </div>

            {/* ── View Toggle ── */}
            <div className="ce-editor-tabs" style={{ background: "#111421" }}>
                <div className="ce-editor-tabs-left">
                    <button
                        className={`ce-tab ${activeView === "config" ? "active" : ""}`}
                        onClick={() => setActiveView("config")}
                    >
                        <i className="fas fa-cog" /> {i18n.catalog["text_5fd9563e6846"]}</button>
                    <button
                        className={`ce-tab ${activeView === "editor" ? "active" : ""}`}
                        onClick={() => setActiveView("editor")}
                    >
                        <i className="fas fa-code" /> {i18n.catalog["text_2fdd9e8e47a1"]}</button>
                </div>
                <div className="ce-editor-tabs-right">
                    {activeView === "editor" && (
                        <span style={{ fontSize: 11, color: "#8890a4", display: "flex", alignItems: "center", gap: 5 }}>
                            <i className="fas fa-info-circle" style={{ color: "#6c8cff" }} />
                            {i18n.catalog["text_325d78c284e5"]}{i18n.catalog["text_d0f7284a94b4"]} {i18n.catalog["text_c6fdf80ff75b"]}</span>
                    )}
                </div>
            </div>

            {/* ══════════════ CONFIG VIEW ══════════════ */}
            {activeView === "config" && (
                <div style={{ flex: 1, overflow: "auto", background: "#0f1117" }}>
                    <div className="ce-config-panel" style={{ borderBottom: "none" }}>
                        {/* ── Basic Info ── */}
                        <div className="ce-config-section-label">
                            <i className="fas fa-info-circle" /> {i18n.catalog["text_66a68be6dd8a"]}</div>
                        <div className="ce-config-row">
                            <div className="ce-field">
                                <label>{i18n.catalog["text_08c8e8814cdf"]}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={i18n.catalog["text_acf1b798b352"]}
                                    className="ce-input"
                                />
                            </div>
                            <div className="ce-field">
                                <label>{i18n.catalog["text_803cc32ed119"]}</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                                    placeholder={i18n.catalog["text_97b981b6224b"]}
                                    className="ce-input"
                                    disabled={!isNew}
                                    style={{ direction: "ltr", textAlign: "left" }}
                                />
                            </div>
                            <div className="ce-field">
                                <label>{i18n.catalog["text_b65ad533c1a8"]}</label>
                                <select
                                    value={taxAuthorityId}
                                    onChange={(e) => setTaxAuthorityId(Number(e.target.value))}
                                    className="ce-select"
                                >
                                    {authorities.map(auth => (
                                        <option key={auth.id} value={auth.id}>{auth.name} ({auth.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ce-field" style={{ minWidth: 100, flex: "0 0 auto" }}>
                                <label>{i18n.catalog["text_c3a4749caed4"]}</label>
                                <select
                                    value={isActive ? "1" : "0"}
                                    onChange={(e) => setIsActive(e.target.value === "1")}
                                    className="ce-select"
                                >
                                    <option value="1">{i18n.catalog["text_629e90b3af3d"]}</option>
                                    <option value="0">{i18n.catalog["text_b719ac8add4e"]}</option>
                                </select>
                            </div>
                        </div>

                        {/* ── Policy Selection ── */}
                        <div className="ce-config-section-label" style={{ marginTop: 4 }}>
                            <i className="fas fa-route" /> {i18n.catalog["text_8263f1a89ee2"]}</div>
                        <div className="ce-config-row">
                            <div className="ce-policy-toggle">
                                <button
                                    className={`ce-policy-option ${policyType === "push" ? "active push" : ""}`}
                                    onClick={() => setPolicyType("push")}
                                    type="button"
                                >
                                    <i className="fas fa-paper-plane ce-policy-icon" />
                                    <span className="ce-policy-label">{i18n.catalog["text_97df31193a2f"]}</span>
                                    <span className="ce-policy-desc">
                                        {i18n.catalog["text_48ca2884016a"]}</span>
                                </button>
                                <button
                                    className={`ce-policy-option ${policyType === "pull" ? "active pull" : ""}`}
                                    onClick={() => setPolicyType("pull")}
                                    type="button"
                                >
                                    <i className="fas fa-download ce-policy-icon" />
                                    <span className="ce-policy-label">{i18n.catalog["text_73fe261a9d42"]}</span>
                                    <span className="ce-policy-desc">
                                        {i18n.catalog["text_f3f2473dab7b"]}</span>
                                </button>
                            </div>
                        </div>

                        {/* ── Format Selection ── */}
                        <div className="ce-config-section-label">
                            <i className="fas fa-file-export" /> {i18n.catalog["text_290eba083a3c"]}</div>
                        <div className="ce-config-row">
                            <div className="ce-field-full">
                                <div className="ce-format-selector">
                                    {formatOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            className={`ce-format-chip ${transmissionFormat === opt.value ? "active" : ""}`}
                                            onClick={() => setTransmissionFormat(opt.value)}
                                            type="button"
                                        >
                                            <i className={opt.icon} />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Push-specific Config ── */}
                        {policyType === "push" && (
                            <>
                                <div className="ce-config-section-label" style={{ marginTop: 4 }}>
                                    <i className="fas fa-server" /> {i18n.catalog["text_290aad95abe2"]}</div>
                                <div className="ce-config-row">
                                    <div className="ce-field ce-field-wide">
                                        <label>{i18n.catalog["text_1ab6a589f765"]}</label>
                                        <input
                                            type="url"
                                            value={endpointUrl}
                                            onChange={(e) => setEndpointUrl(e.target.value)}
                                            placeholder={"https://api.entity.gov/v1/submit"}
                                            className="ce-input"
                                            style={{ direction: "ltr", textAlign: "left" }}
                                        />
                                    </div>
                                    <div className="ce-field" style={{ minWidth: 120, flex: "0 0 auto" }}>
                                        <label>{i18n.catalog["text_596fe2e088b3"]}</label>
                                        <select
                                            value={httpMethod}
                                            onChange={(e) => setHttpMethod(e.target.value)}
                                            className="ce-select"
                                        >
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="PATCH">PATCH</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="ce-config-row">
                                    <div className="ce-field">
                                        <label>{i18n.catalog["text_119babff2748"]}</label>
                                        <select
                                            value={authType}
                                            onChange={(e) => setAuthType(e.target.value as AuthType)}
                                            className="ce-select"
                                        >
                                            {authTypeOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {authType !== "none" && (
                                        <div className="ce-field ce-field-wide">
                                            <label>{i18n.catalog["text_b2ebbefd586a"]}</label>
                                            <input
                                                type="password"
                                                value={authCredentials}
                                                onChange={(e) => setAuthCredentials(e.target.value)}
                                                placeholder={
                                                    authType === i18n.catalog["text_2454ad61c2ac"] ? i18n.catalog["text_5e4f407b48c5"] :
                                                        authType === i18n.catalog["text_fbb7b5bf4ca3"] ? i18n.catalog["text_bc842c31a9e5"] :
                                                            authType === i18n.catalog["text_2e9bc6c94a4c"] ? i18n.catalog["text_226cfd9ea50d"] :
                                                                i18n.catalog["text_ca0e88ea2d25"]
                                                }
                                                className="ce-input"
                                                style={{ direction: "ltr", textAlign: "left" }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="ce-config-row">
                                    <div className="ce-field-full">
                                        <label>{i18n.catalog["text_2ab497db3f85"]}</label>
                                        <textarea
                                            value={requestHeaders}
                                            onChange={(e) => setRequestHeaders(e.target.value)}
                                            placeholder={i18n.catalog["text_ba706d3707b1"]}
                                            className="ce-textarea"
                                            rows={3}
                                            style={{ direction: "ltr", textAlign: "left" }}
                                        />
                                    </div>
                                </div>
                                <div className="ce-config-row">
                                    <div className="ce-field-full">
                                        <label>{i18n.catalog["text_e76fe1849d63"]}</label>
                                        <textarea
                                            value={openApiSpec}
                                            onChange={(e) => setOpenApiSpec(e.target.value)}
                                            placeholder={i18n.catalog["text_9a9c15c97a8f"]}
                                            className="ce-textarea"
                                            rows={4}
                                            style={{ direction: "ltr", textAlign: "left" }}
                                        />
                                        <span style={{ fontSize: 10, color: "#6c8cff", marginTop: 2 }}>
                                            <i className="fas fa-info-circle" style={{ marginLeft: 4 }} />
                                            {i18n.catalog["text_522ec464f7c2"]}</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Pull-specific Config ── */}
                        {policyType === "pull" && (
                            <>
                                <div className="ce-config-section-label" style={{ marginTop: 4 }}>
                                    <i className="fas fa-key" /> {i18n.catalog["text_df3bf5f6b8dc"]}</div>
                                <div className="ce-config-row">
                                    <div className="ce-field">
                                        <label>{i18n.catalog["text_41a30dff4aec"]}</label>
                                        <input
                                            type="text"
                                            value={pullEndpointPath}
                                            onChange={(e) => setPullEndpointPath(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                                            placeholder={i18n.catalog["text_c9d9b1e8a3df"]}
                                            className="ce-input"
                                            style={{ direction: "ltr", textAlign: "left" }}
                                        />
                                    </div>
                                    <div className="ce-field ce-field-wide">
                                        <label>{i18n.catalog["text_91e71ba1752a"]}</label>
                                        <input
                                            type="text"
                                            value={allowedIps}
                                            onChange={(e) => setAllowedIps(e.target.value)}
                                            placeholder={i18n.catalog["text_75e1d58991bc"]}
                                            className="ce-input"
                                            style={{ direction: "ltr", textAlign: "left" }}
                                        />
                                    </div>
                                </div>

                                {/* Endpoint Preview */}
                                <div className="ce-config-row">
                                    <div className="ce-field-full">
                                        <label>{i18n.catalog["text_3bdcf1d3b90f"]}</label>
                                        <div className="ce-endpoint-info">
                                            <span className="ce-method-badge">GET</span>
                                            <code>{pullEndpoint}</code>
                                        </div>
                                    </div>
                                </div>

                                {/* Token Display */}
                                <div className="ce-config-row">
                                    <div className="ce-field-full">
                                        <label>{i18n.catalog["text_0c5fbf4ab285"]}</label>
                                        <div className="ce-token-display">
                                            {(tokenPreview || rawToken) ? (
                                                <>
                                                    <div className="ce-token-value">
                                                        <code>{rawToken || tokenPreview}</code>
                                                        <button className="ce-token-copy" onClick={handleCopyToken}>
                                                            <i className="fas fa-copy" /> {rawToken ? i18n.catalog["text_29a0e2739a92"] : i18n.catalog["text_2ba494867920"]}
                                                        </button>
                                                    </div>
                                                    {rawToken && (
                                                        <div style={{ fontSize: 10, color: "#f59e0b", margin: "4px 0", display: "flex", alignItems: "center", gap: 4 }}>
                                                            <i className="fas fa-exclamation-triangle" />
                                                            {i18n.catalog["text_4da20aa7276d"]}</div>
                                                    )}
                                                    <div className="ce-token-meta">
                                                        {tokenExpiresAt && (
                                                            <span>
                                                                <i className="fas fa-clock" />
                                                                {i18n.catalog["text_c13403f9b32d"]}{new Date(tokenExpiresAt).toLocaleDateString("ar-SA")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="ce-token-actions">
                                                        <button className="ce-token-btn generate" onClick={handleRegenerateToken}>
                                                            <i className="fas fa-sync" /> {i18n.catalog["text_adcb933a3cb3"]}</button>
                                                        <button className="ce-token-btn revoke" onClick={handleRevokeToken}>
                                                            <i className="fas fa-ban" /> {i18n.catalog["text_feecb98abc70"]}</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ textAlign: "center", padding: "12px 0" }}>
                                                    <span style={{ color: "#8890a4", fontSize: 12 }}>
                                                        {i18n.catalog["text_c969380c2022"]}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Notes ── */}
                        <div className="ce-config-section-label" style={{ marginTop: 4 }}>
                            <i className="fas fa-sticky-note" /> {i18n.catalog["text_d446d2dc6b81"]}</div>
                        <div className="ce-config-row" style={{ paddingBottom: 20 }}>
                            <div className="ce-field-full">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={i18n.catalog["text_d3da818ddc30"]}
                                    className="ce-textarea"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ STRUCTURE EDITOR VIEW ══════════════ */}
            {activeView === "editor" && (
                <FormatEditor
                    format={editorFormat}
                    systemKeys={defaultSystemKeys}
                    keyMapping={keyMapping}
                    structureTemplate={structureTemplate}
                    onKeyMappingChange={setKeyMapping}
                    onStructureChange={setStructureTemplate}
                />
            )}
        </div>
    );
}
