"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { NumberRangeManager } from "@/components/number-range";

export default function ViewSuppliersGroupsPage() {
    const { t: i18n } = useI18n();
    return (
        <MainLayout>
            <NumberRangeManager
                objectType="ap_suppliers"
                title={i18n.catalog["common.general.supplierNumberingSettings"]}
                defaultConfig={{ name: i18n.catalog["common.general.suppliers"], name_en: "Suppliers", number_length: 8, prefix: "SUP-" }}
            />
        </MainLayout>
    );
}
