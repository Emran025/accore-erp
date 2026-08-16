"use client";

import { catalogText, useI18n } from "@/lib/i18n";
import { useEffect, ReactNode, Suspense } from "react";
import { useRouter } from "next/navigation";

import {
  SideNavigationBar,
  TopGlobalBar,
  SearchNavigationBar,
  StatusNotificationBar,
} from "@/components/navigation";
import { FullLogo } from "@/components/ui";
import { initSystemSettings } from "@/lib/settings";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";
import { useOperatingContextStore } from "@/stores/useOperatingContextStore";
import { NotificationRuntimeBridge } from "./NotificationRuntimeBridge";
import { publishProductNotification } from "@/stores/useNotificationStore";

interface MainLayoutProps {
  children: ReactNode;
  requiredModule?: string;
  requiredAction?: "view" | "create" | "edit" | "delete";
  isWatermark?: boolean;
}

/**
 * MainLayout — Core layout wrapper providing the global navigation shell.
 * It integrates the responsive sidebar, global search, and utility bars.
 */
export function MainLayout({
  children,
  requiredModule,
  requiredAction = "view",
  isWatermark = true,
}: MainLayoutProps) {
    const { t: i18n } = useI18n();
  const router = useRouter();

  const { isLoading, checkAuth, sessionExpired } = useAuthStore();
  const { mobileOpen, setMobileOpen, setSideNavCollapsed } = useUIStore();
  const { readiness, loadReadiness } = useOperatingContextStore();

  useEffect(() => {
    const verifyAuth = async () => {
      await initSystemSettings();
      const isAuth = await checkAuth();

      if (!isAuth) {
        if (!useAuthStore.getState().sessionExpired) {
          router.push("/auth/login");
        }
        return;
      }

      await loadReadiness();

      if (requiredModule) {
        const hasAccess = useAuthStore.getState().canAccess(requiredModule, requiredAction);
        if (!hasAccess) {
          router.push("/navigation");
          return;
        }
      }
    };

    verifyAuth();
  }, [router, requiredModule, requiredAction, checkAuth, loadReadiness]);

  useEffect(() => {
    if (!readiness || readiness.ready) return;

    const readinessLabels: Record<string, string> = {
      warehouse: i18n.catalog["enterpriseCore.orgHierarchy.readinessWarehouse"],
      cost_center: i18n.catalog["enterpriseCore.orgHierarchy.readinessCostCenter"],
      profit_center: i18n.catalog["enterpriseCore.orgHierarchy.readinessProfitCenter"],
      pos_terminal: i18n.catalog["enterpriseCore.orgHierarchy.readinessPosTerminal"],
    };
    const readinessActions: Record<string, string> = {
      warehouse: i18n.catalog["enterpriseCore.orgHierarchy.readinessActionWarehouse"],
      cost_center: i18n.catalog["enterpriseCore.orgHierarchy.readinessActionCostCenter"],
      profit_center: i18n.catalog["enterpriseCore.orgHierarchy.readinessActionProfitCenter"],
      pos_terminal: i18n.catalog["enterpriseCore.orgHierarchy.readinessActionPosTerminal"],
    };
    const missingActions = readiness.missing
      .map((item) => readinessActions[item.key])
      .filter((action): action is string => Boolean(action));
    const nextActionLabel = readiness.next_action ? readinessLabels[readiness.next_action] : "";

    publishProductNotification({
      message: catalogText(i18n, "components.mainlayout.operatingSetupIncompleteWithAction", {
        value0: i18n.catalog["components.mainlayout.operatingSetupIsIncomplete"],
        value1: nextActionLabel,
      }).trim(),
      source: "operating-context",
      details: missingActions.join(" • ") || undefined,
      dedupeKey: "operating-readiness:incomplete",
    });
  }, [i18n.catalog, readiness]);

  if (isLoading || sessionExpired) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--bg-color)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--border-color)",
              borderTopColor: "var(--primary-color)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "var(--text-secondary)" }}>{i18n.catalog["components.mainlayout.loading"]}</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="test-shell-column">
      <div>
        <NotificationRuntimeBridge />
        <Suspense fallback={<div className="top-global-bar" />}>
          <TopGlobalBar />
        </Suspense>
        <Suspense fallback={<div className="search-navigation-bar" />}>
          <SearchNavigationBar />
        </Suspense>
      </div>
      <div className="test-main-container">
        <SideNavigationBar
          onCollapsedChange={setSideNavCollapsed}
          externalMobileOpen={mobileOpen}
          onExternalMobileClose={() => setMobileOpen(false)}
        />
        <main className="main-layout-content" >
          <FullLogo isWatermark={isWatermark} type="LogoVertical" size={{ width: 600, height: 600 }}>
            {children}
          </FullLogo>
        </main>
      </div>
      <div style={{ alignItems: "stretch" }}>
        <StatusNotificationBar />
      </div>
    </div>
  );
}


// Backward compatibility hook - proxies to useAuthStore
export function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    permissions: store.permissions
  };
}

