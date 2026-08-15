"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { TabMiniNavigation } from "@/components/ui";
import { getStoredPermissions, getStoredUser, Permission, User } from "@/lib/auth";
import { useEffect, useState } from "react";

import { GovernmentFeesTab } from "../components/GovernmentFeesTab";
import { ZatcaSettingsTab } from "../components/ZatcaSettingsTab";

export default function VatZatcaPage() {
    const { t: i18n } = useI18n();
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [activeTab, setActiveTab] = useState("fees");

    useEffect(() => {
        const storedUser = getStoredUser();
        const storedPermissions = getStoredPermissions();
        setUser(storedUser);
        setPermissions(storedPermissions);
    }, []);

    return (
        <MainLayout requiredModule="dashboard">
            <div className="settings-wrapper animate-fade">
                <TabMiniNavigation
                    title={i18n.catalog["finance.vatZatca.taxVatSettingsZatcaIntegration"]}
                    icon="fa-shield-check"
                    tabs={[
                        { key: "fees", label: i18n.catalog["finance.vatZatca.feesLiabilities"], icon: "fa-scale-balanced" },
                        { key: "zatca", label: i18n.catalog["finance.vatZatca.zatcaSettingsZatca"], icon: "fa-shield-check" },
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <div >
                    {activeTab === "fees" && <GovernmentFeesTab />}
                    {activeTab === "zatca" && <ZatcaSettingsTab />}
                </div>
            </div>
        </MainLayout>
    );
}
