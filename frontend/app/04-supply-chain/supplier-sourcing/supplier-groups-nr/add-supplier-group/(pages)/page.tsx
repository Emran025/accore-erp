"use client";

import { MainLayout } from "@/components/layout";
import { NumberRangeManager } from "@/components/number-range";

export default function AddSuppliersGroupPage() {
    return (
        <MainLayout>
            <NumberRangeManager
                objectType="ap_suppliers"
                title="إعدادات ترقيم الموردين"
                defaultConfig={{ name: "الموردين", name_en: "Suppliers", number_length: 8, prefix: "SUP-" }}
            />
        </MainLayout>
    );
}
