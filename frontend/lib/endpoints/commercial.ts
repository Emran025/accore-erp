export interface CommercialEndpoints {
    SALES: {
        INVOICES: string;
        INVOICE_BY_ID: (id: string | number) => string;
        INVOICE_DETAILS: string;
        RETURNS: {
            BASE: string;
            SHOW: string;
            LEDGER: string;
        };
        ZATCA: {
            SUBMIT: (id: string | number) => string;
            STATUS: (id: string | number) => string;
        };
        REPRESENTATIVES: {
            BASE: string;
            LEDGER: string;
            TRANSACTIONS: string;
        };
        TEMPLATES: {
            BASE: string;
            withId: (id: string | number) => string;
            byKey: (key: string) => string;
            byType: (type: string) => string;
            HISTORY: (id: string | number) => string;
            RENDER: (id: string | number) => string;
            APPROVED_KEYS: string;
        };
    };
    PROCUREMENT: {
        BASE: string;
        REQUESTS: string;
        APPROVE: string;
        SUPPLIERS: {
            BASE: string;
            TRANSACTIONS: string;
            PAYMENT: string;
            LEDGER: string;
        };
        RETURNS: {
            BASE: string;
            SHOW: string;
            LEDGER: string;
        };
    };
    CRM: {
        CUSTOMERS: string;
        CUSTOMER_LEDGER: string;
        CUSTOMER_TRANSACTIONS: string;
        CUSTOMER_RECEIPTS: string;
    };
}

export const COMMERCIAL: CommercialEndpoints = {
    SALES: {
        INVOICES: "/v2/invoices",
        INVOICE_BY_ID: (id: string | number) => `/v2/invoices/${id}`,
        INVOICE_DETAILS: "/v2/invoice_details",
        RETURNS: {
            BASE: "/v2/sales/returns",
            SHOW: "/v2/sales/returns/show",
            LEDGER: "/v2/sales/returns/ledger",
        },
        ZATCA: {
            SUBMIT: (id: string | number) => `/v2/invoices/${id}/zatca/submit`,
            STATUS: (id: string | number) => `/v2/invoices/${id}/zatca/status`,
        },
        REPRESENTATIVES: {
            BASE: "/v2/sales_representatives",
            LEDGER: "/v2/sales_representatives/ledger",
            TRANSACTIONS: "/v2/sales_representatives/transactions",
        },
        TEMPLATES: {
            BASE: "/v2/templates",
            withId: (id: string | number) => `/v2/templates/${id}`,
            byKey: (key: string) => `/v2/templates/key/${key}`,
            byType: (type: string) => `/v2/templates/type/${type}`,
            HISTORY: (id: string | number) => `/v2/templates/${id}/history`,
            RENDER: (id: string | number) => `/v2/templates/${id}/render`,
            APPROVED_KEYS: "/v2/templates/approved-keys",
        },
    },
    PROCUREMENT: {
        BASE: "/v2/purchases",
        REQUESTS: "/v2/requests",
        APPROVE: "/v2/purchases/approve",
        SUPPLIERS: {
            BASE: "/v2/ap/suppliers",
            TRANSACTIONS: "/v2/ap/transactions",
            PAYMENT: "/v2/ap/payment",
            LEDGER: "/v2/ap/ledger",
        },
        RETURNS: {
            BASE: "/v2/purchases",
            SHOW: "/v2/purchases/show",
            LEDGER: "/v2/purchases/returns/ledger",
        },
    },
    CRM: {
        CUSTOMERS: "/v2/ar/customers",
        CUSTOMER_LEDGER: "/v2/ar/ledger",
        CUSTOMER_TRANSACTIONS: "/v2/ar/transactions",
        CUSTOMER_RECEIPTS: "/v2/ar/receipts",
    },
};
