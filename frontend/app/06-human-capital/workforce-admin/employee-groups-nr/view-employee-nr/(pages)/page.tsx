"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { NumberRangeManager } from "@/components/number-range";

export default function ViewNumberRangeIntervalsPage() {
    const { t: i18n } = useI18n();
    return (
        <MainLayout>
            <NumberRangeManager
                objectType="employees"
                title={i18n.catalog["text_7e3d0336f972"]}
                defaultConfig={{ name: i18n.catalog["text_b72b314e8bfe"], name_en: "Employees", number_length: 8, prefix: "EMP-" }}
            />
        </MainLayout>
    );
}
