"use client";

import { MainLayout, PageSubHeader } from "@/components/layout";
import type { NrGroup } from "@/components/number-range";
import { NrLoading, NrObjectHeader, NrSetupPrompt, useNumberRange } from "@/components/number-range";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, Table } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EMP_CONFIG = { name: "الموظفين", name_en: "Employees", number_length: 8, prefix: "EMP-" };

export default function ViewEmployeesGroupsPage() {
    const router = useRouter();
    const { objectData, isLoading, createObject, saveGroup, deleteGroup } = useNumberRange({ objectType: "employees" });

    // Edit Group Dialog state
    const [editDialog, setEditDialog] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [groupCode, setGroupCode] = useState("");
    const [groupName, setGroupName] = useState("");
    const [groupNameEn, setGroupNameEn] = useState("");
    const [groupDesc, setGroupDesc] = useState("");

    // Delete Confirm state
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const openEdit = (g: NrGroup) => {
        setEditId(g.id);
        setGroupCode(g.code);
        setGroupName(g.name);
        setGroupNameEn(g.name_en || "");
        setGroupDesc(g.description || "");
        setEditDialog(true);
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await saveGroup({ code: groupCode, name: groupName, name_en: groupNameEn, description: groupDesc }, editId);
        if (ok) setEditDialog(false);
    };

    const openDelete = (id: number) => {
        setDeleteId(id);
        setConfirmDelete(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            const ok = await deleteGroup(deleteId);
            if (ok) setConfirmDelete(false);
        }
    };

    const groupColumns: Column<NrGroup>[] = [
        {
            key: "code", header: "الكود", dataLabel: "الكود",
            render: (item) => (
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent-primary)" }}>
                    {item.code}
                </span>
            ),
        },
        {
            key: "name", header: "الاسم", dataLabel: "الاسم", render: (item) => (
                <div>
                    <strong>{item.name}</strong>
                    {item.name_en && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.name_en}</div>}
                </div>
            )
        },
        { key: "description", header: "الوصف", dataLabel: "الوصف", render: (item) => item.description || "—" },
        {
            key: "is_active", header: "الحالة", dataLabel: "الحالة",
            render: (item) => (
                <span className={`badge ${item.is_active ? "badge-success" : "badge-danger"}`}>
                    {item.is_active ? "نشط" : "معطل"}
                </span>
            ),
        },
        {
            key: "actions", header: "الإجراءات", dataLabel: "الإجراءات",
            render: (item) => (
                <ActionButtons actions={[
                    { icon: "edit", title: "تعديل", variant: "edit", onClick: () => openEdit(item) },
                    { icon: "trash", title: "حذف", variant: "delete", onClick: () => openDelete(item.id) },
                ]} />
            ),
        },
    ];

    if (isLoading) return <MainLayout><NrLoading /></MainLayout>;

    if (!objectData) {
        return (
            <MainLayout>
                <div className="page-header">
                    <h2>عرض تجميعات الموظفين</h2>
                </div>
                <NrSetupPrompt defaultConfig={EMP_CONFIG} onCreateObject={createObject} />
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <PageSubHeader
                title="عرض تجميعات الموظفين"
                titleIcon="layers"
                actions={
                    <Button variant="primary" icon="plus" onClick={() => router.push("/06-human-capital/workforce-admin/employee-groups-nr/add-employee-group")}>
                        إضافة تجميع جديد
                    </Button>
                }
            />

            <NrObjectHeader objectData={objectData} title="إعدادات ترقيم الموظفين" />

            <div className="sales-card compact">
                <div id="nr-alert" style={{ marginBottom: "1rem" }} />

                <Table
                    columns={groupColumns}
                    data={objectData.groups || []}
                    keyExtractor={(item) => item.id}
                    emptyMessage="لا توجد مجموعات مسجلة حتى الآن."
                />
            </div>

            {/* Edit Dialog */}
            <Dialog
                isOpen={editDialog}
                onClose={() => setEditDialog(false)}
                title="تعديل بيانات المجموعة"
                maxWidth="520px"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setEditDialog(false)}>إلغاء</Button>
                        <Button variant="primary" onClick={handleEditSave}>حفظ التعديلات</Button>
                    </>
                }
            >
                <form onSubmit={handleEditSave}>
                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                        <TextInput label="الكود *" id="grp-code" value={groupCode} onChange={(e) => setGroupCode(e.target.value)} required />
                    </div>
                    <div className="form-row" style={{ marginBottom: "1rem" }}>
                        <TextInput label="الاسم بالعربية *" id="grp-name" value={groupName} onChange={(e) => setGroupName(e.target.value)} required />
                        <TextInput label="الاسم بالإنجليزية" id="grp-name-en" value={groupNameEn} onChange={(e) => setGroupNameEn(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <Textarea label="الوصف" id="grp-desc" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} rows={2} />
                    </div>
                </form>
            </Dialog>

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={confirmDelete}
                onClose={() => { setConfirmDelete(false); setDeleteId(null); }}
                onConfirm={handleDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع الروابط ومصادر الترقيم المرتبطة بها."
                confirmText="تأكيد الحذف"
                confirmVariant="danger"
            />
        </MainLayout>
    );
}
