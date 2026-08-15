import { catalogMessage } from "@/lib/i18n";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Domain 1: Enterprise Core (الأساس المؤسسي)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Vision: The foundational backbone of the ERP — system health, organization
 * governance, workflow orchestration, identity & access, and compliance monitoring.
 * 
 * Cross-Domain Integration: Every other domain depends on Core for
 * authentication, audit trail, and workflow approvals.
 */

import { Domain } from "@/types/navigation";

export const CoreDomain: Domain = {
    id: "core",
    order: 1,
    title: catalogMessage("text_2ca078b68a8c"),
    icon: "dashboard",
    description: catalogMessage("text_78cc0c9fd775"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: System Overview
        // ─────────────────────────────────────────────────────────────
        {
            id: "system-overview",
            title: catalogMessage("text_5fa5004504e7"),
            icon: "dashboard",
            description: catalogMessage("text_7c591963c167"),
            groups: [
                {
                    id: "dashboard",
                    title: catalogMessage("text_336496c4f685"),
                    description: catalogMessage("text_0232b698e0e7"),
                    screens: [
                        {
                            id: "global-dashboard",
                            title: catalogMessage("text_336496c4f685"),
                            icon: "dashboard",
                            description: catalogMessage("text_10ecffe69f50"),
                            href: "/01-enterprise-core/system-overview/dashboard/global-dashboard",
                            permissions: [],
                            module: "dashboard",
                        },
                        {
                            id: "modules-status",
                            title: catalogMessage("text_7d555bc68c1a"),
                            icon: "check-circle",
                            description: catalogMessage("text_23d73f9f29cd"),
                            href: "/01-enterprise-core/system-overview/dashboard/modules-status",
                            permissions: [],
                            module: "dashboard",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Organization & Legal Governance
        // ─────────────────────────────────────────────────────────────
        {
            id: "organization-governance",
            title: catalogMessage("text_fe913fccfb07"),
            icon: "tree",
            description: catalogMessage("text_4deb515cb49b"),
            groups: [
                {
                    id: "org-structure",
                    title: catalogMessage("text_46d466c3c97d"),
                    description: catalogMessage("text_02f1b741dcb6"),
                    screens: [
                        {
                            id: "org-hierarchy",
                            title: catalogMessage("text_46d466c3c97d"),
                            icon: "tree",
                            description: catalogMessage("text_e20a5042865e"),
                            href: "/01-enterprise-core/organization-governance/org-structure/org-hierarchy",
                            permissions: [],
                            module: "org_structure",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Automation & Processing
        // ─────────────────────────────────────────────────────────────
        {
            id: "automation",
            title: catalogMessage("text_dbd7084a11a8"),
            icon: "repeat",
            description: catalogMessage("text_db985cdb2766"),
            groups: [
                {
                    id: "recurring",
                    title: catalogMessage("text_8565024fff29"),
                    description: catalogMessage("text_e5dcb2add95b"),
                    screens: [
                        {
                            id: "recurring-transactions",
                            title: catalogMessage("text_8565024fff29"),
                            icon: "repeat",
                            description: catalogMessage("text_e5dcb2add95b"),
                            href: "/01-enterprise-core/automation/recurring/recurring-transactions",
                            permissions: [],
                            module: "recurring_transactions",
                        },
                        {
                            id: "batch-processing",
                            title: catalogMessage("text_3ac01d4f851b"),
                            icon: "layers",
                            description: catalogMessage("text_9b9dd17b5675"),
                            href: "/01-enterprise-core/automation/recurring/batch-processing",
                            permissions: [],
                            module: "batch_processing",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Identity & Access (IAM)
        // ─────────────────────────────────────────────────────────────
        {
            id: "identity-access",
            title: catalogMessage("text_842e67e0c8f6"),
            icon: "user-cog",
            description: catalogMessage("text_eabcf1847259"),
            groups: [
                {
                    id: "user-management",
                    title: catalogMessage("text_9d0befe3acd3"),
                    description: catalogMessage("text_250b06dc4cad"),
                    screens: [
                        {
                            id: "users",
                            title: catalogMessage("text_9d0befe3acd3"),
                            icon: "user-cog",
                            description: catalogMessage("text_6480df0337f1"),
                            href: "/01-enterprise-core/identity-access/user-management/users",
                            permissions: [],
                            module: "users",
                            status: "pending",
                        },
                        {
                            id: "system-settings",
                            title: catalogMessage("text_0f46db2a8846"),
                            icon: "settings",
                            description: catalogMessage("text_2585a1f9f71e"),
                            href: "/01-enterprise-core/identity-access/user-management/system-settings",
                            permissions: [],
                            module: "settings",
                            status: "operational",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Monitoring & Compliance
        // ─────────────────────────────────────────────────────────────
        {
            id: "monitoring-compliance",
            title: catalogMessage("text_f049ac7235e4"),
            icon: "activity",
            description: catalogMessage("text_a9480681b028"),
            groups: [
                {
                    id: "audit-notifications",
                    title: catalogMessage("text_d55d0d631b8a"),
                    description: catalogMessage("text_595dd0763517"),
                    screens: [
                        {
                            id: "notifications",
                            title: catalogMessage("text_8ce3e0cc0601"),
                            icon: "bell",
                            description: catalogMessage("text_af0043c913f0"),
                            href: "/01-enterprise-core/monitoring-compliance/audit-notifications/notifications",
                            permissions: [],
                            module: "notifications",
                            status: "pending",
                        },
                        {
                            id: "system-logs",
                            title: catalogMessage("text_f3e357bd876b"),
                            icon: "file-search",
                            description: catalogMessage("text_fadac13eecb8"),
                            href: "/01-enterprise-core/monitoring-compliance/audit-notifications/system-logs",
                            permissions: [],
                            module: "system_logs",
                            status: "pending",
                        },
                    ],
                },
            ],
        },
    ],
};
