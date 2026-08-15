"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { DocumentTemplate, Employee } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, DocumentPreview, SearchableSelect, Select, showToast, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { templateTypeBadgeClass, templateTypeLabels } from "./templates-data";

export function DocumentGeneration() {
    const { t: i18n } = useI18n();
    const { canAccess } = useAuthStore();
    const router = useRouter();
    const { allEmployees: employees, loadAllEmployees } = useEmployeeStore();
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState("");

    const [previewHtml, setPreviewHtml] = useState("");
    const [previewName, setPreviewName] = useState("");
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    useEffect(() => {
        loadTemplates();
        loadAllEmployees();
    }, [loadAllEmployees]);

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const query = typeFilter ? `?type=${typeFilter}` : "";
            const res = await fetchAPI(catalogText(i18n, "text_82032eb13b31", { value0: API_ENDPOINTS.HUMAN_CAPITAL.DOCUMENT_TEMPLATES.BASE, value1: query }));
            setTemplates((res as any).data || []);
        } catch { console.error(i18n.catalog["text_ddeafa3a6bff"]); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { loadTemplates(); }, [typeFilter]);

    // ── Open Editor for Edit ──
    const openEdit = (template: DocumentTemplate) => {
        router.push(`/06-human-capital/hr-advanced/documents-reports/hr-documents/editor?id=${template.id}`);
    };

    // ── Open Preview ──
    const openPreview = async (template: DocumentTemplate) => {
        if (!selectedEmployeeId) {
            showToast(i18n.catalog["text_9a90cdda5831"], "error");
            return;
        }

        setIsPreviewMode(true);
        setIsPreviewLoading(true);
        setPreviewName(template.template_name_ar);

        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.DOCUMENT_TEMPLATES.RENDER(template.id), {
                method: "POST",
                body: JSON.stringify({ employee_id: Number(selectedEmployeeId) }),
            });
            const resData = (res as any).data;
            let finalHtml = resData?.rendered_html || "";

            const templateRes = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.DOCUMENT_TEMPLATES.withId(template.id));
            const templateData = (templateRes as any).data || templateRes;
            if (templateData) {
                if (!finalHtml) {
                    finalHtml = templateData.body_html || "";
                }
            }

            setPreviewHtml(finalHtml);
        } catch (error) {
            console.error(i18n.catalog["text_910266324d35"], error);
            showToast(i18n.catalog["text_cafcc71591f3"], "error");
            setIsPreviewMode(false);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    // ── Delete ──
    const handleDelete = async (id: number) => {
        if (!confirm(i18n.catalog["text_25afc8d1f0a9"])) return;
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.DOCUMENT_TEMPLATES.withId(id), { method: "DELETE" });
            showToast(i18n.catalog["text_13e2d08f7ce4"], "success");
            loadTemplates();
        } catch { showToast(i18n.catalog["text_3ce4224c7569"], "error"); }
    };

    // ── Table columns ──
    const columns: Column<DocumentTemplate>[] = [
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
                        ...(canAccess("employees", "edit") ? [{ icon: "edit" as const, title: i18n.catalog["text_0338711dd814"], variant: "edit" as const, onClick: () => openEdit(item) }] : []),
                        ...(canAccess("employees", "delete") ? [{ icon: "trash" as const, title: i18n.catalog["text_59ca629220a6"], variant: "delete" as const, onClick: () => handleDelete(item.id) }] : [])
                    ]}
                />
            ),
        },
    ];

    // ═══════════════════════════
    //  List View
    // ═══════════════════════════
    if (isPreviewMode) {
        return (
            <DocumentPreview
                title={previewName}
                htmlContent={previewHtml}
                onBack={() => setIsPreviewMode(false)}
                isLoading={isPreviewLoading}
                titleIcon="file-signature"
            />
        );
    }

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["text_f0213b4e6d35"]}
                titleIcon="file-signature"
                searchInput={
                    <SearchableSelect
                        options={employees.map((e: Employee) => ({ value: e.id.toString(), label: catalogText(i18n, "text_e11f55b693d8", { value0: e.full_name, value1: e.employee_code }) }))}
                        value={selectedEmployeeId}
                        onChange={(val) => setSelectedEmployeeId(val?.toString() || "")}
                        placeholder={i18n.catalog["text_b85e621ca7e6"]}
                    />
                }
                actions={
                    <>
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            placeholder={i18n.catalog["text_76b1679edecf"]}
                            options={Object.entries(templateTypeLabels).map(([v, l]) => ({ value: v, label: l }))}
                            style={{ minWidth: "140px" }}
                        />
                        {canAccess("employees", "create") && (
                            <Button variant="primary" icon="edit" onClick={() => router.push("/06-human-capital/hr-advanced/documents-reports/hr-documents/editor")}>
                                {i18n.catalog["text_d47ce96c1881"]}</Button>
                        )}
                    </>
                }
            />

            <Table columns={columns} data={templates} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_a1a06599a7e0"]} isLoading={isLoading} />

        </div>
    );
}
