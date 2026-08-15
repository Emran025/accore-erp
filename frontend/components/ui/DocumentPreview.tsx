"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import React from "react";
import { Button } from "./Button";
import { PageSubHeader } from "@/components/layout";

export interface DocumentPreviewProps {
    title: string;
    htmlContent: string;
    onBack: () => void;
    isLoading?: boolean;
    titleIcon?: any;
    onExportCsv?: () => void;
}

export function DocumentPreview({
    title,
    htmlContent,
    onBack,
    isLoading = false,
    titleIcon = "file-signature",
    onExportCsv,
}: DocumentPreviewProps) {
    const { t: i18n } = useI18n();
    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            const documentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                .map((node) => node.outerHTML)
                .join("\n");
            printWindow.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
<meta charset="UTF-8"><title>${title || i18n.catalog["text_76a8d471e3b9"]}</title>${documentStyles}
<style>
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
@page { size: A4; margin: 12mm; }
</style></head><body>${htmlContent}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 400);
        }
    };

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={catalogText(i18n, "text_e03a1bb9de48", { value0: title })}
                titleIcon={titleIcon}
                actions={
                    <>
                        <Button variant="secondary" onClick={onBack}>
                            {i18n.catalog["text_cb822418a29d"]}</Button>
                        {onExportCsv && (
                            <Button variant="secondary" icon="download" onClick={onExportCsv} disabled={isLoading}>
                                {i18n.catalog["text_e2b4a3247ac2"]}</Button>
                        )}
                        <Button variant="primary" icon="printer" onClick={handlePrint} disabled={isLoading}>
                            {i18n.catalog["text_c9dc22189457"]}</Button>
                    </>
                }
            />

            <div className="flex justify-center mt-4 pb-8">
                {isLoading ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div
                        className="document-preview bg-white"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                )}
            </div>
        </div>
    );
}
