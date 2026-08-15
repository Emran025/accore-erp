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
                aria-label={i18n.catalog["text_041aefc44394"]}
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
                aria-label={i18n.catalog["text_f1c65e14817e"]}
                onClick={() => router.forward()}
            >
                {getIcon("arrow-right")}
            </button>
            <button
                type="button"
                className="search-nav-icon-btn"
                aria-label={i18n.catalog["text_76900f1bfd16"]}
                onClick={() => router.back()}
            >
                {getIcon("arrow-left")}
            </button>
            <button
                type="button"
                className="search-nav-icon-btn"
                aria-label={i18n.catalog["text_ad18290855a2"]}
                onClick={onUp}
            >
                {getIcon("arrow-up")}
            </button>
        </div >
    );
}
