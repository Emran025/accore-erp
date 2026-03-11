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
    title: "البيانات والذكاء الاصطناعي",
    icon: "chart-bar",
    description: "ذكاء الأعمال، مستودع البيانات، والتحليلات المتقدمة",
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Business Intelligence
        // ─────────────────────────────────────────────────────────────
        {
            id: "business-intelligence",
            title: "ذكاء الأعمال",
            icon: "chart-bar",
            description: "لوحات القيادة التنفيذية والتقارير",
            groups: [
                {
                    id: "executive-dashboards",
                    title: "لوحات القيادة",
                    description: "لوحات تحليلية للإدارة العليا",
                    screens: [
                        {
                            id: "bi-dashboard",
                            title: "لوحات القيادة التنفيذية",
                            icon: "chart-bar",
                            description: "تحليلات شاملة للإدارة التنفيذية (قريباً)",
                            href: "/09-intelligence/business-intelligence/executive-dashboards/bi-dashboard",
                            permissions: [],
                            module: "intelligence",
                        },
                        {
                            id: "drill-down-reports",
                            title: "التقارير التفصيلية",
                            icon: "pie-chart",
                            description: "تقارير قابلة للتعمق (قريباً)",
                            href: "/09-intelligence/business-intelligence/executive-dashboards/drill-down-reports",
                            permissions: [],
                            module: "intelligence",
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
            title: "التحليلات المتقدمة",
            icon: "chart-line",
            description: "التحليلات التنبؤية وتحليل الاتجاهات",
            groups: [
                {
                    id: "predictive",
                    title: "التحليلات التنبؤية",
                    description: "توقعات مبنية على الذكاء الاصطناعي",
                    screens: [
                        {
                            id: "predictive-analytics",
                            title: "التحليلات التنبؤية (AI)",
                            icon: "chart-line",
                            description: "توقعات ذكية للأعمال (قريباً)",
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
