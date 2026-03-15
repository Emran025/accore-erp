"use client";

import { PermissionTemplate } from "@/types";
import { Role } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { Button, Column, Dialog, Select, showToast, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";

export function PermissionTemplatesTab() {
    const { canAccess } = useAuthStore();
    const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showApply, setShowApply] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");

    useEffect(() => {
        loadTemplates();
        loadRoles();
    }, []);

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.PERMISSION_TEMPLATES.BASE);
            setTemplates((res as any).data || []);
        } catch { console.error("Failed to load templates"); }
        finally { setIsLoading(false); }
    };

    const loadRoles = async () => {
        try {
            const res = await fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES}?action=roles`);
            setRoles((res as any).data || []);
        } catch { console.error("Failed to load roles"); }
    };

    const handleApply = async () => {
        if (!selectedTemplateId || !selectedRoleId) {
            showToast("يرجى اختيار القالب والدور", "error");
            return;
        }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.PERMISSION_TEMPLATES.APPLY, {
                method: "POST",
                body: JSON.stringify({ template_id: Number(selectedTemplateId), role_id: Number(selectedRoleId) }),
            });
            showToast("تم تطبيق القالب على الدور بنجاح", "success");
            setShowApply(false);
        } catch { showToast("فشل تطبيق القالب", "error"); }
    };

    const columns: Column<PermissionTemplate>[] = [
        { key: "template_name", header: "اسم القالب", dataLabel: "القالب" },
        { key: "template_key", header: "المفتاح", dataLabel: "المفتاح" },
        { key: "description", header: "الوصف", dataLabel: "الوصف", render: (item) => <span>{item.description || "—"}</span> },
        {
            key: "permissions", header: "عدد الوحدات", dataLabel: "الوحدات",
            render: (item) => <span className="badge badge-info">{item.permissions?.length || 0} وحدة</span>,
        },
        {
            key: "id", header: "إجراءات", dataLabel: "إجراءات",
            render: (item) => (
                <Button variant="primary" icon="check" onClick={() => { setSelectedTemplateId(item.id.toString()); setShowApply(true); }}>
                    تطبيق على دور
                </Button>
            ),
        },
    ];

    return (
        <>
            <PageSubHeader
                title="قوالب الصلاحيات"
                titleIcon="file-signature"
                actions={
                    <>
                        <Button variant="primary" icon="copy" onClick={() => setShowApply(true)}>تطبيق قالب على دور</Button>
                    </>
                }
            />

            <Table columns={columns} data={templates} keyExtractor={(i) => i.id.toString()} emptyMessage="لا توجد قوالب صلاحيات - أضف بيانات من خلال ال Seeder" isLoading={isLoading} />

            <Dialog isOpen={showApply} onClose={() => setShowApply(false)} title="تطبيق قالب صلاحيات على دور" footer={
                <>
                    <Button variant="secondary" onClick={() => setShowApply(false)}>إلغاء</Button>
                    <Button variant="primary" onClick={handleApply}>تطبيق</Button>
                </>
            }>
                <div className="space-y-4">
                    <Select label="قالب الصلاحيات *" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}
                        options={[{ value: "", label: "-- اختر القالب --" }, ...templates.map((t) => ({ value: t.id.toString(), label: t.template_name }))]}
                    />
                    <Select label="الدور *" value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}
                        options={[{ value: "", label: "-- اختر الدور --" }, ...roles.map((r) => ({ value: r.id.toString(), label: r.role_name_ar ||r.role_name_en }))]}
                    />
                </div>
            </Dialog>
        </>
    );
}
