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
    unit_name: catalogMessage("common.general.service"),
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
            unit_name: s.unit_name ?? i18n.catalog["common.general.service"],
            taxable: s.taxable,
        });
        setFormOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            showToast(i18n.catalog["commercial.servicesManagement.pleaseEnterServiceName"], "error");
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
        { key: "name", header: i18n.catalog["commercial.servicesManagement.serviceName.alternative2"] },
        {
            key: "selling_price",
            header: i18n.catalog["common.general.price"],
            render: (row) => formatCurrency(row.selling_price || row.unit_price || 0)
        },
        { key: "unit_name", header: i18n.catalog["common.general.unit"] },
        {
            key: "taxable",
            header: i18n.catalog["common.general.taxable"],
            render: (row) => (
                <span className={`badge badge-${row.taxable ? 'success' : 'secondary'}`}>
                    {row.taxable ? i18n.catalog["common.general.yes"] : i18n.catalog["common.general.no"]}
                </span>
            )
        },
        {
            key: "created_at",
            header: i18n.catalog["common.general.creationDate"],
            render: (row) => row.created_at ? row.created_at.substring(0, 10) : "-"
        },
        {
            key: "actions",
            header: i18n.catalog["common.general.actions"],
            render: (row) => (
                <ActionButtons
                    actions={
                        [
                            {
                                icon: "edit",
                                title: i18n.catalog["common.general.edit"],
                                variant: "secondary",
                                onClick: () => openEdit(row),
                            },
                            {
                                icon: "trash",
                                title: i18n.catalog["common.general.delete"],
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
                    title={i18n.catalog["common.general.serviceManagement"]}
                    titleIcon="briefcase"
                    actions={<Button variant="primary" icon="plus" onClick={openNew}>{i18n.catalog["commercial.servicesManagement.newService"]}</Button>}
                    searchInput={
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <TextInput
                                placeholder={i18n.catalog["commercial.servicesManagement.searchService"]}
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
                title={editingId ? i18n.catalog["commercial.servicesManagement.editService"] : i18n.catalog["commercial.servicesManagement.addNewService"]}
                maxWidth="600px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setFormOpen(false)}>{i18n.catalog["common.general.cancel"]}</Button>
                        <Button variant="primary" icon="check" onClick={handleSave} disabled={saving}>
                            {saving ? i18n.catalog["commercial.servicesManagement.saving"] : editingId ? i18n.catalog["common.general.update"] : i18n.catalog["common.general.save"]}
                        </Button>
                    </>
                }
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <TextInput
                        label={i18n.catalog["commercial.servicesManagement.serviceName"]}
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                    />
                    <Textarea
                        label={i18n.catalog["common.general.description.alternative2"]}
                        value={form.description}
                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                        rows={3}
                    />
                    <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <NumberInput
                            label={i18n.catalog["commercial.servicesManagement.price"]}
                            value={form.unit_price}
                            onChange={(v) => setForm(f => ({ ...f, unit_price: String(v) }))}
                            min={0}
                            required
                        />
                        <TextInput
                            label={i18n.catalog["commercial.servicesManagement.unitMeasure"]}
                            value={form.unit_name}
                            onChange={(e) => setForm(f => ({ ...f, unit_name: e.target.value }))}
                        />
                    </div>
                    <Select
                        label={i18n.catalog["common.general.taxable"]}
                        value={form.taxable ? "1" : "0"}
                        onChange={(e) => setForm(f => ({ ...f, taxable: e.target.value === "1" }))}
                        options={[{ value: "1", label: i18n.catalog["common.general.yes"] }, { value: "0", label: i18n.catalog["common.general.no"] }]}
                    />
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                onConfirm={handleDelete}
                title={i18n.catalog["common.general.confirmDeletion"]}
                message={catalogText(i18n, "commercial.servicesManagement.areYouSureYouWantDeleteService", { value0: toDelete?.name })}
                confirmText={i18n.catalog["common.general.delete"]}
            />
        </MainLayout>
    );
}
