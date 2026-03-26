"use client";

import { MainLayout } from "@/components/layout";
import { NumberRangeManager } from "@/components/number-range";

export default function AddIntervalPage() {
    return (
        <MainLayout>
            <NumberRangeManager
                objectType="employees"
                title="إعدادات ترقيم الموظفين"
                defaultConfig={{ name: "الموظفين", name_en: "Employees", number_length: 8, prefix: "EMP-" }}
            />
        </MainLayout>
    );
}
