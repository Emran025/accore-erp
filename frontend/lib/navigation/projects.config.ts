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
    title: catalogMessage("navigation.projectsConfig.projectsServicesManagement"),
    icon: "briefcase",
    description: catalogMessage("navigation.projectsConfig.projectPlanningExecutionTrackingFinance"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Project Planning
        // ─────────────────────────────────────────────────────────────
        {
            id: "project-planning",
            title: catalogMessage("navigation.projectsConfig.projectPlanning"),
            icon: "briefcase",
            description: catalogMessage("navigation.projectsConfig.projectStructuresResourceAllocation"),
            groups: [
                {
                    id: "projects-overview",
                    title: catalogMessage("navigation.projectsConfig.projectsOverview"),
                    description: catalogMessage("navigation.projectsConfig.projectTaskManagement"),
                    screens: [
                        {
                            id: "projects-list",
                            title: catalogMessage("common.general.projects"),
                            icon: "briefcase",
                            description: catalogMessage("navigation.projectsConfig.projectManagementComingSoon"),
                            href: "/07-projects/project-planning/projects-overview/projects-list",
                            permissions: [],
                            module: "projects",
                            status: "pending",
                        },
                        {
                            id: "tasks",
                            title: catalogMessage("common.general.tasks"),
                            icon: "check-square",
                            description: catalogMessage("navigation.projectsConfig.taskFollowUpComingSoon"),
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
            title: catalogMessage("navigation.projectsConfig.executionTracking"),
            icon: "hourglass",
            description: catalogMessage("navigation.projectsConfig.timeTrackingProgressMonitoring"),
            groups: [
                {
                    id: "time-tracking",
                    title: catalogMessage("common.general.timeTracking"),
                    description: catalogMessage("navigation.projectsConfig.projectWorkHours"),
                    screens: [
                        {
                            id: "timesheets",
                            title: catalogMessage("common.general.timeTracking"),
                            icon: "hourglass",
                            description: catalogMessage("navigation.projectsConfig.workHoursLoggingComingSoon"),
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
            title: catalogMessage("navigation.projectsConfig.projectFinance"),
            icon: "hand-coins",
            description: catalogMessage("navigation.projectsConfig.projectCostsBilling"),
            groups: [
                {
                    id: "project-costs",
                    title: catalogMessage("common.general.projectCosts"),
                    description: catalogMessage("navigation.projectsConfig.projectBudgetsCosts"),
                    screens: [
                        {
                            id: "project-billing",
                            title: catalogMessage("common.general.projectCosts"),
                            icon: "hand-coins",
                            description: catalogMessage("navigation.projectsConfig.projectBudgetsComingSoon"),
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
