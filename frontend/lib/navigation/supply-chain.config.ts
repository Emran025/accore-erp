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
    title: catalogMessage("navigation.supplyChainConfig.supplyChainsLogistics"),
    icon: "shopping-bag",
    description: catalogMessage("navigation.supplyChainConfig.suppliersPurchasesExpensesInventoryWarehousesLogistics"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Supplier & Sourcing
        // ─────────────────────────────────────────────────────────────
        {
            id: "supplier-sourcing",
            title: catalogMessage("navigation.supplyChainConfig.supplierManagement"),
            icon: "truck",
            description: catalogMessage("navigation.supplyChainConfig.vendorDatabaseSupplierLedger"),
            groups: [
                {
                    id: "supplier-master",
                    title: catalogMessage("navigation.supplyChainConfig.supplierData"),
                    description: catalogMessage("navigation.supplyChainConfig.masterDataLedgers"),
                    screens: [
                        {
                            id: "suppliers-list",
                            title: catalogMessage("common.general.suppliers"),
                            icon: "truck",
                            description: catalogMessage("navigation.supplyChainConfig.suppliersDatabase"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-master/suppliers-list",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "supplier-ledger",
                            title: catalogMessage("navigation.supplyChainConfig.supplierBalances"),
                            icon: "hand-coins",
                            description: catalogMessage("common.general.accountsPayableBalances"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-master/supplier-ledger",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                    ],
                },
                {
                    id: "supplier-groups-nr",
                    title: catalogMessage("navigation.supplyChainConfig.supplierAggregations"),
                    icon: "truck",
                    description: catalogMessage("navigation.supplyChainConfig.supplierNumberingGroupsRanges"),
                    screens: [
                        {
                            id: "add-supplier-group",
                            title: catalogMessage("common.general.aggregationDefinition"),
                            icon: "add",
                            description: catalogMessage("common.general.addNewCollection"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/add-supplier-group",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "add-supplier-nr",
                            title: catalogMessage("common.general.scopeDefinition"),
                            icon: "add",
                            description: catalogMessage("common.general.addNewRange"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/add-supplier-nr",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "view-supplier-groups",
                            title: catalogMessage("common.general.viewSupplierAggregations"),
                            icon: "view",
                            description: catalogMessage("common.general.viewSupplierAggregations"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/view-supplier-groups",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "view-supplier-nr",
                            title: catalogMessage("common.general.viewSupplierRanges"),
                            icon: "view",
                            description: catalogMessage("common.general.viewSupplierRanges"),
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/view-supplier-nr",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "supplier-nr-assignment",
                            title: catalogMessage("common.general.viewAddAssignments"),
                            icon: "add",
                            description: catalogMessage("navigation.supplyChainConfig.viewNumberRangeAssignmentsSuppliers"),
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
            title: catalogMessage("navigation.supplyChainConfig.purchasesGoodsProducts"),
            icon: "shopping-bag",
            description: catalogMessage("navigation.supplyChainConfig.purchaseInvoicesPurchaseOrders"),
            groups: [
                {
                    id: "purchase-invoices",
                    title: catalogMessage("navigation.supplyChainConfig.directPurchases"),
                    description: catalogMessage("navigation.supplyChainConfig.directPurchaseTransactions"),
                    screens: [
                        {
                            id: "purchase-invoices",
                            title: catalogMessage("common.general.purchaseInvoices"),
                            icon: "shopping-bag",
                            description: catalogMessage("navigation.supplyChainConfig.purchaseInvoiceManagement"),
                            href: "/04-supply-chain/procurement/purchase-invoices/purchase-invoices",
                            permissions: [],
                            module: "purchases",
                        },
                        {
                            id: "deferred-invoices",
                            title: catalogMessage("navigation.supplyChainConfig.futurePurchases"),
                            icon: "receipt",
                            description: catalogMessage("navigation.supplyChainConfig.installmentDeferredPurchases"),
                            href: "/04-supply-chain/procurement/purchase-invoices/deferred-invoices",
                            permissions: [],
                            module: "deferred_purchases",
                        },
                        {
                            id: "purchase-returns-list",
                            title: catalogMessage("common.general.purchaseReturns"),
                            icon: "history",
                            description: catalogMessage("navigation.supplyChainConfig.directPurchaseReturnsManagement"),
                            href: "/04-supply-chain/procurement/purchase-invoices/purchase-returns",
                            permissions: [],
                            module: "purchases",
                        },
                    ],
                },
                {
                    id: "purchase-orders",
                    title: catalogMessage("common.general.internalTransactions"),
                    description: catalogMessage("navigation.supplyChainConfig.purchaseRequestsOrders"),
                    screens: [
                        {
                            id: "purchase-requests",
                            title: catalogMessage("common.general.purchaseOrders"),
                            icon: "cart",
                            description: catalogMessage("navigation.supplyChainConfig.createReviewPurchaseOrders"),
                            href: "/04-supply-chain/procurement/purchase-orders/purchase-requests",
                            permissions: [],
                            module: "dashboard",
                        },
                        {
                            id: "purchase-orders-list",
                            title: catalogMessage("navigation.supplyChainConfig.purchaseOrders"),
                            icon: "cart",
                            description: catalogMessage("navigation.supplyChainConfig.purchaseOrdersManagementComingSoon"),
                            href: "/04-supply-chain/procurement/purchase-orders/purchase-orders-list",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "payment-schedule",
                            title: catalogMessage("navigation.supplyChainConfig.paymentSchedule"),
                            icon: "calendar",
                            description: catalogMessage("navigation.supplyChainConfig.paymentSchedulingComingSoon"),
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
            title: catalogMessage("navigation.supplyChainConfig.expensesPaymentVouchers"),
            icon: "credit-card",
            description: catalogMessage("navigation.supplyChainConfig.operatingExpensesDisbursementVouchersPurchaseReturns"),
            groups: [
                {
                    id: "expense-management",
                    title: catalogMessage("navigation.supplyChainConfig.expenseManagement"),
                    description: catalogMessage("navigation.supplyChainConfig.recordTrackExpenses"),
                    screens: [
                        {
                            id: "expenses",
                            title: catalogMessage("common.general.expenses"),
                            icon: "credit-card",
                            description: catalogMessage("navigation.supplyChainConfig.recordOperatingExpenses"),
                            href: "/04-supply-chain/payables-expenses/expense-management/expenses",
                            permissions: [],
                            module: "expenses",
                        },
                        {
                            id: "payment-vouchers",
                            title: catalogMessage("navigation.supplyChainConfig.exchangeVouchers"),
                            icon: "book-open",
                            description: catalogMessage("navigation.supplyChainConfig.disburseSupplierBalances"),
                            href: "/04-supply-chain/payables-expenses/expense-management/payment-vouchers",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "purchase-returns",
                            title: catalogMessage("common.general.purchaseReturns"),
                            icon: "history",
                            description: catalogMessage("navigation.supplyChainConfig.purchaseReturnsManagement"),
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
            title: catalogMessage("navigation.supplyChainConfig.inventoryWarehouses"),
            icon: "box",
            description: catalogMessage("navigation.supplyChainConfig.productsItemsInventoryLevelsWarehouses"),
            groups: [
                {
                    id: "products-inventory",
                    title: catalogMessage("navigation.supplyChainConfig.inventoryManagement"),
                    description: catalogMessage("navigation.supplyChainConfig.productsWarehousesInventory"),
                    screens: [
                        {
                            id: "products",
                            title: catalogMessage("navigation.supplyChainConfig.productsItems"),
                            icon: "box",
                            description: catalogMessage("navigation.supplyChainConfig.productsServicesManagement"),
                            href: "/04-supply-chain/inventory/products-inventory/products",
                            permissions: [],
                            module: "products",
                        },
                        {
                            id: "stock-levels",
                            title: catalogMessage("navigation.supplyChainConfig.stockLevels"),
                            icon: "bar-chart-3",
                            description: catalogMessage("navigation.supplyChainConfig.availableQuantitiesTrackingComingSoon"),
                            href: "/04-supply-chain/inventory/products-inventory/stock-levels",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "warehouses",
                            title: catalogMessage("navigation.supplyChainConfig.warehouses"),
                            icon: "landmark",
                            description: catalogMessage("navigation.supplyChainConfig.warehouseBranchManagementComingSoon"),
                            href: "/04-supply-chain/inventory/products-inventory/warehouses",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "stock-transfers",
                            title: catalogMessage("navigation.supplyChainConfig.transfers"),
                            icon: "refresh",
                            description: catalogMessage("navigation.supplyChainConfig.interWarehouseTransferComingSoon"),
                            href: "/04-supply-chain/inventory/products-inventory/stock-transfers",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "stock-reconciliation",
                            title: catalogMessage("navigation.supplyChainConfig.inventoryReconciliation"),
                            icon: "clipboard-check",
                            description: catalogMessage("navigation.supplyChainConfig.inventoryCountingReconciliationComingSoon"),
                            href: "/04-supply-chain/inventory/products-inventory/stock-reconciliation",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "product-categories",
                            title: catalogMessage("common.general.categories"),
                            icon: "tags",
                            description: catalogMessage("navigation.supplyChainConfig.productCategoriesComingSoon"),
                            href: "/04-supply-chain/inventory/products-inventory/product-categories",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "units-of-measure",
                            title: catalogMessage("navigation.supplyChainConfig.unitsMeasure"),
                            icon: "ruler",
                            description: catalogMessage("navigation.supplyChainConfig.unitManagementComingSoon"),
                            href: "/04-supply-chain/inventory/products-inventory/units-of-measure",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "inventory-reports",
                            title: catalogMessage("navigation.supplyChainConfig.supplyChainReports"),
                            icon: "eye",
                            description: catalogMessage("navigation.supplyChainConfig.purchaseSupplierReportsInventoryBalancesExport"),
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
