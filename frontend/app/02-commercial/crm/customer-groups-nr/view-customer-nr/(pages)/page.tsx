"use client";

import { MainLayout } from "@/components/layout";
import { NumberRangeManager } from "@/components/number-range";

export default function ViewNumberRangeIntervalsPage() {
    return (
        <MainLayout>
            <NumberRangeManager
                objectType="ar_customers"
                title="إعدادات ترقيم العملاء"
                defaultConfig={{ name: "العملاء", name_en: "Customers", number_length: 8, prefix: "CUS-" }}
            />
        </MainLayout>
    );
}
