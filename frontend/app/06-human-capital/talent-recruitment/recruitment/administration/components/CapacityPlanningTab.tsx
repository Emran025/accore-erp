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
            console.error(i18n.catalog["text_8e59c4f27144"]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const res = await fetchAPI("/departments");
            setDepartments((res as any).data || (res as any) || []);
        } catch {
            console.error(i18n.catalog["text_02704ff3c975"]);
        }
    };

    const handleSave = async () => {
        if (!form.title_ar) {
            showToast(i18n.catalog["text_61fd99c10d81"], "error");
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
                showToast(i18n.catalog["text_54ee75999f21"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.JOB_TITLES.BASE, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                showToast(i18n.catalog["text_2051c313cdc2"], "success");
            }

            setShowDialog(false);
            setEditItem(null);
            setForm(emptyForm);
            loadJobTitles();
        } catch {
            showToast(i18n.catalog["text_0400d60b037c"], "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(i18n.catalog["text_2db4f790af3b"])) return;
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.JOB_TITLES.withId(id), { method: "DELETE" });
            showToast(i18n.catalog["text_95678800bb0e"], "success");
            loadJobTitles();
        } catch (e: any) {
            showToast(e?.message || i18n.catalog["text_eba584368e93"], "error");
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
        { key: "title_ar", header: i18n.catalog["text_48e553211f36"], dataLabel: i18n.catalog["text_39adfb54212e"] },
        {
            key: "title_en",
            header: i18n.catalog["text_2808878aaf17"],
            dataLabel: "English",
            render: (item) => <span>{item.title_en || "—"}</span>,
        },
        {
            key: "department",
            header: i18n.catalog["text_0771c3ff9336"],
            dataLabel: i18n.catalog["text_0771c3ff9336"],
            render: (item) => <span>{item.department?.name_ar || i18n.catalog["text_5a0374f3ff5a"]}</span>,
        },
        {
            key: "description",
            header: i18n.catalog["text_95023fc76e1b"],
            dataLabel: i18n.catalog["text_95023fc76e1b"],
            render: (item) => (
                <span style={{ maxWidth: "200px", display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.description || "—"}
                </span>
            ),
        },
        {
            key: "is_active",
            header: i18n.catalog["text_c3a4749caed4"],
            dataLabel: i18n.catalog["text_c3a4749caed4"],
            render: (item) => (
                <span className={`badge ${item.is_active ? "badge-success" : "badge-danger"}`}>
                    {item.is_active ? i18n.catalog["text_629e90b3af3d"] : i18n.catalog["text_21dc96b9f9f8"]}
                </span>
            ),
        },
        {
            key: "id",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "edit",
                            title: i18n.catalog["text_113d570d6555"],
                            variant: "edit",
                            onClick: () => openEdit(item),
                        },
                        ...(canAccess("employees", "delete")
                            ? [
                                {
                                    icon: "trash" as const,
                                    title: i18n.catalog["text_59ca629220a6"],
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
                title={i18n.catalog["text_5a2b952f8036"]}
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
                                {i18n.catalog["text_2fe66e5eeaea"]}</Button>
                        )}
                    </>
                }
            />

            <Table
                columns={columns}
                data={jobTitles}
                keyExtractor={(i) => i.id.toString()}
                emptyMessage={i18n.catalog["text_498b31a8adaf"]}
                isLoading={isLoading}
            />

            <Dialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                title={editItem ? i18n.catalog["text_4616cfe98d62"] : i18n.catalog["text_2fe66e5eeaea"]}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowDialog(false)}>
                            {i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button variant="primary" onClick={handleSave}>
                            {editItem ? i18n.catalog["text_00eab31f95b7"] : i18n.catalog["text_a820f3590d36"]}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <TextInput
                        label={i18n.catalog["text_9d4ba6ace3f3"]}
                        value={form.title_ar}
                        onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                    />
                    <TextInput
                        label={i18n.catalog["text_2808878aaf17"]}
                        value={form.title_en}
                        onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    />
                    <Select
                        label={i18n.catalog["text_0771c3ff9336"]}
                        value={form.department_id}
                        onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                        options={[
                            { value: "", label: i18n.catalog["text_883061768176"] },
                            ...departments.map((d) => ({ value: d.id.toString(), label: d.name_ar })),
                        ]}
                    />
                    <Textarea
                        label={i18n.catalog["text_95023fc76e1b"]}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                    />
                </div>
            </Dialog>
        </>
    );
}
