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
    title: catalogMessage("navigation.coreConfig.institutionalBasis"),
    icon: "dashboard",
    description: catalogMessage("navigation.coreConfig.systemAdministrationCorporateGovernanceDashboardOrganizationalStructure"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: System Overview
        // ─────────────────────────────────────────────────────────────
        {
            id: "system-overview",
            title: catalogMessage("navigation.coreConfig.systemOverview"),
            icon: "dashboard",
            description: catalogMessage("navigation.coreConfig.generalDashboardSystemModulesStatus"),
            groups: [
                {
                    id: "dashboard",
                    title: catalogMessage("common.general.dashboard"),
                    description: catalogMessage("navigation.coreConfig.mainCommandCenter"),
                    screens: [
                        {
                            id: "global-dashboard",
                            title: catalogMessage("common.general.dashboard"),
                            icon: "dashboard",
                            description: catalogMessage("navigation.coreConfig.comprehensiveSystemOverview"),
                            href: "/01-enterprise-core/system-overview/dashboard/global-dashboard",
                            permissions: [],
                            module: "dashboard",
                        },
                        {
                            id: "modules-status",
                            title: catalogMessage("common.general.unitsStatus"),
                            icon: "check-circle",
                            description: catalogMessage("navigation.coreConfig.statusAllSystemUnits"),
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
            title: catalogMessage("navigation.coreConfig.governanceOrganizationalStructure"),
            icon: "tree",
            description: catalogMessage("navigation.coreConfig.organizationalStructureLegalEntitiesBusinessUnits"),
            groups: [
                {
                    id: "org-structure",
                    title: catalogMessage("common.general.organizationalStructure"),
                    description: catalogMessage("navigation.coreConfig.organizationalStructurePlanningManagement"),
                    screens: [
                        {
                            id: "org-hierarchy",
                            title: catalogMessage("common.general.organizationalStructure"),
                            icon: "tree",
                            description: catalogMessage("navigation.coreConfig.organizationalStructurePlanningConfiguration"),
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
            title: catalogMessage("navigation.coreConfig.automationProcessing"),
            icon: "repeat",
            description: catalogMessage("navigation.coreConfig.recurringTransactionsBatchProcessingScheduling"),
            groups: [
                {
                    id: "recurring",
                    title: catalogMessage("common.general.recurringTransactions"),
                    description: catalogMessage("common.general.automatedOperationsScheduling"),
                    screens: [
                        {
                            id: "recurring-transactions",
                            title: catalogMessage("common.general.recurringTransactions"),
                            icon: "repeat",
                            description: catalogMessage("common.general.automatedOperationsScheduling"),
                            href: "/01-enterprise-core/automation/recurring/recurring-transactions",
                            permissions: [],
                            module: "recurring_transactions",
                        },
                        {
                            id: "batch-processing",
                            title: catalogMessage("navigation.coreConfig.paymentProcessing"),
                            icon: "layers",
                            description: catalogMessage("navigation.coreConfig.processDataBatches"),
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
            title: catalogMessage("navigation.coreConfig.identityAccess"),
            icon: "user-cog",
            description: catalogMessage("navigation.coreConfig.usersRolesPermissionsSecurityManagement"),
            groups: [
                {
                    id: "user-management",
                    title: catalogMessage("common.general.userManagement"),
                    description: catalogMessage("navigation.coreConfig.usersPermissions"),
                    screens: [
                        {
                            id: "users",
                            title: catalogMessage("common.general.userManagement"),
                            icon: "user-cog",
                            description: catalogMessage("navigation.coreConfig.usersPermissionsComingSoon"),
                            href: "/01-enterprise-core/identity-access/user-management/users",
                            permissions: [],
                            module: "users",
                            status: "pending",
                        },
                        {
                            id: "system-settings",
                            title: catalogMessage("navigation.coreConfig.systemSettings"),
                            icon: "settings",
                            description: catalogMessage("navigation.coreConfig.systemConfigurationPreferences"),
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
            title: catalogMessage("navigation.coreConfig.monitoringCompliance"),
            icon: "activity",
            description: catalogMessage("navigation.coreConfig.auditLogNotificationsSystemLogs"),
            groups: [
                {
                    id: "audit-notifications",
                    title: catalogMessage("navigation.coreConfig.auditNotifications"),
                    description: catalogMessage("navigation.coreConfig.comprehensiveMonitoringCenter"),
                    screens: [
                        {
                            id: "notifications",
                            title: catalogMessage("navigation.coreConfig.notifications"),
                            icon: "bell",
                            description: catalogMessage("navigation.coreConfig.notificationCenterComingSoon"),
                            href: "/01-enterprise-core/monitoring-compliance/audit-notifications/notifications",
                            permissions: [],
                            module: "notifications",
                            status: "pending",
                        },
                        {
                            id: "system-logs",
                            title: catalogMessage("navigation.coreConfig.systemLogs"),
                            icon: "file-search",
                            description: catalogMessage("navigation.coreConfig.errorEventLogsComingSoon"),
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
