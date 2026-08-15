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
        } catch { console.error(i18n.catalog["common.general.failedLoadTemplates"]); }
        finally { setIsLoading(false); }
    };

    const loadRoles = async () => {
        try {
            const res = await fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES}?action=roles`);
            setRoles((res as any).data || []);
        } catch { console.error(i18n.catalog["humanCapital.permissiontemplates.failedLoadRoles"]); }
    };

    const handleApply = async () => {
        if (!selectedTemplateId || !selectedRoleId) {
            showToast(i18n.catalog["humanCapital.permissiontemplates.pleaseSelectTemplateRole"], "error");
            return;
        }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.PERMISSION_TEMPLATES.APPLY, {
                method: "POST",
                body: JSON.stringify({ template_id: Number(selectedTemplateId), role_id: Number(selectedRoleId) }),
            });
            showToast(i18n.catalog["humanCapital.permissiontemplates.templateAppliedRoleSuccessfully"], "success");
            setShowApply(false);
        } catch { showToast(i18n.catalog["humanCapital.permissiontemplates.failedApplyTemplate"], "error"); }
    };

    const columns: Column<PermissionTemplate>[] = [
        { key: "template_name", header: i18n.catalog["common.general.templateName"], dataLabel: i18n.catalog["humanCapital.permissiontemplates.template"] },
        { key: "template_key", header: i18n.catalog["common.general.key.alternative2"], dataLabel: i18n.catalog["common.general.key.alternative2"] },
        { key: "description", header: i18n.catalog["common.general.description.alternative2"], dataLabel: i18n.catalog["common.general.description.alternative2"], render: (item) => <span>{item.description || "—"}</span> },
        {
            key: "permissions", header: i18n.catalog["humanCapital.permissiontemplates.numberUnits"], dataLabel: i18n.catalog["humanCapital.permissiontemplates.units"],
            render: (item) => <span className="badge badge-info">{item.permissions?.length || 0} {i18n.catalog["common.general.unit"]}</span>,
        },
        {
            key: "id", header: i18n.catalog["common.general.actions.alternative2"], dataLabel: i18n.catalog["common.general.actions.alternative2"],
            render: (item) => (
                <Button variant="primary" icon="check" onClick={() => { setSelectedTemplateId(item.id.toString()); setShowApply(true); }}>
                    {i18n.catalog["humanCapital.permissiontemplates.applyRole"]}</Button>
            ),
        },
    ];

    return (
        <>
            <PageSubHeader
                title={i18n.catalog["common.general.permissionTemplates"]}
                titleIcon="file-signature"
                actions={
                    <>
                        <Button variant="primary" icon="copy" onClick={() => setShowApply(true)}>{i18n.catalog["humanCapital.permissiontemplates.applyTemplateRole"]}</Button>
                    </>
                }
            />

            <Table columns={columns} data={templates} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.permissiontemplates.noPermissionTemplatesAddDataViaSeeder"]} isLoading={isLoading} />

            <Dialog isOpen={showApply} onClose={() => setShowApply(false)} title={i18n.catalog["humanCapital.permissiontemplates.applyPermissionTemplateRole"]} footer={
                <>
                    <Button variant="secondary" onClick={() => setShowApply(false)}>{i18n.catalog["common.general.cancel"]}</Button>
                    <Button variant="primary" onClick={handleApply}>{i18n.catalog["common.general.apply"]}</Button>
                </>
            }>
                <div className="space-y-4">
                    <Select label={i18n.catalog["humanCapital.permissiontemplates.permissionsTemplate"]} value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}
                        options={[{ value: "", label: i18n.catalog["humanCapital.permissiontemplates.selectTemplate"] }, ...templates.map((t) => ({ value: t.id.toString(), label: t.template_name }))]}
                    />
                    <Select label={i18n.catalog["humanCapital.permissiontemplates.role"]} value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}
                        options={[{ value: "", label: i18n.catalog["humanCapital.permissiontemplates.selectRole"] }, ...roles.map((r) => ({ value: r.id.toString(), label: r.role_name_ar ||r.role_name_en }))]}
                    />
                </div>
            </Dialog>
        </>
    );
}
