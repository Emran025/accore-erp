"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { initSystemSettings } from "@/lib/settings";
import { useAuthStore } from "@/stores/useAuthStore";
import { ApplicationLanguageSettingsTab } from "@/app/01-enterprise-core/identity-access/user-management/system-settings/components/ApplicationLanguageSettingsTab";
import { getIcon } from "@/lib/icons";

interface SetupLayoutProps {
  children: ReactNode;
}

/**
 * Setup is an authenticated pre-operational shell. It intentionally excludes
 * the application's sidebar and global navigation until the tenant reaches a
 * safe operating baseline.
 */
export default function SetupLayout({ children }: SetupLayoutProps) {
  const { t: i18n } = useI18n();
  const router = useRouter();
  const { checkAuth, sessionExpired } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isApplicationSettingsOpen, setIsApplicationSettingsOpen] = useState(false);

  useEffect(() => {
    const verifySetupAccess = async () => {
      await initSystemSettings();
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        if (!useAuthStore.getState().sessionExpired) {
          router.replace("/auth/login");
        }
        return;
      }
      setIsVerifying(false);
    };

    void verifySetupAccess().catch(() => setIsVerifying(false));
  }, [checkAuth, router]);

  if (isVerifying || sessionExpired) {
    return (
      <main className="setup-access-gate" aria-busy="true">
        <div className="setup-access-gate-panel">
          <span className="setup-access-gate-spinner" aria-hidden="true" />
          <p>{i18n.catalog["enterpriseCore.setup.loading"]}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="setup-shell animate-fade">
      <header className="setup-top-utility">
        <span>{i18n.catalog["enterpriseCore.systemSettings.applicationLanguage"]}</span>
        <button
          type="button"
          className="setup-top-utility-action"
          aria-expanded={isApplicationSettingsOpen}
          aria-controls="setup-application-settings"
          onClick={() => setIsApplicationSettingsOpen((current) => !current)}
        >
          {getIcon("settings")}
          {i18n.catalog["components.globalmeta.settings"]}
        </button>
      </header>
      {isApplicationSettingsOpen ? (
        <div id="setup-application-settings" className="setup-application-settings">
          <ApplicationLanguageSettingsTab />
        </div>
      ) : null}
      {children}
    </main>
  );
}
