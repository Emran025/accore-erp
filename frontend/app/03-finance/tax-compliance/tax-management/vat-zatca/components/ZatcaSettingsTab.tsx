"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Button, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { TaxAuthority } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function ZatcaSettingsTab() {
    const { t: i18n } = useI18n();
    const [authority, setAuthority] = useState<TaxAuthority | null>(null);
    const [config, setConfig] = useState<any>({});

    // UI Helpers
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isOnboarding, setIsOnboarding] = useState(false);

    const loadAuthority = useCallback(async () => {
        try {
            setIsLoading(true);
            const response: any = await fetchAPI(API_ENDPOINTS.FINANCE.TAX_ENGINE.SETUP);
            if (response.data && Array.isArray(response.data.authorities)) {
                // Find ZATCA (or fallback to primary)
                const zatca = response.data.authorities.find((a: TaxAuthority) => a.code === 'ZATCA' || a.is_primary);
                if (zatca) {
                    setAuthority(zatca);
                    let parsedConfig: any = {};
                    try { parsedConfig = typeof zatca.config === 'string' ? JSON.parse(zatca.config) : zatca.config || {}; } catch { }
                    setConfig({
                        zatca_environment: parsedConfig.zatca_environment || "sandbox",
                        zatca_vat_number: parsedConfig.zatca_vat_number || "",
                        zatca_org_name: parsedConfig.zatca_org_name || "",
                        zatca_org_unit_name: parsedConfig.zatca_org_unit_name || "",
                        zatca_common_name: parsedConfig.zatca_common_name || "",
                        zatca_otp: parsedConfig.zatca_otp || "",
                        zatca_request_id: parsedConfig.zatca_request_id || "",
                        zatca_binary_token: parsedConfig.zatca_binary_token || ""
                    });
                }
            }
        } catch (error) {
            console.error(i18n.catalog["text_71a1ab31e78a"], error);
            showToast(i18n.catalog["text_5f8e4ede7a16"], "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAuthority();
    }, [loadAuthority]);

    const handleSave = async () => {
        if (!authority) return;

        try {
            setIsSaving(true);

            // Re-map internal connection token state
            const payload = {
                is_active: authority.is_active,
                connection_type: authority.connection_type,
                endpoint_url: authority.endpoint_url || "",
                connection_credentials: authority.connection_credentials || "",
                config: config // Will auto-cast via eloquent
            };

            await fetchAPI(API_ENDPOINTS.FINANCE.TAX_ENGINE.AUTHORITIES.UPDATE(authority.id), {
                method: "PUT",
                body: JSON.stringify(payload),
            });
            showToast(i18n.catalog["text_017690f38660"], "success");
            loadAuthority();
        } catch (error) {
            console.error(i18n.catalog["text_65da8cc8c0e2"], error);
            showToast(i18n.catalog["text_9fa7bdbaae3f"], "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOnboard = async () => {
        if (!config.zatca_otp) {
            showToast(i18n.catalog["text_fe268d45c1d8"], "error");
            return;
        }

        try {
            setIsOnboarding(true);
            const response: any = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETTINGS.ZATCA + '/onboard', {
                method: "POST", // Needs a real adapter mapping in future steps
                body: JSON.stringify({
                    otp: config.zatca_otp,
                    environment: config.zatca_environment,
                    csr_data: {
                        common_name: config.zatca_common_name,
                        org_name: config.zatca_org_name,
                        org_unit: config.zatca_org_unit_name,
                        vat_number: config.zatca_vat_number
                    }
                }),
            });

            if (response.success) {
                showToast(i18n.catalog["text_9027a03111fe"], "success");
                loadAuthority(); // Reload to snatch the updated config
            } else {
                showToast(response.message || i18n.catalog["text_b245062a9a4c"], "error");
            }
        } catch (error) {
            console.error(i18n.catalog["text_0c3039143459"], error);
            showToast(i18n.catalog["text_778ba406d30f"], "error");
        } finally {
            setIsOnboarding(false);
        }
    };

    if (isLoading) {
        return <div className="empty-state"><p>{i18n.catalog["text_2d3d3199b2b2"]}</p></div>;
    }

    if (!authority) {
        return <div className="empty-state"><p>{i18n.catalog["text_479e3ef175db"]}</p></div>;
    }

    return (
        <div className="animate-fade">
            <PageSubHeader
                title={catalogText(i18n, "text_4a93c7a1a80c", { value0: authority.name, value1: authority.code })}
                titleIcon="shield-check"
                actions={
                    <div className="action-buttons">
                        <Button variant="secondary" onClick={loadAuthority} icon="undo">{i18n.catalog["text_adc4c9205d66"]}</Button>
                        <Button variant="primary" onClick={handleSave} icon="save" isLoading={isSaving}>{i18n.catalog["text_2eec8ae8fd7d"]}</Button>
                    </div>
                }
            />

            <div className="alert alert-info">
                <i className="fa-solid fa-lock me-2 ms-2"></i>
                <strong>{i18n.catalog["text_57b4542bd7af"]}</strong>
                {i18n.catalog["text_a0b2c050c7d1"]}</div>

            <div className="form-group checkbox-group my-3">
                <Checkbox
                    id="is_active"
                    label={catalogText(i18n, "text_95e69bd88e88", { value0: authority.code })}
                    checked={authority.is_active}
                    onChange={(e) => setAuthority({ ...authority, is_active: e.target.checked })}
                />
                <small className="text-muted">{i18n.catalog["text_29e410b45c44"]}</small>
            </div>

            <div className="sales-card">
                <h3><i className="fa-solid fa-network-wired me-2 ms-2"></i>{i18n.catalog["text_949d1b456a76"]}</h3>
                <div className="row mt-3">
                    <div className="col-md-6 form-group">
                        <Select
                            label={i18n.catalog["text_28cf76c094e5"]}
                            value={authority.connection_type || 'none'}
                            onChange={(e) => setAuthority({ ...authority, connection_type: e.target.value as any })}
                            options={[
                                { value: "none", label: i18n.catalog["text_37b53cf91512"] },
                                { value: "push_api", label: i18n.catalog["text_b6d69e321ff2"] },
                                { value: "pull_key", label: i18n.catalog["text_c319b9c7bcda"] }
                            ]}
                        />
                    </div>
                    <div className="col-md-6 form-group">
                        <TextInput
                            label={i18n.catalog["text_bcc51e304775"]}
                            value={authority.endpoint_url || ''}
                            onChange={(e) => setAuthority({ ...authority, endpoint_url: e.target.value })}
                            placeholder={"https://gw-fatoora.zatca.gov.sa/e-invoicing"}
                        />
                    </div>
                </div>

                {authority.connection_type !== 'none' && (
                    <div className="form-row border-top pt-3 mt-2">
                        <div className="form-group w-100">
                            <TextInput
                                label={i18n.catalog["text_4fa6cd49db4b"]}
                                value={authority.connection_credentials || ''}
                                type="password"
                                onChange={(e) => setAuthority({ ...authority, connection_credentials: e.target.value })}
                                placeholder={i18n.catalog["text_0bc92e9c66bd"]}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="sales-card compact">
                <h3>{getIcon("info-circle")} {i18n.catalog["text_4c7899251879"]}</h3>

                <div className="row mt-3">
                    <div className="col-md-6 form-group">
                        <Select
                            label={i18n.catalog["text_64ab125b83c0"]}
                            value={config.zatca_environment}
                            onChange={(e) => setConfig({ ...config, zatca_environment: e.target.value })}
                            options={[
                                { value: "sandbox", label: i18n.catalog["text_5b2f8a6593d3"] },
                                { value: "simulation", label: i18n.catalog["text_f5f6f2634dc4"] },
                                { value: "production", label: i18n.catalog["text_a305a53b1171"] }
                            ]}
                        />
                    </div>
                    <div className="col-md-6 form-group">
                        <TextInput
                            label={i18n.catalog["text_66978ceda822"]}
                            value={config.zatca_vat_number}
                            onChange={(e) => setConfig({ ...config, zatca_vat_number: e.target.value })}
                            placeholder={i18n.catalog["text_d4be10fdacd0"]}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 form-group">
                        <TextInput
                            label={i18n.catalog["text_5764d58b757e"]}
                            value={config.zatca_org_name}
                            onChange={(e) => setConfig({ ...config, zatca_org_name: e.target.value })}
                            placeholder={i18n.catalog["text_14e7a0e62a8a"]}
                        />
                    </div>
                    <div className="col-md-6 form-group">
                        <TextInput
                            label={i18n.catalog["text_e991cf23cc2e"]}
                            value={config.zatca_org_unit_name}
                            onChange={(e) => setConfig({ ...config, zatca_org_unit_name: e.target.value })}
                            placeholder={i18n.catalog["text_9fa2ff4d2ddb"]}
                        />
                    </div>
                </div>

                <div className="alert alert-secondary mt-3">
                    <h5 className="mb-2"><i className="fa-solid fa-key text-warning me-2 ms-2"></i>{i18n.catalog["text_4dce4f2dece8"]}</h5>
                    <p className="text-muted mb-3">{i18n.catalog["text_5cdabebfd94b"]}</p>

                    <div className="row align-items-end">
                        <div className="col-md-8 form-group mb-0">
                            <TextInput
                                label={i18n.catalog["text_9969b29b5de9"]}
                                value={config.zatca_otp}
                                onChange={(e) => setConfig({ ...config, zatca_otp: e.target.value })}
                                placeholder={i18n.catalog["text_8d969eef6eca"]}
                            />
                        </div>
                        <div className="col-md-4">
                            <Button
                                onClick={handleOnboard}
                                variant="primary"
                                icon="link"
                                isLoading={isOnboarding}
                                className="w-100"
                            >
                                {i18n.catalog["text_61410a44ae85"]}</Button>
                        </div>
                    </div>
                </div>

                {config.zatca_binary_token && (
                    <div className="summary-stat-box mt-3">
                        <div className="stat-item">
                            <span className="stat-label">{i18n.catalog["text_1d27ab1f3951"]}</span>
                            <span className="badge badge-success mt-1"><i className="fa-solid fa-check mx-1"></i>{i18n.catalog["text_e6d10eeeb027"]}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">{i18n.catalog["text_18084e520f19"]}</span>
                            <code className="stat-value text-muted">{config.zatca_request_id || i18n.catalog["text_e2f79e5b6033"]}</code>
                        </div>
                    </div>
                )}
            </div>

            <div className="invoice-info bg-light">
                <div className="info-row">
                    <span className="label fw-bold"><i className="fa-solid fa-code-merge me-2 ms-2 text-primary"></i>{i18n.catalog["text_562769fa6a1f"]}</span>
                </div>
                <div className="info-row text-secondary">
                    <span>✓</span> <span className="value ms-2 ps-2 border-end">{i18n.catalog["text_782fcb9f4e4b"]}</span>
                </div>
                <div className="info-row text-secondary">
                    <span>✓</span> <span className="value ms-2 ps-2 border-end">{i18n.catalog["text_35482b26d556"]}</span>
                </div>
                <div className="info-row text-secondary">
                    <span>✓</span> <span className="value ms-2 ps-2 border-end">{i18n.catalog["text_7d394e4c9590"]}</span>
                </div>
            </div>
        </div>
    );
}
