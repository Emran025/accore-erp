"use client";

import { useI18n } from "@/lib/i18n";
import { TemplateData, TemplateEditor } from "@/components/template-editor";
import { showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SystemTemplate } from "../SystemTemplates";
import { SYSTEM_APPROVED_KEYS, SYSTEM_MOCK_CONTEXT, templateTypeLabels } from "../templates-data";

function DocumentEditorContent() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [template, setTemplate] = useState<SystemTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(!!id);

    useEffect(() => {
        if (id) {
            fetchTemplate(id);
        }
    }, [id]);

    const fetchTemplate = async (templateId: string) => {
        setIsLoading(true);
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.withId(templateId));
            const templateData = (res as any).data || res;

            if (templateData && templateData.template_key) {
                setTemplate(templateData);
            } else {
                console.error(i18n.catalog["common.general.invalidTemplateData"], res);
                showToast(i18n.catalog["common.general.failedLoadTemplateData"], "error");
                router.push("/02-commercial/sales-governance/templates/template-manager");
            }
        } catch (error) {
            console.error(i18n.catalog["common.general.fetchError"], error);
            showToast(i18n.catalog["common.general.errorOccurredWhileConnectingServer"], "error");
            router.push("/02-commercial/sales-governance/templates/template-manager");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (data: TemplateData) => {
        try {
            if (id) {
                // Edit
                const res = await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.withId(id), {
                    method: "PUT",
                    body: JSON.stringify(data),
                });
                if ((res as any).success === false) throw new Error((res as any).message);
                showToast(i18n.catalog["commercial.pages.templateUpdatedRecordLoggedSuccessfully"], "success");
            } else {
                // Create
                const body = data.body_html || "";
                const res = await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.BASE, {
                    method: "POST",
                    body: JSON.stringify({ ...data, body_html: body }),
                });
                if ((res as any).success === false) throw new Error((res as any).message);
                showToast(i18n.catalog["common.general.templateCreatedSuccessfully"], "success");
            }
            router.push("/02-commercial/sales-governance/templates/template-manager");
        } catch (error: any) {
            showToast(error.message || i18n.catalog["common.general.errorOccurredWhileSavingTemplate"], "error");
            throw error;
        }
    };

    const handleCancel = () => {
        router.push("/02-commercial/sales-governance/templates/template-manager");
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="p-0 w-full h-screen overflow-hidden bg-[#0f1117]">
            <TemplateEditor
                key={id ? `edit-${id}` : "create"}
                template={template as any}
                moduleName={i18n.catalog["common.general.primarySystemTemplates"]}
                templateTypeLabels={templateTypeLabels}
                approvedKeys={SYSTEM_APPROVED_KEYS}
                mockContext={SYSTEM_MOCK_CONTEXT}
                onSave={handleSave}
                onCancel={handleCancel}
                className="w-full h-full"
            />
        </div>
    );
}

export default function DocumentEditorPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
                <div className="spinner" />
            </div>
        }>
            <DocumentEditorContent />
        </Suspense>
    );
}
