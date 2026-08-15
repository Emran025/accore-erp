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
            const res = await fetchAPI(catalogText(i18n, "text_82032eb13b31", { value0: API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.BASE, value1: query }));
            console.log(i18n.catalog["text_8796deab572b"], res);
            setTemplates((res as any).data || []);
            console.log(i18n.catalog["text_c2cd1e3fa11a"], (res as any).data || []);
        } catch { console.error(i18n.catalog["text_ddeafa3a6bff"]); }
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
                    setPreviewName((prev) => catalogText(i18n, "text_19229ce696c9", { value0: prev }));
                } else {
                    showToast(i18n.catalog["text_45841de07af3"], "error");
                    setIsPreviewMode(false);
                }
            } else {
                // Render live template
                const res = await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.RENDER(template.id), { method: "POST" });
                const resData = (res as any).data;
                setPreviewHtml(resData?.rendered_html || template.body_html || "");
            }
        } catch (error) {
            console.error(i18n.catalog["text_910266324d35"], error);
            showToast(i18n.catalog["text_cafcc71591f3"], "error");
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
            showToast(i18n.catalog["text_b763a0107553"], "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(i18n.catalog["text_fa15111bbfdc"])) return;
        try {
            await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.withId(id), { method: "DELETE" });
            showToast(i18n.catalog["text_a2bc69a3fce3"], "success");
            loadTemplates();
        } catch { showToast(i18n.catalog["text_3ce4224c7569"], "error"); }
    };

    const columns: Column<SystemTemplate>[] = [
        {
            key: "template_name_ar",
            header: i18n.catalog["text_65dd5089d209"],
            dataLabel: i18n.catalog["text_65dd5089d209"],
            render: (item) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{item.template_name_ar}</div>
                    {item.template_name_en && <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{item.template_name_en}</div>}
                </div>
            ),
        },
        {
            key: "template_type",
            header: i18n.catalog["text_caa3f2bb4a36"],
            dataLabel: i18n.catalog["text_caa3f2bb4a36"],
            render: (item) => (
                <span className={`badge ${templateTypeBadgeClass[item.template_type] || 'badge-secondary'}`}>
                    {templateTypeLabels[item.template_type] || item.template_type}
                </span>
            ),
        },
        { key: "template_key", header: i18n.catalog["text_ac5d54e55625"], dataLabel: i18n.catalog["text_ac5d54e55625"] },
        {
            key: "id",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        { icon: "eye", title: i18n.catalog["text_63742c2bd171"], variant: "view", onClick: () => openPreview(item) },
                        { icon: "history", title: i18n.catalog["text_941a7e797f1f"], variant: "view", onClick: () => viewHistory(item) },
                        ...(canAccess("settings", "edit") ? [{ icon: "edit" as const, title: i18n.catalog["text_0338711dd814"], variant: "edit" as const, onClick: () => openEdit(item) }] : []),
                        ...(canAccess("settings", "delete") ? [{ icon: "trash" as const, title: i18n.catalog["text_59ca629220a6"], variant: "delete" as const, onClick: () => handleDelete(item.id) }] : [])
                    ]}
                />
            ),
        },
    ];

    const historyColumns: Column<any>[] = [
        { key: "id", header: "#", dataLabel: "#" },
        { key: "created_at", header: i18n.catalog["text_8811d3a53cb8"], dataLabel: i18n.catalog["text_8811d3a53cb8"], render: (item) => new Date(item.created_at).toLocaleString('ar-SA') },
        { key: "created_by", header: i18n.catalog["text_a98b66bae2c9"], dataLabel: i18n.catalog["text_2fb01868740d"], render: (item) => item.creator?.name || i18n.catalog["text_d44d443520df"] },
        {
            key: "actions", header: i18n.catalog["text_ebe47c1bd0f1"], dataLabel: i18n.catalog["text_ebe47c1bd0f1"], render: (item) => (
                <Button size="sm" variant="outline" onClick={() => {
                    if (selectedTemplate) {
                        setShowHistory(false);
                        openPreview(selectedTemplate, item.id);
                    }
                }}>{i18n.catalog["text_9272b1b7863e"]}</Button>
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
                title={i18n.catalog["text_d623d1d59eba"]}
                titleIcon="file-signature"
                actions={
                    <>
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            placeholder={i18n.catalog["text_76b1679edecf"]}
                            options={Object.entries(templateTypeLabels).map(([v, l]) => ({ value: v, label: l }))}
                            style={{ minWidth: "140px" }}
                        />
                        {canAccess("settings", "create") && (
                            <Button variant="primary" icon="edit" onClick={() => router.push("/02-commercial/sales-governance/templates/template-manager/editor")}>
                                {i18n.catalog["text_d47ce96c1881"]}</Button>
                        )}
                    </>
                }
            />

            <Table columns={columns} data={templates} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_4aa421871384"]} isLoading={isLoading} />



            <Dialog isOpen={showHistory} onClose={() => setShowHistory(false)} title={catalogText(i18n, "text_e234d58a7836", { value0: selectedTemplate?.template_name_ar })}>
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <Table columns={historyColumns} data={histories} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_5ae3b7563f34"]} />
                </div>
                <div className="flex justify-end mt-4">
                    <Button variant="secondary" onClick={() => setShowHistory(false)}>{i18n.catalog["text_ca90c297b099"]}</Button>
                </div>
            </Dialog>
        </div>
    );
}
