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
    title: catalogMessage("navigation.financeConfig.financialManagement"),
    icon: "coins",
    description: catalogMessage("navigation.financeConfig.generalLedgerManagementAccountingTreasuryForeignExchangeTax"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: General Ledger
        // ─────────────────────────────────────────────────────────────
        {
            id: "general-ledger",
            title: catalogMessage("navigation.financeConfig.generalLedger"),
            icon: "book-open",
            description: catalogMessage("navigation.financeConfig.chartAccountsFiscalPeriodsJournalEntries"),
            groups: [
                {
                    id: "ledger-core",
                    title: catalogMessage("navigation.financeConfig.financialReports"),
                    description: catalogMessage("navigation.financeConfig.primaryFinancialReference"),
                    screens: [
                        {
                            id: "chart-of-accounts",
                            title: catalogMessage("navigation.financeConfig.chartAccounts"),
                            icon: "sitemap",
                            description: catalogMessage("navigation.financeConfig.accountsTreeStructure"),
                            href: "/03-finance/general-ledger/ledger-core/chart-of-accounts",
                            permissions: [],
                            module: "chart_of_accounts",
                        },
                        {
                            id: "fiscal-periods",
                            title: catalogMessage("navigation.financeConfig.fiscalPeriods"),
                            icon: "calendar",
                            description: catalogMessage("navigation.financeConfig.manageYearsPeriods"),
                            href: "/03-finance/general-ledger/ledger-core/fiscal-periods",
                            permissions: [],
                            module: "fiscal_periods",
                        },
                        {
                            id: "general-ledger-book",
                            title: catalogMessage("navigation.financeConfig.generalLedger.alternative2"),
                            icon: "book-open",
                            description: catalogMessage("navigation.financeConfig.comprehensiveFinancialRecord"),
                            href: "/03-finance/general-ledger/ledger-core/general-ledger-book",
                            permissions: [],
                            module: "general_ledger",
                        },
                        {
                            id: "financial-reports",
                            title: catalogMessage("navigation.financeConfig.reportsAnalytics"),
                            icon: "pie-chart",
                            description: catalogMessage("navigation.financeConfig.advancedFinancialReportsAnalytics"),
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
            title: catalogMessage("navigation.financeConfig.managerialAccounting"),
            icon: "building",
            description: catalogMessage("navigation.financeConfig.costCentersProfitCentersBudgets"),
            groups: [
                {
                    id: "cost-profit-centers",
                    title: catalogMessage("navigation.financeConfig.financeAccounting"),
                    description: catalogMessage("navigation.financeConfig.costProfitAllocationAnalysis"),
                    screens: [
                        {
                            id: "cost-centers",
                            title: catalogMessage("navigation.financeConfig.costCenters"),
                            icon: "building",
                            description: catalogMessage("navigation.financeConfig.manageAllocateCostsCenters"),
                            href: "/03-finance/management-accounting/cost-profit-centers/cost-centers",
                            permissions: [],
                            module: "chart_of_accounts",
                        },
                        {
                            id: "profit-centers",
                            title: catalogMessage("navigation.financeConfig.profitCenters"),
                            icon: "trending-up",
                            description: catalogMessage("navigation.financeConfig.profitabilityAnalysisUnits"),
                            href: "/03-finance/management-accounting/cost-profit-centers/profit-centers",
                            permissions: [],
                            module: "chart_of_accounts",
                        },
                        {
                            id: "budgeting",
                            title: catalogMessage("navigation.financeConfig.budgets"),
                            icon: "wallet",
                            description: catalogMessage("navigation.financeConfig.planningBudgetsComingSoon"),
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
            title: catalogMessage("navigation.financeConfig.treasuryCashManagement"),
            icon: "trending-up",
            description: catalogMessage("navigation.financeConfig.journalVouchersCashFlowBankReconciliation"),
            groups: [
                {
                    id: "cash-management",
                    title: catalogMessage("navigation.financeConfig.cashManagement"),
                    description: catalogMessage("navigation.financeConfig.cashLiquidityManagement"),
                    screens: [
                        {
                            id: "journal-vouchers",
                            title: catalogMessage("navigation.financeConfig.journalVouchers"),
                            icon: "file-signature",
                            description: catalogMessage("navigation.financeConfig.dailyAccountingEntries"),
                            href: "/03-finance/treasury/cash-management/journal-vouchers",
                            permissions: [],
                            module: "journal_vouchers",
                        },
                        {
                            id: "cash-flow",
                            title: catalogMessage("navigation.financeConfig.cashFlow"),
                            icon: "trending-up",
                            description: catalogMessage("navigation.financeConfig.liquidityManagementComingSoon"),
                            href: "/03-finance/treasury/cash-management/cash-flow",
                            permissions: [],
                            module: "general_ledger",
                            status: "pending",
                        },
                        {
                            id: "bank-reconciliation",
                            title: catalogMessage("navigation.financeConfig.bankReconciliation"),
                            icon: "scale",
                            description: catalogMessage("navigation.financeConfig.bankReconciliation.alternative2"),
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
            title: catalogMessage("navigation.financeConfig.foreignCurrenciesExchange"),
            icon: "coins",
            description: catalogMessage("navigation.financeConfig.currencyExchangeRateMonetaryPolicyManagement"),
            groups: [
                {
                    id: "currency-management",
                    title: catalogMessage("navigation.financeConfig.currencyManagement"),
                    description: catalogMessage("navigation.financeConfig.currenciesExchangeRates"),
                    screens: [
                        {
                            id: "currencies",
                            title: catalogMessage("navigation.financeConfig.acceptedCurrencies"),
                            icon: "coins",
                            description: catalogMessage("navigation.financeConfig.defineManageBaseForeignCurrenciesSystem"),
                            href: "/03-finance/foreign-exchange/currency-management/currencies",
                            permissions: [],
                            module: "currency",
                        },
                        {
                            id: "monetary-policy",
                            title: catalogMessage("common.general.monetaryPolicies"),
                            icon: "coins",
                            description: catalogMessage("navigation.financeConfig.evaluationDeterminantsCashTransactionRulesComingSoon"),
                            href: "/03-finance/foreign-exchange/currency-management/monetary-policy",
                            permissions: [],
                            module: "monetary_policy",
                            status: "pending",
                        },
                        {
                            id: "exchange-rates",
                            title: catalogMessage("common.general.exchangeRates"),
                            icon: "coins",
                            description: catalogMessage("navigation.financeConfig.manageExchangeRateTablesHistoricalValuationLogComing"),
                            href: "/03-finance/foreign-exchange/currency-management/exchange-rates",
                            permissions: [],
                            module: "exchange_rate",
                            status: "pending",
                        },
                        {
                            id: "fx-operations",
                            title: catalogMessage("common.general.foreignExchangeOperations"),
                            icon: "coins",
                            description: catalogMessage("navigation.financeConfig.executeSettleCurrencyBuySellOrdersComingSoon"),
                            href: "/03-finance/foreign-exchange/currency-management/fx-operations",
                            permissions: [],
                            module: "currency_transfer",
                        },
                        {
                            id: "fx-logs",
                            title: catalogMessage("navigation.financeConfig.operationsLog"),
                            icon: "coins",
                            description: catalogMessage("navigation.financeConfig.historicalTrackingOversightCashTransactionsComingSoon"),
                            href: "/03-finance/foreign-exchange/currency-management/fx-logs",
                            permissions: [],
                            module: "currency_history",
                            status: "pending",
                        },
                        {
                            id: "currency-positions",
                            title: catalogMessage("common.general.currencyCenters"),
                            icon: "coins",
                            description: catalogMessage("navigation.financeConfig.monitorLiquidityLevelsFinancialPositionsPerCurrencyComing"),
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
            title: catalogMessage("navigation.financeConfig.externalCorporateLiabilities"),
            icon: "shield",
            description: catalogMessage("navigation.financeConfig.taxesCustomsGovernmentObligations"),
            groups: [
                {
                    id: "tax-management",
                    title: catalogMessage("navigation.financeConfig.taxManagement"),
                    description: catalogMessage("navigation.financeConfig.vatZatca"),
                    screens: [
                        {
                            id: "vat-zatca",
                            title: catalogMessage("navigation.financeConfig.taxesVatZatca"),
                            icon: "shield-check",
                            description: catalogMessage("navigation.financeConfig.taxManagementIntegrationZatca"),
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
            title: catalogMessage("navigation.financeConfig.internalAuditCompliance"),
            icon: "shield-check",
            description: catalogMessage("navigation.financeConfig.auditLogActivityTracking"),
            groups: [
                {
                    id: "audit-trail",
                    title: catalogMessage("common.general.auditLog"),
                    description: catalogMessage("navigation.financeConfig.comprehensiveOperationsTracking"),
                    screens: [
                        {
                            id: "audit-log",
                            title: catalogMessage("common.general.auditLog"),
                            icon: "activity",
                            description: catalogMessage("navigation.financeConfig.trackAllOperations"),
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
