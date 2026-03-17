"use client";

import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, Column, Dialog, SearchableSelect, SelectOption, Table, showAlert, showToast } from "@/components/ui";
import { NumberInput } from "@/components/ui/NumberInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ServiceItem {
    id: number;
    name: string;
    unit_price: number;
    unit_name?: string;
    taxable: boolean;
}

interface Customer {
    id: number;
    name: string;
    phone?: string;
    tax_number?: string;
}

interface SaleLine {
    service_id: number;
    service_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface ServiceInvoice {
    id: number;
    invoice_number: string;
    total_amount: number;
    vat_amount: number;
    payment_type: string;
    customer_name?: string;
    created_at: string;
}

export default function CreditServicesPage() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);
    const [lines, setLines] = useState<SaleLine[]>([]);

    const [invoices, setInvoices] = useState<ServiceInvoice[]>([]);
    const [invoicesLoading, setInvoicesLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [viewDialog, setViewDialog] = useState(false);
    const [viewedInvoice, setViewedInvoice] = useState<ServiceInvoice | null>(null);

    const vatRate = 0.15;
    const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
    const vatAmount = lines.some(l => {
        const svc = services.find(s => s.id === l.service_id);
        return svc?.taxable ?? false;
    }) ? subtotal * vatRate : 0;
    const total = subtotal + vatAmount;

    const loadData = async () => {
        try {
            const [svcRes, custRes] = await Promise.all([
                fetchAPI(`${API_ENDPOINTS.COMMERCIAL.SERVICES.BASE}?per_page=200`),
                fetchAPI(API_ENDPOINTS.COMMERCIAL.CRM.CUSTOMERS),
            ]);
            const svcs = svcRes.data ?? svcRes;
            setServices(Array.isArray(svcs) ? svcs : (svcs.data ?? []));
            const custs = custRes.data ?? custRes;
            setCustomers(Array.isArray(custs) ? custs : (custs.data ?? []));
        } catch { /* silent */ }
    };

    const loadInvoices = async () => {
        setInvoicesLoading(true);
        try {
            const res = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.SERVICES.SALES}?payment_type=credit&per_page=30`);
            const data = res.data ?? res;
            setInvoices(Array.isArray(data) ? data : (data.data ?? []));
        } catch { /* silent */ }
        finally { setInvoicesLoading(false); }
    };

    useEffect(() => { loadData(); loadInvoices(); }, []);

    const handleServiceChange = (id: string) => {
        const svc = services.find(s => s.id === Number(id));
        setSelectedService(svc ?? null);
        setUnitPrice(svc?.unit_price ?? 0);
    };

    const addLine = () => {
        if (!selectedService) { showAlert("الرجاء اختيار خدمة"); return; }
        if (quantity <= 0) { showAlert("الكمية يجب أن تكون أكبر من صفر"); return; }
        if (unitPrice <= 0) { showAlert("السعر يجب أن يكون أكبر من صفر"); return; }
        setLines(prev => [
            ...prev,
            {
                service_id: selectedService.id,
                service_name: selectedService.name,
                quantity,
                unit_price: unitPrice,
                subtotal: quantity * unitPrice,
            },
        ]);
        setSelectedService(null);
        setQuantity(1);
        setUnitPrice(0);
    };

    const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx));

    const handleSave = async () => {
        if (!selectedCustomer) { showAlert("الرجاء اختيار العميل"); return; }
        if (lines.length === 0) { showAlert("أضف خدمة واحدة على الأقل"); return; }
        setSaving(true);
        try {
            await fetchAPI(API_ENDPOINTS.COMMERCIAL.SERVICES.SALES, {
                method: "POST",
                body: JSON.stringify({
                    payment_type: "credit",
                    customer_id: selectedCustomer.id,
                    items: lines.map(l => ({ service_id: l.service_id, quantity: l.quantity, unit_price: l.unit_price })),
                }),
            });
            showToast("تم تسجيل فاتورة الخدمة الآجلة بنجاح", "success");
            setLines([]);
            setSelectedCustomer(null);
            loadInvoices();
        } catch (e: any) {
            showAlert(e?.message ?? "خطأ في تسجيل الفاتورة");
        } finally {
            setSaving(false);
        }
    };

    const serviceOptions: SelectOption[] = services.map(s => ({
        value: String(s.id),
        label: `${s.name} — ${formatCurrency(s.unit_price)}`,
    }));

    const customerOptions: SelectOption[] = customers.map(c => ({
        value: String(c.id),
        label: c.name,
    }));

    const lineColumns: Column<SaleLine>[] = [
        { key: "service_name", header: "الخدمة" },
        { key: "quantity", header: "الكمية" },
        { key: "unit_price", header: "السعر", render: (v) => formatCurrency(Number(v)) },
        { key: "subtotal", header: "الإجمالي", render: (v) => formatCurrency(Number(v)) },
        {
            key: "service_id",
            header: "",
            width: "60px",
            render: (_v, _row, idx) => (
                <Button variant="danger" size="sm" icon="trash" onClick={() => removeLine(idx ?? 0)} />
            ),
        },
    ];

    const invoiceColumns: Column<ServiceInvoice>[] = [
        { key: "invoice_number", header: "رقم الفاتورة" },
        { key: "customer_name", header: "العميل" },
        { key: "total_amount", header: "الإجمالي", render: (v) => formatCurrency(Number(v)) },
        { key: "created_at", header: "التاريخ", render: (v) => formatDateTime(String(v)) },
        {
            key: "id",
            header: "",
            render: (_v, row) => (
                <Button variant="secondary" size="sm" icon="view" onClick={() => { setViewedInvoice(row); setViewDialog(true); }}>عرض</Button>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="sales-card compact">
                <PageSubHeader title="مبيعات الخدمات الآجلة" titleIcon="receipt" />

                <div style={{ marginBottom: "1rem" }}>
                    <SearchableSelect
                        label="العميل *"
                        options={customerOptions}
                        value={selectedCustomer ? String(selectedCustomer.id) : ""}
                        onChange={(id) => setSelectedCustomer(customers.find(c => c.id === Number(id)) ?? null)}
                        placeholder="اختر عميلاً..."
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "1rem" }}>
                    <div style={{ flex: 2, minWidth: 220 }}>
                        <SearchableSelect
                            label="الخدمة"
                            options={serviceOptions}
                            value={selectedService ? String(selectedService.id) : ""}
                            onChange={handleServiceChange}
                            placeholder="اختر خدمة..."
                        />
                    </div>
                    <NumberInput label="الكمية" value={quantity} onChange={setQuantity} min={1} style={{ width: 120 }} />
                    <NumberInput label="السعر" value={unitPrice} onChange={setUnitPrice} min={0} style={{ width: 140 }} />
                    <Button variant="secondary" icon="add" onClick={addLine}>إضافة</Button>
                </div>

                <Table columns={lineColumns} data={lines} emptyMessage="لا توجد بنود — أضف خدمة" />

                {lines.length > 0 && (
                    <div style={{ marginTop: "1rem", textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                        <div>المجموع قبل الضريبة: <strong>{formatCurrency(subtotal)}</strong></div>
                        <div>ضريبة القيمة المضافة (15%): <strong>{formatCurrency(vatAmount)}</strong></div>
                        <div style={{ fontSize: "1.1rem" }}>الإجمالي: <strong>{formatCurrency(total)}</strong></div>
                        <Button variant="primary" icon="check" onClick={handleSave} disabled={saving} style={{ marginTop: "0.5rem" }}>
                            {saving ? "جارٍ الحفظ..." : "تسجيل الفاتورة الآجلة"}
                        </Button>
                    </div>
                )}
            </div>

            <div className="sales-card compact" style={{ marginTop: "1.5rem" }}>
                <PageSubHeader title="الفواتير الآجلة الأخيرة" titleIcon="receipt" />
                <Table
                    columns={invoiceColumns}
                    data={invoices}
                    loading={invoicesLoading}
                    emptyMessage="لا توجد فواتير آجلة"
                />
            </div>

            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title="تفاصيل الفاتورة" size="sm">
                {viewedInvoice && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div>رقم الفاتورة: <strong>{viewedInvoice.invoice_number}</strong></div>
                        <div>العميل: <strong>{viewedInvoice.customer_name ?? "—"}</strong></div>
                        <div>نوع الدفع: <strong>آجل</strong></div>
                        <div>الإجمالي: <strong>{formatCurrency(viewedInvoice.total_amount)}</strong></div>
                        <div>ضريبة القيمة المضافة: <strong>{formatCurrency(viewedInvoice.vat_amount)}</strong></div>
                        <div>التاريخ: <strong>{formatDateTime(viewedInvoice.created_at)}</strong></div>
                    </div>
                )}
            </Dialog>
        </MainLayout>
    );
}
