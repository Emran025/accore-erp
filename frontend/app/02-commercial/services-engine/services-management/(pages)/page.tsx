"use client";

import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, Column, ConfirmDialog, Dialog, Table, showAlert, showToast } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/TextInput";
import { NumberInput } from "@/components/ui/NumberInput";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ServiceItem {
    id: number;
    name: string;
    description?: string;
    unit_price: number;
    unit_name?: string;
    taxable: boolean;
    category_name?: string;
    created_at?: string;
}

const emptyForm = {
    name: "",
    description: "",
    unit_price: 0,
    unit_name: "خدمة",
    taxable: true,
};

export default function ServicesManagementPage() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 20;

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<ServiceItem | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [toDelete, setToDelete] = useState<ServiceItem | null>(null);

    const load = async (p = 1, q = search) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(p), per_page: String(perPage) });
            if (q) params.set("search", q);
            const res = await fetchAPI(`${API_ENDPOINTS.COMMERCIAL.SERVICES.BASE}?${params}`);
            const data = res.data ?? res;
            setServices(Array.isArray(data) ? data : (data.data ?? []));
            const total = res.total ?? data.total ?? 0;
            setTotalPages(Math.max(1, Math.ceil(total / perPage)));
        } catch {
            showAlert("خطأ في تحميل الخدمات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(1); }, []);

    const openNew = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormOpen(true);
    };

    const openEdit = (s: ServiceItem) => {
        setEditing(s);
        setForm({
            name: s.name,
            description: s.description ?? "",
            unit_price: s.unit_price,
            unit_name: s.unit_name ?? "خدمة",
            taxable: s.taxable,
        });
        setFormOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) { showAlert("الرجاء إدخال اسم الخدمة"); return; }
        setSaving(true);
        try {
            const payload = { ...form, item_type: "service", inventory_control: false, sellable: true };
            if (editing) {
                await fetchAPI(API_ENDPOINTS.COMMERCIAL.SERVICES.BASE, {
                    method: "PUT",
                    body: JSON.stringify({ id: editing.id, ...payload }),
                });
                showToast("تم تحديث الخدمة بنجاح", "success");
            } else {
                await fetchAPI(API_ENDPOINTS.COMMERCIAL.SERVICES.BASE, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                showToast("تمت إضافة الخدمة بنجاح", "success");
            }
            setFormOpen(false);
            load(page);
        } catch (e: any) {
            showAlert(e?.message ?? "خطأ في حفظ الخدمة");
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (s: ServiceItem) => { setToDelete(s); setDeleteDialog(true); };
    const handleDelete = async () => {
        if (!toDelete) return;
        try {
            await fetchAPI(API_ENDPOINTS.COMMERCIAL.SERVICES.BASE, {
                method: "DELETE",
                body: JSON.stringify({ id: toDelete.id }),
            });
            showToast("تم حذف الخدمة", "success");
            setDeleteDialog(false);
            load(page);
        } catch {
            showAlert("خطأ في حذف الخدمة");
        }
    };

    const columns: Column<ServiceItem>[] = [
        { key: "id", header: "#", width: "60px" },
        { key: "name", header: "اسم الخدمة" },
        { key: "unit_price", header: "السعر", render: (v) => formatCurrency(Number(v)) },
        { key: "unit_name", header: "وحدة" },
        { key: "taxable", header: "خاضع للضريبة", render: (v) => v ? "نعم" : "لا" },
        { key: "created_at", header: "تاريخ الإنشاء", render: (v) => v ? String(v).substring(0, 10) : "-" },
        {
            key: "id",
            header: "إجراءات",
            render: (_v, row) => (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button variant="secondary" size="sm" icon="edit" onClick={() => openEdit(row)}>تعديل</Button>
                    <Button variant="danger" size="sm" icon="trash" onClick={() => confirmDelete(row)}>حذف</Button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="sales-card compact">
                <PageSubHeader
                    title="إدارة الخدمات"
                    titleIcon="briefcase"
                    actions={<Button variant="primary" icon="add" onClick={openNew}>خدمة جديدة</Button>}
                />

                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
                    <TextInput
                        label=""
                        placeholder="بحث عن خدمة..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: 1, maxWidth: 320 }}
                    />
                    <Button variant="secondary" icon="search" onClick={() => { setPage(1); load(1, search); }}>بحث</Button>
                </div>

                <Table
                    columns={columns}
                    data={services}
                    loading={loading}
                    emptyMessage="لا توجد خدمات مسجلة"
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => { setPage(p); load(p); }}
                />
            </div>

            <Dialog
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                title={editing ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
                size="md"
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <TextInput
                        label="اسم الخدمة *"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                    />
                    <Textarea
                        label="الوصف"
                        value={form.description}
                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                        rows={2}
                    />
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <NumberInput
                            label="السعر *"
                            value={form.unit_price}
                            onChange={(v) => setForm(f => ({ ...f, unit_price: v }))}
                            min={0}
                            required
                        />
                        <TextInput
                            label="وحدة القياس"
                            value={form.unit_name}
                            onChange={(e) => setForm(f => ({ ...f, unit_name: e.target.value }))}
                        />
                    </div>
                    <Select
                        label="خاضع للضريبة"
                        value={form.taxable ? "1" : "0"}
                        onChange={(e) => setForm(f => ({ ...f, taxable: e.target.value === "1" }))}
                        options={[{ value: "1", label: "نعم" }, { value: "0", label: "لا" }]}
                    />
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                        <Button variant="secondary" onClick={() => setFormOpen(false)}>إلغاء</Button>
                        <Button variant="primary" icon="check" onClick={handleSave} disabled={saving}>
                            {saving ? "جارٍ الحفظ..." : "حفظ"}
                        </Button>
                    </div>
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                onConfirm={handleDelete}
                title="تأكيد الحذف"
                message={`هل تريد حذف الخدمة "${toDelete?.name}"؟`}
                confirmText="حذف"
                variant="danger"
            />
        </MainLayout>
    );
}
