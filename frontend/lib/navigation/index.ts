/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Navigation Configuration — Central Hub
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file aggregates all 10 domain configurations into a single
 * navigation tree. It also provides backward-compatible adapters to
 * bridge the legacy `NavigationGroup` interface with the new
 * Domain → Capability → Feature Group → Screen hierarchy.
 * 
 * Usage:
 *   // New API (recommended)
 *   import { allDomains, getDomain, getNavigationTree } from '@/lib/navigation';
 * 
 *   // Legacy API (backward-compatible)
 *   import { navigationGroups, getAllNavigationLinks } from '@/lib/navigation';
 */

// ═══════════════════════════════════════════════════════════════════════════
// Domain Imports
// ═══════════════════════════════════════════════════════════════════════════
import { CoreDomain } from "./core.config";
import { CommercialDomain } from "./commercial.config";
import { FinanceDomain } from "./finance.config";
import { SupplyChainDomain } from "./supply-chain.config";
import { ManufacturingDomain } from "./manufacturing.config";
import { HumanCapitalDomain } from "./human-capital.config";
import { ProjectsDomain } from "./projects.config";
import { AssetsDomain } from "./assets.config";
import { IntelligenceDomain } from "./intelligence.config";
import { PlatformDomain } from "./platform.config";

// ═══════════════════════════════════════════════════════════════════════════
// Type Re-exports
// ═══════════════════════════════════════════════════════════════════════════
export type {
    Domain,
    Capability,
    FeatureGroup,
    NavScreen,
    NavigationTree,
} from "@/types/navigation";

import type {
    Domain,
    Capability,
    FeatureGroup,
    NavScreen,
    NavigationTree,
} from "@/types/navigation";

// ═══════════════════════════════════════════════════════════════════════════
// Legacy Type Re-exports (for backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════
import type { NavigationLink, NavigationGroup, NavigationItem } from "@/types/navigation";
export type { NavigationLink, NavigationGroup, NavigationItem };

// ═══════════════════════════════════════════════════════════════════════════
// Domain Registry
// ═══════════════════════════════════════════════════════════════════════════

/** All 10 domains sorted by their order property */
export const allDomains: Domain[] = [
    CoreDomain,
    CommercialDomain,
    FinanceDomain,
    SupplyChainDomain,
    ManufacturingDomain,
    HumanCapitalDomain,
    ProjectsDomain,
    AssetsDomain,
    IntelligenceDomain,
    PlatformDomain,
].sort((a, b) => a.order - b.order);

/** Individual domain exports for direct access */
export {
    CoreDomain,
    CommercialDomain,
    FinanceDomain,
    SupplyChainDomain,
    ManufacturingDomain,
    HumanCapitalDomain,
    ProjectsDomain,
    AssetsDomain,
    IntelligenceDomain,
    PlatformDomain,
};

// ═══════════════════════════════════════════════════════════════════════════
// New API — Domain-Driven Accessors
// ═══════════════════════════════════════════════════════════════════════════

/** Get the full navigation tree */
export function getNavigationTree(): NavigationTree {
    return { domains: allDomains };
}

/** Find a domain by its ID */
export function getDomain(domainId: string): Domain | undefined {
    return allDomains.find((d) => d.id === domainId);
}

/** Find a capability by its ID across all domains */
export function getCapability(capabilityId: string): Capability | undefined {
    for (const domain of allDomains) {
        const cap = domain.capabilities.find((c) => c.id === capabilityId);
        if (cap) return cap;
    }
    return undefined;
}

/** Find a feature group by its ID across all domains */
export function getFeatureGroup(groupId: string): FeatureGroup | undefined {
    for (const domain of allDomains) {
        for (const cap of domain.capabilities) {
            const group = cap.groups.find((g) => g.id === groupId);
            if (group) return group;
        }
    }
    return undefined;
}

/** Get all screens (flat list) across all domains */
export function getAllScreens(): NavScreen[] {
    const screens: NavScreen[] = [];
    for (const domain of allDomains) {
        for (const cap of domain.capabilities) {
            for (const group of cap.groups) {
                screens.push(...group.screens);
            }
        }
    }
    return screens;
}

