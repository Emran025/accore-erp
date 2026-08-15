"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { NumberRangeManager } from "@/components/number-range";

export default function AddEmployeesGroupPage() {
    const { t: i18n } = useI18n();
    return (
        <MainLayout>
            <NumberRangeManager
                objectType="employees"
                title={i18n.catalog["common.general.employeeNumberingSettings"]}
                defaultConfig={{ name: i18n.catalog["common.general.employees"], name_en: "Employees", number_length: 8, prefix: "EMP-" }}
            />
        </MainLayout>
    );
}
