/**
 * ERP Platform — Navigation Type System
 * ══════════════════════════════════════
 * 
 * Philosophy: Domain → Capability → Feature Group → Screen
 * 
 * This file defines the strict 4-layer hierarchy used across
 * the entire navigation system. Every navigational element
 * must conform to this taxonomy.
 * 
 * Layer 1 — Domain (The Why):     High-level business area
 * Layer 2 — Capability (The What): A specific business power
 * Layer 3 — Feature Group (The How): Logical grouping of related tasks
 * Layer 4 — Screen (The Do):       The actual UI where the user interacts
 */

import { IconName } from "../lib/icons";

// ═══════════════════════════════════════════════════════════════════════════
// Layer 4: Screen — The atomic navigable unit
// ═══════════════════════════════════════════════════════════════════════════
export interface NavScreen {
    /** Unique identifier for this screen (e.g., "recon-list") */
    id: string;
    /** Display title (supports i18n keys) */
    title: string;
    /** Icon identifier from the icon registry */
    icon: IconName;
    /** Brief description of the screen's purpose */
    description: string;
    /** The route path for navigation (follows /domain/capability/feature pattern) */
    href: string;
    /** Required permissions to access this screen (RBAC) */
    permissions: string[];
    /** Original module key for backward compatibility */
    module?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Layer 3: Feature Group — Logical grouping of related screens
// ═══════════════════════════════════════════════════════════════════════════
export interface FeatureGroup {
    /** Unique identifier (e.g., "reconciliation") */
    id: string;
    /** Display title */
    title: string;
    /** Optional icon */
    icon?: IconName;
    /** Description of this feature group */
    description: string;
    /** Screens within this feature group */
    screens: NavScreen[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Layer 2: Capability — A specific business power within a domain
// ═══════════════════════════════════════════════════════════════════════════
export interface Capability {
    /** Unique identifier (e.g., "treasury") */
    id: string;
    /** Display title */
    title: string;
    /** Icon identifier */
    icon: IconName;
    /** Description of this capability */
    description: string;
    /** Feature groups within this capability */
    groups: FeatureGroup[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Layer 1: Domain — The highest-level business area
// ═══════════════════════════════════════════════════════════════════════════
export interface Domain {
    /** Unique domain identifier (e.g., "finance", "core") */
    id: string;
    /** Numeric order for consistent display (1-10) */
    order: number;
    /** Display title */
    title: string;
    /** Icon identifier */
    icon: IconName;
    /** High-level description of the domain */
    description: string;
    /** Capabilities within this domain */
    capabilities: Capability[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Aggregate type for the full navigation tree
// ═══════════════════════════════════════════════════════════════════════════
export interface NavigationTree {
    /** All domains in the ERP system */
    domains: Domain[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy Types for Backend Compatibility
// ═══════════════════════════════════════════════════════════════════════════
export interface NavigationLink {
    href: string;
    icon: IconName;
    label: string;
    description: string;
    module: string;
}

export interface NavigationGroup {
    key: string;
    domainKey: string;
    label: string;
    description: string;
    icon: IconName;
    items: (NavigationLink | NavigationGroup)[];
}

export type NavigationItem = NavigationLink | NavigationGroup;
