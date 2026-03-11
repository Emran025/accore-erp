"use client";

import { PageSubHeader } from "@/components/layout";
import { TabNavigation } from "@/components/ui";
import { useState } from "react";
import { JobTitlesTab } from "../components/CapacityPlanningTab";
import { EmployeePositionTab } from "../components/EmployeePositionTab";
import { PermissionTemplatesTab } from "../components/PermissionTemplatesTab";
import { PositionsTab } from "../components/PositionsTab";
import { RolesTab } from "../components/RolesTab";

export function HrAdministration() {
    const [activeTab, setActiveTab] = useState<"jobTitles" | "positions" | "empPosition" | "roles" | "templates">("positions");

    const tabs = [
        { key: "positions" as const, label: "المناصب الوظيفية", icon: "layers" },
        { key: "empPosition" as const, label: "تعيين الموظفين", icon: "user-check" },
        { key: "jobTitles" as const, label: "المسميات الوظيفية", icon: "file-signature" },
        { key: "roles" as const, label: "الأدوار والصلاحيات", icon: "shield" },
        { key: "templates" as const, label: "قوالب الصلاحيات", icon: "copy" },
    ];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title="إدارة الموارد البشرية"
                titleIcon="settings"
                actions={
                    <>
                        <TabNavigation
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={(key) => setActiveTab(key as any)}
                        />
                    </>
                }
            />

            <div style={{ padding: "16px 0" }}>
                {activeTab === "positions" && <PositionsTab />}
                {activeTab === "empPosition" && <EmployeePositionTab />}
                {activeTab === "jobTitles" && <JobTitlesTab />}
                {activeTab === "roles" && <RolesTab />}
                {activeTab === "templates" && <PermissionTemplatesTab />}
            </div>
        </div>
    );
}
