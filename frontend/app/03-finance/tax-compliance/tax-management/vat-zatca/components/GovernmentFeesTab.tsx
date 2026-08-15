"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, showToast, Table } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";
import { Account, TaxAuthority, TaxType } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function GovernmentFeesTab() {
    const { t: i18n } = useI18n();
    const { canAccess } = useAuthStore();
    const [authorities, setAuthorities] = useState<TaxAuthority[]>([]);
    const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [editingFeeId, setEditingFeeId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Provide default form values corresponding to the API validation
    const [formData, setFormData] = useState<any>({
        tax_authority_id: "",
        name: "",
        code: "",
        calculation_type: "percentage",
        rate: 0,
        fixed_amount: 0,
        gl_account_code: "",
        applicable_areas: ["sales"],
        is_active: true
    });

    const loadSetup = useCallback(async () => {
        try {
            const response: any = await fetchAPI(API_ENDPOINTS.FINANCE.TAX_ENGINE.SETUP);
            if (response.data && Array.isArray(response.data.authorities)) {
                const loadedAuthorities = response.data.authorities;
                setAuthorities(loadedAuthorities);

                // Flatten tax types from all authorities into a single array for the table
                const allTypes: TaxType[] = [];
                loadedAuthorities.forEach((auth: TaxAuthority) => {
                    if (auth.tax_types) {
                        auth.tax_types.forEach((tt) => {
                            allTypes.push({
                                ...tt,
                                tax_authority_name: auth.name
                            } as any);
                        });
                    }
                });
                setTaxTypes(allTypes);
            }
        } catch (e) {
            console.error(e);
            showToast(i18n.catalog["finance.governmentfees.errorLoadingTaxEngineSettings"], "error");
        }
    }, []);

    const loadAccounts = useCallback(async () => {
        try {
            const response: any = await fetchAPI(API_ENDPOINTS.FINANCE.ACCOUNTS.BASE);
            if (response.data) {
                const list = Array.isArray(response.data) ? response.data : (response.data.accounts || []);
                if (Array.isArray(list)) {
                    // Filter down to liability accounts. Ideally we'd pull standard ones.
                    setAccounts(list.filter((a: any) => a.account_type === 'Liability' || a.account_type === 'Expense'));
                }
            }
        } catch (e) {
            console.error(i18n.catalog["common.general.errorLoadingAccounts"], e);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([loadSetup(), loadAccounts()]);
            setIsLoading(false);
        };
        init();
    }, [loadSetup, loadAccounts]);

    const handleOpenDialog = (taxType?: TaxType) => {
        if (taxType) {
            setEditingFeeId(taxType.id);

            // Extract the default rate logic
            let defaultRateObj = taxType.tax_rates?.find(r => r.is_default) || taxType.tax_rates?.[0] || { rate: 0, fixed_amount: 0 };

            // Parse applicable areas correctly
            let areas = ["sales"];
            if (typeof taxType.applicable_areas === 'string') {
                try { areas = JSON.parse(taxType.applicable_areas); } catch { }
            } else if (Array.isArray(taxType.applicable_areas)) {
                areas = taxType.applicable_areas;
            }

            setFormData({
                tax_authority_id: taxType.tax_authority_id,
                name: taxType.name,
                code: taxType.code,
                calculation_type: taxType.calculation_type,
                rate: defaultRateObj.rate * 100, // Show as percentage UI
                fixed_amount: defaultRateObj.fixed_amount,
                gl_account_code: taxType.gl_account_code || "",
                applicable_areas: areas,
                is_active: taxType.is_active
            });
        } else {
            setEditingFeeId(null);
            setFormData({
                tax_authority_id: authorities.length > 0 ? authorities[0].id : "",
                name: "",
                code: catalogText(i18n, "finance.governmentfees.fee", { value0: Date.now().toString().slice(-4) }),
                calculation_type: "percentage",
                rate: 0,
                fixed_amount: 0,
                gl_account_code: "",
                applicable_areas: ["sales"],
                is_active: true
            });
        }
        setDialogOpen(true);
    };

    const toggleArea = (area: string) => {
        const current = formData.applicable_areas as string[];
        if (current.includes(area)) {
            setFormData({ ...formData, applicable_areas: current.filter(a => a !== area) });
        } else {
            setFormData({ ...formData, applicable_areas: [...current, area] });
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.code || !formData.tax_authority_id) {
            showToast(i18n.catalog["finance.governmentfees.pleaseEnterRequiredFieldsNameCodeEntity"], "error");
            return;
        }

        try {
            const payload = {
                ...formData,
                rate: formData.calculation_type === 'percentage' ? (Number(formData.rate) / 100) : 0,
                fixed_amount: formData.calculation_type === 'fixed_amount' ? Number(formData.fixed_amount) : 0,
            };

            if (editingFeeId) {
                await fetchAPI(API_ENDPOINTS.FINANCE.TAX_ENGINE.TYPES.withId(editingFeeId), {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
                showToast(i18n.catalog["finance.governmentfees.taxCategoryObligationUpdatedSuccessfully"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.FINANCE.TAX_ENGINE.TYPES.BASE, {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
                showToast(i18n.catalog["finance.governmentfees.taxCategoryObligationAddedSuccessfully"], "success");
            }
            setDialogOpen(false);
            loadSetup();
        } catch (e) {
            console.error(e);
            showToast(i18n.catalog["finance.governmentfees.errorOccurredWhileSaving"], "error");
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            await fetchAPI(API_ENDPOINTS.FINANCE.TAX_ENGINE.TYPES.withId(deleteId), { method: "DELETE" });
            showToast(i18n.catalog["common.general.deletedSuccessfully"], "success");
            loadSetup();
        } catch (e) {
            showToast(i18n.catalog["finance.governmentfees.errorOccurredDuringDeleteCommitUsedOperations"], "error");
        } finally {
            setConfirmDialogOpen(false);
        }
    };

    const getAccountName = (code: string) => {
        const acc = accounts.find(a => a.account_code === code);
        return acc ? `${acc.account_code} - ${acc.account_name}` : code;
    };

    const columns: Column<TaxType>[] = [
        {
            key: "code",
            header: i18n.catalog["common.general.code"],
            render: (fee) => <span className="text-muted">{fee.code}</span>
        },
        {
            key: "name",
            header: i18n.catalog["common.general.name"],
        },
        {
            key: "calculation_type",
            header: i18n.catalog["common.general.type.alternative3"],
            render: (fee) => fee.calculation_type === 'percentage' ? i18n.catalog["common.general.percentage.alternative2"] : i18n.catalog["finance.governmentfees.fixedAmount"],
        },
        {
            key: "gl_account_code",
            header: i18n.catalog["finance.governmentfees.entityAuthority"],
            render: (fee: any) => <span className="badge badge-info">{fee.tax_authority_name || i18n.catalog["finance.governmentfees.unspecifiedEntity"]}</span>
        },
        {
            key: "gl_account_code", // Just to render something different
            header: i18n.catalog["common.general.value"],
            render: (fee) => {
                const defRate = fee.tax_rates?.find(r => r.is_default) || fee.tax_rates?.[0];
                if (!defRate) return '-';
                return fee.calculation_type === 'percentage'
                    ? catalogText(i18n, "common.general.message.alternative4", { value0: Number(defRate.rate * 100).toFixed(2) })
                    : catalogText(i18n, "finance.governmentfees.sar", { value0: defRate.fixed_amount });
            },
        },
        {
            key: "tax_authority_id",
            header: i18n.catalog["finance.governmentfees.applicationScope"],
            render: (fee) => {
                let areas: string[] = [];
                try {
                    areas = typeof fee.applicable_areas === 'string'
                        ? JSON.parse(fee.applicable_areas)
                        : (fee.applicable_areas || []);

                    if (!Array.isArray(areas)) {
                        areas = [];
                    }
                } catch {
                    areas = [];
                }

                return areas.map((a: string) => (
                    <span key={a} className="badge badge-secondary me-1 ms-1">
                        {a === 'sales' ? i18n.catalog["common.general.sales"] : a === 'purchases' ? i18n.catalog["common.general.purchases"] : a === 'payroll' ? i18n.catalog["common.general.payroll.alternative2"] : a}
                    </span>
                ));
            }
        },
        {
            key: "is_active",
            header: i18n.catalog["common.general.status.alternative2"],
            render: (fee) => (
                <span className={`badge ${fee.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {fee.is_active ? i18n.catalog["common.general.active"] : i18n.catalog["common.general.inactive"]}
                </span>
            ),
        },
        {
            key: "id",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "edit",
                            title: i18n.catalog["common.general.edit"],
                            variant: "edit",
                            onClick: () => handleOpenDialog(item)
                        },
                        ...(canAccess("settings", "delete") ? [{
                            icon: "trash" as const,
                            title: i18n.catalog["common.general.delete"],
                            variant: "delete" as const,
                            onClick: () => handleDeleteClick(item.id)
                        }] : [])
                    ]}
                />
            ),
        },
    ];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["finance.governmentfees.unifiedTaxesGovernmentLiabilities"]}
                titleIcon="box"
                actions={
                    <Button
                        onClick={() => handleOpenDialog()}
                        variant="primary"
                        icon="plus"
                    >
                        {i18n.catalog["finance.governmentfees.addNewTaxFeeCondition"]}</Button>
                }
            />
            {authorities.length === 0 && !isLoading && (
                <div className="alert alert-warning">
                    {i18n.catalog["finance.governmentfees.pleaseFirstEnsureTaxAuthorityIsEnabledConfigured"]}</div>
            )}

            <Table
                columns={columns}
                data={taxTypes}
                keyExtractor={(fee) => fee.id}
                isLoading={isLoading}
                emptyMessage={i18n.catalog["finance.governmentfees.noDeductionsLiabilitiesRecorded"]}
            />

            <Dialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title={editingFeeId ? i18n.catalog["finance.governmentfees.editConditionCommitment"] : i18n.catalog["finance.governmentfees.addNewTaxConditionObligation"]}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setDialogOpen(false)}>{i18n.catalog["common.general.cancel"]}</button>
                        <button className="btn btn-primary" onClick={handleSave}>{i18n.catalog["finance.governmentfees.saveSendTaxEngine"]}</button>
                    </>
                }
            >
                <div className="alert alert-info py-2">
                    <i className="fa-solid fa-server me-2 ms-2 text-primary"></i>
                    {i18n.catalog["finance.governmentfees.thisPanelIsDirectlyConnectedTaxEngineAll"]}</div>

                <div className="row">
                    <div className="col-md-6 form-group">
                        <Select
                            label={i18n.catalog["finance.governmentfees.authorityTaxAuthority"]}
                            value={formData.tax_authority_id}
                            onChange={(e) => setFormData({ ...formData, tax_authority_id: e.target.value })}
                            disabled={!!editingFeeId}
                        >
                            <option value="">{i18n.catalog["finance.governmentfees.select"]}</option>
                            {authorities.map(auth => (
                                <option key={auth.id} value={auth.id}>{auth.name} ({auth.code})</option>
                            ))}
                        </Select>
                    </div>
                    <div className="col-md-6 form-group">
                        <TextInput
                            label={i18n.catalog["finance.governmentfees.systemCodeCode"]}
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                            placeholder={i18n.catalog["finance.governmentfees.eGVatSaMunicipalFee"]}
                            disabled={!!editingFeeId}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <TextInput
                        label={i18n.catalog["finance.governmentfees.identifier"]}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder={i18n.catalog["finance.governmentfees.enterFeeTaxNameEGVatKharaj"]}
                    />
                </div>

                <div className="row mt-3">
                    <div className="col-12 form-group">
                        <label className="form-label fw-bold"><i className="fa-solid fa-calculator me-2 ms-2"></i>{i18n.catalog["finance.governmentfees.accountFormulas"]}</label>
                        <div className="d-flex gap-4">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="calc_type"
                                    checked={formData.calculation_type === 'percentage'}
                                    onChange={() => setFormData({ ...formData, calculation_type: 'percentage' })}
                                />
                                <label className="form-check-label">{i18n.catalog["finance.governmentfees.percentageTaxableTotal"]}</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="calc_type"
                                    checked={formData.calculation_type === 'fixed_amount'}
                                    onChange={() => setFormData({ ...formData, calculation_type: 'fixed_amount' })}
                                />
                                <label className="form-check-label">{i18n.catalog["finance.governmentfees.fixedLumpSumAmountPerTransaction"]}</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {formData.calculation_type === 'percentage' ? (
                        <div className="col-md-12 form-group">
                            <TextInput
                                label={i18n.catalog["finance.governmentfees.defaultPercentageValue"]}
                                type="number"
                                step="0.01"
                                value={formData.rate}
                                onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                            />
                            <small className="text-muted">{i18n.catalog["finance.governmentfees.enterPercentageEG15Apply15"]}</small>
                        </div>
                    ) : (
                        <div className="col-md-12 form-group">
                            <TextInput
                                label={i18n.catalog["finance.governmentfees.defaultFixedAmount"]}
                                type="number"
                                step="0.01"
                                value={formData.fixed_amount}
                                onChange={e => setFormData({ ...formData, fixed_amount: parseFloat(e.target.value) })}
                            />
                            <small className="text-muted">{i18n.catalog["finance.governmentfees.additionalAmountAddedAsAbsoluteValueEGFixed"]}</small>
                        </div>
                    )}
                </div>

                <div className="form-group mt-3">
                    <Select
                        label={i18n.catalog["finance.governmentfees.linkChartAccountsAccountGlMappingAccount"]}
                        value={formData.gl_account_code || ""}
                        onChange={e => setFormData({ ...formData, gl_account_code: e.target.value })}
                    >
                        <option value="">{i18n.catalog["finance.governmentfees.noAutomaticLinkingSystemDefault"]}</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.account_code}>
                                {acc.account_code} - {acc.account_name}
                            </option>
                        ))}
                    </Select>
                    <small className="text-muted">{i18n.catalog["finance.governmentfees.mandatorySystemWillPostValuesThisAccountWhen"]}</small>
                </div>

                <div className="form-group mt-3">
                    <label className="form-label fw-bold">{i18n.catalog["finance.governmentfees.applyDeductionCommitmentUnitsApplicableAreas"]}</label>
                    <div className="d-flex gap-3 flex-wrap mt-2">
                        <Checkbox label={i18n.catalog["finance.governmentfees.salesInvoicingSales"]} checked={formData.applicable_areas.includes("sales")} onChange={() => toggleArea("sales")} />
                        <Checkbox label={i18n.catalog["finance.governmentfees.purchasesSuppliersPurchases"]} checked={formData.applicable_areas.includes("purchases")} onChange={() => toggleArea("purchases")} />
                        <Checkbox label={i18n.catalog["finance.governmentfees.salariesHrSystemPayroll"]} checked={formData.applicable_areas.includes("payroll")} onChange={() => toggleArea("payroll")} />
                    </div>
                </div>

                <div className="form-group checkbox-group mt-4">
                    <Checkbox
                        label={i18n.catalog["finance.governmentfees.enableThisAuthorityLocallyClaimCompliance"]}
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                </div>

            </Dialog>

            <ConfirmDialog
                isOpen={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title={i18n.catalog["finance.governmentfees.confirmDeletionTaxRegister"]}
                message={i18n.catalog["finance.governmentfees.areYouSureYouWantDeleteThisTaxGovernment"]}
                confirmText={i18n.catalog["finance.governmentfees.deletePermanently"]}
                confirmVariant="danger"
            />
        </div>
    );
}
