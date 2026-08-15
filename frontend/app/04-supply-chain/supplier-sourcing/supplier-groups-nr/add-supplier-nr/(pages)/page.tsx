"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { NumberRangeManager } from "@/components/number-range";

export default function AddIntervalPage() {
    const { t: i18n } = useI18n();
    return (
        <MainLayout>
            <NumberRangeManager
                objectType="ap_suppliers"
                title={i18n.catalog["text_ead6a3498a43"]}
                defaultConfig={{ name: i18n.catalog["text_8297ebf9ea8e"], name_en: "Suppliers", number_length: 8, prefix: "SUP-" }}
            />
        </MainLayout>
    );
}
