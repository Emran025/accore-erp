/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Domain 2: Commercial Operations (العمليات التجارية والعملاء)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Vision: Complete commercial lifecycle management — from CRM and sales pipeline
 * through revenue recognition, marketing, and sales governance.
 * 
 * Cross-Domain Integration:
 *  - Finance: Revenue posting, receivables
 *  - Supply Chain: Stock reservations on sales orders
 *  - Intelligence: Sales analytics and forecasting
 */

import { Domain } from "../../types/navigation";

export const CommercialDomain: Domain = {
    id: "commercial",
    order: 2,
    title: "العمليات التجارية والعملاء",
    icon: "cart",
    description: "إدارة المبيعات والعملاء — CRM، دورة البيع، الإيرادات، التسويق، والحوكمة التجارية",
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Customer Relationship (CRM)
        // ─────────────────────────────────────────────────────────────
        {
            id: "crm",
            title: "إدارة العملاء",
            icon: "user-plus",
            description: "قاعدة بيانات العملاء والتصنيفات وبوابة الخدمة الذاتية",
            groups: [
                {
                    id: "customer-master",
                    title: "بيانات العملاء",
                    description: "إدارة البيانات الرئيسية للعملاء",
                    screens: [
                        {
                            id: "customers-list",
                            title: "العملاء",
                            icon: "user-plus",
                            description: "قاعدة بيانات العملاء",
                            href: "/02-commercial/crm/customer-master/customers-list",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "customer-ledger",
                            title: "أرصدة العملاء",
                            icon: "hand-coins",
                            description: "حسابات الدفع والأرصدة",
                            href: "/02-commercial/crm/customer-master/customer-ledger",
                            permissions: [],
                            module: "ar_customers",
                        },
                    ],
                },
                {
                    id: "customer-groups-nr",
                    title: "تجميعات العملاء",
                    icon: "users",
                    description: "تجميعات ونطاقات ترقيم العملاء",
                    screens: [
                        {
                            id: "add-customer-group",
                            title: "تعريف تجميع",
                            icon: "add",
                            description: "إضافة تجميع جديد",
                            href: "/02-commercial/crm/customer-groups-nr/add-customer-group",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "add-customer-nr",
                            title: "تعريف نطاق",
                            icon: "add",
                            description: "إضافة نطاق جديد",
                            href: "/02-commercial/crm/customer-groups-nr/add-customer-nr",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "view-customer-groups",
                            title: "عرض تجميعات العملاء",
                            icon: "view",
                            description: "عرض تجميعات العملاء",
                            href: "/02-commercial/crm/customer-groups-nr/view-customer-groups",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "view-customer-nr",
                            title: "عرض نطاقات العملاء",
                            icon: "view",
                            description: "عرض نطاقات العملاء",
                            href: "/02-commercial/crm/customer-groups-nr/view-customer-nr",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "customer-nr-assignment",
                            title: "عرض وإضافة الإسنادات",
                            icon: "add",
                            description: "عرض إسنادات نطاقات الترقيم إلى العملاء",
                            href: "/02-commercial/crm/customer-groups-nr/customer-nr-assignment",
                            permissions: [],
                            module: "ar_customers",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Sales Pipeline & Lifecycle
        // ─────────────────────────────────────────────────────────────
        {
            id: "sales-lifecycle",
            title: "مبيعات السلع والمنتجات",
            icon: "cart",
            description: "عروض الأسعار، أوامر البيع، الفواتير، والمرتجعات",
            groups: [
                {
                    id: "direct-sales",
                    title: "المبيعات المباشرة",
                    description: "إدارة فواتير ومعاملات البيع المباشر",
                    screens: [
                        {
                            id: "sales-invoices",
                            title: "فواتير المبيعات",
                            icon: "cart",
                            description: "إنشاء وإدارة فواتير البيع",
                            href: "/02-commercial/sales-lifecycle/direct-sales/sales-invoices",
                            permissions: [],
                            module: "sales",
                        },
                        {
                            id: "deferred-sales",
                            title: "المبيعات الآجلة",
                            icon: "receipt",
                            description: "مبيعات بالتقسيط والآجل",
                            href: "/02-commercial/sales-lifecycle/direct-sales/deferred-sales",
                            permissions: [],
                            module: "deferred_sales",
                        },
                        {
                            id: "sales-returns",
                            title: "مرتجعات المبيعات",
                            icon: "history",
                            description: "إدارة مرتجعات المبيعات",
                            href: "/02-commercial/sales-lifecycle/direct-sales/sales-returns",
                            permissions: [],
                            module: "returns",
                        },
                        {
                            id: "commercial-reports",
                            title: "تقارير التجارة",
                            icon: "eye",
                            description: "كشوف المبيعات والعملاء والمرتجعات والتصدير",
                            href: "/02-commercial/sales-lifecycle/direct-sales/reports",
                            permissions: [],
                            module: "sales",
                        },
                    ],
                },
                {
                    id: "sales-orders",
                    title: "المعاملات الداخلية",
                    description: "طلبات الشراء وعروض الأسعار وأوامر البيع",
                    screens: [
                        {
                            id: "purchase-requests-sales",
                            title: "طلبات الشراء",
                            icon: "book-open",
                            description: "إدارة طلبات الشراء أو النقل المخزني وحالتها",
                            href: "/02-commercial/sales-lifecycle/sales-orders/purchase-requests-sales",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "quotations",
                            title: "عروض الأسعار",
                            icon: "cart",
                            description: "إنشاء عروض الأسعار وإصدارها",
                            href: "/02-commercial/sales-lifecycle/sales-orders/quotations",
                            permissions: [],
                            module: "sales",
                        },
                        {
                            id: "sales-orders-list",
                            title: "أوامر البيع",
                            icon: "cart",
                            description: "إدارة طلبات البيع (قريباً)",
                            href: "/02-commercial/sales-lifecycle/sales-orders/sales-orders-list",
                            permissions: [],
                            module: "sales",
                            status: "pending",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Revenue & Receivables
        // ─────────────────────────────────────────────────────────────
        {
            id: "revenue-receivables",
            title: "إدارة الإيرادات وسندات القبض",
            icon: "trending-up",
            description: "الاعتراف بالإيراد وسندات القبض وتحصيل الديون",
            groups: [
                {
                    id: "revenue-receipts",
                    title: "الإيرادات والمقبوضات",
                    description: "تسجيل الإيرادات وسندات القبض",
                    screens: [
                        {
                            id: "revenues",
                            title: "الإيرادات",
                            icon: "trending-up",
                            description: "تسجيل الإيرادات المتنوعة",
                            href: "/02-commercial/revenue-receivables/revenue-receipts/revenues",
                            permissions: [],
                            module: "revenues",
                        },
                        {
                            id: "receipt-vouchers",
                            title: "سندات القبض",
                            icon: "book-open",
                            description: "مقبوضات أرصدة العملاء",
                            href: "/02-commercial/revenue-receivables/revenue-receipts/receipt-vouchers",
                            permissions: [],
                            module: "ar_customers",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Marketing & Distribution
        // ─────────────────────────────────────────────────────────────
        {
            id: "marketing-distribution",
            title: "التسويق والمروجين",
            icon: "award",
            description: "المناديب والعمولات والترويج",
            groups: [
                {
                    id: "representatives",
                    title: "المناديب والمسوقين",
                    description: "إدارة قنوات التسويق والتوزيع",
                    screens: [
                        {
                            id: "reps-list",
                            title: "المناديب والمسوقين",
                            icon: "tags",
                            description: "إدارة المناديب والمسوقين",
                            href: "/02-commercial/marketing-distribution/representatives/reps-list",
                            permissions: [],
                            module: "representatives",
                        },
                        {
                            id: "reps-ledger",
                            title: "المناديب والمسوقين",
                            icon: "tags",
                            description: "إدارة المناديب والمسوقين",
                            href: "/02-commercial/marketing-distribution/representatives/reps-ledger",
                            permissions: [],
                            module: "representatives",
                        },
                        {
                            id: "commissions",
                            title: "العمولات",
                            icon: "coins",
                            description: "عمولات المبيعات (قريباً)",
                            href: "/02-commercial/marketing-distribution/representatives/commissions",
                            permissions: [],
                            module: "representatives",
                            status: "pending",
                        },
                    ],
                },
            ],
        },
        // ─────────────────────────────────────────────────────────────
        // Capability: Managing and monitoring sales of in-stock 
        // and non-in-stock products (Instant Services)
        // ─────────────────────────────────────────────────────────────
        {
            id: "instant-services",
            title: "الخدمات الجاهزة",
            icon: "briefcase",
            description: "بيع الخدمات نقداً وآجلاً بدون تأثير على المخزون",
            groups: [

                {
                    id: "services-core",
                    title: "مبيعات الخدمات",
                    description: "إدارة كتالوج الخدمات ومعاملات البيع",
                    screens: [
                        {
                            id: "cash-services",
                            title: "مبيعات الخدمات النقدية",
                            icon: "banknote",
                            description: "تسجيل فواتير الخدمات النقدية",
                            href: "/02-commercial/instant-services/services-core/cash-services",
                            permissions: [],
                            module: "sales",
                        },
                        {
                            id: "credit-services",
                            title: "مبيعات الخدمات الآجلة",
                            icon: "receipt",
                            description: "تسجيل فواتير الخدمات الآجلة على العملاء",
                            href: "/02-commercial/instant-services/services-core/credit-services",
                            permissions: [],
                            module: "sales",
                        },
                        {
                            id: "service-returns",
                            title: "مرتجعات الخدمات",
                            icon: "history",
                            description: "إدارة مرتجعات مبيعات الخدمات",
                            href: "/02-commercial/instant-services/services-core/service-returns",
                            permissions: [],
                            module: "returns",
                        },
                    ],
                },

                {
                    id: "instnt-srvcs-ctlg",
                    title: "الكتالوج التجاري للخدمات",
                    description: "تعريف كل ما يمكن بيعه من خدمات غير مخزنية",
                    screens: [
                        {
                            id: "services-management",
                            title: "إدارة الخدمات",
                            icon: "briefcase",
                            description: "عرض وإضافة وتعديل وحذف الخدمات",
                            href: "/02-commercial/instant-services/instnt-srvcs-ctlg/services-management",
                            permissions: [],
                            module: "sales",
                        },
                        {
                            id: "instnt-srvcs-categories",
                            title: "التصنيفات",
                            icon: "tags",
                            description: "تصنيفات الخدمات",
                            href: "/02-commercial/instant-services/instnt-srvcs-ctlg/instnt-srvcs-categories",
                            permissions: [],
                            module: "dashboard",
                        },
                    ]
                }
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Sales Governance
        // ─────────────────────────────────────────────────────────────
        {
            id: "sales-governance",
            title: "حوكمة المبيعات",
            icon: "coins",
            description: "قوالب المستندات ونطاقات الترقيم",
            groups: [
                {
                    id: "templates",
                    title: "إدارة القوالب",
                    description: "قوالب التصاميم والفواتير",
                    screens: [
                        {
                            id: "template-manager",
                            title: "إدارة القوالب",
                            icon: "coins",
                            description: "إدارة قوالب التصاميم والفواتير وكشوفات الحساب",
                            href: "/02-commercial/sales-governance/templates/template-manager",
                            permissions: [],
                            module: "system_templates",
                        },
                    ],
                },
            ],
        },
    ],
};
