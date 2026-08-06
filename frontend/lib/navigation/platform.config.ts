/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Domain 10: Digital Platform & Extensions (المنصة الرقمية والتوسع)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Vision: Platform extensibility — integration hub, low-code customization,
 * communication suite, and developer ecosystem.
 * 
 * Cross-Domain Integration:
 *  - All Domains: API gateway and webhook support
 *  - Core: Extension of system configuration
 *  - Intelligence: Data pipeline connectors
 */

import { Domain } from "../../types/navigation";

export const PlatformDomain: Domain = {
    id: "platform",
    order: 10,
    title: "المنصة الرقمية والتوسع",
    icon: "settings",
    description: "محور التكامل، محرك التخصيص، الاتصالات، ومنظومة المطورين",
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Integration Hub
        // ─────────────────────────────────────────────────────────────
        {
            id: "integration-hub",
            title: "محور التكامل",
            icon: "link",
            description: "إدارة واجهات البرمجة والربط مع الأنظمة الخارجية",
            groups: [
                {
                    id: "api-management",
                    title: "إدارة API",
                    description: "واجهات البرمجة والموصلات",
                    screens: [
                        {
                            id: "api-gateway",
                            title: "إدارة API",
                            icon: "link",
                            description: "إدارة واجهات REST/GraphQL (قريباً)",
                            href: "/10-platform/integration-hub/api-management/api-gateway",
                            permissions: [],
                            module: "platform",
                            status: "pending",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Customization Engine
        // ─────────────────────────────────────────────────────────────
        {
            id: "customization",
            title: "محرك التخصيص",
            icon: "settings",
            description: "حقول مخصصة وبناء واجهات المستخدم",
            groups: [
                {
                    id: "low-code",
                    title: "التخصيص بدون برمجة",
                    description: "أدوات التخصيص منخفضة الكود",
                    screens: [
                        {
                            id: "custom-fields",
                            title: "الحقول المخصصة",
                            icon: "settings",
                            description: "إدارة الحقول والكيانات المخصصة (قريباً)",
                            href: "/10-platform/customization/low-code/custom-fields",
                            permissions: [],
                            module: "platform",
                            status: "pending",
                        },
                    ],
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────
        // Capability: Communication Suite
        // ─────────────────────────────────────────────────────────────
        {
            id: "communication",
            title: "منظومة الاتصالات",
            icon: "send",
            description: "البريد الإلكتروني والرسائل والإشعارات",
            groups: [
                {
                    id: "messaging",
                    title: "خدمات المراسلة",
                    description: "قنوات الاتصال المتعددة",
                    screens: [
                        {
                            id: "email-sms",
                            title: "البريد والرسائل",
                            icon: "send",
                            description: "بوابة البريد الإلكتروني والرسائل (قريباً)",
                            href: "/10-platform/communication/messaging/email-sms",
                            permissions: [],
                            module: "platform",
                            status: "pending",
                        },
                    ],
                },
            ],
        },
    ],
};
