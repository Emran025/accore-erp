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
            showToast(i18n.catalog["finance.exchangeRates.errorLoadingExchangeRateLog"], "error");
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
            showToast(i18n.catalog["common.general.pleaseFillAllRequiredFields"], "error");
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
                showToast(i18n.catalog["finance.exchangeRates.exchangeRateRecordedSuccessfully"], "success");
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
                showToast(res.message || i18n.catalog["finance.exchangeRates.failedRecordExchangeRate"], "error");
            }
        } catch (e) {
            showToast(i18n.catalog["common.general.connectionError"], "error");
        }
    };

    const columns: Column<ExchangeRateHistory>[] = [
        {
            key: "currency",
            header: i18n.catalog["common.general.sourceCurrency.alternative2"],
            render: (row) => (
                <span>
                    {row.currency?.name || "-"}{" "}
                    <span className="text-muted">({row.currency?.code})</span>
                </span>
            ),
        },
        {
            key: "target_currency",
            header: i18n.catalog["common.general.targetCurrency"],
            render: (row) => (
                <span>
                    {row.target_currency?.name || "-"}{" "}
                    <span className="text-muted">({row.target_currency?.code})</span>
                </span>
            ),
        },
        {
            key: "exchange_rate",
            header: i18n.catalog["common.general.exchangeRate"],
            render: (row) => (
                <strong style={{ fontFamily: "monospace", fontSize: "0.95rem" }}>
                    {Number(row.exchange_rate).toFixed(6)}
                </strong>
            ),
        },
        {
            key: "effective_date",
            header: i18n.catalog["common.general.effectiveDate"],
            render: (row) => row.effective_date,
        },
        {
            key: "source",
            header: i18n.catalog["common.general.source"],
            render: (row) => (
                <span className={`badge ${row.source === 'MANUAL' ? 'badge-info-light' : row.source === 'CENTRAL_BANK' ? 'badge-success-light' : 'badge-warning-light'}`}>
                    {row.source === "MANUAL" ? i18n.catalog["common.general.manual"] : row.source === "CENTRAL_BANK" ? i18n.catalog["common.general.centralBank"] : "API"}
                </span>
            ),
        },
        {
            key: "created_by",
            header: i18n.catalog["common.general.notAvailable.alternative7"],
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
                            <h3 style={{ margin: 0 }}>{i18n.catalog["common.general.exchangeRates"]}</h3>
                            <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                                {i18n.catalog["finance.exchangeRates.manageExchangeRateTablesHistoricalValuationRecords"]}</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <i className="fas fa-plus"></i> {i18n.catalog["finance.exchangeRates.recordExchangeRate"]}</button>
                    </div>

                    {/* Filters */}
                    <div className="settings-form-grid" style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--bg-color)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                        <div className="form-group">
                            <label className="form-label">{i18n.catalog["common.general.currency"]}</label>
                            <select
                                className="form-control"
                                value={filterCurrencyId}
                                onChange={(e) => setFilterCurrencyId(e.target.value)}
                            >
                                <option value="">{i18n.catalog["common.general.all"]}</option>
                                {currencies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{i18n.catalog["common.general.againstCurrency"]}</label>
                            <select
                                className="form-control"
                                value={filterTargetId}
                                onChange={(e) => setFilterTargetId(e.target.value)}
                            >
                                <option value="">{i18n.catalog["common.general.all"]}</option>
                                {currencies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <TextInput
                                label={i18n.catalog["common.general.date.alternative6"]}
                                type="date"
                                value={filterFromDate}
                                onChange={(e) => setFilterFromDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <TextInput
                                label={i18n.catalog["common.general.date.alternative2"]}
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
                        emptyMessage={i18n.catalog["finance.exchangeRates.noExchangeRateRecords"]}
                    />
                </div>

                {/* Record Rate Dialog */}
                <Dialog
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={i18n.catalog["finance.exchangeRates.registerNewExchangeRate"]}
                    maxWidth="600px"
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>{i18n.catalog["common.general.cancel"]}</button>
                            <button className="btn btn-primary" onClick={handleRecordRate}>{i18n.catalog["common.general.register"]}</button>
                        </>
                    }
                >
                    <div className="settings-form-grid">
                        <div className="form-group">
                            <label className="form-label">{i18n.catalog["common.general.sourceCurrency"]}</label>
                            <select
                                className="form-control"
                                value={formData.currency_id}
                                onChange={(e) => setFormData({ ...formData, currency_id: e.target.value })}
                            >
                                <option value="">{i18n.catalog["common.general.selectCurrency"]}</option>
                                {currencies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{i18n.catalog["common.general.targetCurrency.alternative2"]}</label>
                            <select
                                className="form-control"
                                value={formData.target_currency_id}
                                onChange={(e) => setFormData({ ...formData, target_currency_id: e.target.value })}
                            >
                                <option value="">{i18n.catalog["common.general.selectCurrency"]}</option>
                                {currencies.filter((c) => c.id.toString() !== formData.currency_id).map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <TextInput
                                label={i18n.catalog["finance.exchangeRates.exchangeRate"]}
                                type="number"
                                step="0.00000001"
                                value={formData.exchange_rate}
                                onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                                placeholder={i18n.catalog["finance.exchangeRates.message000000000"]}
                            />
                        </div>
                        <div className="form-group">
                            <TextInput
                                label={i18n.catalog["common.general.effectiveDate"]}
                                type="date"
                                value={formData.effective_date}
                                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{i18n.catalog["common.general.source"]}</label>
                            <select
                                className="form-control"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            >
                                <option value="MANUAL">{i18n.catalog["common.general.manual"]}</option>
                                <option value="CENTRAL_BANK">{i18n.catalog["common.general.centralBank"]}</option>
                                <option value="API">API</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <TextInput
                                label={i18n.catalog["common.general.reference"]}
                                value={formData.source_reference}
                                onChange={(e) => setFormData({ ...formData, source_reference: e.target.value })}
                                placeholder={i18n.catalog["finance.exchangeRates.referenceNumberOptional"]}
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        </MainLayout>
    );
}
