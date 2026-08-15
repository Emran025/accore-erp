import { catalogMessage } from "@/lib/i18n";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Domain 7: Project & Service Management (المشاريع والخدمات)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Vision: Project lifecycle management — planning, execution tracking,
 * and project finance with profitability analysis.
 * 
 * Cross-Domain Integration:
 *  - Finance: Project billing and cost allocation
 *  - Human Capital: Resource allocation and timesheets
 *  - Supply Chain: Material procurement for projects
 */

import { Domain } from "../../types/navigation";

export const ProjectsDomain: Domain = {
    id: "projects",
    order: 7,
    title: catalogMessage("text_bb58c4a176b5"),
    icon: "briefcase",
    description: catalogMessage("text_b7a34221eb30"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Project Planning
        // ─────────────────────────────────────────────────────────────
        {
            id: "project-planning",
            title: catalogMessage("text_e24a6c0139c7"),
            icon: "briefcase",
            description: catalogMessage("text_a4bb3f802eb9"),
            groups: [
                {
                    id: "projects-overview",
                    title: catalogMessage("text_95b47e6ba891"),
                    description: catalogMessage("text_456c2c4469cd"),
                    screens: [
                        {
                            id: "projects-list",
                            title: catalogMessage("text_5818066ebd9f"),
                            icon: "briefcase",
                            description: catalogMessage("text_5c2e235163ed"),
                            href: "/07-projects/project-planning/projects-overview/projects-list",
                            permissions: [],
                            module: "projects",
                            status: "pending",
                        },
                        {
                            id: "tasks",
                            title: catalogMessage("text_001eea528d3c"),
                            icon: "check-square",
                            description: catalogMessage("text_e50915453d4a"),
                            href: "/07-projects/project-planning/projects-overview/tasks",
                            permissions: [],
                            module: "projects",
                            status: "pending",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Execution & Tracking
        // ─────────────────────────────────────────────────────────────
        {
            id: "execution-tracking",
            title: catalogMessage("text_576ab95a0c51"),
            icon: "hourglass",
            description: catalogMessage("text_52fb8aa97db3"),
            groups: [
                {
                    id: "time-tracking",
                    title: catalogMessage("text_8a7a14bc876a"),
                    description: catalogMessage("text_142f432f9b14"),
                    screens: [
                        {
                            id: "timesheets",
                            title: catalogMessage("text_8a7a14bc876a"),
                            icon: "hourglass",
                            description: catalogMessage("text_39f7cbace737"),
                            href: "/07-projects/execution-tracking/time-tracking/timesheets",
                            permissions: [],
                            module: "projects",
                            status: "pending",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Project Finance
        // ─────────────────────────────────────────────────────────────
        {
            id: "project-finance",
            title: catalogMessage("text_34349df807e8"),
            icon: "hand-coins",
            description: catalogMessage("text_87abc149f1fa"),
            groups: [
                {
                    id: "project-costs",
                    title: catalogMessage("text_90ccb41c0159"),
                    description: catalogMessage("text_f94cb5f23e6f"),
                    screens: [
                        {
                            id: "project-billing",
                            title: catalogMessage("text_90ccb41c0159"),
                            icon: "hand-coins",
                            description: catalogMessage("text_140a1bb56a50"),
                            href: "/07-projects/project-finance/project-costs/project-billing",
                            permissions: [],
                            module: "projects",
                            status: "pending",
                        },
                    ],
                },
            ],
        },
    ],
};
