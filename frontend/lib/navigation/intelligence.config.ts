import { catalogMessage } from "@/lib/i18n";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Domain 9: Data & Intelligence (البيانات والذكاء الاصطناعي)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Vision: Enterprise-wide analytics — business intelligence dashboards,
 * data warehousing, and advanced predictive analytics.
 * 
 * Cross-Domain Integration:
 *  - All Domains: Aggregates data from every business domain
 *  - Finance: Financial analytics and KPIs
 *  - Commercial: Sales forecasting and pipeline analytics
 */

import { Domain } from "../../types/navigation";

export const IntelligenceDomain: Domain = {
    id: "intelligence",
    order: 9,
    title: catalogMessage("navigation.intelligenceConfig.dataAi"),
    icon: "chart-bar",
    description: catalogMessage("navigation.intelligenceConfig.businessIntelligenceDataWarehousingAdvancedAnalytics"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Business Intelligence
        // ─────────────────────────────────────────────────────────────
        {
            id: "business-intelligence",
            title: catalogMessage("navigation.intelligenceConfig.businessIntelligence"),
            icon: "chart-bar",
            description: catalogMessage("navigation.intelligenceConfig.executiveDashboardsReports"),
            groups: [
                {
                    id: "executive-dashboards",
                    title: catalogMessage("navigation.intelligenceConfig.dashboards"),
                    description: catalogMessage("navigation.intelligenceConfig.executiveAnalyticsDashboards"),
                    screens: [
                        {
                            id: "bi-dashboard",
                            title: catalogMessage("navigation.intelligenceConfig.executiveDashboards"),
                            icon: "chart-bar",
                            description: catalogMessage("navigation.intelligenceConfig.comprehensiveAnalyticsExecutiveManagementComingSoon"),
                            href: "/09-intelligence/business-intelligence/executive-dashboards/bi-dashboard",
                            permissions: [],
                            module: "intelligence",
                            status: "pending",
                        },
                        {
                            id: "drill-down-reports",
                            title: catalogMessage("navigation.intelligenceConfig.detailedReports"),
                            icon: "pie-chart",
                            description: catalogMessage("navigation.intelligenceConfig.drillDownReportsComingSoon"),
                            href: "/09-intelligence/business-intelligence/executive-dashboards/drill-down-reports",
                            permissions: [],
                            module: "intelligence",
                            status: "pending",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Advanced Analytics
        // ─────────────────────────────────────────────────────────────
        {
            id: "advanced-analytics",
            title: catalogMessage("navigation.intelligenceConfig.advancedAnalytics"),
            icon: "chart-line",
            description: catalogMessage("navigation.intelligenceConfig.predictiveAnalyticsTrendAnalysis"),
            groups: [
                {
                    id: "predictive",
                    title: catalogMessage("navigation.intelligenceConfig.predictiveAnalytics"),
                    description: catalogMessage("navigation.intelligenceConfig.aiBasedForecasts"),
                    screens: [
                        {
                            id: "predictive-analytics",
                            title: catalogMessage("navigation.intelligenceConfig.predictiveAnalyticsAi"),
                            icon: "chart-line",
                            description: catalogMessage("navigation.intelligenceConfig.smartBusinessForecastsComingSoon"),
                            href: "/09-intelligence/advanced-analytics/predictive/predictive-analytics",
                            permissions: [],
                            module: "intelligence",
                        },
                    ],
                },
            ],
        },
    ],
};
