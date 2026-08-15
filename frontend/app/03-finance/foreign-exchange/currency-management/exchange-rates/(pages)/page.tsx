"use client";

import { useI18n } from "@/lib/i18n";
import { ActionButtons, Column, Dialog, showToast, Table } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useCallback, useEffect, useState } from "react";
import { MainLayout } from "@/components/layout";

interface ExchangeRateHistory {
    id: number;
    currency_id: number;
    target_currency_id: number;
    exchange_rate: number;
    effective_date: string;
    effective_time: string | null;
    source: string;
    source_reference: string | null;
    currency?: { code: string; name: string; symbol: string };
    target_currency?: { code: string; name: string; symbol: string };
    created_by?: { name: string };
    created_at: string;
}

interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
}

export default function ExchangeRatesPage() {
    const { t: i18n } = useI18n();
    const [history, setHistory] = useState<ExchangeRateHistory[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [filterCurrencyId, setFilterCurrencyId] = useState<string>("");
    const [filterTargetId, setFilterTargetId] = useState<string>("");
    const [filterFromDate, setFilterFromDate] = useState<string>("");
    const [filterToDate, setFilterToDate] = useState<string>("");

    // Record rate form
    const [formData, setFormData] = useState({
        currency_id: "",
        target_currency_id: "",
        exchange_rate: "",
        effective_date: new Date().toISOString().split("T")[0],
        source: "MANUAL",
        source_reference: "",
    });

    const loadCurrencies = useCallback(async () => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.BASE);
            if (res.success) {
                setCurrencies(res.data as Currency[]);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const loadHistory = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterCurrencyId) params.append("currency_id", filterCurrencyId);
            if (filterTargetId) params.append("target_currency_id", filterTargetId);
            if (filterFromDate) params.append("from_date", filterFromDate);
            if (filterToDate) params.append("to_date", filterToDate);

            const url = `${API_ENDPOINTS.FINANCE.TREASURY.RATES_HISTORY}?${params.toString()}`;
            const res = await fetchAPI(url);
            if (res.success) {
                setHistory(res.data as ExchangeRateHistory[]);
            }
        } catch (e) {
            console.error(e);
            showToast(i18n.catalog["text_153661a775a9"], "error");
        } finally {
            setLoading(false);
        }
    }, [filterCurrencyId, filterTargetId, filterFromDate, filterToDate]);

    useEffect(() => {
        loadCurrencies();
    }, [loadCurrencies]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleRecordRate = async () => {
        if (!formData.currency_id || !formData.target_currency_id || !formData.exchange_rate) {
            showToast(i18n.catalog["text_0a8eb85d0081"], "error");
            return;
        }

        try {
            const res = await fetchAPI(API_ENDPOINTS.FINANCE.TREASURY.RECORD_RATE, {
                method: "POST",
                body: JSON.stringify({
                    currency_id: parseInt(formData.currency_id),
                    target_currency_id: parseInt(formData.target_currency_id),
                    exchange_rate: parseFloat(formData.exchange_rate),
                    effective_date: formData.effective_date || null,
                    source: formData.source,
                    source_reference: formData.source_reference || null,
                }),
            });

            if (res.success) {
                showToast(i18n.catalog["text_6147fbcc672d"], "success");
                setIsModalOpen(false);
                setFormData({
                    currency_id: "",
                    target_currency_id: "",
                    exchange_rate: "",
                    effective_date: new Date().toISOString().split("T")[0],
                    source: "MANUAL",
                    source_reference: "",
                });
                loadHistory();
            } else {
                showToast(res.message || i18n.catalog["text_a9fadfcd96ed"], "error");
            }
        } catch (e) {
            showToast(i18n.catalog["text_1ac65f6d78f4"], "error");
        }
    };

    const columns: Column<ExchangeRateHistory>[] = [
        {
            key: "currency",
            header: i18n.catalog["text_a049cbb14f26"],
            render: (row) => (
                <span>
                    {row.currency?.name || "-"}{" "}
                    <span className="text-muted">({row.currency?.code})</span>
                </span>
            ),
        },
        {
            key: "target_currency",
            header: i18n.catalog["text_a7af2ad5f979"],
            render: (row) => (
                <span>
                    {row.target_currency?.name || "-"}{" "}
                    <span className="text-muted">({row.target_currency?.code})</span>
                </span>
            ),
        },
        {
            key: "exchange_rate",
            header: i18n.catalog["text_fbffb38f5bb4"],
            render: (row) => (
                <strong style={{ fontFamily: "monospace", fontSize: "0.95rem" }}>
                    {Number(row.exchange_rate).toFixed(6)}
                </strong>
            ),
        },
        {
            key: "effective_date",
            header: i18n.catalog["text_6f53e00bf25e"],
            render: (row) => row.effective_date,
        },
        {
            key: "source",
            header: i18n.catalog["text_64660bb87d89"],
            render: (row) => (
                <span className={`badge ${row.source === 'MANUAL' ? 'badge-info-light' : row.source === 'CENTRAL_BANK' ? 'badge-success-light' : 'badge-warning-light'}`}>
                    {row.source === "MANUAL" ? i18n.catalog["text_a62cb7790ba3"] : row.source === "CENTRAL_BANK" ? i18n.catalog["text_3442aeef4a07"] : "API"}
                </span>
            ),
        },
        {
            key: "created_by",
            header: i18n.catalog["text_a98b66bae2c9"],
            render: (row) => row.created_by?.name || "-",
        },
    ];

    return (
        <MainLayout requiredModule="exchange_rate">
            <div className="settings-wrapper animate-fade">
                <div className="sales-card animate-fade">
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <div>
                            <h3 style={{ margin: 0 }}>{i18n.catalog["text_4d9dae2a2d01"]}</h3>
                            <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                                {i18n.catalog["text_5cdedf40687a"]}</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <i className="fas fa-plus"></i> {i18n.catalog["text_57a232cd7554"]}</button>
                    </div>

                    {/* Filters */}
                    <div className="settings-form-grid" style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--bg-color)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                        <div className="form-group">
                            <label className="form-label">{i18n.catalog["text_30ce3a1dae2c"]}</label>
                            <select
                                className="form-control"
                                value={filterCurrencyId}
                                onChange={(e) => setFilterCurrencyId(e.target.value)}
                            >
                                <option value="">{i18n.catalog["text_65f276da33cf"]}</option>
                                {currencies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{i18n.catalog["text_219c5815ace0"]}</label>
                            <select
                                className="form-control"
                                value={filterTargetId}
                                onChange={(e) => setFilterTargetId(e.target.value)}
                            >
                                <option value="">{i18n.catalog["text_65f276da33cf"]}</option>
                                {currencies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <TextInput
                                label={i18n.catalog["text_996988dbc52e"]}
                                type="date"
                                value={filterFromDate}
                                onChange={(e) => setFilterFromDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <TextInput
                                label={i18n.catalog["text_217caed1c04f"]}
                                type="date"
                                value={filterToDate}
                                onChange={(e) => setFilterToDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        data={history}
                        columns={columns}
                        keyExtractor={(item) => item.id}
                        isLoading={loading}
                        emptyMessage={i18n.catalog["text_fc0d956bf32a"]}
                    />
                </div>

                {/* Record Rate Dialog */}
                <Dialog
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={i18n.catalog["text_925aac27d609"]}
                    maxWidth="600px"
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</button>
                            <button className="btn btn-primary" onClick={handleRecordRate}>{i18n.catalog["text_dcf52d4105c1"]}</button>
                        </>
                    }
                >
                    <div className="settings-form-grid">
                        <div className="form-group">
                            <label className="form-label">{i18n.catalog["text_755378c0729d"]}</label>
                            <select
                                className="form-control"
                                value={formData.currency_id}
                                onChange={(e) => setFormData({ ...formData, currency_id: e.target.value })}
                            >
                                <option value="">{i18n.catalog["text_7fa36bc2854c"]}</option>
                                {currencies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{i18n.catalog["text_e15b38936754"]}</label>
                            <select
                                className="form-control"
                                value={formData.target_currency_id}
                                onChange={(e) => setFormData({ ...formData, target_currency_id: e.target.value })}
                            >
                                <option value="">{i18n.catalog["text_7fa36bc2854c"]}</option>
                                {currencies.filter((c) => c.id.toString() !== formData.currency_id).map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <TextInput
                                label={i18n.catalog["text_18e2d4abef9a"]}
                                type="number"
                                step="0.00000001"
                                value={formData.exchange_rate}
                                onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                                placeholder={i18n.catalog["text_46927e019820"]}
                            />
                        </div>
                        <div className="form-group">
                            <TextInput
                                label={i18n.catalog["text_6f53e00bf25e"]}
                                type="date"
                                value={formData.effective_date}
                                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{i18n.catalog["text_64660bb87d89"]}</label>
                            <select
                                className="form-control"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            >
                                <option value="MANUAL">{i18n.catalog["text_a62cb7790ba3"]}</option>
                                <option value="CENTRAL_BANK">{i18n.catalog["text_3442aeef4a07"]}</option>
                                <option value="API">API</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <TextInput
                                label={i18n.catalog["text_d6a838d92c8d"]}
                                value={formData.source_reference}
                                onChange={(e) => setFormData({ ...formData, source_reference: e.target.value })}
                                placeholder={i18n.catalog["text_e6188a0d0fa1"]}
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        </MainLayout>
    );
}
