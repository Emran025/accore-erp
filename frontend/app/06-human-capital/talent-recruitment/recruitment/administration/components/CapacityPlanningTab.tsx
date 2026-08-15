"use client";

import { useI18n } from "@/lib/i18n";
import { JobTitle } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Select, showToast, Table } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";

interface JobTitleForm {
    title_ar: string;
    title_en: string;
    department_id: string;
    description: string;
}

const emptyForm: JobTitleForm = {
    title_ar: "",
    title_en: "",
    department_id: "",
    description: "",
};

export function JobTitlesTab() {
    const { t: i18n } = useI18n();
    const { canAccess } = useAuthStore();
    const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editItem, setEditItem] = useState<JobTitle | null>(null);
    const [departments, setDepartments] = useState<Array<{ id: number; name_ar: string }>>([]);
    const [form, setForm] = useState<JobTitleForm>(emptyForm);

    useEffect(() => {
        loadJobTitles();
        loadDepartments();
    }, []);

    const loadJobTitles = async () => {
        setIsLoading(true);
        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.JOB_TITLES.BASE);
            setJobTitles((res as any).data || []);
        } catch {
            console.error(i18n.catalog["humanCapital.capacityplanning.failedLoadJobTitles"]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const res = await fetchAPI("/departments");
            setDepartments((res as any).data || (res as any) || []);
        } catch {
            console.error(i18n.catalog["humanCapital.capacityplanning.failedLoadDepartments"]);
        }
    };

    const handleSave = async () => {
        if (!form.title_ar) {
            showToast(i18n.catalog["humanCapital.capacityplanning.pleaseEnterJobTitle"], "error");
            return;
        }
        try {
            const payload = {
                title_ar: form.title_ar,
                title_en: form.title_en || null,
                department_id: form.department_id ? Number(form.department_id) : null,
                description: form.description || null,
            };

            if (editItem) {
                await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.JOB_TITLES.withId(editItem.id), {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
                showToast(i18n.catalog["humanCapital.capacityplanning.jobTitleUpdated"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.JOB_TITLES.BASE, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                showToast(i18n.catalog["humanCapital.capacityplanning.positionCreated"], "success");
            }

            setShowDialog(false);
            setEditItem(null);
            setForm(emptyForm);
            loadJobTitles();
        } catch {
            showToast(i18n.catalog["humanCapital.capacityplanning.failedSaveJobTitle"], "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(i18n.catalog["humanCapital.capacityplanning.areYouSureYouWantDeleteThisTitle"])) return;
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.JOB_TITLES.withId(id), { method: "DELETE" });
            showToast(i18n.catalog["humanCapital.capacityplanning.jobTitleDeleted"], "success");
            loadJobTitles();
        } catch (e: any) {
            showToast(e?.message || i18n.catalog["humanCapital.capacityplanning.failedDeleteTitle"], "error");
        }
    };

    const openEdit = (item: JobTitle) => {
        setForm({
            title_ar: item.title_ar,
            title_en: item.title_en || "",
            department_id: item.department_id?.toString() || "",
            description: item.description || "",
        });
        setEditItem(item);
        setShowDialog(true);
    };

    const columns: Column<JobTitle>[] = [
        { key: "title_ar", header: i18n.catalog["humanCapital.capacityplanning.jobTitleArabic"], dataLabel: i18n.catalog["common.general.title.alternative2"] },
        {
            key: "title_en",
            header: i18n.catalog["common.general.jobTitleEnglish"],
            dataLabel: "English",
            render: (item) => <span>{item.title_en || "—"}</span>,
        },
        {
            key: "department",
            header: i18n.catalog["common.general.section"],
            dataLabel: i18n.catalog["common.general.section"],
            render: (item) => <span>{item.department?.name_ar || i18n.catalog["common.general.unspecified"]}</span>,
        },
        {
            key: "description",
            header: i18n.catalog["common.general.description.alternative2"],
            dataLabel: i18n.catalog["common.general.description.alternative2"],
            render: (item) => (
                <span style={{ maxWidth: "200px", display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.description || "—"}
                </span>
            ),
        },
        {
            key: "is_active",
            header: i18n.catalog["common.general.status.alternative2"],
            dataLabel: i18n.catalog["common.general.status.alternative2"],
            render: (item) => (
                <span className={`badge ${item.is_active ? "badge-success" : "badge-danger"}`}>
                    {item.is_active ? i18n.catalog["common.general.active"] : i18n.catalog["common.general.disabled"]}
                </span>
            ),
        },
        {
            key: "id",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "edit",
                            title: i18n.catalog["common.general.edit"],
                            variant: "edit",
                            onClick: () => openEdit(item),
                        },
                        ...(canAccess("employees", "delete")
                            ? [
                                {
                                    icon: "trash" as const,
                                    title: i18n.catalog["common.general.delete"],
                                    variant: "delete" as const,
                                    onClick: () => handleDelete(item.id),
                                },
                            ]
                            : []),
                    ]}
                />
            ),
        },
    ];

    return (
        <>
            <PageSubHeader
                title={i18n.catalog["common.general.jobTitles"]}
                titleIcon="file-signature"
                actions={
                    <>
                        {canAccess("employees", "create") && (
                            <Button
                                variant="primary"
                                icon="plus"
                                onClick={() => {
                                    setEditItem(null);
                                    setForm(emptyForm);
                                    setShowDialog(true);
                                }}
                            >
                                {i18n.catalog["common.general.newJobTitle"]}</Button>
                        )}
                    </>
                }
            />

            <Table
                columns={columns}
                data={jobTitles}
                keyExtractor={(i) => i.id.toString()}
                emptyMessage={i18n.catalog["humanCapital.capacityplanning.noJobTitles"]}
                isLoading={isLoading}
            />

            <Dialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                title={editItem ? i18n.catalog["humanCapital.capacityplanning.editJobTitle"] : i18n.catalog["common.general.newJobTitle"]}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowDialog(false)}>
                            {i18n.catalog["common.general.cancel"]}</Button>
                        <Button variant="primary" onClick={handleSave}>
                            {editItem ? i18n.catalog["common.general.update"] : i18n.catalog["common.general.create"]}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <TextInput
                        label={i18n.catalog["humanCapital.capacityplanning.jobTitleArabic.alternative2"]}
                        value={form.title_ar}
                        onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                    />
                    <TextInput
                        label={i18n.catalog["common.general.jobTitleEnglish"]}
                        value={form.title_en}
                        onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    />
                    <Select
                        label={i18n.catalog["common.general.section"]}
                        value={form.department_id}
                        onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                        options={[
                            { value: "", label: i18n.catalog["common.general.selectDepartment"] },
                            ...departments.map((d) => ({ value: d.id.toString(), label: d.name_ar })),
                        ]}
                    />
                    <Textarea
                        label={i18n.catalog["common.general.description.alternative2"]}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                    />
                </div>
            </Dialog>
        </>
    );
}
