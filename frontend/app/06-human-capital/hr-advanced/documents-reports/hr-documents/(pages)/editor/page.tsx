"use client";

import { useI18n } from "@/lib/i18n";
import { DocumentTemplate } from "@/types";
import { TemplateData, TemplateEditor } from "@/components/template-editor";
import { showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
    HR_APPROVED_KEYS,
    HR_MOCK_CONTEXT,
    templateTypeLabels
} from "../templates-data";

function DocumentEditorContent() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [template, setTemplate] = useState<DocumentTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(!!id);

    useEffect(() => {
        if (id) {
            fetchTemplate(id);
        }
    }, [id]);

    const fetchTemplate = async (templateId: string) => {
        setIsLoading(true);
        try {
            const res = await fetchAPI<DocumentTemplate>(API_ENDPOINTS.HUMAN_CAPITAL.DOCUMENT_TEMPLATES.withId(templateId));
            const templateData = res.data || res as unknown as DocumentTemplate; // Handle both wrapped and unwrapped responses

            if (templateData && templateData.template_key) {
                setTemplate(templateData);
            } else {
                console.error(i18n.catalog["common.general.invalidTemplateData"], res);
                showToast(i18n.catalog["common.general.failedLoadTemplateData"], "error");
                router.push("/06-human-capital/hr-advanced/documents-reports/hr-documents");
            }
        } catch (error) {
            console.error(i18n.catalog["common.general.fetchError"], error);
            showToast(i18n.catalog["common.general.errorOccurredWhileConnectingServer"], "error");
            router.push("/06-human-capital/hr-advanced/documents-reports/hr-documents");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (data: TemplateData) => {
        try {
            if (id) {
                // Edit
                const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.DOCUMENT_TEMPLATES.withId(id), {
                    method: "PUT",
                    body: JSON.stringify(data),
                });
                if (res.success === false) throw new Error(res.message as string);
                showToast(i18n.catalog["humanCapital.pages.templateUpdatedSuccessfully"], "success");
            } else {
                // Create
                const body = data.body_html || "";
                const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.DOCUMENT_TEMPLATES.BASE, {
                    method: "POST",
                    body: JSON.stringify({ ...data, body_html: body }),
                });
                if (res.success === false) throw new Error(res.message as string);
                showToast(i18n.catalog["common.general.templateCreatedSuccessfully"], "success");
            }
            router.push("/06-human-capital/hr-advanced/documents-reports/hr-documents");
        } catch (error) {
            const err = error as Error;
            showToast(err.message || i18n.catalog["common.general.errorOccurredWhileSavingTemplate"], "error");
            throw err;
        }
    };

    const handleCancel = () => {
        router.push("/06-human-capital/hr-advanced/documents-reports/hr-documents");
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
                template={template}
                moduleName={i18n.catalog["common.general.humanResources"]}
                templateTypeLabels={templateTypeLabels}
                approvedKeys={HR_APPROVED_KEYS}
                mockContext={HR_MOCK_CONTEXT}
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
