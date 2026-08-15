"use client";

import { useI18n } from "@/lib/i18n";

export function GlobalMenus() {
    const { t: i18n } = useI18n();
    return (
        <nav className="top-global-menus" aria-label={i18n.catalog["text_6f97f033069c"]}>
            <button className="top-global-menu-btn" type="button">
                <span className="top-global-menu-label">{i18n.catalog["text_6c197eab0340"]}</span>
            </button>
            <button className="top-global-menu-btn" type="button">
                <span className="top-global-menu-label">{i18n.catalog["text_c7be7c856d1d"]}</span>
            </button>
            <button className="top-global-menu-btn" type="button">
                <span className="top-global-menu-label">{i18n.catalog["text_f1bb5f7a4f9c"]}</span>
            </button>
            <button className="top-global-menu-btn" type="button">
                <span className="top-global-menu-label">{i18n.catalog["text_df8d4a3bd114"]}</span>
            </button>
            <button className="top-global-menu-btn" type="button">
                <span className="top-global-menu-label">{i18n.catalog["text_30db229c7c29"]}</span>
            </button>
        </nav>
    );
}
