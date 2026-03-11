/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Domain 3: Financial Management (الإدارة المالية)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Vision: Complete financial control — General Ledger, management accounting,
 * treasury, foreign exchange, consolidation, tax compliance, and reporting.
 * 
 * Cross-Domain Integration:
 *  - Commercial: Revenue posting, AR/AP
 *  - Supply Chain: Purchase invoice matching
 *  - Human Capital: Payroll journal entries
 *  - Assets: Depreciation schedules
 */

import { Domain } from "../../types/navigation";

export const FinanceDomain: Domain = {
    id: "",
    order: 3,
    title: "الإدارة المالية",
    icon: "coins",
    description: "الأستاذ العام، المحاسبة الإدارية، الخزينة، العملات الأجنبية، الضرائب، والتقارير المالية",
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: General Ledger
        // ─────────────────────────────────────────────────────────────
        {
            id: "general-ledger",
            title: "الأستاذ العام",
            icon: "book-open",
            description: "دليل الحسابات، الفترات المالية، وسندات القيد",
            groups: [
                {
                    id: "ledger-core",
                    title: "التقارير المالية",
                    description: "المرجع المالي الأساسي",
                    screens: [
                        {
                            id: "chart-of-accounts",
                            title: "دليل الحسابات",
                            icon: "sitemap",
                            description: "هيكل شجرة الحسابات",
                            href: "/03-finance/general-ledger/ledger-core/chart-of-accounts",
                            permissions: [],
                            module: "chart_of_accounts",
                        },
                        {
                            id: "fiscal-periods",
                            title: "الفترات المالية",
                            icon: "calendar",
                            description: "إدارة السنوات والفترات",
                            href: "/03-finance/general-ledger/ledger-core/fiscal-periods",
                            permissions: [],
                            module: "fiscal_periods",
                        },
                        {
                            id: "general-ledger-book",
                            title: "دفتر الأستاذ العام",
                            icon: "book-open",
                            description: "السجل المالي الشامل",
                            href: "/03-finance/general-ledger/ledger-core/general-ledger-book",
                            permissions: [],
                            module: "general_ledger",
                        },
                        {
                            id: "financial-reports",
                            title: "التقارير والتحليلات",
                            icon: "pie-chart",
                            description: "تقارير مالية وتحليلات متقدمة",
                            href: "/03-finance/general-ledger/ledger-core/financial-reports",
                            permissions: [],
                            module: "reports",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Management Accounting
        // ─────────────────────────────────────────────────────────────
        {
            id: "management-accounting",
            title: "المحاسبة الإدارية",
            icon: "building",
            description: "مراكز التكلفة، مراكز الربح، والميزانيات",
            groups: [
                {
                    id: "cost-profit-centers",
                    title: "المالية والمحاسبة",
                    description: "توزيع وتحليل التكاليف والأرباح",
                    screens: [
                        {
                            id: "cost-centers",
                            title: "مراكز التكلفة",
                            icon: "building",
                            description: "إدارة وتوزيع التكاليف على المراكز",
                            href: "/03-finance/management-accounting/cost-profit-centers/cost-centers",
                            permissions: [],
                            module: "chart_of_accounts",
                        },
                        {
                            id: "profit-centers",
                            title: "مراكز الربح",
                            icon: "trending-up",
                            description: "تحليل الربحية حسب الوحدات",
                            href: "/03-finance/management-accounting/cost-profit-centers/profit-centers",
                            permissions: [],
                            module: "chart_of_accounts",
                        },
                        {
                            id: "budgeting",
                            title: "الميزانيات",
                            icon: "wallet",
                            description: "التخطيط والميزانيات (قريباً)",
                            href: "/03-finance/management-accounting/cost-profit-centers/budgeting",
                            permissions: [],
                            module: "general_ledger",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Treasury & Cash Management
        // ─────────────────────────────────────────────────────────────
        {
            id: "treasury",
            title: "النقدية والسياسة المالية",
            icon: "trending-up",
            description: "سندات القيد، التدفق النقدي، والتسوية البنكية",
            groups: [
                {
                    id: "cash-management",
                    title: "إدارة النقدية",
                    description: "إدارة السيولة والحركات النقدية",
                    screens: [
                        {
                            id: "journal-vouchers",
                            title: "سندات القيد",
                            icon: "file-signature",
                            description: "القيود اليومية والمحاسبية",
                            href: "/03-finance/treasury/cash-management/journal-vouchers",
                            permissions: [],
                            module: "journal_vouchers",
                        },
                        {
                            id: "cash-flow",
                            title: "التدفق النقدي",
                            icon: "trending-up",
                            description: "إدارة السيولة (قريباً)",
                            href: "/03-finance/treasury/cash-management/cash-flow",
                            permissions: [],
                            module: "general_ledger",
                        },
                        {
                            id: "bank-reconciliation",
                            title: "التسوية البنكية",
                            icon: "scale",
                            description: "مطابقة الحسابات البنكية",
                            href: "/03-finance/treasury/cash-management/bank-reconciliation",
                            permissions: [],
                            module: "reconciliation",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Foreign Exchange (FX) Operations
        // ─────────────────────────────────────────────────────────────
        {
            id: "foreign-exchange",
            title: "الخزينة والعملات الأجنبية",
            icon: "coins",
            description: "إدارة العملات وأسعار الصرف وعمليات التداول",
            groups: [
                {
                    id: "currency-management",
                    title: "إدارة العملات",
                    description: "العملات وأسعار الصرف",
                    screens: [
                        {
                            id: "currencies",
                            title: "العملات المعتمدة",
                            icon: "coins",
                            description: "تعريف وإدارة العملات الأساسية والأجنبية في النظام",
                            href: "/03-finance/foreign-exchange/currency-management/currencies",
                            permissions: [],
                            module: "currency",
                        },
                        {
                            id: "monetary-policy",
                            title: "السياسات النقدية",
                            icon: "coins",
                            description: "هيكلة محددات التقييم وقواعد التعاملات النقدية (قريباً)",
                            href: "/03-finance/foreign-exchange/currency-management/monetary-policy",
                            permissions: [],
                            module: "monetary_policy",
                        },
                        {
                            id: "exchange-rates",
                            title: "أسعار الصرف",
                            icon: "coins",
                            description: "إدارة جداول أسعار الصرف والسجل التاريخي للتقييم (قريباً)",
                            href: "/03-finance/foreign-exchange/currency-management/exchange-rates",
                            permissions: [],
                            module: "exchange_rate",
                        },
                        {
                            id: "fx-operations",
                            title: "عمليات الصرف الأجنبي",
                            icon: "coins",
                            description: "تنفيذ وتسوية أوامر بيع وشراء العملات (قريباً)",
                            href: "/03-finance/foreign-exchange/currency-management/fx-operations",
                            permissions: [],
                            module: "currency_transfer",
                        },
                        {
                            id: "fx-logs",
                            title: "سجل العمليات",
                            icon: "coins",
                            description: "التتبع التاريخي والرقابة على حركات التداول النقدي (قريباً)",
                            href: "/03-finance/foreign-exchange/currency-management/fx-logs",
                            permissions: [],
                            module: "currency_history",
                        },
                        {
                            id: "currency-positions",
                            title: "مراكز العملات",
                            icon: "coins",
                            description: "مراقبة مستويات السيولة والمراكز المالية لكل عملة (قريباً)",
                            href: "/03-finance/foreign-exchange/currency-management/currency-positions",
                            permissions: [],
                            module: "currency_balances",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Tax & Compliance
        // ─────────────────────────────────────────────────────────────
        {
            id: "tax-compliance",
            title: "الالتزامات المؤسسية الخارجية",
            icon: "shield",
            description: "الضرائب والجمارك والالتزامات الحكومية",
            groups: [
                {
                    id: "tax-management",
                    title: "إدارة الضرائب",
                    description: "ضريبة القيمة المضافة وزاتكا",
                    screens: [
                        {
                            id: "vat-zatca",
                            title: "الضرائب (VAT/ZATCA)",
                            icon: "shield-check",
                            description: "إدارة الضرائب والربط مع زاتكا",
                            href: "/03-finance/tax-compliance/tax-management/vat-zatca",
                            permissions: [],
                            module: "vat_zatca",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Internal Audit & Compliance
        // ─────────────────────────────────────────────────────────────
        {
            id: "audit-compliance",
            title: "التدقيق والامتثال الداخلي",
            icon: "shield-check",
            description: "سجل التدقيق وتتبع العمليات",
            groups: [
                {
                    id: "audit-trail",
                    title: "سجل التدقيق",
                    description: "تتبع شامل للعمليات",
                    screens: [
                        {
                            id: "audit-log",
                            title: "سجل التدقيق",
                            icon: "activity",
                            description: "تتبع جميع العمليات",
                            href: "/03-finance/audit-compliance/audit-trail/audit-log",
                            permissions: [],
                            module: "audit_trail",
                        },
                    ],
                },
            ],
        },
    ],
};
