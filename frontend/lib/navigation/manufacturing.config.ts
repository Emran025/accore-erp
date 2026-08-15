import { catalogMessage } from "@/lib/i18n";
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
    title: catalogMessage("navigation.manufacturingConfig.manufacturingProduction"),
    icon: "factory",
    description: catalogMessage("navigation.manufacturingConfig.productEngineeringProductionControlMaintenance"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Engineering
        // ─────────────────────────────────────────────────────────────
        {
            id: "engineering",
            title: catalogMessage("navigation.manufacturingConfig.engineering"),
            icon: "files",
            description: catalogMessage("navigation.manufacturingConfig.materialsWorkCenters"),
            groups: [
                {
                    id: "bom",
                    title: catalogMessage("common.general.billMaterialsBom"),
                    description: catalogMessage("navigation.manufacturingConfig.productRawMaterialComposition"),
                    screens: [
                        {
                            id: "bom-list",
                            title: catalogMessage("common.general.billMaterialsBom"),
                            icon: "files",
                            description: catalogMessage("navigation.manufacturingConfig.productCompositionComingSoon"),
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
            title: catalogMessage("navigation.manufacturingConfig.productionControl"),
            icon: "hammer",
            description: catalogMessage("navigation.manufacturingConfig.workOrdersProductionPlanning"),
            groups: [
                {
                    id: "work-orders",
                    title: catalogMessage("navigation.manufacturingConfig.productionOrders"),
                    description: catalogMessage("navigation.manufacturingConfig.manageProductionOperations"),
                    screens: [
                        {
                            id: "work-orders-list",
                            title: catalogMessage("navigation.manufacturingConfig.workOrders"),
                            icon: "hammer",
                            description: catalogMessage("navigation.manufacturingConfig.productionOrdersComingSoon"),
                            href: "/05-manufacturing/production-control/work-orders/work-orders-list",
                            permissions: [],
                            module: "manufacturing",
                            status: "pending",
                        },
                        {
                            id: "production-planning",
                            title: catalogMessage("navigation.manufacturingConfig.productionPlanning"),
                            icon: "cpu",
                            description: catalogMessage("navigation.manufacturingConfig.productionSchedulingComingSoon"),
                            href: "/05-manufacturing/production-control/work-orders/production-planning",
                            permissions: [],
                            module: "manufacturing",
                            status: "pending",
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
            title: catalogMessage("common.general.qualityControl"),
            icon: "clipboard-check",
            description: catalogMessage("navigation.manufacturingConfig.qualityControlProductInspection"),
            groups: [
                {
                    id: "qc-inspection",
                    title: catalogMessage("navigation.manufacturingConfig.qualityControl"),
                    description: catalogMessage("navigation.manufacturingConfig.productInspectionEvaluation"),
                    screens: [
                        {
                            id: "quality-check",
                            title: catalogMessage("common.general.qualityControl"),
                            icon: "clipboard-check",
                            description: catalogMessage("navigation.manufacturingConfig.qualityControlComingSoon"),
                            href: "/05-manufacturing/quality-control/qc-inspection/quality-check",
                            permissions: [],
                            module: "manufacturing",
                            status: "pending",
                        },
                    ],
                },
            ],
        },
    ],
};
