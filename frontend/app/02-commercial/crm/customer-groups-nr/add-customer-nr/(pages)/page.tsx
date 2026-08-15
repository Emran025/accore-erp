"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { NumberRangeManager } from "@/components/number-range";

export default function AddIntervalPage() {
    const { t: i18n } = useI18n();
    return (
        <MainLayout>
            <NumberRangeManager
                objectType="ar_customers"
                title={i18n.catalog["common.general.customerNumberingSettings"]}
                defaultConfig={{ name: i18n.catalog["common.general.customers"], name_en: "Customers", number_length: 8, prefix: "CUS-" }}
            />
        </MainLayout>
    );
}
