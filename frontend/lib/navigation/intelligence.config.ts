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
    title: catalogMessage("text_f4afb544f31a"),
    icon: "chart-bar",
    description: catalogMessage("text_590255b97124"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Business Intelligence
        // ─────────────────────────────────────────────────────────────
        {
            id: "business-intelligence",
            title: catalogMessage("text_0858111e63f8"),
            icon: "chart-bar",
            description: catalogMessage("text_71940e486270"),
            groups: [
                {
                    id: "executive-dashboards",
                    title: catalogMessage("text_28ac3b7cbd4c"),
                    description: catalogMessage("text_75397a979c56"),
                    screens: [
                        {
                            id: "bi-dashboard",
                            title: catalogMessage("text_8cb5a1d139fe"),
                            icon: "chart-bar",
                            description: catalogMessage("text_4d47eb8bb85f"),
                            href: "/09-intelligence/business-intelligence/executive-dashboards/bi-dashboard",
                            permissions: [],
                            module: "intelligence",
                            status: "pending",
                        },
                        {
                            id: "drill-down-reports",
                            title: catalogMessage("text_7cf79c6042fa"),
                            icon: "pie-chart",
                            description: catalogMessage("text_7fcacb1619ce"),
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
            title: catalogMessage("text_01be5134dc1f"),
            icon: "chart-line",
            description: catalogMessage("text_5b5c31059a84"),
            groups: [
                {
                    id: "predictive",
                    title: catalogMessage("text_55ae485eb500"),
                    description: catalogMessage("text_07807018aa9e"),
                    screens: [
                        {
                            id: "predictive-analytics",
                            title: catalogMessage("text_953fe6ff7425"),
                            icon: "chart-line",
                            description: catalogMessage("text_294541841438"),
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
