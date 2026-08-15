"use client";

import { useI18n } from "@/lib/i18n";

export function GlobalMenus() {
    const { t: i18n } = useI18n();
    return (
        <nav className="top-global-menus" aria-label={i18n.catalog["components.globalmenus.globalMenus"]}>
            <button className="top-global-menu-btn" type="button">
                <span className="top-global-menu-label">{i18n.catalog["components.globalmenus.menu"]}</span>
            </button>
            <button className="top-global-menu-btn" type="button">
                <span className="top-global-menu-label">{i18n.catalog["components.globalmenus.edit"]}</span>
            </button>
            <button className="top-global-menu-btn" type="button">
                <span className="top-global-menu-label">{i18n.catalog["components.globalmenus.additions"]}</span>
            </button>
            <button className="top-global-menu-btn" type="button">
                <span className="top-global-menu-label">{i18n.catalog["common.general.system"]}</span>
            </button>
            <button className="top-global-menu-btn" type="button">
                <span className="top-global-menu-label">{i18n.catalog["components.globalmenus.help"]}</span>
            </button>
        </nav>
    );
}
