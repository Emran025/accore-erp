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
    title: "إدارة المشاريع والخدمات",
    icon: "briefcase",
    description: "تخطيط المشاريع، التنفيذ والتتبع، والمالية",
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Project Planning
        // ─────────────────────────────────────────────────────────────
        {
            id: "project-planning",
            title: "تخطيط المشاريع",
            icon: "briefcase",
            description: "هياكل المشاريع وتخصيص الموارد",
            groups: [
                {
                    id: "projects-overview",
                    title: "نظرة عامة على المشاريع",
                    description: "إدارة المشاريع والمهام",
                    screens: [
                        {
                            id: "projects-list",
                            title: "المشاريع",
                            icon: "briefcase",
                            description: "إدارة المشاريع (قريباً)",
                            href: "/07-projects/project-planning/projects-overview/projects-list",
                            permissions: [],
                            module: "projects",
                            status: "pending",
                        },
                        {
                            id: "tasks",
                            title: "المهام",
                            icon: "check-square",
                            description: "متابعة المهام (قريباً)",
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
            title: "التنفيذ والتتبع",
            icon: "hourglass",
            description: "تتبع الوقت ومتابعة التقدم",
            groups: [
                {
                    id: "time-tracking",
                    title: "تتبع الوقت",
                    description: "ساعات العمل على المشاريع",
                    screens: [
                        {
                            id: "timesheets",
                            title: "تتبع الوقت",
                            icon: "hourglass",
                            description: "تسجيل ساعات العمل (قريباً)",
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
            title: "مالية المشاريع",
            icon: "hand-coins",
            description: "تكاليف المشاريع والفوترة",
            groups: [
                {
                    id: "project-costs",
                    title: "تكاليف المشاريع",
                    description: "ميزانيات وتكاليف المشاريع",
                    screens: [
                        {
                            id: "project-billing",
                            title: "تكاليف المشاريع",
                            icon: "hand-coins",
                            description: "ميزانية المشاريع (قريباً)",
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
