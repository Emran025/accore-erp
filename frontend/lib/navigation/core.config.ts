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
    title: "الأساس المؤسسي",
    icon: "dashboard",
    description: "إدارة النظام والحوكمة المؤسسية — لوحة التحكم، الهيكل التنظيمي، الأتمتة، الهوية والوصول، والمراقبة والامتثال",
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: System Overview
        // ─────────────────────────────────────────────────────────────
        {
            id: "system-overview",
            title: "نظرة عامة على النظام",
            icon: "dashboard",
            description: "لوحة التحكم العامة وحالة وحدات النظام",
            groups: [
                {
                    id: "dashboard",
                    title: "لوحة التحكم",
                    description: "مركز القيادة الرئيسي",
                    screens: [
                        {
                            id: "global-dashboard",
                            title: "لوحة التحكم",
                            icon: "dashboard",
                            description: "نظرة عامة شاملة على النظام",
                            href: "/01-enterprise-core/system-overview/dashboard/global-dashboard",
                            permissions: [],
                            module: "dashboard",
                        },
                        {
                            id: "modules-status",
                            title: "حالة الوحدات",
                            icon: "check-circle",
                            description: "حالة جميع وحدات النظام",
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
            title: "الحوكمة والهيكل التنظيمي",
            icon: "tree",
            description: "الهيكل التنظيمي والكيانات القانونية ووحدات الأعمال",
            groups: [
                {
                    id: "org-structure",
                    title: "الهيكل التنظيمي",
                    description: "تخطيط وإدارة الهيكل التنظيمي",
                    screens: [
                        {
                            id: "org-hierarchy",
                            title: "الهيكل التنظيمي",
                            icon: "tree",
                            description: "تخطيط وتهيئة الهيكل التنظيمي للمؤسسة",
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
            title: "الأتمتة والمعالجة",
            icon: "repeat",
            description: "المعاملات المتكررة والمعالجة الدفعية والجدولة",
            groups: [
                {
                    id: "recurring",
                    title: "المعاملات المتكررة",
                    description: "جدولة العمليات الآلية",
                    screens: [
                        {
                            id: "recurring-transactions",
                            title: "المعاملات المتكررة",
                            icon: "repeat",
                            description: "جدولة العمليات الآلية",
                            href: "/01-enterprise-core/automation/recurring/recurring-transactions",
                            permissions: [],
                            module: "recurring_transactions",
                        },
                        {
                            id: "batch-processing",
                            title: "المعالجة الدفعية",
                            icon: "layers",
                            description: "معالجة دفعات البيانات",
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
            title: "الهوية والوصول",
            icon: "user-cog",
            description: "إدارة المستخدمين والأدوار والصلاحيات والأمان",
            groups: [
                {
                    id: "user-management",
                    title: "إدارة المستخدمين",
                    description: "المستخدمين والصلاحيات",
                    screens: [
                        {
                            id: "users",
                            title: "إدارة المستخدمين",
                            icon: "user-cog",
                            description: "المستخدمين والصلاحيات (قريباً)",
                            href: "/01-enterprise-core/identity-access/user-management/users",
                            permissions: [],
                            module: "users",
                            status: "pending",
                        },
                        {
                            id: "system-settings",
                            title: "إعدادات النظام",
                            icon: "settings",
                            description: "تكوين النظام والتفضيلات",
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
            title: "المراقبة والامتثال",
            icon: "activity",
            description: "سجل التدقيق والإشعارات وسجلات النظام",
            groups: [
                {
                    id: "audit-notifications",
                    title: "التدقيق والإشعارات",
                    description: "مركز المراقبة الشامل",
                    screens: [
                        {
                            id: "notifications",
                            title: "الإشعارات",
                            icon: "bell",
                            description: "مركز الإشعارات (قريباً)",
                            href: "/01-enterprise-core/monitoring-compliance/audit-notifications/notifications",
                            permissions: [],
                            module: "notifications",
                            status: "pending",
                        },
                        {
                            id: "system-logs",
                            title: "سجلات النظام",
                            icon: "file-search",
                            description: "سجلات الأخطاء والأحداث (قريباً)",
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
