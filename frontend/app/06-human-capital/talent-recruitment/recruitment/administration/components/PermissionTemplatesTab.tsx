"use client";

import { useI18n } from "@/lib/i18n";
import { PermissionTemplate } from "@/types";
import { Role } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { Button, Column, Dialog, Select, showToast, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";

export function PermissionTemplatesTab() {
    const { t: i18n } = useI18n();
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
        } catch { console.error(i18n.catalog["text_ddeafa3a6bff"]); }
        finally { setIsLoading(false); }
    };

    const loadRoles = async () => {
        try {
            const res = await fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES}?action=roles`);
            setRoles((res as any).data || []);
        } catch { console.error(i18n.catalog["text_9813c7409f4b"]); }
    };

    const handleApply = async () => {
        if (!selectedTemplateId || !selectedRoleId) {
            showToast(i18n.catalog["text_5a0ac4ac5e4a"], "error");
            return;
        }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.PERMISSION_TEMPLATES.APPLY, {
                method: "POST",
                body: JSON.stringify({ template_id: Number(selectedTemplateId), role_id: Number(selectedRoleId) }),
            });
            showToast(i18n.catalog["text_e1ed5396f3be"], "success");
            setShowApply(false);
        } catch { showToast(i18n.catalog["text_d636001a89c7"], "error"); }
    };

    const columns: Column<PermissionTemplate>[] = [
        { key: "template_name", header: i18n.catalog["text_65dd5089d209"], dataLabel: i18n.catalog["text_4b8a1586b8af"] },
        { key: "template_key", header: i18n.catalog["text_ac5d54e55625"], dataLabel: i18n.catalog["text_ac5d54e55625"] },
        { key: "description", header: i18n.catalog["text_95023fc76e1b"], dataLabel: i18n.catalog["text_95023fc76e1b"], render: (item) => <span>{item.description || "—"}</span> },
        {
            key: "permissions", header: i18n.catalog["text_fca71dd11f5b"], dataLabel: i18n.catalog["text_fd8fe07809af"],
            render: (item) => <span className="badge badge-info">{item.permissions?.length || 0} {i18n.catalog["text_584f05614c76"]}</span>,
        },
        {
            key: "id", header: i18n.catalog["text_9f0a0f722601"], dataLabel: i18n.catalog["text_9f0a0f722601"],
            render: (item) => (
                <Button variant="primary" icon="check" onClick={() => { setSelectedTemplateId(item.id.toString()); setShowApply(true); }}>
                    {i18n.catalog["text_35ea1ca40390"]}</Button>
            ),
        },
    ];

    return (
        <>
            <PageSubHeader
                title={i18n.catalog["text_b6999c27b67d"]}
                titleIcon="file-signature"
                actions={
                    <>
                        <Button variant="primary" icon="copy" onClick={() => setShowApply(true)}>{i18n.catalog["text_aab87ad4519d"]}</Button>
                    </>
                }
            />

            <Table columns={columns} data={templates} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_98ec15064b53"]} isLoading={isLoading} />

            <Dialog isOpen={showApply} onClose={() => setShowApply(false)} title={i18n.catalog["text_5893554a0d5d"]} footer={
                <>
                    <Button variant="secondary" onClick={() => setShowApply(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                    <Button variant="primary" onClick={handleApply}>{i18n.catalog["text_268974da5082"]}</Button>
                </>
            }>
                <div className="space-y-4">
                    <Select label={i18n.catalog["text_a817bf12c438"]} value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}
                        options={[{ value: "", label: i18n.catalog["text_af432af710eb"] }, ...templates.map((t) => ({ value: t.id.toString(), label: t.template_name }))]}
                    />
                    <Select label={i18n.catalog["text_60e9248a27d5"]} value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}
                        options={[{ value: "", label: i18n.catalog["text_0411c33485ad"] }, ...roles.map((r) => ({ value: r.id.toString(), label: r.role_name_ar ||r.role_name_en }))]}
                    />
                </div>
            </Dialog>
        </>
    );
}
