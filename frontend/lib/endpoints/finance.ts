export interface FinanceEndpoints {
    GENERAL_LEDGER: {
        TRIAL_BALANCE: string;
        ENTRIES: string;
        ACCOUNT_ACTIVITY: string;
        ACCOUNT_DETAILS: string;
        BALANCE_HISTORY: string;
    };
    TREASURY: {
        VOUCHERS: {
            BASE: string;
            withId: (id: string | number) => string;
            POST: (id: string | number) => string;
        };
        EXCHANGE_RATE: string;
        RATES_HISTORY: string;
        RECORD_RATE: string;
        CONVERT: string;
        REVALUATION: string;
        CURRENCY_POSITIONS: string;
    };
    FOREIGN_EXCHANGE: {
        CURRENCIES: {
            BASE: string;
            withId: (id: string | number) => string;
            TOGGLE: (id: string | number) => string;
        };
        POLICIES: {
            BASE: string;
            ACTIVE: string;
            TYPES: string;
            withId: (id: string | number) => string;
            ACTIVATE: (id: string | number) => string;
        };
    };
    TAX_ENGINE: {
        SETUP: string;
        AUTHORITIES: {
            UPDATE: (id: string | number) => string;
        };
        TYPES: {
            BASE: string;
            withId: (id: string | number) => string;
        };
    };
    FISCAL_PERIODS: {
        BASE: string;
        CLOSE: string;
        LOCK: string;
        UNLOCK: string;
    };
    ACCOUNTS: {
        BASE: string;
        withId: (id: string | number) => string;
        BALANCES: string;
    };
    ACCRUAL: string;
    RECONCILIATION: string;
    RECURRING: {
        BASE: string;
        withId: (id: string | number) => string;
        PROCESS: string;
    };
    EXPENSES: string;
    REVENUES: string;
    COST_CENTERS: {
        BASE: string;
        TREE: string;
        withId: (id: string | number) => string;
    };
    PROFIT_CENTERS: {
        BASE: string;
        TREE: string;
        withId: (id: string | number) => string;
    };
    CENTERS_SUMMARY: string;
    AR: {
        CUSTOMERS: string;
        LEDGER: string;
        TRANSACTIONS: string;
        RECEIPTS: string;
    };
}

export const FINANCE: FinanceEndpoints = {
    GENERAL_LEDGER: {
        TRIAL_BALANCE: "/v2/trial-balance",
        ENTRIES: "/v2/ledger/entries",
        ACCOUNT_ACTIVITY: "/v2/ledger/account-activity",
        ACCOUNT_DETAILS: "/v2/ledger/account-details",
        BALANCE_HISTORY: "/v2/ledger/balance-history",
    },
    TREASURY: {
        VOUCHERS: {
            BASE: "/v2/treasury/journal-vouchers",
            withId: (id: string | number) => `/v2/treasury/journal-vouchers/${id}`,
            POST: (id: string | number) => `/v2/treasury/vouchers/${id}/post`,
        },
        EXCHANGE_RATE: "/v2/treasury/rates/exchange",
        RATES_HISTORY: "/v2/treasury/rates/history",
        RECORD_RATE: "/v2/treasury/rates/record",
        CONVERT: "/v2/treasury/convert",
        REVALUATION: "/v2/treasury/revaluation",
        CURRENCY_POSITIONS: "/v2/treasury/currency-positions",
    },
    FOREIGN_EXCHANGE: {
        CURRENCIES: {
            BASE: "/v2/foreign-exchange/currencies",
            withId: (id: string | number) => `/v2/foreign-exchange/currencies/${id}`,
            TOGGLE: (id: string | number) => `/v2/foreign-exchange/currencies/${id}/toggle-active`,
        },
        POLICIES: {
            BASE: "/v2/foreign-exchange/policies",
            ACTIVE: "/v2/foreign-exchange/policies/active",
            TYPES: "/v2/foreign-exchange/policies/types",
            withId: (id: string | number) => `/v2/foreign-exchange/policies/${id}`,
            ACTIVATE: (id: string | number) => `/v2/foreign-exchange/policies/${id}/activate`,
        },
    },
    TAX_ENGINE: {
        SETUP: "/v2/tax-engine/setup",
        AUTHORITIES: {
            UPDATE: (id: string | number) => `/v2/tax-engine/authorities/${id}`,
        },
        TYPES: {
            BASE: "/v2/tax-engine/types",
            withId: (id: string | number) => `/v2/tax-engine/types/${id}`,
        },
    },
    FISCAL_PERIODS: {
        BASE: "/v2/fiscal-periods",
        CLOSE: "/v2/fiscal-periods/close",
        LOCK: "/v2/fiscal-periods/lock",
        UNLOCK: "/v2/fiscal-periods/unlock",
    },
    ACCOUNTS: {
        BASE: "/v2/accounts",
        withId: (id: string | number) => `/v2/accounts/${id}`,
        BALANCES: "/v2/accounts/balances",
    },
    ACCRUAL: "/v2/accrual",
    RECONCILIATION: "/v2/reconciliation",
    RECURRING: {
        BASE: "/v2/recurring_transactions",
        withId: (id: string | number) => `/v2/recurring_transactions/${id}`,
        PROCESS: "/v2/recurring_transactions/process",
    },
    EXPENSES: "/v2/expenses",
    REVENUES: "/v2/revenues",
    COST_CENTERS: {
        BASE: "/v2/cost-centers",
        TREE: "/v2/cost-centers/tree",
        withId: (id: string | number) => `/v2/cost-centers/${id}`,
    },
    PROFIT_CENTERS: {
        BASE: "/v2/profit-centers",
        TREE: "/v2/profit-centers/tree",
        withId: (id: string | number) => `/v2/profit-centers/${id}`,
    },
    CENTERS_SUMMARY: "/v2/centers-summary",
    AR: {
        CUSTOMERS: "/v2/ar/customers",
        LEDGER: "/v2/ar/ledger",
        TRANSACTIONS: "/v2/ar/transactions",
        RECEIPTS: "/v2/ar/receipts",
    },
};
