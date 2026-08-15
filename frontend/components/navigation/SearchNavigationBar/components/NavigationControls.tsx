"use client";

import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { getIcon } from "@/lib/icons";
import { useUIStore } from "@/stores/useUIStore";

interface NavigationControlsProps {
    onUp: () => void;
}

export function NavigationControls({ onUp }: NavigationControlsProps) {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const { mobileOpen, setMobileOpen, toggleSideNav, sideNavCollapsed, sideNavWidth, setSideNavCollapsed } = useUIStore();

    return (
        <div className="search-nav-controls">
            {/* Sidebar toggle */}
            <button
                type="button"
                className="search-nav-icon-btn"
                aria-label={i18n.catalog["components.navigationcontrols.toggleSidebar"]}
                onClick={() => {
                    if (window.innerWidth <= 1024) {
                        setMobileOpen(!mobileOpen);
                        setSideNavCollapsed(false);
                    } else {
                        toggleSideNav();
                    }
                }}
            >
                {getIcon("panel-right")}
            </button>
            <button
                type="button"
                className="search-nav-icon-btn"
                aria-label={i18n.catalog["components.navigationcontrols.forward"]}
                onClick={() => router.forward()}
            >
                {getIcon("arrow-right")}
            </button>
            <button
                type="button"
                className="search-nav-icon-btn"
                aria-label={i18n.catalog["components.navigationcontrols.back"]}
                onClick={() => router.back()}
            >
                {getIcon("arrow-left")}
            </button>
            <button
                type="button"
                className="search-nav-icon-btn"
                aria-label={i18n.catalog["components.navigationcontrols.upOneLevel"]}
                onClick={onUp}
            >
                {getIcon("arrow-up")}
            </button>
        </div >
    );
}
