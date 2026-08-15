import { catalogMessage } from "@/lib/i18n";
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
    title: catalogMessage("text_c718e0da305e"),
    icon: "settings",
    description: catalogMessage("text_25188ee0ee76"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Integration Hub
        // ─────────────────────────────────────────────────────────────
        {
            id: "integration-hub",
            title: catalogMessage("text_0f12be25c643"),
            icon: "link",
            description: catalogMessage("text_84790aae61b5"),
            groups: [
                {
                    id: "api-management",
                    title: catalogMessage("text_5859364cf6a2"),
                    description: catalogMessage("text_d4dda7cfbcdd"),
                    screens: [
                        {
                            id: "api-gateway",
                            title: catalogMessage("text_5859364cf6a2"),
                            icon: "link",
                            description: catalogMessage("text_5f64c0e76f92"),
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
            title: catalogMessage("text_ca0e6e1e2e7a"),
            icon: "settings",
            description: catalogMessage("text_7fe698f48a52"),
            groups: [
                {
                    id: "low-code",
                    title: catalogMessage("text_cf7b13964f30"),
                    description: catalogMessage("text_93b62fecf3fb"),
                    screens: [
                        {
                            id: "custom-fields",
                            title: catalogMessage("text_5198375bc00c"),
                            icon: "settings",
                            description: catalogMessage("text_2310b6a050a6"),
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
            title: catalogMessage("text_c61a69e26ff0"),
            icon: "send",
            description: catalogMessage("text_b75c980612df"),
            groups: [
                {
                    id: "messaging",
                    title: catalogMessage("text_672be4a7844b"),
                    description: catalogMessage("text_4ef801acfca2"),
                    screens: [
                        {
                            id: "email-sms",
                            title: catalogMessage("text_acba8d3aed56"),
                            icon: "send",
                            description: catalogMessage("text_a864392dea51"),
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
