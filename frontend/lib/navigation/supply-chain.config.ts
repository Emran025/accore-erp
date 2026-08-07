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
    title: "سلاسل الإمداد والخدمات اللوجستية",
    icon: "shopping-bag",
    description: "الموردين والمشتريات والمصروفات والمخزون والمستودعات واللوجستيات",
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Supplier & Sourcing
        // ─────────────────────────────────────────────────────────────
        {
            id: "supplier-sourcing",
            title: "إدارة الموردين",
            icon: "truck",
            description: "قاعدة بيانات الموردين وأستاذ الموردين",
            groups: [
                {
                    id: "supplier-master",
                    title: "بيانات الموردين",
                    description: "البيانات الرئيسية والدفاتر",
                    screens: [
                        {
                            id: "suppliers-list",
                            title: "الموردين",
                            icon: "truck",
                            description: "قاعدة بيانات الموردين",
                            href: "/04-supply-chain/supplier-sourcing/supplier-master/suppliers-list",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "supplier-ledger",
                            title: "أرصدة الموردين",
                            icon: "hand-coins",
                            description: "حسابات الدفع والأرصدة",
                            href: "/04-supply-chain/supplier-sourcing/supplier-master/supplier-ledger",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                    ],
                },
                {
                    id: "supplier-groups-nr",
                    title: "تجميعات الموردين",
                    icon: "truck",
                    description: "تجميعات ونطاقات ترقيم الموردين",
                    screens: [
                        {
                            id: "add-supplier-group",
                            title: "تعريف تجميع",
                            icon: "add",
                            description: "إضافة تجميع جديد",
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/add-supplier-group",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "add-supplier-nr",
                            title: "تعريف نطاق",
                            icon: "add",
                            description: "إضافة نطاق جديد",
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/add-supplier-nr",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "view-supplier-groups",
                            title: "عرض تجميعات الموردين",
                            icon: "view",
                            description: "عرض تجميعات الموردين",
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/view-supplier-groups",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "view-supplier-nr",
                            title: "عرض نطاقات الموردين",
                            icon: "view",
                            description: "عرض نطاقات الموردين",
                            href: "/04-supply-chain/supplier-sourcing/supplier-groups-nr/view-supplier-nr",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "supplier-nr-assignment",
                            title: "عرض وإضافة الإسنادات",
                            icon: "add",
                            description: "عرض إسنادات نطاقات الترقيم إلى الموردين",
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
            title: "مشتريات السلع والمنتجات",
            icon: "shopping-bag",
            description: "فواتير المشتريات وأوامر الشراء",
            groups: [
                {
                    id: "purchase-invoices",
                    title: "المشتريات المباشرة",
                    description: "معاملات الشراء المباشر",
                    screens: [
                        {
                            id: "purchase-invoices",
                            title: "فواتير المشتريات",
                            icon: "shopping-bag",
                            description: "إدارة فواتير الشراء",
                            href: "/04-supply-chain/procurement/purchase-invoices/purchase-invoices",
                            permissions: [],
                            module: "purchases",
                        },
                        {
                            id: "deferred-invoices",
                            title: "المشتريات الآجلة",
                            icon: "receipt",
                            description: "مشتريات بالتقسيط والآجل",
                            href: "/04-supply-chain/procurement/purchase-invoices/deferred-invoices",
                            permissions: [],
                            module: "deferred_purchases",
                        },
                        {
                            id: "purchase-returns-list",
                            title: "مردودات المشتريات",
                            icon: "history",
                            description: "إدارة مردودات المشتريات المباشرة",
                            href: "/04-supply-chain/procurement/purchase-invoices/purchase-returns",
                            permissions: [],
                            module: "purchases",
                        },
                    ],
                },
                {
                    id: "purchase-orders",
                    title: "المعاملات الداخلية",
                    description: "طلبات وأوامر الشراء",
                    screens: [
                        {
                            id: "purchase-requests",
                            title: "طلبات الشراء",
                            icon: "cart",
                            description: "إنشاء أو استعراض طلبات الشراء",
                            href: "/04-supply-chain/procurement/purchase-orders/purchase-requests",
                            permissions: [],
                            module: "dashboard",
                        },
                        {
                            id: "purchase-orders-list",
                            title: "أوامر الشراء",
                            icon: "cart",
                            description: "إدارة أوامر الشراء (قريباً)",
                            href: "/04-supply-chain/procurement/purchase-orders/purchase-orders-list",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "payment-schedule",
                            title: "جدول الدفعات",
                            icon: "calendar",
                            description: "جدولة المدفوعات (قريباً)",
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
            title: "المصروفات وسندات الصرف",
            icon: "credit-card",
            description: "المصروفات التشغيلية وسندات الصرف ومردودات المشتريات",
            groups: [
                {
                    id: "expense-management",
                    title: "إدارة المصروفات",
                    description: "تسجيل وتتبع المصروفات",
                    screens: [
                        {
                            id: "expenses",
                            title: "المصروفات",
                            icon: "credit-card",
                            description: "تسجيل المصروفات التشغيلية",
                            href: "/04-supply-chain/payables-expenses/expense-management/expenses",
                            permissions: [],
                            module: "expenses",
                        },
                        {
                            id: "payment-vouchers",
                            title: "سندات الصرف",
                            icon: "book-open",
                            description: "صرف أرصدة الموردين",
                            href: "/04-supply-chain/payables-expenses/expense-management/payment-vouchers",
                            permissions: [],
                            module: "ap_suppliers",
                        },
                        {
                            id: "purchase-returns",
                            title: "مردودات المشتريات",
                            icon: "history",
                            description: "إدارة مردودات المشتريات",
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
            title: "المخزون والمستودعات",
            icon: "box",
            description: "المنتجات والأصناف ومستويات المخزون والمستودعات",
            groups: [
                {
                    id: "products-inventory",
                    title: "إدارة المخزون",
                    description: "المنتجات والمستودعات والجرد",
                    screens: [
                        {
                            id: "products",
                            title: "المنتجات والأصناف",
                            icon: "box",
                            description: "إدارة المنتجات والخدمات",
                            href: "/04-supply-chain/inventory/products-inventory/products",
                            permissions: [],
                            module: "products",
                        },
                        {
                            id: "stock-levels",
                            title: "مستويات المخزون",
                            icon: "bar-chart-3",
                            description: "متابعة الكميات المتاحة (قريباً)",
                            href: "/04-supply-chain/inventory/products-inventory/stock-levels",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "warehouses",
                            title: "المستودعات",
                            icon: "landmark",
                            description: "إدارة المخازن والفروع (قريباً)",
                            href: "/04-supply-chain/inventory/products-inventory/warehouses",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "stock-transfers",
                            title: "التحويلات",
                            icon: "refresh",
                            description: "تحويل بين المستودعات (قريباً)",
                            href: "/04-supply-chain/inventory/products-inventory/stock-transfers",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "stock-reconciliation",
                            title: "تسوية المخزون",
                            icon: "clipboard-check",
                            description: "جرد وتسوية المخزون (قريباً)",
                            href: "/04-supply-chain/inventory/products-inventory/stock-reconciliation",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "product-categories",
                            title: "التصنيفات",
                            icon: "tags",
                            description: "تصنيفات المنتجات (قريباً)",
                            href: "/04-supply-chain/inventory/products-inventory/product-categories",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "units-of-measure",
                            title: "وحدات القياس",
                            icon: "ruler",
                            description: "إدارة وحدات القياس (قريباً)",
                            href: "/04-supply-chain/inventory/products-inventory/units-of-measure",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                        {
                            id: "inventory-reports",
                            title: "تقارير المخزون",
                            icon: "eye",
                            description: "تقارير وتحليلات المخزون (قريباً)",
                            href: "/04-supply-chain/inventory/products-inventory/inventory-reports",
                            permissions: [],
                            module: "dashboard",
                            status: "pending",
                        },
                    ],
                },
            ],
        },
    ],
};
