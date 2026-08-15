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
            showToast(i18n.catalog["text_e3571b919fa7"], "error");
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
            console.error(i18n.catalog["text_a8ded9e0e1f3"], e);
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
                code: catalogText(i18n, "text_b0a552ae24e7", { value0: Date.now().toString().slice(-4) }),
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
            showToast(i18n.catalog["text_536a6319bbe4"], "error");
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
                showToast(i18n.catalog["text_319dedfa47a6"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.FINANCE.TAX_ENGINE.TYPES.BASE, {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
                showToast(i18n.catalog["text_557a7cfcf2eb"], "success");
            }
            setDialogOpen(false);
            loadSetup();
        } catch (e) {
            console.error(e);
            showToast(i18n.catalog["text_1357fc9e2935"], "error");
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
            showToast(i18n.catalog["text_12b6e3813b40"], "success");
            loadSetup();
        } catch (e) {
            showToast(i18n.catalog["text_308649cd381d"], "error");
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
            header: i18n.catalog["text_589c6420ea10"],
            render: (fee) => <span className="text-muted">{fee.code}</span>
        },
        {
            key: "name",
            header: i18n.catalog["text_52ab09847cf8"],
        },
        {
            key: "calculation_type",
            header: i18n.catalog["text_caa3f2bb4a36"],
            render: (fee) => fee.calculation_type === 'percentage' ? i18n.catalog["text_d75c4c7090fc"] : i18n.catalog["text_25162762270b"],
        },
        {
            key: "gl_account_code",
            header: i18n.catalog["text_8aa51c1c6ee3"],
            render: (fee: any) => <span className="badge badge-info">{fee.tax_authority_name || i18n.catalog["text_5f4b44eb6311"]}</span>
        },
        {
            key: "gl_account_code", // Just to render something different
            header: i18n.catalog["text_4c49efecd6cb"],
            render: (fee) => {
                const defRate = fee.tax_rates?.find(r => r.is_default) || fee.tax_rates?.[0];
                if (!defRate) return '-';
                return fee.calculation_type === 'percentage'
                    ? catalogText(i18n, "text_518ef1823474", { value0: Number(defRate.rate * 100).toFixed(2) })
                    : catalogText(i18n, "text_239530228355", { value0: defRate.fixed_amount });
            },
        },
        {
            key: "tax_authority_id",
            header: i18n.catalog["text_bc2fd164652d"],
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
                        {a === 'sales' ? i18n.catalog["text_7bf1b13416bc"] : a === 'purchases' ? i18n.catalog["text_2a14f93caa32"] : a === 'payroll' ? i18n.catalog["text_8da58f1c866a"] : a}
                    </span>
                ));
            }
        },
        {
            key: "is_active",
            header: i18n.catalog["text_c3a4749caed4"],
            render: (fee) => (
                <span className={`badge ${fee.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {fee.is_active ? i18n.catalog["text_629e90b3af3d"] : i18n.catalog["text_b719ac8add4e"]}
                </span>
            ),
        },
        {
            key: "id",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "edit",
                            title: i18n.catalog["text_113d570d6555"],
                            variant: "edit",
                            onClick: () => handleOpenDialog(item)
                        },
                        ...(canAccess("settings", "delete") ? [{
                            icon: "trash" as const,
                            title: i18n.catalog["text_59ca629220a6"],
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
                title={i18n.catalog["text_7f9b9f257d00"]}
                titleIcon="box"
                actions={
                    <Button
                        onClick={() => handleOpenDialog()}
                        variant="primary"
                        icon="plus"
                    >
                        {i18n.catalog["text_b157eddeae9a"]}</Button>
                }
            />
            {authorities.length === 0 && !isLoading && (
                <div className="alert alert-warning">
                    {i18n.catalog["text_a49de283e4c7"]}</div>
            )}

            <Table
                columns={columns}
                data={taxTypes}
                keyExtractor={(fee) => fee.id}
                isLoading={isLoading}
                emptyMessage={i18n.catalog["text_a1799fb742b3"]}
            />

            <Dialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title={editingFeeId ? i18n.catalog["text_813118d1d14c"] : i18n.catalog["text_9b886d65d0d8"]}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setDialogOpen(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</button>
                        <button className="btn btn-primary" onClick={handleSave}>{i18n.catalog["text_fa167122a793"]}</button>
                    </>
                }
            >
                <div className="alert alert-info py-2">
                    <i className="fa-solid fa-server me-2 ms-2 text-primary"></i>
                    {i18n.catalog["text_9ab8ac005fd7"]}</div>

                <div className="row">
                    <div className="col-md-6 form-group">
                        <Select
                            label={i18n.catalog["text_2b5ea51d140f"]}
                            value={formData.tax_authority_id}
                            onChange={(e) => setFormData({ ...formData, tax_authority_id: e.target.value })}
                            disabled={!!editingFeeId}
                        >
                            <option value="">{i18n.catalog["text_0969a8197763"]}</option>
                            {authorities.map(auth => (
                                <option key={auth.id} value={auth.id}>{auth.name} ({auth.code})</option>
                            ))}
                        </Select>
                    </div>
                    <div className="col-md-6 form-group">
                        <TextInput
                            label={i18n.catalog["text_4c44c2f6d96c"]}
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                            placeholder={i18n.catalog["text_6255dc6b0d5a"]}
                            disabled={!!editingFeeId}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <TextInput
                        label={i18n.catalog["text_d4b9fadaaeb8"]}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder={i18n.catalog["text_d3647115774c"]}
                    />
                </div>

                <div className="row mt-3">
                    <div className="col-12 form-group">
                        <label className="form-label fw-bold"><i className="fa-solid fa-calculator me-2 ms-2"></i>{i18n.catalog["text_8a2a3bb6840f"]}</label>
                        <div className="d-flex gap-4">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="calc_type"
                                    checked={formData.calculation_type === 'percentage'}
                                    onChange={() => setFormData({ ...formData, calculation_type: 'percentage' })}
                                />
                                <label className="form-check-label">{i18n.catalog["text_9b4974321a50"]}</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="calc_type"
                                    checked={formData.calculation_type === 'fixed_amount'}
                                    onChange={() => setFormData({ ...formData, calculation_type: 'fixed_amount' })}
                                />
                                <label className="form-check-label">{i18n.catalog["text_bbc4d2fb8ec6"]}</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {formData.calculation_type === 'percentage' ? (
                        <div className="col-md-12 form-group">
                            <TextInput
                                label={i18n.catalog["text_4eca62da9b5e"]}
                                type="number"
                                step="0.01"
                                value={formData.rate}
                                onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                            />
                            <small className="text-muted">{i18n.catalog["text_cbce18b6619c"]}</small>
                        </div>
                    ) : (
                        <div className="col-md-12 form-group">
                            <TextInput
                                label={i18n.catalog["text_46a70c68447f"]}
                                type="number"
                                step="0.01"
                                value={formData.fixed_amount}
                                onChange={e => setFormData({ ...formData, fixed_amount: parseFloat(e.target.value) })}
                            />
                            <small className="text-muted">{i18n.catalog["text_9b2632ff358c"]}</small>
                        </div>
                    )}
                </div>

                <div className="form-group mt-3">
                    <Select
                        label={i18n.catalog["text_131568c66394"]}
                        value={formData.gl_account_code || ""}
                        onChange={e => setFormData({ ...formData, gl_account_code: e.target.value })}
                    >
                        <option value="">{i18n.catalog["text_b4685a3ce36a"]}</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.account_code}>
                                {acc.account_code} - {acc.account_name}
                            </option>
                        ))}
                    </Select>
                    <small className="text-muted">{i18n.catalog["text_9e0148908205"]}</small>
                </div>

                <div className="form-group mt-3">
                    <label className="form-label fw-bold">{i18n.catalog["text_b34512b79b13"]}</label>
                    <div className="d-flex gap-3 flex-wrap mt-2">
                        <Checkbox label={i18n.catalog["text_d60ee97fdd55"]} checked={formData.applicable_areas.includes("sales")} onChange={() => toggleArea("sales")} />
                        <Checkbox label={i18n.catalog["text_fe751a4822c8"]} checked={formData.applicable_areas.includes("purchases")} onChange={() => toggleArea("purchases")} />
                        <Checkbox label={i18n.catalog["text_456da660292f"]} checked={formData.applicable_areas.includes("payroll")} onChange={() => toggleArea("payroll")} />
                    </div>
                </div>

                <div className="form-group checkbox-group mt-4">
                    <Checkbox
                        label={i18n.catalog["text_ab233f36e977"]}
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                </div>

            </Dialog>

            <ConfirmDialog
                isOpen={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title={i18n.catalog["text_0958cf4c59b2"]}
                message={i18n.catalog["text_25cfca5886a9"]}
                confirmText={i18n.catalog["text_cd6f896cc0ee"]}
                confirmVariant="danger"
            />
        </div>
    );
}
