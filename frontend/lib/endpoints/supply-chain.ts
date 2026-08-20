export interface SupplyChainEndpoints {
    PRODUCTS: string;
    PRODUCT_IMPORT: string;
    CATEGORIES: string;
    BATCH: string;
    PERIODIC: {
        BASE: string;
        PROCESS: string;
        VALUATION: string;
    };
}

export const SUPPLY_CHAIN: SupplyChainEndpoints = {
    PRODUCTS: "/v2/inventory/products",
    PRODUCT_IMPORT: "/v2/inventory/products/import",
    CATEGORIES: "/v2/inventory/categories",
    BATCH: "/v2/batch",
    PERIODIC: {
        BASE: "/v2/inventory/periodic",
        PROCESS: "/v2/inventory/periodic/process",
        VALUATION: "/v2/inventory/periodic/valuation",
    },
};