/** Search screens by title or description (case-insensitive) */
export function searchScreens(query: string): NavScreen[] {
    const q = query.toLowerCase();
    return getAllScreens().filter(
        (s) =>
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q)
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy API — Backward-Compatible Adapters
// ═══════════════════════════════════════════════════════════════════════════
// These functions transform the new Domain structure back into the old
// NavigationGroup[] format so existing components continue to work.

/**
 * Converts a FeatureGroup's screens into legacy NavigationLink objects
 */
function screensToLinks(screens: NavScreen[]): NavigationLink[] {
    return screens.map((s) => ({
        href: s.href,
        icon: s.icon,
        label: s.title,
        description: s.description,
        module: s.module || "",
    }));
}

/**
 * Converts a Capability into a legacy NavigationGroup.
 * Always preserves the feature groups as nested items.
 */
function capabilityToGroup(domainKey: string, capability: Capability): NavigationGroup {
    return {
        key: capability.id,
        domainKey: domainKey,
        label: capability.title,
        icon: capability.icon,
        description: capability.description,
        items: capability.groups.map((g) => ({
            key: g.id,
            domainKey: domainKey,
            description:g.description,
            label: g.title,
            icon: g.icon || capability.icon,
            items: screensToLinks(g.screens),
        })),
    };
}

/**
 * Converts a Domain into a legacy NavigationGroup.
 * Always preserves the capabilities as nested items.
 */
function domainToNavigationGroup(domain: Domain): NavigationGroup {
    return {
        key: domain.id,
        domainKey: domain.id,
        description: domain.description,
        label: domain.title,
        icon: domain.icon,
        items: domain.capabilities.map((d) => { return capabilityToGroup(domain.id, d) }),
    };
}

/**
 * Legacy-compatible navigation groups array.
 * Transforms all 10 domains into the old NavigationGroup[] format.
 */
export const navigationGroups: NavigationGroup[] = allDomains.map(domainToNavigationGroup);

/**
 * Legacy helper: Check if a navigation item is a link
 */
export function isNavigationLink(item: NavigationItem): item is NavigationLink {
    return "href" in item;
}

/**
 * Legacy helper: Check if a navigation item is a group
 */
export function isNavigationGroup(item: NavigationItem): item is NavigationGroup {
    return "items" in item;
}

/**
 * Legacy helper: Get all navigation links (flat list)
 */
export function getAllNavigationLinks(
    groups: NavigationGroup[] = navigationGroups
): NavigationLink[] {
    const allLinks: NavigationLink[] = [];
    for (const group of groups) {
        if (!group.items || group.items.length === 0) continue;
        for (const item of group.items) {
            if (isNavigationLink(item)) {
                allLinks.push(item);
            } else if (isNavigationGroup(item)) {
                allLinks.push(...getAllNavigationLinks([item]));
            }
        }
    }
    return allLinks;
}

/**
 * Legacy helper: Find a navigation group by key
 */
export function getNavigationGroup(
    key: string,
    groups: NavigationGroup[] = navigationGroups
): NavigationGroup | undefined {
    // Normalize key: remove trailing slash
    const cleanKey = key.endsWith("/") ? key.slice(0, -1) : key;

    for (const group of groups) {
        if (group.key === cleanKey) return group;
        if (group.items && group.items.length > 0) {
            for (const item of group.items) {
                if (isNavigationGroup(item)) {
                    const found = getNavigationGroup(cleanKey, [item]);
                    if (found) return found;
                }
            }
        }
    }
    return undefined;
}

/**
 * Find a navigation group by URL segment path
 * Handles 01-, 02- prefixes and deep paths.
 */
export function getNavigationGroupFromPath(path: string | string[]): NavigationGroup | undefined {
    const segments = Array.isArray(path) ? path : path.replace(/^\//, '').replace(/\/$/, '').split('/');
    if (segments.length === 0) return undefined;

    // Try segments from last to first
    for (let i = segments.length - 1; i >= 0; i--) {
        const rawSegment = segments[i];
        // Remove 01-, 02- prefixes if present (e.g. 02-commercial -> commercial)
        const cleanSegment = rawSegment.replace(/^\d+-/, '');
        
        const found = getNavigationGroup(cleanSegment);
        if (found) return found;
        
        // Also try the raw segment
        const foundRaw = getNavigationGroup(rawSegment);
        if (foundRaw) return foundRaw;
    }

    return undefined;
}
