"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Button, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function DocumentPreviewContent() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const employeeId = searchParams.get("employee_id");

    const [renderedHtml, setRenderedHtml] = useState("");
    const [templateName, setTemplateName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id && employeeId) {
            renderDocument(id, employeeId);
        } else {
            router.push("/06-human-capital/hr-advanced/documents-reports/hr-documents");
        }
    }, [id, employeeId]);

    const renderDocument = async (templateId: string, empId: string) => {
        setIsLoading(true);
        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.DOCUMENT_TEMPLATES.RENDER(templateId), {
                method: "POST",
                body: JSON.stringify({ employee_id: Number(empId) }),
            });
            const resData = (res as any).data;
            let finalHtml = resData?.rendered_html || "";

            const templateRes = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.DOCUMENT_TEMPLATES.withId(templateId));
            const templateData = (templateRes as any).data || templateRes;
            if (templateData) {
                setTemplateName(templateData.template_name_ar);
                if (!finalHtml) {
                    finalHtml = templateData.body_html || "";
                }
            }

            setRenderedHtml(finalHtml);
        } catch (error) {
            console.error(i18n.catalog["text_910266324d35"], error);
            showToast(i18n.catalog["text_cafcc71591f3"], "error");
            router.push("/06-human-capital/hr-advanced/documents-reports/hr-documents");
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
                titleIcon="file-signature"
                actions={
                    <>
                        <Button variant="secondary" onClick={() => router.push("/06-human-capital/hr-advanced/documents-reports/hr-documents")}>
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

export default function DocumentPreviewPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
                <div className="spinner" />
            </div>
        }>
            <DocumentPreviewContent />
        </Suspense>
    );
}
