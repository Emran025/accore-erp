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
    title: "إدارة الأصول والبنية التحتية",
    icon: "building-2",
    description: "سجل الأصول الثابتة والإهلاك والتصرف والصيانة",
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Asset Lifecycle
        // ─────────────────────────────────────────────────────────────
        {
            id: "asset-lifecycle",
            title: "دورة حياة الأصول",
            icon: "building-2",
            description: "سجل الأصول الثابتة ومحرك الإهلاك",
            groups: [
                {
                    id: "fixed-assets",
                    title: "الأصول الثابتة",
                    description: "إدارة الأصول والإهلاك",
                    screens: [
                        {
                            id: "fixed-assets-registry",
                            title: "الأصول الثابتة",
                            icon: "building-2",
                            description: "إدارة الأصول والإهلاك",
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
            title: "الأصول الاستثمارية",
            icon: "briefcase",
            description: "إدارة المحافظ الاستثمارية",
            groups: [
                {
                    id: "investment-portfolio",
                    title: "المحفظة الاستثمارية",
                    description: "ميزانيات الاستثمارات",
                    screens: [
                        {
                            id: "investment-assets",
                            title: "الأصول الاستثمارية",
                            icon: "briefcase",
                            description: "ميزانيات الاستثمارات (قريباً)",
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
