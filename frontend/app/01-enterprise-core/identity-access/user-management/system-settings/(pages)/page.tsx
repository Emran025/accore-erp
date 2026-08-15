"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { TabNavigation } from "@/components/ui";
import { useState } from "react";

import { InvoiceSettingsTab } from "../components/InvoiceSettingsTab";
import { SecurityTab } from "../components/SecurityTab";
import { SessionsTab } from "../components/SessionsTab";
import { StoreSettingsTab } from "../components/StoreSettingsTab";


export default function SettingsPage() {
    const { t: i18n } = useI18n();
  const [activeTab, setActiveTab] = useState("store");

  return (
    <MainLayout requiredModule="settings">
      <div className="settings-wrapper animate-fade">
        <TabNavigation
          tabs={[
            { key: "store", label: i18n.catalog["common.general.storeInformation"], icon: "fa-store" },
            { key: "invoice", label: i18n.catalog["common.general.invoiceSettings"], icon: "fa-file-invoice" },
            { key: "security", label: i18n.catalog["enterpriseCore.systemSettings.accountSecurity"], icon: "fa-lock" },
            { key: "sessions", label: i18n.catalog["common.general.activeSessions"], icon: "fa-desktop" },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div style={{ marginTop: "1rem", }}>
          {activeTab === "store" && <StoreSettingsTab />}
          {activeTab === "invoice" && <InvoiceSettingsTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "sessions" && <SessionsTab />}
        </div>
      </div>
    </MainLayout>
  );
}
