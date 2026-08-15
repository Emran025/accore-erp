import { catalogMessage } from "@/lib/i18n";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Domain 8: Asset Management (إدارة الأصول والبنية التحتية)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Vision: Full asset lifecycle management — acquisition, depreciation,
 * transfers, disposal, and maintenance.
 * 
 * Cross-Domain Integration:
 *  - Finance: Depreciation journal entries, asset valuations
 *  - Supply Chain: Asset procurement
 *  - Manufacturing: Equipment maintenance
 */

import { Domain } from "../../types/navigation";

export const AssetsDomain: Domain = {
    id: "assets",
    order: 8,
    title: catalogMessage("text_9f5c91187073"),
    icon: "building-2",
    description: catalogMessage("text_773b32944617"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Asset Lifecycle
        // ─────────────────────────────────────────────────────────────
        {
            id: "asset-lifecycle",
            title: catalogMessage("text_68d9eeb339ca"),
            icon: "building-2",
            description: catalogMessage("text_8bbd8384fd9b"),
            groups: [
                {
                    id: "fixed-assets",
                    title: catalogMessage("text_e42df7c724bd"),
                    description: catalogMessage("text_5a3795736d92"),
                    screens: [
                        {
                            id: "fixed-assets-registry",
                            title: catalogMessage("text_e42df7c724bd"),
                            icon: "building-2",
                            description: catalogMessage("text_5a3795736d92"),
                            href: "/08-assets/asset-lifecycle/fixed-assets/fixed-assets-registry",
                            permissions: [],
                            module: "assets",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Investments
        // ─────────────────────────────────────────────────────────────
        {
            id: "investments",
            title: catalogMessage("text_92461b409406"),
            icon: "briefcase",
            description: catalogMessage("text_72da7263d8f5"),
            groups: [
                {
                    id: "investment-portfolio",
                    title: catalogMessage("text_2b3ca3c70fbb"),
                    description: catalogMessage("text_280c7ac1a60c"),
                    screens: [
                        {
                            id: "investment-assets",
                            title: catalogMessage("text_92461b409406"),
                            icon: "briefcase",
                            description: catalogMessage("text_6cba459d25a8"),
                            href: "/08-assets/investments/investment-portfolio/investment-assets",
                            permissions: [],
                            module: "investments",
                            status: "pending",
                        },
                    ],
                },
            ],
        },
    ],
};
