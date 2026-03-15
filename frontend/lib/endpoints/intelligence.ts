export interface IntelligenceEndpoints {
    DASHBOARD: string;
    REPORTS: {
        BALANCE_SHEET: string;
        PROFIT_LOSS: string;
        CASH_FLOW: string;
        AGING_RECEIVABLES: string;
        AGING_PAYABLES: string;
        COMPARATIVE: string;
    };
}

export const INTELLIGENCE: IntelligenceEndpoints = {
    DASHBOARD: "/v2/analytics/dashboard",
    REPORTS: {
        BALANCE_SHEET: "/v2/analytics/reports/balance-sheet",
        PROFIT_LOSS: "/v2/analytics/reports/profit-loss",
        CASH_FLOW: "/v2/analytics/reports/cash-flow",
        AGING_RECEIVABLES: "/v2/analytics/reports/aging-receivables",
        AGING_PAYABLES: "/v2/analytics/reports/aging-payables",
        COMPARATIVE: "/v2/analytics/reports/comparative",
    },
};
