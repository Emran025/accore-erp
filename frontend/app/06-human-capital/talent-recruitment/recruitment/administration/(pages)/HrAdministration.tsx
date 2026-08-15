"use client";

import { useI18n } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { TabNavigation } from "@/components/ui";
import { useState } from "react";
import { JobTitlesTab } from "../components/CapacityPlanningTab";
import { EmployeePositionTab } from "../components/EmployeePositionTab";
import { PermissionTemplatesTab } from "../components/PermissionTemplatesTab";
import { PositionsTab } from "../components/PositionsTab";
import { RolesTab } from "../components/RolesTab";

export function HrAdministration() {
    const { t: i18n } = useI18n();
    const [activeTab, setActiveTab] = useState<"jobTitles" | "positions" | "empPosition" | "roles" | "templates">("positions");

    const tabs = [
        { key: "positions" as const, label: i18n.catalog["common.general.jobPositions"], icon: "layers" },
        { key: "empPosition" as const, label: i18n.catalog["humanCapital.hradministration.assignEmployees"], icon: "user-check" },
        { key: "jobTitles" as const, label: i18n.catalog["common.general.jobTitles"], icon: "file-signature" },
        { key: "roles" as const, label: i18n.catalog["humanCapital.hradministration.rolesPermissions"], icon: "shield" },
        { key: "templates" as const, label: i18n.catalog["common.general.permissionTemplates"], icon: "copy" },
    ];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["humanCapital.hradministration.humanResourcesManagement"]}
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
