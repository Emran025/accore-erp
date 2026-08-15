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
            console.error(i18n.catalog["finance.zatcasettings.errorLoadingTaxAuthoritySetup"], error);
            showToast(i18n.catalog["finance.zatcasettings.errorLoadingZakatTaxAuthoritySettings"], "error");
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
            showToast(i18n.catalog["finance.zatcasettings.authorityTechnicalAccessPolicySavedSuccessfully"], "success");
            loadAuthority();
        } catch (error) {
            console.error(i18n.catalog["finance.zatcasettings.errorSavingAuthorityFrameworkData"], error);
            showToast(i18n.catalog["finance.zatcasettings.errorOccurredWhileUpdatingDataPleaseReviewPermissions"], "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOnboard = async () => {
        if (!config.zatca_otp) {
            showToast(i18n.catalog["finance.zatcasettings.pleaseEnterOtpCodeDevelopersPortalFatoora"], "error");
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
                showToast(i18n.catalog["finance.zatcasettings.securityTechnicalIntegrationAuthorityCompletedSuccessfullyTokenCaptured"], "success");
                loadAuthority(); // Reload to snatch the updated config
            } else {
                showToast(response.message || i18n.catalog["finance.zatcasettings.failedConnectGovernmentServers"], "error");
            }
        } catch (error) {
            console.error(i18n.catalog["finance.zatcasettings.onboardingLogicExecutionError"], error);
            showToast(i18n.catalog["finance.zatcasettings.credentialsRejectedAuthorityConnectionClosed"], "error");
        } finally {
            setIsOnboarding(false);
        }
    };

    if (isLoading) {
        return <div className="empty-state"><p>{i18n.catalog["finance.zatcasettings.creatingCommunicationChannelsCoreTaxEngine"]}</p></div>;
    }

    if (!authority) {
        return <div className="empty-state"><p>{i18n.catalog["finance.zatcasettings.sorryNoActiveTaxAuthorityWasFoundSystem"]}</p></div>;
    }

    return (
        <div className="animate-fade">
            <PageSubHeader
                title={catalogText(i18n, "finance.zatcasettings.contactCompliancePolicies", { value0: authority.name, value1: authority.code })}
                titleIcon="shield-check"
                actions={
                    <div className="action-buttons">
                        <Button variant="secondary" onClick={loadAuthority} icon="undo">{i18n.catalog["finance.zatcasettings.cancelReload"]}</Button>
                        <Button variant="primary" onClick={handleSave} icon="save" isLoading={isSaving}>{i18n.catalog["finance.zatcasettings.saveAccessPolicies"]}</Button>
                    </div>
                }
            />

            <div className="alert alert-info">
                <i className="fa-solid fa-lock me-2 ms-2"></i>
                <strong>{i18n.catalog["finance.zatcasettings.globalCustomsProtectionSecuritySystem"]}</strong>
                {i18n.catalog["finance.zatcasettings.directDatabaseAccessIsNotPermittedChooseConnection"]}</div>

            <div className="form-group checkbox-group my-3">
                <Checkbox
                    id="is_active"
                    label={catalogText(i18n, "finance.zatcasettings.enableActiveLinkingIntegrationAuthority", { value0: authority.code })}
                    checked={authority.is_active}
                    onChange={(e) => setAuthority({ ...authority, is_active: e.target.checked })}
                />
                <small className="text-muted">{i18n.catalog["finance.zatcasettings.enablingThisOptionWillApplyThisAuthoritySTaxes"]}</small>
            </div>

            <div className="sales-card">
                <h3><i className="fa-solid fa-network-wired me-2 ms-2"></i>{i18n.catalog["finance.zatcasettings.externalLinkingPolicy"]}</h3>
                <div className="row mt-3">
                    <div className="col-md-6 form-group">
                        <Select
                            label={i18n.catalog["finance.zatcasettings.integrationProtocolIntegrationStrategy"]}
                            value={authority.connection_type || 'none'}
                            onChange={(e) => setAuthority({ ...authority, connection_type: e.target.value as any })}
                            options={[
                                { value: "none", label: i18n.catalog["finance.zatcasettings.unlinkedInternalOnlyOffline"] },
                                { value: "push_api", label: i18n.catalog["finance.zatcasettings.signSubmitXmlGovernmentZatcaModel"] },
                                { value: "pull_key", label: i18n.catalog["finance.zatcasettings.grantCodeAgencyRetrieveDataLocally"] }
                            ]}
                        />
                    </div>
                    <div className="col-md-6 form-group">
                        <TextInput
                            label={i18n.catalog["finance.zatcasettings.governmentEndpointServersEndpointUrl"]}
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
                                label={i18n.catalog["finance.zatcasettings.rawSecurityCredentialsSecretKeyOauth"]}
                                value={authority.connection_credentials || ''}
                                type="password"
                                onChange={(e) => setAuthority({ ...authority, connection_credentials: e.target.value })}
                                placeholder={i18n.catalog["finance.zatcasettings.hiddenAutomaticallyLeaveItBlankRetainPreviousValue"]}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="sales-card compact">
                <h3>{getIcon("info-circle")} {i18n.catalog["finance.zatcasettings.credentialsTaxIdCertificateDetailsStage2"]}</h3>

                <div className="row mt-3">
                    <div className="col-md-6 form-group">
                        <Select
                            label={i18n.catalog["finance.zatcasettings.officialWorkEnvironmentEnvironment"]}
                            value={config.zatca_environment}
                            onChange={(e) => setConfig({ ...config, zatca_environment: e.target.value })}
                            options={[
                                { value: "sandbox", label: i18n.catalog["finance.zatcasettings.developerTestEnvironmentSandbox"] },
                                { value: "simulation", label: i18n.catalog["finance.zatcasettings.governmentSimulationEnvironmentSimulation"] },
                                { value: "production", label: i18n.catalog["finance.zatcasettings.liveProductionMonitoringEnvironmentProduction"] }
                            ]}
                        />
                    </div>
                    <div className="col-md-6 form-group">
                        <TextInput
                            label={i18n.catalog["finance.zatcasettings.companyVatNumberVatNumber"]}
                            value={config.zatca_vat_number}
                            onChange={(e) => setConfig({ ...config, zatca_vat_number: e.target.value })}
                            placeholder={i18n.catalog["finance.zatcasettings.message310xxxxxxxxxxxxx"]}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 form-group">
                        <TextInput
                            label={i18n.catalog["finance.zatcasettings.organisationCompanyNameEnglishOrganisationName"]}
                            value={config.zatca_org_name}
                            onChange={(e) => setConfig({ ...config, zatca_org_name: e.target.value })}
                            placeholder={i18n.catalog["finance.zatcasettings.eGMyGlobalCoLtd"]}
                        />
                    </div>
                    <div className="col-md-6 form-group">
                        <TextInput
                            label={i18n.catalog["finance.zatcasettings.systemBranchNameCommonNameUnit"]}
                            value={config.zatca_org_unit_name}
                            onChange={(e) => setConfig({ ...config, zatca_org_unit_name: e.target.value })}
                            placeholder={i18n.catalog["finance.zatcasettings.riyadhBranchIt"]}
                        />
                    </div>
                </div>

                <div className="alert alert-secondary mt-3">
                    <h5 className="mb-2"><i className="fa-solid fa-key text-warning me-2 ms-2"></i>{i18n.catalog["finance.zatcasettings.exportBindingCertificateCsrOtp"]}</h5>
                    <p className="text-muted mb-3">{i18n.catalog["finance.zatcasettings.authorizeSystemEnteringValidOtpSoItCan"]}</p>

                    <div className="row align-items-end">
                        <div className="col-md-8 form-group mb-0">
                            <TextInput
                                label={i18n.catalog["finance.zatcasettings.activationCodeOtpInvoicingGateway"]}
                                value={config.zatca_otp}
                                onChange={(e) => setConfig({ ...config, zatca_otp: e.target.value })}
                                placeholder={i18n.catalog["finance.zatcasettings.message123456"]}
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
                                {i18n.catalog["finance.zatcasettings.secureConnectionRequestOnboard"]}</Button>
                        </div>
                    </div>
                </div>

                {config.zatca_binary_token && (
                    <div className="summary-stat-box mt-3">
                        <div className="stat-item">
                            <span className="stat-label">{i18n.catalog["finance.zatcasettings.securityCertificateStatusKeyStorage"]}</span>
                            <span className="badge badge-success mt-1"><i className="fa-solid fa-check mx-1"></i>{i18n.catalog["finance.zatcasettings.tokenAcquiredSecure"]}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">{i18n.catalog["finance.zatcasettings.certificateReferenceNumberRequestId"]}</span>
                            <code className="stat-value text-muted">{config.zatca_request_id || i18n.catalog["finance.zatcasettings.n"]}</code>
                        </div>
                    </div>
                )}
            </div>

            <div className="invoice-info bg-light">
                <div className="info-row">
                    <span className="label fw-bold"><i className="fa-solid fa-code-merge me-2 ms-2 text-primary"></i>{i18n.catalog["finance.zatcasettings.confirmComplianceGovernmentObligations"]}</span>
                </div>
                <div className="info-row text-secondary">
                    <span>✓</span> <span className="value ms-2 ps-2 border-end">{i18n.catalog["finance.zatcasettings.completeUnificationSingleBaseAvoidTaxFragmentation"]}</span>
                </div>
                <div className="info-row text-secondary">
                    <span>✓</span> <span className="value ms-2 ps-2 border-end">{i18n.catalog["finance.zatcasettings.localSigningBeforePushingGovernmentApiPushMode"]}</span>
                </div>
                <div className="info-row text-secondary">
                    <span>✓</span> <span className="value ms-2 ps-2 border-end">{i18n.catalog["finance.zatcasettings.preventDirectDatabaseAccessProtectAgainstVulnerabilitiesZero"]}</span>
                </div>
            </div>
        </div>
    );
}
