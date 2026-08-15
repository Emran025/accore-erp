"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, Table, showToast } from "@/components/ui";
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
    unit_name: catalogMessage("text_11f4216e101b"),
    taxable: true,
};

export default function ServicesManagementPage() {
    const { t: i18n } = useI18n();
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
            unit_name: s.unit_name ?? i18n.catalog["text_11f4216e101b"],
            taxable: s.taxable,
        });
        setFormOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            showToast(i18n.catalog["text_6d5b30bf0cc1"], "error");
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
        { key: "name", header: i18n.catalog["text_8999278851b9"] },
        {
            key: "selling_price",
            header: i18n.catalog["text_259862e8b313"],
            render: (row) => formatCurrency(row.selling_price || row.unit_price || 0)
        },
        { key: "unit_name", header: i18n.catalog["text_584f05614c76"] },
        {
            key: "taxable",
            header: i18n.catalog["text_8d1c87e5718b"],
            render: (row) => (
                <span className={`badge badge-${row.taxable ? 'success' : 'secondary'}`}>
                    {row.taxable ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"]}
                </span>
            )
        },
        {
            key: "created_at",
            header: i18n.catalog["text_dc08056fa4f2"],
            render: (row) => row.created_at ? row.created_at.substring(0, 10) : "-"
        },
        {
            key: "actions",
            header: i18n.catalog["text_7797240d6caf"],
            render: (row) => (
                <ActionButtons
                    actions={
                        [
                            {
                                icon: "edit",
                                title: i18n.catalog["text_113d570d6555"],
                                variant: "secondary",
                                onClick: () => openEdit(row),
                            },
                            {
                                icon: "trash",
                                title: i18n.catalog["text_59ca629220a6"],
                                variant: "delete",
                                onClick: () => confirmDelete(row),
                            },
                        ]
                    }
                />
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="sales-card animate-fade">
                <PageSubHeader
                    title={i18n.catalog["text_829bed999387"]}
                    titleIcon="briefcase"
                    actions={<Button variant="primary" icon="plus" onClick={openNew}>{i18n.catalog["text_61c45907c9d2"]}</Button>}
                    searchInput={
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <TextInput
                                placeholder={i18n.catalog["text_22813b439fa6"]}
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
                title={editingId ? i18n.catalog["text_e82b95030144"] : i18n.catalog["text_7198020eb56d"]}
                maxWidth="600px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setFormOpen(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button variant="primary" icon="check" onClick={handleSave} disabled={saving}>
                            {saving ? i18n.catalog["text_dd81b078c15b"] : editingId ? i18n.catalog["text_00eab31f95b7"] : i18n.catalog["text_ddfcaf9d0144"]}
                        </Button>
                    </>
                }
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <TextInput
                        label={i18n.catalog["text_307322a4c247"]}
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                    />
                    <Textarea
                        label={i18n.catalog["text_95023fc76e1b"]}
                        value={form.description}
                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                        rows={3}
                    />
                    <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <NumberInput
                            label={i18n.catalog["text_8cb73887fa76"]}
                            value={form.unit_price}
                            onChange={(v) => setForm(f => ({ ...f, unit_price: String(v) }))}
                            min={0}
                            required
                        />
                        <TextInput
                            label={i18n.catalog["text_02e927a2fbf5"]}
                            value={form.unit_name}
                            onChange={(e) => setForm(f => ({ ...f, unit_name: e.target.value }))}
                        />
                    </div>
                    <Select
                        label={i18n.catalog["text_8d1c87e5718b"]}
                        value={form.taxable ? "1" : "0"}
                        onChange={(e) => setForm(f => ({ ...f, taxable: e.target.value === "1" }))}
                        options={[{ value: "1", label: i18n.catalog["text_4b2d2c65d365"] }, { value: "0", label: i18n.catalog["text_2bd073516a87"] }]}
                    />
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                onConfirm={handleDelete}
                title={i18n.catalog["text_5f9cb54dc136"]}
                message={catalogText(i18n, "text_a247abff53d0", { value0: toDelete?.name })}
                confirmText={i18n.catalog["text_59ca629220a6"]}
            />
        </MainLayout>
    );
}
