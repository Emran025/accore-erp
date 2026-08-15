"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { NumberRangeManager } from "@/components/number-range";

export default function ViewNumberRangeIntervalsPage() {
    const { t: i18n } = useI18n();
    return (
        <MainLayout>
            <NumberRangeManager
                objectType="ar_customers"
                title={i18n.catalog["text_747d667d5a4d"]}
                defaultConfig={{ name: i18n.catalog["text_813d9a8a1065"], name_en: "Customers", number_length: 8, prefix: "CUS-" }}
            />
        </MainLayout>
    );
}
