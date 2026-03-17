"use client";

import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, Column, ConfirmDialog, Dialog, Table, showToast } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/TextInput";
import { NumberInput } from "@/components/ui/NumberInput";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/lib/utils";
import { useServiceStore } from "@/stores/useServiceStore";
import { Product as Service } from "@/types";
import { useEffect, useState } from "react";

const emptyForm = {
    name: "",
    description: "",
    unit_price: "0",
    unit_name: "خدمة",
    taxable: true,
};

export default function ServicesManagementPage() {
    const {
        items: services,
        isLoading,
        currentPage,
        totalPages,
        load: loadServices,
        save: saveService,
        remove: deleteService,
    } = useServiceStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [toDelete, setToDelete] = useState<Service | null>(null);

    useEffect(() => {
        loadServices(1);
    }, [loadServices]);

    const handleSearch = () => {
        loadServices(1, searchTerm);
    };

    const openNew = () => {
        setEditingId(null);
        setForm(emptyForm);
        setFormOpen(true);
    };

    const openEdit = (s: Service) => {
        setEditingId(s.id);
        setForm({
            name: s.name,
            description: s.description ?? "",
            unit_price: String(s.selling_price || s.unit_price || 0),
            unit_name: s.unit_name ?? "خدمة",
            taxable: s.taxable,
        });
        setFormOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            showToast("الرجاء إدخال اسم الخدمة", "error");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                unit_price: parseFloat(form.unit_price),
                item_type: "service",
                inventory_control: false,
                sellable: true,
            };
            const success = await saveService(payload, editingId || undefined);
            if (success) {
                setFormOpen(false);
                loadServices(currentPage, searchTerm);
            }
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (s: Service) => {
        setToDelete(s);
        setDeleteDialog(true);
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        const success = await deleteService(toDelete.id);
        if (success) {
            setDeleteDialog(false);
            setToDelete(null);
        }
    };

    const columns: Column<Service>[] = [
        { key: "id", header: "#" },
        { key: "name", header: "اسم الخدمة" },
        { 
            key: "selling_price", 
            header: "السعر", 
            render: (row) => formatCurrency(row.selling_price || row.unit_price || 0) 
        },
        { key: "unit_name", header: "وحدة" },
        { 
            key: "taxable", 
            header: "خاضع للضريبة", 
            render: (row) => (
                <span className={`badge badge-${row.taxable ? 'success' : 'secondary'}`}>
                    {row.taxable ? "نعم" : "لا"}
                </span>
            )
        },
        { 
            key: "created_at", 
            header: "تاريخ الإنشاء", 
            render: (row) => row.created_at ? row.created_at.substring(0, 10) : "-" 
        },
        {
            key: "actions",
            header: "الإجراءات",
            render: (row) => (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button variant="secondary" size="sm" icon="edit" onClick={() => openEdit(row)}>تعديل</Button>
                    <Button variant="danger" size="sm" icon="trash" onClick={() => confirmDelete(row)}>حذف</Button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="sales-card animate-fade">
                <PageSubHeader
                    title="إدارة الخدمات"
                    titleIcon="briefcase"
                    actions={<Button variant="primary" icon="plus" onClick={openNew}>خدمة جديدة</Button>}
                    searchInput={
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <TextInput
                                placeholder="بحث عن خدمة..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: "300px" }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button variant="secondary" icon="search" onClick={handleSearch} />
                        </div>
                    }
                />

                <Table
                    columns={columns}
                    data={services}
                    keyExtractor={(it) => it.id}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        onPageChange: (p) => loadServices(p, searchTerm)
                    }}
                />
            </div>

            <Dialog
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                title={editingId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
                maxWidth="600px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setFormOpen(false)}>إلغاء</Button>
                        <Button variant="primary" icon="check" onClick={handleSave} disabled={saving}>
                            {saving ? "جارٍ الحفظ..." : editingId ? "تحديث" : "حفظ"}
                        </Button>
                    </>
                }
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
                        rows={3}
                    />
                    <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <NumberInput
                            label="السعر *"
                            value={form.unit_price}
                            onChange={(v) => setForm(f => ({ ...f, unit_price: String(v) }))}
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
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                onConfirm={handleDelete}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من حذف الخدمة "${toDelete?.name}"؟`}
                confirmText="حذف"
            />
        </MainLayout>
    );
}
