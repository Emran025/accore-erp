import { catalogMessage } from "@/lib/i18n";
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
    title: catalogMessage("text_10f0fab38f6c"),
    icon: "users",
    description: catalogMessage("text_6faee4e02c01"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Workforce Admin
        // ─────────────────────────────────────────────────────────────
        {
            id: "workforce-admin",
            title: catalogMessage("text_269a7b7c79fc"),
            icon: "users",
            description: catalogMessage("text_35c18b8c32a3"),
            groups: [
                {
                    id: "employee-master",
                    title: catalogMessage("text_662c761383aa"),
                    description: catalogMessage("text_4121b3dfc43c"),
                    screens: [
                        {
                            id: "employees-list",
                            title: catalogMessage("text_b72b314e8bfe"),
                            icon: "user",
                            description: catalogMessage("text_dab28f7f58b6"),
                            href: "/06-human-capital/workforce-admin/employee-master/employees-list",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "expat-management",
                            title: catalogMessage("text_d615f591967f"),
                            icon: "globe",
                            description: catalogMessage("text_eb8d3505137f"),
                            href: "/06-human-capital/workforce-admin/employee-master/expat-management",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "employee-assets",
                            title: catalogMessage("text_dae7bb2736a6"),
                            icon: "laptop",
                            description: catalogMessage("text_9c72c0c34b88"),
                            href: "/06-human-capital/workforce-admin/employee-master/employee-assets",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "contracts",
                            title: catalogMessage("text_97fe2c7ce722"),
                            icon: "file-contract",
                            description: catalogMessage("text_15426ec74882"),
                            href: "/06-human-capital/workforce-admin/employee-master/contracts",
                            permissions: [],
                            module: "employees",
                        },
                    ],
                },
                {
                    id: "employee-groups-nr",
                    title: catalogMessage("text_d91566129fba"),
                    icon: "group",
                    description: catalogMessage("text_e9b99bf70610"),
                    screens: [
                        {
                            id: "add-employee-group",
                            title: catalogMessage("text_da33776a790a"),
                            icon: "add",
                            description: catalogMessage("text_008637650d6c"),
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/add-employee-group",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "add-employee-nr",
                            title: catalogMessage("text_7c221583986f"),
                            icon: "add",
                            description: catalogMessage("text_1b15968ae1d6"),
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/add-employee-nr",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "view-employee-groups",
                            title: catalogMessage("text_e7a196971fe4"),
                            icon: "view",
                            description: catalogMessage("text_e7a196971fe4"),
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/view-employee-groups",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "view-employee-nr",
                            title: catalogMessage("text_e386d4b4d888"),
                            icon: "view",
                            description: catalogMessage("text_e386d4b4d888"),
                            href: "/06-human-capital/workforce-admin/employee-groups-nr/view-employee-nr",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "employee-nr-assignment",
                            title: catalogMessage("text_197b19ee7c45"),
                            icon: "add",
                            description: catalogMessage("text_611540ab24ed"),
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
            title: catalogMessage("text_0a33eebb40de"),
            icon: "user-plus",
            description: catalogMessage("text_91883739a381"),
            groups: [
                {
                    id: "recruitment",
                    title: catalogMessage("text_4f04a53fea96"),
                    description: catalogMessage("text_d9ee68e020ea"),
                    screens: [
                        {
                            id: "ats",
                            title: catalogMessage("text_a6ff66f0a31c"),
                            icon: "user-plus",
                            description: catalogMessage("text_2d38ac6d4feb"),
                            href: "/06-human-capital/talent-recruitment/recruitment/ats",
                            permissions: [],
                            module: "recruitment",
                        },
                        {
                            id: "administration",
                            title: catalogMessage("text_75b8a09f973e"),
                            icon: "settings",
                            description: catalogMessage("text_0bbadc153a52"),
                            href: "/06-human-capital/talent-recruitment/recruitment/administration",
                            permissions: [],
                            module: "employees",
                        },
                        {
                            id: "onboarding",
                            title: catalogMessage("text_2cad2bd456c2"),
                            icon: "user-check",
                            description: catalogMessage("text_8423fb7c9ece"),
                            href: "/06-human-capital/talent-recruitment/recruitment/onboarding",
                            permissions: [],
                            module: "onboarding",
                        },
                        {
                            id: "contingent-workers",
                            title: catalogMessage("text_25f00fd24148"),
                            icon: "briefcase",
                            description: catalogMessage("text_bbd403d2aa4d"),
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
            title: catalogMessage("text_b4c79a951af5"),
            icon: "shield-check",
            description: catalogMessage("text_5001d5426fda"),
            groups: [
                {
                    id: "compliance-relations",
                    title: catalogMessage("text_b4c79a951af5"),
                    description: catalogMessage("text_08bd438d05ce"),
                    screens: [
                        {
                            id: "qa-compliance",
                            title: catalogMessage("text_a4a91ea866ef"),
                            icon: "shield-check",
                            description: catalogMessage("text_7421599a5cf8"),
                            href: "/06-human-capital/hr-compliance/compliance-relations/qa-compliance",
                            permissions: [],
                            module: "compliance",
                        },
                        {
                            id: "employee-relations",
                            title: catalogMessage("text_f75e3a4229b3"),
                            icon: "scale",
                            description: catalogMessage("text_1bd1b27db43d"),
                            href: "/06-human-capital/hr-compliance/compliance-relations/employee-relations",
                            permissions: [],
                            module: "relations",
                        },
                        {
                            id: "communications",
                            title: catalogMessage("text_ceaf6ce2fd61"),
                            icon: "bullhorn",
                            description: catalogMessage("text_a0e01093ec8c"),
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
            title: catalogMessage("text_98cdab5cad57"),
            icon: "clock",
            description: catalogMessage("text_d9b165ae677f"),
            groups: [
                {
                    id: "attendance-scheduling",
                    title: catalogMessage("text_c44eb889ae26"),
                    description: catalogMessage("text_76277ee6ea49"),
                    screens: [
                        {
                            id: "attendance",
                            title: catalogMessage("text_3153537304ad"),
                            icon: "clock",
                            description: catalogMessage("text_384ac539c283"),
                            href: "/06-human-capital/time-productivity/attendance-scheduling/attendance",
                            permissions: [],
                            module: "attendance",
                        },
                        {
                            id: "biometric",
                            title: catalogMessage("text_98f211083ddf"),
                            icon: "clock",
                            description: catalogMessage("text_6eae6faaf39b"),
                            href: "/06-human-capital/time-productivity/attendance-scheduling/biometric",
                            permissions: [],
                            module: "attendance",
                        },
                        {
                            id: "scheduling",
                            title: catalogMessage("text_83d32cd90f2d"),
                            icon: "calendar-days",
                            description: catalogMessage("text_0333c0a49ffd"),
                            href: "/06-human-capital/time-productivity/attendance-scheduling/scheduling",
                            permissions: [],
                            module: "scheduling",
                        },
                        {
                            id: "leave",
                            title: catalogMessage("text_2ff62410916c"),
                            icon: "calendar",
                            description: catalogMessage("text_19469f267b92"),
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
            title: catalogMessage("text_1f6ffc904fff"),
            icon: "chart-line",
            description: catalogMessage("text_8672d3f1eb35"),
            groups: [
                {
                    id: "performance",
                    title: catalogMessage("text_2ff53617ffdf"),
                    description: catalogMessage("text_7fd5d375d810"),
                    screens: [
                        {
                            id: "performance-kpi",
                            title: catalogMessage("text_8b02a7309aba"),
                            icon: "chart-line",
                            description: catalogMessage("text_d46bc5e7469d"),
                            href: "/06-human-capital/performance-development/performance/performance-kpi",
                            permissions: [],
                            module: "performance",
                        },
                        {
                            id: "learning",
                            title: catalogMessage("text_57bd13375883"),
                            icon: "graduation-cap",
                            description: catalogMessage("text_d434fcd83b72"),
                            href: "/06-human-capital/performance-development/performance/learning",
                            permissions: [],
                            module: "learning",
                        },
                        {
                            id: "succession",
                            title: catalogMessage("text_e789ea97a5d1"),
                            icon: "sitemap",
                            description: catalogMessage("text_697769bce015"),
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
            title: catalogMessage("text_7d26af648530"),
            icon: "banknote",
            description: catalogMessage("text_6716e522d1b6"),
            groups: [
                {
                    id: "payroll-management",
                    title: catalogMessage("text_99c204b40af9"),
                    description: catalogMessage("text_6040795c00eb"),
                    screens: [
                        {
                            id: "compensation",
                            title: catalogMessage("text_6334fe113b74"),
                            icon: "money-bill-wave",
                            description: catalogMessage("text_03387ef67cbb"),
                            href: "/06-human-capital/payroll-benefits/payroll-management/compensation",
                            permissions: [],
                            module: "compensation",
                        },
                        {
                            id: "benefits",
                            title: catalogMessage("text_800701b92996"),
                            icon: "heart",
                            description: catalogMessage("text_896b00163ecc"),
                            href: "/06-human-capital/payroll-benefits/payroll-management/benefits",
                            permissions: [],
                            module: "benefits",
                        },
                        {
                            id: "payroll",
                            title: catalogMessage("text_8da58f1c866a"),
                            icon: "banknote",
                            description: catalogMessage("text_6fa319cdd729"),
                            href: "/06-human-capital/payroll-benefits/payroll-management/payroll",
                            permissions: [],
                            module: "payroll",
                        },
                        {
                            id: "payroll-components",
                            title: catalogMessage("text_861283f6aed4"),
                            icon: "settings",
                            description: catalogMessage("text_44ab077b8139"),
                            href: "/06-human-capital/payroll-benefits/payroll-management/payroll-components",
                            permissions: [],
                            module: "payroll",
                        },
                        {
                            id: "payroll-integrations",
                            title: catalogMessage("text_d984325c3b8c"),
                            icon: "link",
                            description: catalogMessage("text_b049d93771ee"),
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
            title: catalogMessage("text_a5785ef986b6"),
            icon: "heart-pulse",
            description: catalogMessage("text_d393481b4783"),
            groups: [
                {
                    id: "employee-services",
                    title: catalogMessage("text_db88151fd81e"),
                    description: catalogMessage("text_b8edfc2c1d61"),
                    screens: [
                        {
                            id: "travel-expenses",
                            title: catalogMessage("text_28a68602812c"),
                            icon: "plane",
                            description: catalogMessage("text_60a245cccfc1"),
                            href: "/06-human-capital/services-wellness/employee-services/travel-expenses",
                            permissions: [],
                            module: "travel",
                        },
                        {
                            id: "loans",
                            title: catalogMessage("text_ea9cd6542562"),
                            icon: "hand-holding-usd",
                            description: catalogMessage("text_20408a6ab1be"),
                            href: "/06-human-capital/services-wellness/employee-services/loans",
                            permissions: [],
                            module: "loans",
                        },
                        {
                            id: "ehs",
                            title: catalogMessage("text_748525308241"),
                            icon: "hard-hat",
                            description: catalogMessage("text_cb38a87ce16e"),
                            href: "/06-human-capital/services-wellness/employee-services/ehs",
                            permissions: [],
                            module: "ehs",
                        },
                        {
                            id: "wellness",
                            title: catalogMessage("text_3ce92fd36bc5"),
                            icon: "heart-pulse",
                            description: catalogMessage("text_e58b6cc6128e"),
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
            title: catalogMessage("text_3930c7c5a54f"),
            icon: "book",
            description: catalogMessage("text_dd63c976b4f6"),
            groups: [
                {
                    id: "self-service",
                    title: catalogMessage("text_dfa5a9006169"),
                    description: catalogMessage("text_93306e070a19"),
                    screens: [
                        {
                            id: "knowledge-base",
                            title: catalogMessage("text_659aa2733c32"),
                            icon: "book",
                            description: catalogMessage("text_0c0f88c6a086"),
                            href: "/06-human-capital/knowledge-portal/self-service/knowledge-base",
                            permissions: [],
                            module: "knowledge",
                        },
                        {
                            id: "expertise",
                            title: catalogMessage("text_e688fc5a7084"),
                            icon: "users-gear",
                            description: catalogMessage("text_2c1e0a11b1de"),
                            href: "/06-human-capital/knowledge-portal/self-service/expertise",
                            permissions: [],
                            module: "expertise",
                        },
                        {
                            id: "employee-portal",
                            title: catalogMessage("text_f1ad10e3fb23"),
                            icon: "user-cog",
                            description: catalogMessage("text_88736dbbd63d"),
                            href: "/06-human-capital/knowledge-portal/self-service/employee-portal",
                            permissions: [],
                            module: "portal",
                        },
                        {
                            id: "eosb",
                            title: catalogMessage("text_900c8f0e93b9"),
                            icon: "calculator",
                            description: catalogMessage("text_e0788567c6ed"),
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
            title: catalogMessage("text_5c044d933603"),
            icon: "settings",
            description: catalogMessage("text_1c7a91e89ded"),
            groups: [
                {
                    id: "documents-reports",
                    title: catalogMessage("text_e2588518209c"),
                    description: catalogMessage("text_911815daf926"),
                    screens: [
                        {
                            id: "hr-documents",
                            title: catalogMessage("text_e2588518209c"),
                            icon: "file-signature",
                            description: catalogMessage("text_bc71e47c64f2"),
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
