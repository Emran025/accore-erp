"use client";

import { useI18n } from "@/lib/i18n";
import { showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useCallback, useEffect, useState } from "react";
import { MainLayout } from "@/components/layout";

interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    exchange_rate: number;
}

interface ConversionResult {
    original_amount: number;
    converted_amount: number;
    exchange_rate: number;
    source_currency_id: number;
    target_currency_id: number;
}

export default function FxOperationsPage() {
    const { t: i18n } = useI18n();
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState(false);
    const [result, setResult] = useState<ConversionResult | null>(null);

    const [formData, setFormData] = useState({
        amount: "",
        source_currency_id: "",
        target_currency_id: "",
        date: "",
    });

    const loadCurrencies = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchAPI(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.BASE);
            if (res.success) {
                setCurrencies(res.data as Currency[]);
            }
        } catch (e) {
            console.error(e);
            showToast(i18n.catalog["text_0f3bf5f8f012"], "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCurrencies();
    }, [loadCurrencies]);

    const handleConvert = async () => {
        if (!formData.amount || !formData.source_currency_id || !formData.target_currency_id) {
            showToast(i18n.catalog["text_0a8eb85d0081"], "error");
            return;
        }

        try {
            setConverting(true);
            const res = await fetchAPI(API_ENDPOINTS.FINANCE.TREASURY.CONVERT, {
                method: "POST",
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    source_currency_id: parseInt(formData.source_currency_id),
                    target_currency_id: parseInt(formData.target_currency_id),
                    date: formData.date || null,
                }),
            });

            if (res.success) {
                setResult(res.data as ConversionResult);
                showToast(i18n.catalog["text_f642b474d11b"], "success");
            } else {
                showToast(res.message || i18n.catalog["text_6fa979efcafd"], "error");
            }
        } catch (e) {
            showToast(i18n.catalog["text_1ac65f6d78f4"], "error");
        } finally {
            setConverting(false);
        }
    };

    const sourceCurrency = currencies.find(c => c.id.toString() === formData.source_currency_id);
    const targetCurrency = currencies.find(c => c.id.toString() === formData.target_currency_id);

    const handleSwap = () => {
        setFormData(prev => ({
            ...prev,
            source_currency_id: prev.target_currency_id,
            target_currency_id: prev.source_currency_id,
        }));
        setResult(null);
    };

    return (
        <MainLayout requiredModule="currency_transfer">
            <div className="settings-wrapper animate-fade">
                <div className="sales-card animate-fade">
                    {/* Header */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <h3 style={{ margin: 0 }}>{i18n.catalog["text_fc6a1b2619b0"]}</h3>
                        <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                            {i18n.catalog["text_6d7a8d138f1b"]}</p>
                    </div>

                    {/* Conversion Form */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        gap: "1.5rem",
                        alignItems: "end",
                        marginBottom: "2rem",
                        padding: "1.5rem",
                        background: "var(--bg-color)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border-color)",
                    }}>
                        {/* Source */}
                        <div>
                            <div className="form-group" style={{ marginBottom: "1rem" }}>
                                <label className="form-label">{i18n.catalog["text_755378c0729d"]}</label>
                                <select
                                    className="form-control"
                                    value={formData.source_currency_id}
                                    onChange={(e) => { setFormData({ ...formData, source_currency_id: e.target.value }); setResult(null); }}
                                >
                                    <option value="">{i18n.catalog["text_7fa36bc2854c"]}</option>
                                    {currencies.filter(c => c.id.toString() !== formData.target_currency_id).map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.symbol} {c.name} ({c.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <TextInput
                                    label={i18n.catalog["text_3cfbd3350215"]}
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => { setFormData({ ...formData, amount: e.target.value }); setResult(null); }}
                                    placeholder={i18n.catalog["text_561b2814d3c0"]}
                                />
                            </div>
                        </div>

                        {/* Swap Button */}
                        <div style={{ textAlign: "center", paddingBottom: "1rem" }}>
                            <button
                                className="btn btn-secondary"
                                onClick={handleSwap}
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 0,
                                }}
                                title={i18n.catalog["text_ae1b1c8c6557"]}
                            >
                                <i className="fas fa-exchange-alt"></i>
                            </button>
                        </div>

                        {/* Target */}
                        <div>
                            <div className="form-group" style={{ marginBottom: "1rem" }}>
                                <label className="form-label">{i18n.catalog["text_e15b38936754"]}</label>
                                <select
                                    className="form-control"
                                    value={formData.target_currency_id}
                                    onChange={(e) => { setFormData({ ...formData, target_currency_id: e.target.value }); setResult(null); }}
                                >
                                    <option value="">{i18n.catalog["text_7fa36bc2854c"]}</option>
                                    {currencies.filter(c => c.id.toString() !== formData.source_currency_id).map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.symbol} {c.name} ({c.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <TextInput
                                    label={i18n.catalog["text_665cb85a9cac"]}
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => { setFormData({ ...formData, date: e.target.value }); setResult(null); }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Convert Button */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleConvert}
                            disabled={converting || !formData.amount || !formData.source_currency_id || !formData.target_currency_id}
                            style={{ minWidth: "200px", padding: "0.75rem 2rem", fontSize: "1rem" }}
                        >
                            {converting ? (
                                <><span className="btn-spinner" style={{ width: '16px', height: '16px', marginLeft: '0.5rem' }}></span> {i18n.catalog["text_d43a71f3c3e4"]}</>
                            ) : (
                                <><i className="fas fa-sync-alt"></i> {i18n.catalog["text_4f0356aad001"]}</>
                            )}
                        </button>
                    </div>

                    {/* Result */}
                    {result && (
                        <div className="animate-fade" style={{
                            padding: "2rem",
                            background: "var(--primary-subtle)",
                            borderRadius: "var(--radius-lg)",
                            border: "1px solid var(--primary-color)",
                            textAlign: "center",
                        }}>
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                                <div>
                                    <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>{i18n.catalog["text_ab7099c73d2c"]}</p>
                                    <h2 style={{ margin: "0.25rem 0", fontFamily: "monospace" }}>
                                        {Number(result.original_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        <span className="text-muted" style={{ fontSize: "0.9rem", marginRight: "0.5rem" }}>{sourceCurrency?.code}</span>
                                    </h2>
                                </div>

                                <i className="fas fa-arrow-left" style={{ fontSize: "1.5rem", color: "var(--primary-color)" }}></i>

                                <div>
                                    <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>{i18n.catalog["text_20eff811c130"]}</p>
                                    <h2 style={{ margin: "0.25rem 0", fontFamily: "monospace", color: "var(--primary-color)" }}>
                                        {Number(result.converted_amount).toLocaleString("en-US", { minimumFractionDigits: 4 })}
                                        <span className="text-muted" style={{ fontSize: "0.9rem", marginRight: "0.5rem" }}>{targetCurrency?.code}</span>
                                    </h2>
                                </div>
                            </div>

                            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(255,255,255,0.5)", borderRadius: "var(--radius-md)", display: "inline-block" }}>
                                <span className="text-muted">{i18n.catalog["text_d15bf3739039"]}</span>
                                <strong style={{ fontFamily: "monospace" }}>{Number(result.exchange_rate).toFixed(6)}</strong>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
