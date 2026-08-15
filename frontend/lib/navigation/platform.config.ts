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
    title: catalogMessage("navigation.platformConfig.digitalPlatformExpansion"),
    icon: "settings",
    description: catalogMessage("navigation.platformConfig.integrationHubCustomizationEngineCommunicationsDeveloperEcosystem"),
    capabilities: [
        // ─────────────────────────────────────────────────────────────
        // Capability: Integration Hub
        // ─────────────────────────────────────────────────────────────
        {
            id: "integration-hub",
            title: catalogMessage("navigation.platformConfig.integrationHub"),
            icon: "link",
            description: catalogMessage("navigation.platformConfig.apiManagementIntegrationExternalSystems"),
            groups: [
                {
                    id: "api-management",
                    title: catalogMessage("common.general.apiManagement"),
                    description: catalogMessage("navigation.platformConfig.apisConnectors"),
                    screens: [
                        {
                            id: "api-gateway",
                            title: catalogMessage("common.general.apiManagement"),
                            icon: "link",
                            description: catalogMessage("navigation.platformConfig.restGraphqlApiManagementComingSoon"),
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
            title: catalogMessage("navigation.platformConfig.customizationEngine"),
            icon: "settings",
            description: catalogMessage("navigation.platformConfig.customFieldsUiBuilding"),
            groups: [
                {
                    id: "low-code",
                    title: catalogMessage("navigation.platformConfig.customizationWithoutCoding"),
                    description: catalogMessage("navigation.platformConfig.lowCodeCustomizationTools"),
                    screens: [
                        {
                            id: "custom-fields",
                            title: catalogMessage("navigation.platformConfig.customFields"),
                            icon: "settings",
                            description: catalogMessage("navigation.platformConfig.customFieldsEntitiesManagementComingSoon"),
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
            title: catalogMessage("navigation.platformConfig.communicationsSystem"),
            icon: "send",
            description: catalogMessage("navigation.platformConfig.emailMessagesNotifications"),
            groups: [
                {
                    id: "messaging",
                    title: catalogMessage("navigation.platformConfig.messagingServices"),
                    description: catalogMessage("navigation.platformConfig.multipleCommunicationChannels"),
                    screens: [
                        {
                            id: "email-sms",
                            title: catalogMessage("navigation.platformConfig.mailMessages"),
                            icon: "send",
                            description: catalogMessage("navigation.platformConfig.emailMessagingGatewayComingSoon"),
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
