/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Domain 5: Manufacturing & Production (التصنيع والإنتاج)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Vision: Full manufacturing lifecycle — engineering (BOM), production
 * control (MRP, shop floor), and maintenance (TPM).
 * 
 * Cross-Domain Integration:
 *  - Supply Chain: Raw material procurement
 *  - Finance: Production cost allocation
 *  - Intelligence: Yield analysis and forecasting
 */

import { Domain } from "../../types/navigation";

export const ManufacturingDomain: Domain = {
    id: "manufacturing",
    order: 5,
    title: "التصنيع والإنتاج",
    icon: "factory",
    description: "هندسة المنتجات، التحكم بالإنتاج، والصيانة",
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Engineering
        // ─────────────────────────────────────────────────────────────
        {
            id: "engineering",
            title: "الهندسة",
            icon: "files",
            description: "قائمة المواد ومراكز العمل",
            groups: [
                {
                    id: "bom",
                    title: "قائمة المواد (BOM)",
                    description: "تركيبة المنتجات والمواد الخام",
                    screens: [
                        {
                            id: "bom-list",
                            title: "قائمة المواد (BOM)",
                            icon: "files",
                            description: "تركيبة المنتجات (قريباً)",
                            href: "/05-manufacturing/engineering/bom/bom-list",
                            permissions: [],
                            module: "manufacturing",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Production Control
        // ─────────────────────────────────────────────────────────────
        {
            id: "production-control",
            title: "التحكم بالإنتاج",
            icon: "hammer",
            description: "أوامر العمل وتخطيط الإنتاج",
            groups: [
                {
                    id: "work-orders",
                    title: "أوامر الإنتاج",
                    description: "إدارة عمليات الإنتاج",
                    screens: [
                        {
                            id: "work-orders-list",
                            title: "أوامر العمل",
                            icon: "hammer",
                            description: "أوامر الإنتاج (قريباً)",
                            href: "/05-manufacturing/production-control/work-orders/work-orders-list",
                            permissions: [],
                            module: "manufacturing",
                        },
                        {
                            id: "production-planning",
                            title: "تخطيط الإنتاج",
                            icon: "cpu",
                            description: "جدولة الإنتاج (قريباً)",
                            href: "/05-manufacturing/production-control/work-orders/production-planning",
                            permissions: [],
                            module: "manufacturing",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Quality Control
        // ─────────────────────────────────────────────────────────────
        {
            id: "quality-control",
            title: "مراقبة الجودة",
            icon: "clipboard-check",
            description: "ضبط الجودة وفحص المنتجات",
            groups: [
                {
                    id: "qc-inspection",
                    title: "ضبط الجودة",
                    description: "فحص وتقييم المنتجات",
                    screens: [
                        {
                            id: "quality-check",
                            title: "مراقبة الجودة",
                            icon: "clipboard-check",
                            description: "ضبط الجودة (قريباً)",
                            href: "/05-manufacturing/quality-control/qc-inspection/quality-check",
                            permissions: [],
                            module: "manufacturing",
                        },
                    ],
                },
            ],
        },
    ],
};
