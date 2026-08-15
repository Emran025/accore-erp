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
            { key: "store", label: i18n.catalog["text_e11ec54f7103"], icon: "fa-store" },
            { key: "invoice", label: i18n.catalog["text_e217fe66e326"], icon: "fa-file-invoice" },
            { key: "security", label: i18n.catalog["text_251996bd474c"], icon: "fa-lock" },
            { key: "sessions", label: i18n.catalog["text_49726b3d3b3c"], icon: "fa-desktop" },
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
