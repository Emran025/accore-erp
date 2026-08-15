"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Button, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function TemplatePreviewContent() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const historyId = searchParams.get("history_id");

    const [renderedHtml, setRenderedHtml] = useState("");
    const [templateName, setTemplateName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadPreview(id, historyId);
        } else {
            router.push("/02-commercial/sales-governance/templates/template-manager");
        }
    }, [id, historyId]);

    const loadPreview = async (templateId: string, hId: string | null) => {
        setIsLoading(true);
        try {
            // Get original template name
            const templateRes = await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.withId(templateId));
            const templateData = (templateRes as any).data || templateRes;
            if (templateData) {
                setTemplateName(templateData.template_name_ar);
            }

            if (hId) {
                // Fetch history
                const histRes = await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.HISTORY(templateId));
                const histData = (histRes as any).data || [];
                const targetHistory = histData.find((h: any) => h.id.toString() === hId);
                if (targetHistory) {
                    setRenderedHtml(targetHistory.body_html || "");
                    setTemplateName((prev) => catalogText(i18n, "text_19229ce696c9", { value0: prev }));
                } else {
                    showToast(i18n.catalog["text_45841de07af3"], "error");
                    router.push("/02-commercial/sales-governance/templates/template-manager");
                }
            } else {
                // Render live template
                const res = await fetchAPI(API_ENDPOINTS.PLATFORM.AUTOMATION.TEMPLATES.RENDER(templateId), { method: "POST" });
                const resData = (res as any).data;
                setRenderedHtml(resData?.rendered_html || templateData?.body_html || "");
            }
        } catch (error) {
            console.error(i18n.catalog["text_910266324d35"], error);
            showToast(i18n.catalog["text_cafcc71591f3"], "error");
            router.push("/02-commercial/sales-governance/templates/template-manager");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
<meta charset="UTF-8"><title>${templateName || i18n.catalog["text_76a8d471e3b9"]}</title>
</head><body><style>
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
@page { size: A4; margin: 15mm 12mm; }
</style>${renderedHtml}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 400);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={catalogText(i18n, "text_e03a1bb9de48", { value0: templateName })}
                titleIcon="file-contract"
                actions={
                    <>
                        <Button variant="secondary" onClick={() => router.push("/02-commercial/sales-governance/templates/template-manager")}>
                            {i18n.catalog["text_cb822418a29d"]}</Button>
                        <Button variant="primary" icon="printer" onClick={handlePrint}>
                            {i18n.catalog["text_2e00e00acffe"]}</Button>
                    </>
                }
            />

            <div className="flex justify-center mt-4">
                <div
                    className="document-preview bg-white"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
            </div>
        </div>
    );
}

export default function TemplatePreviewPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
                <div className="spinner" />
            </div>
        }>
            <TemplatePreviewContent />
        </Suspense>
    );
}
