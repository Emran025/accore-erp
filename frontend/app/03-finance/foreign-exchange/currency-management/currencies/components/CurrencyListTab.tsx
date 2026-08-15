"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { ActionButtons, Column, Dialog, showToast, Table } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/switch";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { Currency, CurrencyDenomination, PolicyStatus } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function CurrencyListTab() {
    const { t: i18n } = useI18n();
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
    const [policyStatus, setPolicyStatus] = useState<PolicyStatus | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<Currency>>({
        code: "",
        name: "",
        symbol: "",
        exchange_rate: 1,
        is_active: true,
        denominations: []
    });

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: "primary" | "danger";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        variant: "primary"
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [currRes, statusRes] = await Promise.all([
                fetchAPI(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.BASE),
                fetchAPI(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.POLICIES.ACTIVE)
            ]);

            if (currRes.success) {
                setCurrencies(currRes.data as Currency[]);
            }
            if (statusRes.success) {
                setPolicyStatus(statusRes.data as PolicyStatus);
            }
        } catch (e) {
            console.error(e);
            showToast(i18n.catalog["common.general.errorLoadingData"], "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async () => {
        try {
            const url = editingCurrency
                ? API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.withId(editingCurrency.id)
                : API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.BASE;

            const method = editingCurrency ? "PUT" : "POST";

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(formData),
            });

            if (res.success) {
                showToast(editingCurrency ? i18n.catalog["finance.currencylist.currencyUpdated"] : i18n.catalog["finance.currencylist.currencyAdded"], "success");
                setIsModalOpen(false);
                loadData();
            } else {
                showToast(res.message || i18n.catalog["common.general.errorOccurred"], "error");
            }
        } catch (e) {
            showToast(i18n.catalog["common.general.errorSaving"], "error");
        }
    };

    const handleEdit = (curr: Currency) => {
        setEditingCurrency(curr);
        setFormData({
            code: curr.code,
            name: curr.name,
            symbol: curr.symbol,
            exchange_rate: curr.exchange_rate,
            is_active: curr.is_active,
            denominations: curr.denominations || []
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setConfirmDialog({
            isOpen: true,
            title: i18n.catalog["common.general.confirmDeletion"],
            message: i18n.catalog["finance.currencylist.areYouSureYouWantDeleteThisCurrency"],
            variant: "danger",
            onConfirm: async () => {
                try {
                    const res = await fetchAPI(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.withId(id), { method: "DELETE" });
                    if (res.success) {
                        showToast(i18n.catalog["common.general.deletedSuccessfully"], "success");
                        loadData();
                    } else {
                        showToast(res.message || i18n.catalog["common.general.deletionFailed"], "error");
                    }
                } catch {
                    showToast(i18n.catalog["common.general.deletionError"], "error");
                }
            }
        });
    };

    const handleToggleActive = async (curr: Currency) => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.TOGGLE(curr.id), { method: "POST" });
            if (res.success) {
                loadData();
                showToast(i18n.catalog["common.general.statusUpdated"], "success");
            } else {
                showToast(res.message || i18n.catalog["common.general.updateFailed"], "error");
            }
        } catch {
            showToast(i18n.catalog["common.general.updateError"], "error");
        }
    }

    // Banknotes helper in form
    const addDenomination = () => {
        const currentDenoms = formData.denominations || [];
        setFormData({ ...formData, denominations: [...currentDenoms, { value: 0, label: "" }] });
    };

    const removeDenomination = (index: number) => {
        const currentDenoms = [...(formData.denominations || [])];
        currentDenoms.splice(index, 1);
        setFormData({ ...formData, denominations: currentDenoms });
    };

    const updateDenomination = (index: number, field: keyof CurrencyDenomination, value: any) => {
        const currentDenoms = [...(formData.denominations || [])];
        currentDenoms[index] = { ...currentDenoms[index], [field]: value };
        setFormData({ ...formData, denominations: currentDenoms });
    };

    const columns: Column<Currency>[] = [
        {
            key: "name",
            header: i18n.catalog["common.general.currency"],
            render: (curr) => (
                <>
                    {curr.name} <span className="text-muted">({curr.code})</span>
                    {curr.is_primary && <span className="badge badge-success-light mr-2">{i18n.catalog["common.general.home"]}</span>}
                </>
            )
        },
        { key: "symbol", header: i18n.catalog["common.general.code"] },
        {
            key: "exchange_rate",
            header: i18n.catalog["common.general.exchangeRate"],
            render: (curr) => Number(curr.exchange_rate).toFixed(4)
        },
        {
            key: "is_active",
            header: i18n.catalog["common.general.status.alternative2"],
            render: (curr) => (
                <Switch
                    checked={curr.is_active}
                    onChange={() => handleToggleActive(curr)}
                    disabled={curr.is_primary}
                />
            )
        },
        {
            key: "actions",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (curr) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "edit",
                            title: i18n.catalog["common.general.edit"],
                            variant: "edit",
                            onClick: () => handleEdit(curr),
                        },
                        {
                            icon: "trash",
                            title: i18n.catalog["common.general.delete"],
                            variant: "delete",
                            onClick: () => handleDelete(curr.id),
                        }
                    ]}
                />
            ),
        },
    ];

    const denominationColumns: Column<CurrencyDenomination>[] = [
        {
            key: "value",
            header: i18n.catalog["common.general.value"],
            render: (denom, idx) => (
                <Input
                    type="number"
                    className="form-control form-control-sm"
                    value={denom.value}
                    onChange={e => updateDenomination(idx, 'value', parseFloat(e.target.value))}
                />
            )
        },
        {
            key: "label",
            header: i18n.catalog["finance.currencylist.titleOptional"],
            render: (denom, idx) => (
                <Input
                    type="text"
                    className="form-control form-control-sm"
                    value={denom.label}
                    onChange={e => updateDenomination(idx, 'label', e.target.value)}
                    placeholder={catalogText(i18n, "common.general.notAvailable.alternative3", { value0: denom.value, value1: formData.name || '' })}
                />
            )
        },
        {
            key: "actions",
            header: "",
            render: (_, idx) => (
                <button className="btn-icon text-danger" onClick={() => removeDenomination(idx)}>
                    {getIcon("trash")}
                </button>
            )
        }
    ];

    return (
        <div className="sales-card animate-fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>{i18n.catalog["finance.currencylist.currencySettings"]}</h3>
                <button className="btn btn-primary" onClick={() => {
                    setEditingCurrency(null);
                    setFormData({ code: "", name: "", symbol: "", exchange_rate: 1, is_active: true, denominations: [] });
                    setIsModalOpen(true);
                }}>
                    <i className="fas fa-plus"></i> {i18n.catalog["finance.currencylist.addCurrency"]}</button>
            </div>

            <Table
                data={currencies}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={loading}
            />

            <Dialog
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCurrency ? i18n.catalog["finance.currencylist.editCurrency"] : i18n.catalog["finance.currencylist.addNewCurrency"]}
                maxWidth="800px"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>{i18n.catalog["common.general.cancel"]}</button>
                        <button className="btn btn-primary" onClick={handleSave}>{i18n.catalog["common.general.save"]}</button>
                    </>
                }
            >
                <div className="settings-form-grid">
                    <div className="form-group">
                        <TextInput
                            label={i18n.catalog["finance.currencylist.currencyName"]}
                            value={formData.name || ""}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <TextInput
                            label={i18n.catalog["finance.currencylist.codeIso"]}
                            value={formData.code || ""}
                            maxLength={3}
                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div className="form-group">
                        <TextInput
                            label={i18n.catalog["common.general.code"]}
                            value={formData.symbol || ""}
                            onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <div>
                            <TextInput
                                label={i18n.catalog["finance.currencylist.exchangeRateVsBaseCurrency"]}
                                type="number"
                                step="0.0001"
                                value={formData.exchange_rate}
                                onChange={e => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) })}
                                disabled={editingCurrency?.is_primary}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {editingCurrency?.is_primary
                                    ? i18n.catalog["finance.currencylist.baseCurrencyExchangeRateCannotBeChanged"]
                                    : `1 ${formData.code || i18n.catalog["common.general.unit"]} = ${formData.exchange_rate} ${policyStatus?.reference_currency?.code || i18n.catalog["finance.currencylist.baseCurrency"]}`
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <hr />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h4>{i18n.catalog["finance.currencylist.currencyDenominationsBanknotes"]}</h4>
                    <button className="btn btn-sm btn-secondary" onClick={addDenomination}>
                        <i className="fas fa-plus"></i> {i18n.catalog["finance.currencylist.addCategory"]}</button>
                </div>

                <div className="denominations-table">
                    <Table
                        columns={denominationColumns}
                        data={formData.denominations || []}
                        keyExtractor={(_, idx) => idx}
                        emptyMessage={i18n.catalog["finance.currencylist.noCashCategoriesAdded"]}
                    />
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmVariant={confirmDialog.variant}
                confirmText={i18n.catalog["common.general.confirm"]}
                cancelText={i18n.catalog["common.general.cancel"]}
            />
        </div>
    );
}
