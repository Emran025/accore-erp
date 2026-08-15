import { catalogMessage } from "@/lib/i18n";
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
    title: catalogMessage("text_032ddf83af02"),
    icon: "cart",
    description: catalogMessage("text_1eb86595a18a"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Customer Relationship (CRM)
        // ─────────────────────────────────────────────────────────────
        {
            id: "crm",
            title: catalogMessage("text_bff3793b5cce"),
            icon: "user-plus",
            description: catalogMessage("text_d1e9a8eb6d8a"),
            groups: [
                {
                    id: "customer-master",
                    title: catalogMessage("text_cc7cd8940a32"),
                    description: catalogMessage("text_09f7539cb222"),
                    screens: [
                        {
                            id: "customers-list",
                            title: catalogMessage("text_813d9a8a1065"),
                            icon: "user-plus",
                            description: catalogMessage("text_8f006851c13a"),
                            href: "/02-commercial/crm/customer-master/customers-list",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "customer-ledger",
                            title: catalogMessage("text_6959a968bf34"),
                            icon: "hand-coins",
                            description: catalogMessage("text_3267789e839b"),
                            href: "/02-commercial/crm/customer-master/customer-ledger",
                            permissions: [],
                            module: "ar_customers",
                        },
                    ],
                },
                {
                    id: "customer-groups-nr",
                    title: catalogMessage("text_06d57ae5ce24"),
                    icon: "users",
                    description: catalogMessage("text_bcda3469b10f"),
                    screens: [
                        {
                            id: "add-customer-group",
                            title: catalogMessage("text_da33776a790a"),
                            icon: "add",
                            description: catalogMessage("text_008637650d6c"),
                            href: "/02-commercial/crm/customer-groups-nr/add-customer-group",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "add-customer-nr",
                            title: catalogMessage("text_7c221583986f"),
                            icon: "add",
                            description: catalogMessage("text_1b15968ae1d6"),
                            href: "/02-commercial/crm/customer-groups-nr/add-customer-nr",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "view-customer-groups",
                            title: catalogMessage("text_0e175aa4e56b"),
                            icon: "view",
                            description: catalogMessage("text_0e175aa4e56b"),
                            href: "/02-commercial/crm/customer-groups-nr/view-customer-groups",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "view-customer-nr",
                            title: catalogMessage("text_7f48a8a698f4"),
                            icon: "view",
                            description: catalogMessage("text_7f48a8a698f4"),
                            href: "/02-commercial/crm/customer-groups-nr/view-customer-nr",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "customer-nr-assignment",
                            title: catalogMessage("text_197b19ee7c45"),
                            icon: "add",
                            description: catalogMessage("text_98530800504d"),
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
            title: catalogMessage("text_a35333780d60"),
            icon: "cart",
            description: catalogMessage("text_1699326c07cd"),
            groups: [
                {
                    id: "direct-sales",
                    title: catalogMessage("text_d3a7e2832d5a"),
                    description: catalogMessage("text_7432247e6867"),
                    screens: [
                        {
                            id: "sales-invoices",
                            title: catalogMessage("text_5009f3495500"),
                            icon: "cart",
                            description: catalogMessage("text_797b93a3a316"),
                            href: "/02-commercial/sales-lifecycle/direct-sales/sales-invoices",
                            permissions: [],
                            module: "sales",
                        },
                        {
                            id: "deferred-sales",
                            title: catalogMessage("text_bfd826a3836d"),
                            icon: "receipt",
                            description: catalogMessage("text_41e4bf18dc56"),
                            href: "/02-commercial/sales-lifecycle/direct-sales/deferred-sales",
                            permissions: [],
                            module: "deferred_sales",
                        },
                        {
                            id: "sales-returns",
                            title: catalogMessage("text_36af18369fdc"),
                            icon: "history",
                            description: catalogMessage("text_f65fd0ba0017"),
                            href: "/02-commercial/sales-lifecycle/direct-sales/sales-returns",
                            permissions: [],
                            module: "returns",
                        },
                        {
                            id: "commercial-reports",
                            title: catalogMessage("text_6de6df69099d"),
                            icon: "eye",
                            description: catalogMessage("text_84c3bc0989ab"),
                            href: "/02-commercial/sales-lifecycle/direct-sales/reports",
                            permissions: [],
                            module: "sales",
                        },
                    ],
                },
                {
                    id: "sales-orders",
                    title: catalogMessage("text_21c2232bd2de"),
                    description: catalogMessage("text_d464baabdf16"),
                    screens: [
                        {
                            id: "purchase-requests-sales",
                            title: catalogMessage("text_0b4a794d5f29"),
                            icon: "book-open",
                            description: catalogMessage("text_cd5bf51dd7b8"),
                            href: "/02-commercial/sales-lifecycle/sales-orders/purchase-requests-sales",
                            permissions: [],
                            module: "ar_customers",
                        },
                        {
                            id: "quotations",
                            title: catalogMessage("text_6ca2c33f29f9"),
                            icon: "cart",
                            description: catalogMessage("text_db6355fe742d"),
                            href: "/02-commercial/sales-lifecycle/sales-orders/quotations",
                            permissions: [],
                            module: "sales",
                        },
                        {
                            id: "sales-orders-list",
                            title: catalogMessage("text_ff82372b1ecd"),
                            icon: "cart",
                            description: catalogMessage("text_212ba6de1cdd"),
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
            title: catalogMessage("text_50dbb804ef8c"),
            icon: "trending-up",
            description: catalogMessage("text_3ebe709355ab"),
            groups: [
                {
                    id: "revenue-receipts",
                    title: catalogMessage("text_7c15a1b40b73"),
                    description: catalogMessage("text_3e6f1b541c04"),
                    screens: [
                        {
                            id: "revenues",
                            title: catalogMessage("text_8188deffd656"),
                            icon: "trending-up",
                            description: catalogMessage("text_fb5fc735ebca"),
                            href: "/02-commercial/revenue-receivables/revenue-receipts/revenues",
                            permissions: [],
                            module: "revenues",
                        },
                        {
                            id: "receipt-vouchers",
                            title: catalogMessage("text_47b192b07403"),
                            icon: "book-open",
                            description: catalogMessage("text_5a5a54542b22"),
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
            title: catalogMessage("text_6a9979107671"),
            icon: "award",
            description: catalogMessage("text_d4b9b3351910"),
            groups: [
                {
                    id: "representatives",
                    title: catalogMessage("text_917d4bb5a359"),
                    description: catalogMessage("text_b75c664f10e6"),
                    screens: [
                        {
                            id: "reps-list",
                            title: catalogMessage("text_917d4bb5a359"),
                            icon: "tags",
                            description: catalogMessage("text_3fae23786ef0"),
                            href: "/02-commercial/marketing-distribution/representatives/reps-list",
                            permissions: [],
                            module: "representatives",
                        },
                        {
                            id: "reps-ledger",
                            title: catalogMessage("text_917d4bb5a359"),
                            icon: "tags",
                            description: catalogMessage("text_3fae23786ef0"),
                            href: "/02-commercial/marketing-distribution/representatives/reps-ledger",
                            permissions: [],
                            module: "representatives",
                        },
                        {
                            id: "commissions",
                            title: catalogMessage("text_98a646991390"),
                            icon: "coins",
                            description: catalogMessage("text_58c16f0f0d25"),
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
            title: catalogMessage("text_5b721a333829"),
            icon: "briefcase",
            description: catalogMessage("text_7ceb160b231e"),
            groups: [

                {
                    id: "services-core",
                    title: catalogMessage("text_ad767fd2e2b7"),
                    description: catalogMessage("text_33f9aeb09c78"),
                    screens: [
                        {
                            id: "cash-services",
                            title: catalogMessage("text_940148b0ae90"),
                            icon: "banknote",
                            description: catalogMessage("text_f8917f28c3cf"),
                            href: "/02-commercial/instant-services/services-core/cash-services",
                            permissions: [],
                            module: "sales",
                        },
                        {
                            id: "credit-services",
                            title: catalogMessage("text_3a0b7bbd2c20"),
                            icon: "receipt",
                            description: catalogMessage("text_a296b253d382"),
                            href: "/02-commercial/instant-services/services-core/credit-services",
                            permissions: [],
                            module: "sales",
                        },
                        {
                            id: "service-returns",
                            title: catalogMessage("text_f797e9b0e3eb"),
                            icon: "history",
                            description: catalogMessage("text_f99d5b47c925"),
                            href: "/02-commercial/instant-services/services-core/service-returns",
                            permissions: [],
                            module: "returns",
                        },
                    ],
                },

                {
                    id: "instnt-srvcs-ctlg",
                    title: catalogMessage("text_987c2622f62f"),
                    description: catalogMessage("text_7b3bda9d7d72"),
                    screens: [
                        {
                            id: "services-management",
                            title: catalogMessage("text_829bed999387"),
                            icon: "briefcase",
                            description: catalogMessage("text_cf246aed72be"),
                            href: "/02-commercial/instant-services/instnt-srvcs-ctlg/services-management",
                            permissions: [],
                            module: "sales",
                        },
                        {
                            id: "instnt-srvcs-categories",
                            title: catalogMessage("text_e809b3087f40"),
                            icon: "tags",
                            description: catalogMessage("text_e23ff29affac"),
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
            title: catalogMessage("text_7034cd84a33c"),
            icon: "coins",
            description: catalogMessage("text_b8fcdf7f058e"),
            groups: [
                {
                    id: "templates",
                    title: catalogMessage("text_d0d0fff36695"),
                    description: catalogMessage("text_951fba48edbe"),
                    screens: [
                        {
                            id: "template-manager",
                            title: catalogMessage("text_d0d0fff36695"),
                            icon: "coins",
                            description: catalogMessage("text_9110a12a52de"),
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
