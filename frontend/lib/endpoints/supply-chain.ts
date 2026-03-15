export interface SupplyChainEndpoints {
    PRODUCTS: string;
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
    CATEGORIES: "/v2/inventory/categories",
    BATCH: "/v2/batch",
    PERIODIC: {
        BASE: "/v2/inventory/periodic",
        PROCESS: "/v2/inventory/periodic/process",
        VALUATION: "/v2/inventory/periodic/valuation",
    },
};
