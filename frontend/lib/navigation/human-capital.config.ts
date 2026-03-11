/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Domain 6: Human Capital Management (رأس المال البشري)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Vision: Complete workforce lifecycle — from recruitment through payroll,
 * performance management, and end-of-service.
 * 
 * Cross-Domain Integration:
 *  - Finance: Payroll journal entries, EOSB provisions
 *  - Core: User/Role management linkage
 *  - Projects: Resource allocation and timesheets
 */

import { Domain } from "../../types/navigation";

export const HumanCapitalDomain: Domain = {
    id: "human-capital",
    order: 6,
    title: "رأس المال البشري",
    icon: "users",
    description: "إدارة الموظفين والتوظيف والحضور والرواتب والأداء والتطوير",
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Workforce Admin
        // ─────────────────────────────────────────────────────────────
        {
            id: "workforce-admin",
            title: "الإدارة الأساسية",
            icon: "users",
            description: "بيانات الموظفين والعقود والأصول والوثائق",
            groups: [
                {
                    id: "employee-master",
                    title: "بيانات الموظفين",
                    description: "الملف الشامل للموظف",
                    screens: [
                        {
                            id: "employees-list",
                            title: "الموظفين",
                            icon: "user",
                            description: "قاعدة بيانات الموظفين",
                            href: "/06-human-capital/workforce-admin/employee-master/employees-list",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "expat-management",
                            title: "إدارة العمالة الأجنبية",
                            icon: "globe",
                            description: "إدارة الوثائق والتصاريح للموظفين العمالة الأجنبية",
                            href: "/06-human-capital/workforce-admin/employee-master/expat-management",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "employee-assets",
                            title: "أصول الموظفين",
                            icon: "laptop",
                            description: "إدارة المعدات والأصول المخصصة للموظفين",
                            href: "/06-human-capital/workforce-admin/employee-master/employee-assets",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "contracts",
                            title: "العقود والاتفاقيات",
                            icon: "file-contract",
                            description: "إدارة عقود العمل والاتفاقيات",
                            href: "/06-human-capital/workforce-admin/employee-master/contracts",
                            permissions: [],
                            module: "employees",
                        },
                    ],
                },
                {
                    id: "employee-groups-nr",
                    title: "تجميعات الموظفين",
                    icon: "group",
                    description: "تجميعات ونطاقات ترقيم الموظفين",
                    screens: [
                        {
                            id: "add-employee-group",
                            title: "تعريف تجميع",
                            icon: "add",
                            description: "إضافة تجميع جديد",
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/add-employee-group",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "add-employee-nr",
                            title: "تعريف نطاق",
                            icon: "add",
                            description: "إضافة نطاق جديد",
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/add-employee-nr",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "view-employee-groups",
                            title: "عرض تجميعات الموظفين",
                            icon: "view",
                            description: "عرض تجميعات الموظفين",
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/view-employee-groups",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "view-employee-nr",
                            title: "عرض نطاقات الموظفين",
                            icon: "view",
                            description: "عرض نطاقات الموظفين",
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/view-employee-nr",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "employee-nr-assignment",
                            title: "عرض وإضافة الإسنادات",
                            icon: "add",
                            description: "عرض إسنادات نطاقات الترقيم إلى الموظفين",
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/employee-nr-assignment",
                            permissions: [],
                            module: "employees",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Talent & Recruitment
        // ─────────────────────────────────────────────────────────────
        {
            id: "talent-recruitment",
            title: "التوظيف والمواهب",
            icon: "user-plus",
            description: "نظام تتبع المتقدمين والتهيئة والعمالة المؤقتة",
            groups: [
                {
                    id: "recruitment",
                    title: "عمليات التوظيف",
                    description: "من التوظيف إلى الانضمام",
                    screens: [
                        {
                            id: "ats",
                            title: "التوظيف والمرشحين",
                            icon: "user-plus",
                            description: "نظام تتبع المتقدمين للوظائف",
                            href: "/06-human-capital/talent-recruitment/recruitment/ats",
                            permissions: [],
                            module: "recruitment",
                        },
                        {
                            id: "administration",
                            title: "الإدارة والأدوار",
                            icon: "settings",
                            description: "المسميات الوظيفية والصلاحيات وربط المستخدمين",
                            href: "/06-human-capital/talent-recruitment/recruitment/administration",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "onboarding",
                            title: "التهيئة والإنهاء",
                            icon: "user-check",
                            description: "عمليات التوظيف وإنهاء الخدمة",
                            href: "/06-human-capital/talent-recruitment/recruitment/onboarding",
                            permissions: [],
                            module: "onboarding",
                        },
                        {
                            id: "contingent-workers",
                            title: "العمالة المؤقتة",
                            icon: "briefcase",
                            description: "إدارة المقاولين والاستشاريين",
                            href: "/06-human-capital/talent-recruitment/recruitment/contingent-workers",
                            permissions: [],
                            module: "contingent",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Compliance & Relations
        // ─────────────────────────────────────────────────────────────
        {
            id: "hr-compliance",
            title: "الامتثال والعلاقات",
            icon: "shield-check",
            description: "الجودة والامتثال وعلاقات الموظفين والاتصالات",
            groups: [
                {
                    id: "compliance-relations",
                    title: "الامتثال والعلاقات",
                    description: "الشكاوى والانضباط والاتصالات",
                    screens: [
                        {
                            id: "qa-compliance",
                            title: "الجودة والامتثال",
                            icon: "shield-check",
                            description: "إدارة الامتثال والتدقيق الداخلي",
                            href: "/06-human-capital/hr-compliance/compliance-relations/qa-compliance",
                            permissions: [],
                            module: "compliance",
                        },
                        {
                            id: "employee-relations",
                            title: "علاقات الموظفين",
                            icon: "scale",
                            description: "إدارة الشكاوى والانضباط",
                            href: "/06-human-capital/hr-compliance/compliance-relations/employee-relations",
                            permissions: [],
                            module: "relations",
                        },
                        {
                            id: "communications",
                            title: "الاتصالات المؤسسية",
                            icon: "bullhorn",
                            description: "الإعلانات والاستطلاعات",
                            href: "/06-human-capital/hr-compliance/compliance-relations/communications",
                            permissions: [],
                            module: "communications",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Time & Productivity
        // ─────────────────────────────────────────────────────────────
        {
            id: "time-productivity",
            title: "الوقت والحضور",
            icon: "clock",
            description: "الحضور والانصراف والجدولة والإجازات",
            groups: [
                {
                    id: "attendance-scheduling",
                    title: "إدارة الحضور",
                    description: "تتبع الدوام والمناوبات",
                    screens: [
                        {
                            id: "attendance",
                            title: "الحضور والانصراف",
                            icon: "clock",
                            description: "تتبع الدوام وتقرير الساعات",
                            href: "/06-human-capital/time-productivity/attendance-scheduling/attendance",
                            permissions: [],
                            module: "attendance",
                        },
                        {
                            id: "biometric",
                            title: "أجهزة البصمة",
                            icon: "clock",
                            description: "إدارة أجهزة الحضور البيومترية",
                            href: "/06-human-capital/time-productivity/attendance-scheduling/biometric",
                            permissions: [],
                            module: "attendance",
                        },
                        {
                            id: "scheduling",
                            title: "جدولة القوى العاملة",
                            icon: "calendar-days",
                            description: "جدولة المناوبات والتحسين",
                            href: "/06-human-capital/time-productivity/attendance-scheduling/scheduling",
                            permissions: [],
                            module: "scheduling",
                        },
                        {
                            id: "leave",
                            title: "الإجازات",
                            icon: "calendar",
                            description: "إدارة طلبات الإجازات والغياب",
                            href: "/06-human-capital/time-productivity/attendance-scheduling/leave",
                            permissions: [],
                            module: "leave",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Performance & Development
        // ─────────────────────────────────────────────────────────────
        {
            id: "performance-development",
            title: "الأداء والتطوير",
            icon: "chart-line",
            description: "تقييم الأداء والتدريب والتخطيط للخلافة",
            groups: [
                {
                    id: "performance",
                    title: "الأداء والتعلم",
                    description: "إدارة الأهداف والتطوير",
                    screens: [
                        {
                            id: "performance-kpi",
                            title: "الأداء والأهداف",
                            icon: "chart-line",
                            description: "إدارة الأهداف وتقييمات الأداء",
                            href: "/06-human-capital/performance-development/performance/performance-kpi",
                            permissions: [],
                            module: "performance",
                        },
                        {
                            id: "learning",
                            title: "التدريب والتعلم",
                            icon: "graduation-cap",
                            description: "نظام إدارة التعلم (LMS)",
                            href: "/06-human-capital/performance-development/performance/learning",
                            permissions: [],
                            module: "learning",
                        },
                        {
                            id: "succession",
                            title: "التخطيط للخلافة",
                            icon: "sitemap",
                            description: "تخطيط الخلافة والمسار الوظيفي",
                            href: "/06-human-capital/performance-development/performance/succession",
                            permissions: [],
                            module: "succession",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Payroll & Benefits
        // ─────────────────────────────────────────────────────────────
        {
            id: "payroll-benefits",
            title: "الرواتب والتعويضات",
            icon: "banknote",
            description: "مسيرات الرواتب والتعويضات والمزايا والربط البنكي",
            groups: [
                {
                    id: "payroll-management",
                    title: "إدارة الرواتب",
                    description: "المسيرات والمكونات والربط البنكي",
                    screens: [
                        {
                            id: "compensation",
                            title: "إدارة التعويضات",
                            icon: "money-bill-wave",
                            description: "تخطيط الرواتب والمزايا",
                            href: "/06-human-capital/payroll-benefits/payroll-management/compensation",
                            permissions: [],
                            module: "compensation",
                        },
                        {
                            id: "benefits",
                            title: "المزايا والاستحقاقات",
                            icon: "heart",
                            description: "إدارة خطط المزايا",
                            href: "/06-human-capital/payroll-benefits/payroll-management/benefits",
                            permissions: [],
                            module: "benefits",
                        },
                        {
                            id: "payroll",
                            title: "الرواتب",
                            icon: "banknote",
                            description: "إدارة مسيرات الرواتب والاعتمادات",
                            href: "/06-human-capital/payroll-benefits/payroll-management/payroll",
                            permissions: [],
                            module: "payroll",
                        },
                        {
                            id: "payroll-components",
                            title: "مكونات الرواتب",
                            icon: "settings",
                            description: "إدارة البدلات والاستقطاعات",
                            href: "/06-human-capital/payroll-benefits/payroll-management/payroll-components",
                            permissions: [],
                            module: "payroll",
                        },
                        {
                            id: "payroll-integrations",
                            title: "الربط البنكي",
                            icon: "link",
                            description: "ملفات البنوك والتكاملات",
                            href: "/06-human-capital/payroll-benefits/payroll-management/payroll-integrations",
                            permissions: [],
                            module: "payroll",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Employee Services & Wellness
        // ─────────────────────────────────────────────────────────────
        {
            id: "services-wellness",
            title: "الخدمات والصحة",
            icon: "heart-pulse",
            description: "السفر والقروض والصحة والسلامة والرفاهية",
            groups: [
                {
                    id: "employee-services",
                    title: "خدمات الموظفين",
                    description: "خدمات متنوعة للموظفين",
                    screens: [
                        {
                            id: "travel-expenses",
                            title: "السفر والمصروفات",
                            icon: "plane",
                            description: "طلبات السفر وتقارير المصروفات",
                            href: "/06-human-capital/services-wellness/employee-services/travel-expenses",
                            permissions: [],
                            module: "travel",
                        },
                        {
                            id: "loans",
                            title: "القروض المالية",
                            icon: "hand-holding-usd",
                            description: "إدارة قروض الموظفين",
                            href: "/06-human-capital/services-wellness/employee-services/loans",
                            permissions: [],
                            module: "loans",
                        },
                        {
                            id: "ehs",
                            title: "الصحة والسلامة",
                            icon: "hard-hat",
                            description: "إدارة الحوادث والسلامة",
                            href: "/06-human-capital/services-wellness/employee-services/ehs",
                            permissions: [],
                            module: "ehs",
                        },
                        {
                            id: "wellness",
                            title: "الرفاهية",
                            icon: "heart-pulse",
                            description: "برامج الصحة والرفاهية",
                            href: "/06-human-capital/services-wellness/employee-services/wellness",
                            permissions: [],
                            module: "wellness",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Knowledge & Self-Service
        // ─────────────────────────────────────────────────────────────
        {
            id: "knowledge-portal",
            title: "المعرفة والبوابة",
            icon: "book",
            description: "قاعدة المعرفة والبوابة الذاتية ونهاية الخدمة",
            groups: [
                {
                    id: "self-service",
                    title: "الخدمة الذاتية",
                    description: "بوابة الموظف وقاعدة المعرفة",
                    screens: [
                        {
                            id: "knowledge-base",
                            title: "قاعدة المعرفة",
                            icon: "book",
                            description: "مكتبة المعرفة وأفضل الممارسات",
                            href: "/06-human-capital/knowledge-portal/self-service/knowledge-base",
                            permissions: [],
                            module: "knowledge",
                        },
                        {
                            id: "expertise",
                            title: "دليل الخبراء",
                            icon: "users-gear",
                            description: "دليل الخبراء الداخليين",
                            href: "/06-human-capital/knowledge-portal/self-service/expertise",
                            permissions: [],
                            module: "expertise",
                        },
                        {
                            id: "employee-portal",
                            title: "البوابة الذاتية",
                            icon: "user-cog",
                            description: "كشوف المرتبات وطلبات الموظف",
                            href: "/06-human-capital/knowledge-portal/self-service/employee-portal",
                            permissions: [],
                            module: "portal",
                        },
                        {
                            id: "eosb",
                            title: "مكافأة نهاية الخدمة",
                            icon: "calculator",
                            description: "حساب تسويات نهاية الخدمة",
                            href: "/06-human-capital/knowledge-portal/self-service/eosb",
                            permissions: [],
                            module: "eosb",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Advanced Features
        // ─────────────────────────────────────────────────────────────
        {
            id: "hr-advanced",
            title: "ميزات متقدمة",
            icon: "settings",
            description: "المستندات والتقارير المتقدمة",
            groups: [
                {
                    id: "documents-reports",
                    title: "المستندات والتقارير",
                    description: "قوالب المستندات والتقارير",
                    screens: [
                        {
                            id: "hr-documents",
                            title: "المستندات والتقارير",
                            icon: "file-signature",
                            description: "قوالب المستندات وبطاقات الهوية والتقارير",
                            href: "/06-human-capital/hr-advanced/documents-reports/hr-documents",
                            permissions: [],
                            module: "employees",
                        },
                    ],
                },
            ],
        },
    ],
};
