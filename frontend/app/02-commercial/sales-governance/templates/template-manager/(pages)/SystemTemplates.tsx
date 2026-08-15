"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, DocumentPreview, Select, showToast, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { templateTypeBadgeClass, templateTypeLabels } from "./templates-data";

export interface SystemTemplate {
    id: number;
    template_key: string;
    template_name_ar: string;
    template_name_en?: string;
    template_type: string;
    body_html: string;
    is_active: boolean;
    histories?: any[];
}

export function SystemTemplates() {
    const { t: i18n } = useI18n();
    const { canAccess } = useAuthStore();
    const router = useRouter();
    const [templates, setTemplates] = useState<SystemTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<SystemTemplate | null>(null);
    const [histories, setHistories] = useState<any[]>([]);
    const [typeFilter, setTypeFilter] = useState("");

    const [previewHtml, setPreviewHtml] = useState("");
    const [previewName, setPreviewName] = useState("");
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, [typeFilter]);

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const query = typeFilter ? `?type=${typeFilter}` : "";
            const res = await fetchAPI(catalogText(i18n, "common.general.notAvailable.alternative5", { value0: API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.BASE, value1: query }));
            console.log(i18n.catalog["commercial.systemtemplates.systemtemplatesApiResponse"], res);
            setTemplates((res as any).data || []);
            console.log(i18n.catalog["commercial.systemtemplates.templatesState"], (res as any).data || []);
        } catch { console.error(i18n.catalog["common.general.failedLoadTemplates"]); }
        finally { setIsLoading(false); }
    };

    const openEdit = (template: SystemTemplate) => {
        router.push(`/02-commercial/sales-governance/templates/template-manager/editor?id=${template.id}`);
    };

    const openPreview = async (template: SystemTemplate, historyId?: number) => {
        setIsPreviewMode(true);
        setIsPreviewLoading(true);
        setPreviewName(template.template_name_ar);

        try {
            if (historyId) {
                // Fetch history
                const histRes = await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.HISTORY(template.id));
                const histData = (histRes as any).data || [];
                const targetHistory = histData.find((h: any) => h.id === historyId);
                if (targetHistory) {
                    setPreviewHtml(targetHistory.body_html || "");
                    setPreviewName((prev) => catalogText(i18n, "common.general.oldVersion", { value0: prev }));
                } else {
                    showToast(i18n.catalog["common.general.versionNotFound"], "error");
                    setIsPreviewMode(false);
                }
            } else {
                // Render live template
                const res = await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.RENDER(template.id), { method: "POST" });
                const resData = (res as any).data;
                setPreviewHtml(resData?.rendered_html || template.body_html || "");
            }
        } catch (error) {
            console.error(i18n.catalog["common.general.renderError"], error);
            showToast(i18n.catalog["common.general.failedLoadPreview"], "error");
            setIsPreviewMode(false);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const viewHistory = async (template: SystemTemplate) => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.HISTORY(template.id));
            setHistories((res as any).data || []);
            setSelectedTemplate(template);
            setShowHistory(true);
        } catch {
            showToast(i18n.catalog["commercial.systemtemplates.failedViewRecord"], "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(i18n.catalog["commercial.systemtemplates.areYouSureYouWantDeleteThisTemplate"])) return;
        try {
            await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.withId(id), { method: "DELETE" });
            showToast(i18n.catalog["common.general.templateDeletedSuccessfully"], "success");
            loadTemplates();
        } catch { showToast(i18n.catalog["common.general.failedDeleteTemplate"], "error"); }
    };

    const columns: Column<SystemTemplate>[] = [
        {
            key: "template_name_ar",
            header: i18n.catalog["common.general.templateName"],
            dataLabel: i18n.catalog["common.general.templateName"],
            render: (item) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{item.template_name_ar}</div>
                    {item.template_name_en && <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{item.template_name_en}</div>}
                </div>
            ),
        },
        {
            key: "template_type",
            header: i18n.catalog["common.general.type.alternative3"],
            dataLabel: i18n.catalog["common.general.type.alternative3"],
            render: (item) => (
                <span className={`badge ${templateTypeBadgeClass[item.template_type] || 'badge-secondary'}`}>
                    {templateTypeLabels[item.template_type] || item.template_type}
                </span>
            ),
        },
        { key: "template_key", header: i18n.catalog["common.general.key.alternative2"], dataLabel: i18n.catalog["common.general.key.alternative2"] },
        {
            key: "id",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        { icon: "eye", title: i18n.catalog["common.general.preview"], variant: "view", onClick: () => openPreview(item) },
                        { icon: "history", title: i18n.catalog["commercial.systemtemplates.changeLog"], variant: "view", onClick: () => viewHistory(item) },
                        ...(canAccess("settings", "edit") ? [{ icon: "edit" as const, title: i18n.catalog["common.general.templateEditor"], variant: "edit" as const, onClick: () => openEdit(item) }] : []),
                        ...(canAccess("settings", "delete") ? [{ icon: "trash" as const, title: i18n.catalog["common.general.delete"], variant: "delete" as const, onClick: () => handleDelete(item.id) }] : [])
                    ]}
                />
            ),
        },
    ];

    const historyColumns: Column<any>[] = [
        { key: "id", header: "#", dataLabel: "#" },
        { key: "created_at", header: i18n.catalog["common.general.dateModified"], dataLabel: i18n.catalog["common.general.dateModified"], render: (item) => new Date(item.created_at).toLocaleString('ar-SA') },
        { key: "created_by", header: i18n.catalog["common.general.notAvailable.alternative7"], dataLabel: i18n.catalog["common.general.user"], render: (item) => item.creator?.name || i18n.catalog["common.general.unknown"] },
        {
            key: "actions", header: i18n.catalog["common.general.version"], dataLabel: i18n.catalog["common.general.version"], render: (item) => (
                <Button size="sm" variant="outline" onClick={() => {
                    if (selectedTemplate) {
                        setShowHistory(false);
                        openPreview(selectedTemplate, item.id);
                    }
                }}>{i18n.catalog["commercial.systemtemplates.previewCopy"]}</Button>
            )
        }
    ]

    if (isPreviewMode) {
        return (
            <DocumentPreview
                title={previewName}
                htmlContent={previewHtml}
                onBack={() => setIsPreviewMode(false)}
                isLoading={isPreviewLoading}
                titleIcon="file-contract"
            />
        );
    }

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["common.general.primarySystemTemplates"]}
                titleIcon="file-signature"
                actions={
                    <>
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            placeholder={i18n.catalog["common.general.allTypes"]}
                            options={Object.entries(templateTypeLabels).map(([v, l]) => ({ value: v, label: l }))}
                            style={{ minWidth: "140px" }}
                        />
                        {canAccess("settings", "create") && (
                            <Button variant="primary" icon="edit" onClick={() => router.push("/02-commercial/sales-governance/templates/template-manager/editor")}>
                                {i18n.catalog["common.general.newTemplateEditor"]}</Button>
                        )}
                    </>
                }
            />

            <Table columns={columns} data={templates} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["commercial.systemtemplates.noSavedTemplates"]} isLoading={isLoading} />



            <Dialog isOpen={showHistory} onClose={() => setShowHistory(false)} title={catalogText(i18n, "commercial.systemtemplates.amendmentRecord", { value0: selectedTemplate?.template_name_ar })}>
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <Table columns={historyColumns} data={histories} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["commercial.systemtemplates.noEditHistoryThisTemplate"]} />
                </div>
                <div className="flex justify-end mt-4">
                    <Button variant="secondary" onClick={() => setShowHistory(false)}>{i18n.catalog["common.general.close"]}</Button>
                </div>
            </Dialog>
        </div>
    );
}
