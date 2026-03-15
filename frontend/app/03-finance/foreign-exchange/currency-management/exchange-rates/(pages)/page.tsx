"use client";

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
            const res = await fetchAPI(API_ENDPOINTS.FINANCE.CURRENCIES.BASE);
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
            showToast("خطأ في تحميل سجل أسعار الصرف", "error");
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
            showToast("يرجى ملء جميع الحقول المطلوبة", "error");
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
                showToast("تم تسجيل سعر الصرف بنجاح", "success");
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
                showToast(res.message || "فشل تسجيل سعر الصرف", "error");
            }
        } catch (e) {
            showToast("خطأ في الاتصال", "error");
        }
    };

    const columns: Column<ExchangeRateHistory>[] = [
        {
            key: "currency",
            header: "العملة المصدر",
            render: (row) => (
                <span>
                    {row.currency?.name || "-"}{" "}
                    <span className="text-muted">({row.currency?.code})</span>
                </span>
            ),
        },
        {
            key: "target_currency",
            header: "العملة الهدف",
            render: (row) => (
                <span>
                    {row.target_currency?.name || "-"}{" "}
                    <span className="text-muted">({row.target_currency?.code})</span>
                </span>
            ),
        },
        {
            key: "exchange_rate",
            header: "سعر الصرف",
            render: (row) => (
                <strong style={{ fontFamily: "monospace", fontSize: "0.95rem" }}>
                    {Number(row.exchange_rate).toFixed(6)}
                </strong>
            ),
        },
        {
            key: "effective_date",
            header: "تاريخ السريان",
            render: (row) => row.effective_date,
        },
        {
            key: "source",
            header: "المصدر",
            render: (row) => (
                <span className={`badge ${row.source === 'MANUAL' ? 'badge-info-light' : row.source === 'CENTRAL_BANK' ? 'badge-success-light' : 'badge-warning-light'}`}>
                    {row.source === "MANUAL" ? "يدوي" : row.source === "CENTRAL_BANK" ? "بنك مركزي" : "API"}
                </span>
            ),
        },
        {
            key: "created_by",
            header: "بواسطة",
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
                            <h3 style={{ margin: 0 }}>أسعار الصرف</h3>
                            <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                                إدارة جداول أسعار الصرف والسجل التاريخي للتقييم
                            </p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <i className="fas fa-plus"></i> تسجيل سعر صرف
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="settings-form-grid" style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--bg-color)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                        <div className="form-group">
                            <label className="form-label">العملة</label>
                            <select
                                className="form-control"
                                value={filterCurrencyId}
                                onChange={(e) => setFilterCurrencyId(e.target.value)}
                            >
                                <option value="">الكل</option>
                                {currencies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">مقابل العملة</label>
                            <select
                                className="form-control"
                                value={filterTargetId}
                                onChange={(e) => setFilterTargetId(e.target.value)}
                            >
                                <option value="">الكل</option>
                                {currencies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <TextInput
                                label="من تاريخ"
                                type="date"
                                value={filterFromDate}
                                onChange={(e) => setFilterFromDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <TextInput
                                label="إلى تاريخ"
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
                        emptyMessage="لا توجد سجلات أسعار صرف"
                    />
                </div>

                {/* Record Rate Dialog */}
                <Dialog
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="تسجيل سعر صرف جديد"
                    maxWidth="600px"
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>إلغاء</button>
                            <button className="btn btn-primary" onClick={handleRecordRate}>تسجيل</button>
                        </>
                    }
                >
                    <div className="settings-form-grid">
                        <div className="form-group">
                            <label className="form-label">العملة المصدر *</label>
                            <select
                                className="form-control"
                                value={formData.currency_id}
                                onChange={(e) => setFormData({ ...formData, currency_id: e.target.value })}
                            >
                                <option value="">اختر العملة</option>
                                {currencies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">العملة الهدف *</label>
                            <select
                                className="form-control"
                                value={formData.target_currency_id}
                                onChange={(e) => setFormData({ ...formData, target_currency_id: e.target.value })}
                            >
                                <option value="">اختر العملة</option>
                                {currencies.filter((c) => c.id.toString() !== formData.currency_id).map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <TextInput
                                label="سعر الصرف *"
                                type="number"
                                step="0.00000001"
                                value={formData.exchange_rate}
                                onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                                placeholder="0.00000000"
                            />
                        </div>
                        <div className="form-group">
                            <TextInput
                                label="تاريخ السريان"
                                type="date"
                                value={formData.effective_date}
                                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">المصدر</label>
                            <select
                                className="form-control"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            >
                                <option value="MANUAL">يدوي</option>
                                <option value="CENTRAL_BANK">بنك مركزي</option>
                                <option value="API">API</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <TextInput
                                label="المرجع"
                                value={formData.source_reference}
                                onChange={(e) => setFormData({ ...formData, source_reference: e.target.value })}
                                placeholder="رقم مرجعي (اختياري)"
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        </MainLayout>
    );
}
