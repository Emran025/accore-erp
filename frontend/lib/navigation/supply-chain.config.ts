import { catalogMessage } from "@/lib/i18n";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Domain 4: Supply Chain & Logistics (سلاسل الإمداد والخدمات اللوجستية)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Vision: End-to-end supply chain — sourcing, procurement, payables,
 * inventory management, warehouse operations, logistics, and quality.
 * 
 * Cross-Domain Integration:
 *  - Finance: AP posting, landed cost allocation
 *  - Commercial: Stock checks for sales orders
 *  - Manufacturing: Raw material procurement
 */

import { Domain } from "../../types/navigation";

export const SupplyChainDomain: Domain = {
    id: "supply-chain",
    order: 4,
    title: catalogMessage("text_2332a281e0ae"),
    icon: "shopping-bag",
    description: catalogMessage("text_bda0aaa39f01"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Supplier & Sourcing
        // ─────────────────────────────────────────────────────────────
        {
            id: "supplier-sourcing",
            title: catalogMessage("text_386106f63f00"),
            icon: "truck",
            description: catalogMessage("text_b09ee05f2e2b"),
            groups: [
                {
                    id: "supplier-master",
                    title: catalogMessage("text_507007622ccc"),
                    description: catalogMessage("text_e1281eff0a04"),
                    screens: [
                        {
                            id: "suppliers-list",
                            title: catalogMessage("text_8297ebf9ea8e"),
                            icon: "truck",
                            description: catalogMessage("text_689226bae70e"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-master/suppliers-list",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "supplier-ledger",
                            title: catalogMessage("text_b7c5448b829e"),
                            icon: "hand-coins",
                            description: catalogMessage("text_3267789e839b"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-master/supplier-ledger",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                    ],
                },
                {
                    id: "supplier-groups-nr",
                    title: catalogMessage("text_dcabe8eba9ec"),
                    icon: "truck",
                    description: catalogMessage("text_e2c1f1bf5e74"),
                    screens: [
                        {
                            id: "add-supplier-group",
                            title: catalogMessage("text_da33776a790a"),
                            icon: "add",
                            description: catalogMessage("text_008637650d6c"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/add-supplier-group",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "add-supplier-nr",
                            title: catalogMessage("text_7c221583986f"),
                            icon: "add",
                            description: catalogMessage("text_1b15968ae1d6"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/add-supplier-nr",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "view-supplier-groups",
                            title: catalogMessage("text_a42733cc7beb"),
                            icon: "view",
                            description: catalogMessage("text_a42733cc7beb"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/view-supplier-groups",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "view-supplier-nr",
                            title: catalogMessage("text_1c6dd228d7c6"),
                            icon: "view",
                            description: catalogMessage("text_1c6dd228d7c6"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/view-supplier-nr",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "supplier-nr-assignment",
                            title: catalogMessage("text_197b19ee7c45"),
                            icon: "add",
                            description: catalogMessage("text_8792f77d571f"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/supplier-nr-assignment",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Procurement Lifecycle
        // ─────────────────────────────────────────────────────────────
        {
            id: "procurement",
            title: catalogMessage("text_2d5b900a6684"),
            icon: "shopping-bag",
            description: catalogMessage("text_b8b31921da71"),
            groups: [
                {
                    id: "purchase-invoices",
                    title: catalogMessage("text_ff259b49b314"),
                    description: catalogMessage("text_78f29707b09b"),
                    screens: [
                        {
                            id: "purchase-invoices",
                            title: catalogMessage("text_acd86802dbfe"),
                            icon: "shopping-bag",
                            description: catalogMessage("text_6e0b002e4180"),
                            href: "/04-supply-chain/procurement/purchase-invoices/purchase-invoices",
                            permissions: [],
                            module: "purchases",
                        },
                        {
                            id: "deferred-invoices",
                            title: catalogMessage("text_722e6f8bc801"),
                            icon: "receipt",
                            description: catalogMessage("text_89234e146f57"),
                            href: "/04-supply-chain/procurement/purchase-invoices/deferred-invoices",
                            permissions: [],
                            module: "deferred_purchases",
                        },
                        {
                            id: "purchase-returns-list",
                            title: catalogMessage("text_0ba88658969c"),
                            icon: "history",
                            description: catalogMessage("text_d0d3c9b32465"),
                            href: "/04-supply-chain/procurement/purchase-invoices/purchase-returns",
                            permissions: [],
                            module: "purchases",
                        },
                    ],
                },
                {
                    id: "purchase-orders",
                    title: catalogMessage("text_21c2232bd2de"),
                    description: catalogMessage("text_1f54da97fb53"),
                    screens: [
                        {
                            id: "purchase-requests",
                            title: catalogMessage("text_0b4a794d5f29"),
                            icon: "cart",
                            description: catalogMessage("text_83fcdc75f1fc"),
                            href: "/04-supply-chain/procurement/purchase-orders/purchase-requests",
                            permissions: [],
                            module: "dashboard",
                        },
                        {
                            id: "purchase-orders-list",
                            title: catalogMessage("text_37d10770219f"),
                            icon: "cart",
                            description: catalogMessage("text_40f9a6d22d73"),
                            href: "/04-supply-chain/procurement/purchase-orders/purchase-orders-list",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "payment-schedule",
                            title: catalogMessage("text_11ab686a3506"),
                            icon: "calendar",
                            description: catalogMessage("text_6f113f2ef191"),
                            href: "/04-supply-chain/procurement/purchase-orders/payment-schedule",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Payables & Expenses
        // ─────────────────────────────────────────────────────────────
        {
            id: "payables-expenses",
            title: catalogMessage("text_5187f6552d48"),
            icon: "credit-card",
            description: catalogMessage("text_47b349a60603"),
            groups: [
                {
                    id: "expense-management",
                    title: catalogMessage("text_6cd934aea5ce"),
                    description: catalogMessage("text_297bcf0f8c35"),
                    screens: [
                        {
                            id: "expenses",
                            title: catalogMessage("text_4d514b65a483"),
                            icon: "credit-card",
                            description: catalogMessage("text_0ca8ab7f203e"),
                            href: "/04-supply-chain/payables-expenses/expense-management/expenses",
                            permissions: [],
                            module: "expenses",
                        },
                        {
                            id: "payment-vouchers",
                            title: catalogMessage("text_78cd781a786f"),
                            icon: "book-open",
                            description: catalogMessage("text_9f3172e8642f"),
                            href: "/04-supply-chain/payables-expenses/expense-management/payment-vouchers",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "purchase-returns",
                            title: catalogMessage("text_0ba88658969c"),
                            icon: "history",
                            description: catalogMessage("text_0385d000e986"),
                            href: "/04-supply-chain/payables-expenses/expense-management/purchase-returns",
                            permissions: [],
                            module: "purchases",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Inventory Management
        // ─────────────────────────────────────────────────────────────
        {
            id: "inventory",
            title: catalogMessage("text_5d717795eb9a"),
            icon: "box",
            description: catalogMessage("text_28d37eac4093"),
            groups: [
                {
                    id: "products-inventory",
                    title: catalogMessage("text_8330a0c71014"),
                    description: catalogMessage("text_a1168e061a86"),
                    screens: [
                        {
                            id: "products",
                            title: catalogMessage("text_3dc21b0b75f2"),
                            icon: "box",
                            description: catalogMessage("text_ddf2b52ece0e"),
                            href: "/04-supply-chain/inventory/products-inventory/products",
                            permissions: [],
                            module: "products",
                        },
                        {
                            id: "stock-levels",
                            title: catalogMessage("text_bddd2cf70efd"),
                            icon: "bar-chart-3",
                            description: catalogMessage("text_869feecd5837"),
                            href: "/04-supply-chain/inventory/products-inventory/stock-levels",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "warehouses",
                            title: catalogMessage("text_c081148fcfa4"),
                            icon: "landmark",
                            description: catalogMessage("text_0afd86578a1f"),
                            href: "/04-supply-chain/inventory/products-inventory/warehouses",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "stock-transfers",
                            title: catalogMessage("text_018af0d040f9"),
                            icon: "refresh",
                            description: catalogMessage("text_5391a95bd115"),
                            href: "/04-supply-chain/inventory/products-inventory/stock-transfers",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "stock-reconciliation",
                            title: catalogMessage("text_14cfc6cb0a94"),
                            icon: "clipboard-check",
                            description: catalogMessage("text_86340d8f7a83"),
                            href: "/04-supply-chain/inventory/products-inventory/stock-reconciliation",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "product-categories",
                            title: catalogMessage("text_e809b3087f40"),
                            icon: "tags",
                            description: catalogMessage("text_13e7a915417a"),
                            href: "/04-supply-chain/inventory/products-inventory/product-categories",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "units-of-measure",
                            title: catalogMessage("text_5ab85502b98d"),
                            icon: "ruler",
                            description: catalogMessage("text_be2775682b54"),
                            href: "/04-supply-chain/inventory/products-inventory/units-of-measure",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "inventory-reports",
                            title: catalogMessage("text_c368e8122cc5"),
                            icon: "eye",
                            description: catalogMessage("text_d84be983fe2d"),
                            href: "/04-supply-chain/inventory/products-inventory/inventory-reports",
                            permissions: [],
                            module: "products",
                        },
                    ],
                },
            ],
        },
    ],
};
