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
    title: catalogMessage("navigation.assetsConfig.assetsInfrastructureManagement"),
    icon: "building-2",
    description: catalogMessage("navigation.assetsConfig.fixedAssetsRegisterDepreciationDisposalMaintenance"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Asset Lifecycle
        // ─────────────────────────────────────────────────────────────
        {
            id: "asset-lifecycle",
            title: catalogMessage("navigation.assetsConfig.assetLifecycle"),
            icon: "building-2",
            description: catalogMessage("navigation.assetsConfig.fixedAssetRegisterDepreciationEngine"),
            groups: [
                {
                    id: "fixed-assets",
                    title: catalogMessage("common.general.fixedAssets"),
                    description: catalogMessage("common.general.assetDepreciationManagement"),
                    screens: [
                        {
                            id: "fixed-assets-registry",
                            title: catalogMessage("common.general.fixedAssets"),
                            icon: "building-2",
                            description: catalogMessage("common.general.assetDepreciationManagement"),
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
            title: catalogMessage("common.general.investmentAssets"),
            icon: "briefcase",
            description: catalogMessage("navigation.assetsConfig.investmentPortfolioManagement"),
            groups: [
                {
                    id: "investment-portfolio",
                    title: catalogMessage("navigation.assetsConfig.investmentPortfolio"),
                    description: catalogMessage("navigation.assetsConfig.investmentBudgets"),
                    screens: [
                        {
                            id: "investment-assets",
                            title: catalogMessage("common.general.investmentAssets"),
                            icon: "briefcase",
                            description: catalogMessage("navigation.assetsConfig.investmentBudgetsComingSoon"),
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
