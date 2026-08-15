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
            showToast(i18n.catalog["text_f10d2b4c7fe1"], "error");
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
                showToast(editingCurrency ? i18n.catalog["text_a84d53a49643"] : i18n.catalog["text_ac8ba9fa1df3"], "success");
                setIsModalOpen(false);
                loadData();
            } else {
                showToast(res.message || i18n.catalog["text_83d3d40014f9"], "error");
            }
        } catch (e) {
            showToast(i18n.catalog["text_c574313242be"], "error");
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
            title: i18n.catalog["text_5f9cb54dc136"],
            message: i18n.catalog["text_7a4da5d8f42f"],
            variant: "danger",
            onConfirm: async () => {
                try {
                    const res = await fetchAPI(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.withId(id), { method: "DELETE" });
                    if (res.success) {
                        showToast(i18n.catalog["text_12b6e3813b40"], "success");
                        loadData();
                    } else {
                        showToast(res.message || i18n.catalog["text_f46bfc521612"], "error");
                    }
                } catch {
                    showToast(i18n.catalog["text_3bdb299872fb"], "error");
                }
            }
        });
    };

    const handleToggleActive = async (curr: Currency) => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.TOGGLE(curr.id), { method: "POST" });
            if (res.success) {
                loadData();
                showToast(i18n.catalog["text_5b8139e25125"], "success");
            } else {
                showToast(res.message || i18n.catalog["text_96c789857dbf"], "error");
            }
        } catch {
            showToast(i18n.catalog["text_133019abccaa"], "error");
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
            header: i18n.catalog["text_30ce3a1dae2c"],
            render: (curr) => (
                <>
                    {curr.name} <span className="text-muted">({curr.code})</span>
                    {curr.is_primary && <span className="badge badge-success-light mr-2">{i18n.catalog["text_bfcf48307970"]}</span>}
                </>
            )
        },
        { key: "symbol", header: i18n.catalog["text_589c6420ea10"] },
        {
            key: "exchange_rate",
            header: i18n.catalog["text_fbffb38f5bb4"],
            render: (curr) => Number(curr.exchange_rate).toFixed(4)
        },
        {
            key: "is_active",
            header: i18n.catalog["text_c3a4749caed4"],
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
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (curr) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "edit",
                            title: i18n.catalog["text_113d570d6555"],
                            variant: "edit",
                            onClick: () => handleEdit(curr),
                        },
                        {
                            icon: "trash",
                            title: i18n.catalog["text_59ca629220a6"],
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
            header: i18n.catalog["text_4c49efecd6cb"],
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
            header: i18n.catalog["text_942501f12b14"],
            render: (denom, idx) => (
                <Input
                    type="text"
                    className="form-control form-control-sm"
                    value={denom.label}
                    onChange={e => updateDenomination(idx, 'label', e.target.value)}
                    placeholder={catalogText(i18n, "text_54ef3bb1085e", { value0: denom.value, value1: formData.name || '' })}
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
                <h3>{i18n.catalog["text_1c3c2b1221e4"]}</h3>
                <button className="btn btn-primary" onClick={() => {
                    setEditingCurrency(null);
                    setFormData({ code: "", name: "", symbol: "", exchange_rate: 1, is_active: true, denominations: [] });
                    setIsModalOpen(true);
                }}>
                    <i className="fas fa-plus"></i> {i18n.catalog["text_663cc92bc783"]}</button>
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
                title={editingCurrency ? i18n.catalog["text_f4022a731cd2"] : i18n.catalog["text_45a6ce1b7588"]}
                maxWidth="800px"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</button>
                        <button className="btn btn-primary" onClick={handleSave}>{i18n.catalog["text_ddfcaf9d0144"]}</button>
                    </>
                }
            >
                <div className="settings-form-grid">
                    <div className="form-group">
                        <TextInput
                            label={i18n.catalog["text_d1b89062a819"]}
                            value={formData.name || ""}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <TextInput
                            label={i18n.catalog["text_ee23bfa5cb5f"]}
                            value={formData.code || ""}
                            maxLength={3}
                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div className="form-group">
                        <TextInput
                            label={i18n.catalog["text_589c6420ea10"]}
                            value={formData.symbol || ""}
                            onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <div>
                            <TextInput
                                label={i18n.catalog["text_74724ff99675"]}
                                type="number"
                                step="0.0001"
                                value={formData.exchange_rate}
                                onChange={e => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) })}
                                disabled={editingCurrency?.is_primary}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {editingCurrency?.is_primary
                                    ? i18n.catalog["text_91075dbdfae7"]
                                    : `1 ${formData.code || i18n.catalog["text_584f05614c76"]} = ${formData.exchange_rate} ${policyStatus?.reference_currency?.code || i18n.catalog["text_43bf18235b78"]}`
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <hr />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h4>{i18n.catalog["text_9c18558f1c94"]}</h4>
                    <button className="btn btn-sm btn-secondary" onClick={addDenomination}>
                        <i className="fas fa-plus"></i> {i18n.catalog["text_2653523db0f9"]}</button>
                </div>

                <div className="denominations-table">
                    <Table
                        columns={denominationColumns}
                        data={formData.denominations || []}
                        keyExtractor={(_, idx) => idx}
                        emptyMessage={i18n.catalog["text_c7b5d4fa221f"]}
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
                confirmText={i18n.catalog["text_8f7d74ac0eac"]}
                cancelText={i18n.catalog["text_9a30dc2a96b8"]}
            />
        </div>
    );
}
