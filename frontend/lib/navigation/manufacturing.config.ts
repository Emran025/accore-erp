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
    title: catalogMessage("text_82bc33d7db92"),
    icon: "factory",
    description: catalogMessage("text_081fb71b21d9"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Engineering
        // ─────────────────────────────────────────────────────────────
        {
            id: "engineering",
            title: catalogMessage("text_7cd5d0145cce"),
            icon: "files",
            description: catalogMessage("text_a59bbbefa785"),
            groups: [
                {
                    id: "bom",
                    title: catalogMessage("text_c07439465724"),
                    description: catalogMessage("text_e376b57a8cad"),
                    screens: [
                        {
                            id: "bom-list",
                            title: catalogMessage("text_c07439465724"),
                            icon: "files",
                            description: catalogMessage("text_8eca77762950"),
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
            title: catalogMessage("text_c74da4d95b71"),
            icon: "hammer",
            description: catalogMessage("text_8fecafbe3d93"),
            groups: [
                {
                    id: "work-orders",
                    title: catalogMessage("text_807ea7a9685e"),
                    description: catalogMessage("text_7127dbf2df86"),
                    screens: [
                        {
                            id: "work-orders-list",
                            title: catalogMessage("text_894a14ff60b2"),
                            icon: "hammer",
                            description: catalogMessage("text_9310cbbd42d2"),
                            href: "/05-manufacturing/production-control/work-orders/work-orders-list",
                            permissions: [],
                            module: "manufacturing",
                            status: "pending",
                        },
                        {
                            id: "production-planning",
                            title: catalogMessage("text_df776916379a"),
                            icon: "cpu",
                            description: catalogMessage("text_b2b0969f4b80"),
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
            title: catalogMessage("text_671e1e1977d0"),
            icon: "clipboard-check",
            description: catalogMessage("text_ca1e087d2e73"),
            groups: [
                {
                    id: "qc-inspection",
                    title: catalogMessage("text_31163fe4cd64"),
                    description: catalogMessage("text_c5749ee3834f"),
                    screens: [
                        {
                            id: "quality-check",
                            title: catalogMessage("text_671e1e1977d0"),
                            icon: "clipboard-check",
                            description: catalogMessage("text_ed07e224f044"),
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
