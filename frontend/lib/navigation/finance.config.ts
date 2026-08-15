import { catalogMessage } from "@/lib/i18n";
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
    title: catalogMessage("text_682afdbdeee5"),
    icon: "coins",
    description: catalogMessage("text_fcfa2a63f34e"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: General Ledger
        // ─────────────────────────────────────────────────────────────
        {
            id: "general-ledger",
            title: catalogMessage("text_a79d7908681c"),
            icon: "book-open",
            description: catalogMessage("text_a2658df664f1"),
            groups: [
                {
                    id: "ledger-core",
                    title: catalogMessage("text_ebbfc766a2ef"),
                    description: catalogMessage("text_449d69ed5a48"),
                    screens: [
                        {
                            id: "chart-of-accounts",
                            title: catalogMessage("text_79b9f0587823"),
                            icon: "sitemap",
                            description: catalogMessage("text_4d440f09abcd"),
                            href: "/03-finance/general-ledger/ledger-core/chart-of-accounts",
                            permissions: [],
                            module: "chart_of_accounts",
                        },
                        {
                            id: "fiscal-periods",
                            title: catalogMessage("text_cba99e4b28df"),
                            icon: "calendar",
                            description: catalogMessage("text_017b24515d00"),
                            href: "/03-finance/general-ledger/ledger-core/fiscal-periods",
                            permissions: [],
                            module: "fiscal_periods",
                        },
                        {
                            id: "general-ledger-book",
                            title: catalogMessage("text_e04ca8b197c3"),
                            icon: "book-open",
                            description: catalogMessage("text_515223abb0e8"),
                            href: "/03-finance/general-ledger/ledger-core/general-ledger-book",
                            permissions: [],
                            module: "general_ledger",
                        },
                        {
                            id: "financial-reports",
                            title: catalogMessage("text_abd201eac7e8"),
                            icon: "pie-chart",
                            description: catalogMessage("text_afc00aafcd6f"),
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
            title: catalogMessage("text_e8cc3d7c260a"),
            icon: "building",
            description: catalogMessage("text_fd42f1d838d7"),
            groups: [
                {
                    id: "cost-profit-centers",
                    title: catalogMessage("text_3e0d1f15ece2"),
                    description: catalogMessage("text_1e8dabb619a9"),
                    screens: [
                        {
                            id: "cost-centers",
                            title: catalogMessage("text_f73d5c151e9c"),
                            icon: "building",
                            description: catalogMessage("text_80964b4b11fd"),
                            href: "/03-finance/management-accounting/cost-profit-centers/cost-centers",
                            permissions: [],
                            module: "chart_of_accounts",
                        },
                        {
                            id: "profit-centers",
                            title: catalogMessage("text_6927b11bef08"),
                            icon: "trending-up",
                            description: catalogMessage("text_4eeb20df1bde"),
                            href: "/03-finance/management-accounting/cost-profit-centers/profit-centers",
                            permissions: [],
                            module: "chart_of_accounts",
                        },
                        {
                            id: "budgeting",
                            title: catalogMessage("text_a0840380fd06"),
                            icon: "wallet",
                            description: catalogMessage("text_7c4971878807"),
                            href: "/03-finance/management-accounting/cost-profit-centers/budgeting",
                            permissions: [],
                            module: "general_ledger",
                            status: "pending",
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
            title: catalogMessage("text_add12d314e02"),
            icon: "trending-up",
            description: catalogMessage("text_a9bc0dbc7969"),
            groups: [
                {
                    id: "cash-management",
                    title: catalogMessage("text_934f9f55dd78"),
                    description: catalogMessage("text_243796622de9"),
                    screens: [
                        {
                            id: "journal-vouchers",
                            title: catalogMessage("text_e52dd7803641"),
                            icon: "file-signature",
                            description: catalogMessage("text_40bceab2d2cc"),
                            href: "/03-finance/treasury/cash-management/journal-vouchers",
                            permissions: [],
                            module: "journal_vouchers",
                        },
                        {
                            id: "cash-flow",
                            title: catalogMessage("text_d920314679b6"),
                            icon: "trending-up",
                            description: catalogMessage("text_e37bdc69b7e6"),
                            href: "/03-finance/treasury/cash-management/cash-flow",
                            permissions: [],
                            module: "general_ledger",
                            status: "pending",
                        },
                        {
                            id: "bank-reconciliation",
                            title: catalogMessage("text_63a146b07ae9"),
                            icon: "scale",
                            description: catalogMessage("text_cee4bd3c85d1"),
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
            title: catalogMessage("text_04631ada58db"),
            icon: "coins",
            description: catalogMessage("text_8c1a97688b26"),
            groups: [
                {
                    id: "currency-management",
                    title: catalogMessage("text_35c94f33a912"),
                    description: catalogMessage("text_20dcb22ab7af"),
                    screens: [
                        {
                            id: "currencies",
                            title: catalogMessage("text_d0ef4406403a"),
                            icon: "coins",
                            description: catalogMessage("text_6354468f575c"),
                            href: "/03-finance/foreign-exchange/currency-management/currencies",
                            permissions: [],
                            module: "currency",
                        },
                        {
                            id: "monetary-policy",
                            title: catalogMessage("text_2e59fd1930a2"),
                            icon: "coins",
                            description: catalogMessage("text_65fbbbffea44"),
                            href: "/03-finance/foreign-exchange/currency-management/monetary-policy",
                            permissions: [],
                            module: "monetary_policy",
                            status: "pending",
                        },
                        {
                            id: "exchange-rates",
                            title: catalogMessage("text_4d9dae2a2d01"),
                            icon: "coins",
                            description: catalogMessage("text_16c0beff5f0c"),
                            href: "/03-finance/foreign-exchange/currency-management/exchange-rates",
                            permissions: [],
                            module: "exchange_rate",
                            status: "pending",
                        },
                        {
                            id: "fx-operations",
                            title: catalogMessage("text_fc6a1b2619b0"),
                            icon: "coins",
                            description: catalogMessage("text_43fe2dc983b1"),
                            href: "/03-finance/foreign-exchange/currency-management/fx-operations",
                            permissions: [],
                            module: "currency_transfer",
                        },
                        {
                            id: "fx-logs",
                            title: catalogMessage("text_3b94a4bfaecd"),
                            icon: "coins",
                            description: catalogMessage("text_5b06c35f3f99"),
                            href: "/03-finance/foreign-exchange/currency-management/fx-logs",
                            permissions: [],
                            module: "currency_history",
                            status: "pending",
                        },
                        {
                            id: "currency-positions",
                            title: catalogMessage("text_0aef4886b833"),
                            icon: "coins",
                            description: catalogMessage("text_6d6b95ba304f"),
                            href: "/03-finance/foreign-exchange/currency-management/currency-positions",
                            permissions: [],
                            module: "currency_balances",
                            status: "pending",
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
            title: catalogMessage("text_c8079b033f3e"),
            icon: "shield",
            description: catalogMessage("text_bbcb069e708c"),
            groups: [
                {
                    id: "tax-management",
                    title: catalogMessage("text_e32fa4d2d922"),
                    description: catalogMessage("text_2b2a3c086572"),
                    screens: [
                        {
                            id: "vat-zatca",
                            title: catalogMessage("text_491ed16643bb"),
                            icon: "shield-check",
                            description: catalogMessage("text_1b1619ef6cad"),
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
            title: catalogMessage("text_93d03ae7981c"),
            icon: "shield-check",
            description: catalogMessage("text_a24b1f1897cf"),
            groups: [
                {
                    id: "audit-trail",
                    title: catalogMessage("text_b5e5ce89e637"),
                    description: catalogMessage("text_b7bedff41c85"),
                    screens: [
                        {
                            id: "audit-log",
                            title: catalogMessage("text_b5e5ce89e637"),
                            icon: "activity",
                            description: catalogMessage("text_f6c0f2966378"),
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
