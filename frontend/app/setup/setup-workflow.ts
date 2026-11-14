import type { SetupJourneyStepId } from "./components/SetupJourneyStepper";
import type { OrganizationProfile, Readiness, SetupRequirement, SetupState } from "./types";

export type SetupScopeCapabilities = {
  requiresWorkingUnit: boolean;
  requiresOperatingContext: boolean;
  requiresWarehouse: boolean;
  requiresPosTerminal: boolean;
  requiresCostCenter: boolean;
  requiresProfitCenter: boolean;
};

export function getSetupScopeCapabilities(requirements: SetupRequirement[]): SetupScopeCapabilities {
  const keys = new Set(requirements.map((requirement) => requirement.key));
  return {
    requiresWorkingUnit: keys.has("working_unit"),
    requiresOperatingContext: keys.has("operating_context"),
    requiresWarehouse: keys.has("warehouse"),
    requiresPosTerminal: keys.has("pos_terminal"),
    requiresCostCenter: keys.has("node_type:COST_CENTER"),
    requiresProfitCenter: keys.has("node_type:PROFIT_CENTER"),
  };
}

export function createSetupLoadSequence() {
  let latestRequestId = 0;

  return {
    begin: () => ++latestRequestId,
    isCurrent: (requestId: number) => requestId === latestRequestId,
  };
}

export function getSetupDirection(locale: string): "rtl" | "ltr" {
  return locale.startsWith("ar") ? "rtl" : "ltr";
}

export function getSetupInferenceContextSignature(profile: OrganizationProfile, selectedTemplateKey: string): string {
  return JSON.stringify({
    selectedTemplateKey,
    templateKey: profile.template_key,
    industry: profile.industry,
    organizationSize: profile.organization_size,
    companyName: profile.company_name,
    companyCode: profile.company_code,
    countryCode: profile.country_code,
    currencyId: profile.currency_id,
    primarySiteName: profile.primary_site_name ?? "",
    primarySiteCode: profile.primary_site_code ?? "",
    factoryCalendarId: profile.factory_calendar_id ?? null,
    language: profile.language ?? null,
    inventoryEnabled: profile.inventory_enabled,
  });
}

export function detectStaleSetupState(
  current: SetupState | null,
  incoming: SetupState | null,
  currentReadiness?: Readiness | null,
  incomingReadiness?: Readiness | null,
): boolean {
  if (!current || !incoming) return false;

  const snapshot = (state: SetupState, readiness?: Readiness | null) => JSON.stringify({
    policyVersion: state.onboarding?.policy_version ?? null,
    selected: [...(state.selected_module_keys ?? [])].sort(),
    active: [...(state.active_module_keys ?? [])].sort(),
    pending: [...(state.pending_module_keys ?? [])].sort(),
    requirements: (state.requirement_queue ?? []).map((item) => item.key).sort(),
    phase: state.onboarding?.next_phase ?? null,
    phases: {
      foundation: state.onboarding?.phases?.foundation?.ready ?? null,
      coreOperations: state.onboarding?.phases?.core_operations?.ready ?? null,
    },
    template: {
      key: state.organization_template?.profile?.template_key ?? null,
      applied: state.organization_template?.is_applied ?? null,
      industry: state.organization_template?.profile?.industry ?? null,
      organizationSize: state.organization_template?.profile?.organization_size ?? null,
      companyName: state.organization_template?.profile?.company_name ?? null,
      companyCode: state.organization_template?.profile?.company_code ?? null,
      countryCode: state.organization_template?.profile?.country_code ?? null,
      currencyId: state.organization_template?.profile?.currency_id ?? null,
      primarySiteName: state.organization_template?.profile?.primary_site_name ?? null,
      primarySiteCode: state.organization_template?.profile?.primary_site_code ?? null,
      factoryCalendarId: state.organization_template?.profile?.factory_calendar_id ?? null,
      language: state.organization_template?.profile?.language ?? null,
      inventoryEnabled: state.organization_template?.profile?.inventory_enabled ?? null,
    },
    modules: (state.modules ?? []).map((module) => [
      module.module_key,
      module.is_selected,
      module.is_operational,
      module.requirements_satisfied ?? null,
      module.lifecycle,
    ]).sort(([left], [right]) => String(left).localeCompare(String(right))),
    readiness: readiness ? {
      ready: readiness.ready,
      structuralReady: readiness.structural_readiness?.ready ?? null,
      chartReady: readiness.accounting_readiness?.chart_of_accounts.ready ?? null,
      fiscalPeriodReady: readiness.accounting_readiness?.open_fiscal_period.ready ?? null,
      checks: (readiness.checks ?? []).map((check) => [check.key, check.complete]).sort(([left], [right]) => String(left).localeCompare(String(right))),
      context: readiness.context ? [
        readiness.context.org_node_uuid ?? null,
        readiness.context.warehouse_id ?? null,
        readiness.context.pos_terminal_id ?? null,
        readiness.context.cost_center_id ?? null,
        readiness.context.profit_center_id ?? null,
      ] : null,
    } : null,
  });

  return snapshot(current, currentReadiness) !== snapshot(incoming, incomingReadiness);
}

export function hasServerConfirmedModuleSelection(state: SetupState | null): boolean {
  return (state?.selected_module_keys.length ?? 0) > 0;
}

export function canNavigateToSetupStep(
  target: SetupJourneyStepId,
  state: SetupState | null,
  readiness?: Readiness | null,
): boolean {
  if (target === "module_selection") return true;
  if (!hasServerConfirmedModuleSelection(state)) return false;

  const onboarding = state?.onboarding ?? readiness?.onboarding;
  if (target === "foundation") return true;
  const foundationReady = onboarding?.phases?.foundation?.ready === true;
  if (!foundationReady) return false;
  const coreOperationsReady = onboarding?.phases?.core_operations?.ready === true;

  if (target === "operating_links") {
    const scope = getSetupScopeCapabilities(state?.requirement_queue ?? []);
    return !coreOperationsReady || scope.requiresWorkingUnit || scope.requiresOperatingContext
      || scope.requiresWarehouse || scope.requiresPosTerminal || scope.requiresCostCenter || scope.requiresProfitCenter;
  }
  return coreOperationsReady;
}

export function getNextSetupJourneyStep(state: SetupState | null, readiness?: Readiness | null): SetupJourneyStepId {
  if (!hasServerConfirmedModuleSelection(state)) return "module_selection";

  switch (state?.onboarding?.next_phase) {
    case "core_operations":
      return "operating_links";
    case "module_activation":
      if (
        (state?.requirement_queue ?? []).some((item) => [
          "working_unit",
          "operating_context",
          "node_type:COST_CENTER",
          "node_type:PROFIT_CENTER",
        ].includes(item.key))
        && readiness?.structural_readiness?.ready === false
      ) return "operating_links";
      return "optional_capabilities";
    case "foundation":
    default:
      return "foundation";
  }
}

export function areSelectedModuleRequirementsReady(state: SetupState | null): boolean {
  const selectedKeys = state?.selected_module_keys ?? [];
  if (selectedKeys.length === 0) return false;

  const modulesByKey = new Map((state?.modules ?? []).map((module) => [module.module_key, module]));
  return selectedKeys.every((moduleKey) => {
    const setupModule = modulesByKey.get(moduleKey);
    return Boolean(setupModule && !setupModule.is_configuration_module && setupModule.requirements_satisfied === true);
  });
}

export function hasActivatableSelectedModule(state: SetupState | null): boolean {
  const selectedKeys = state?.selected_module_keys ?? [];
  const modulesByKey = new Map((state?.modules ?? []).map((module) => [module.module_key, module]));

  return selectedKeys.some((moduleKey) => {
    const setupModule = modulesByKey.get(moduleKey);
    return Boolean(setupModule && !setupModule.is_configuration_module && !setupModule.is_operational && setupModule.requirements_satisfied === true);
  });
}

export const DEFAULT_SETUP_DASHBOARD_ROUTE = "/01-enterprise-core/system-overview/dashboard/global-dashboard";

const moduleReturnPrefixes: Array<{ prefix: string; moduleKey: string }> = [
  { prefix: "/01-enterprise-core/organization-governance/", moduleKey: "org_structure" },
  { prefix: "/02-commercial/sales-lifecycle/", moduleKey: "sales" },
  { prefix: "/02-commercial/instant-services/", moduleKey: "sales" },
  { prefix: "/02-commercial/crm/", moduleKey: "ar_customers" },
  { prefix: "/02-commercial/marketing-distribution/", moduleKey: "representatives" },
  { prefix: "/02-commercial/marketplace/", moduleKey: "marketplace" },
  { prefix: "/02-commercial/revenue-receivables/", moduleKey: "revenues" },
  { prefix: "/03-finance/general-ledger/", moduleKey: "general_ledger" },
  { prefix: "/03-finance/foreign-exchange/", moduleKey: "currency" },
  { prefix: "/03-finance/audit-compliance/", moduleKey: "audit_trail" },
  { prefix: "/03-finance/tax-compliance/", moduleKey: "vat_zatca" },
  { prefix: "/03-finance/management-accounting/", moduleKey: "reports" },
  { prefix: "/04-supply-chain/inventory/", moduleKey: "products" },
  { prefix: "/04-supply-chain/procurement/", moduleKey: "purchases" },
  { prefix: "/04-supply-chain/payables-expenses/", moduleKey: "expenses" },
  { prefix: "/04-supply-chain/supplier-sourcing/", moduleKey: "purchases" },
  { prefix: "/05-manufacturing/", moduleKey: "manufacturing" },
  { prefix: "/06-human-capital/workforce-admin/", moduleKey: "employees" },
  { prefix: "/06-human-capital/talent-recruitment/", moduleKey: "recruitment" },
  { prefix: "/06-human-capital/payroll-benefits/", moduleKey: "payroll" },
  { prefix: "/06-human-capital/time-productivity/", moduleKey: "attendance" },
  { prefix: "/06-human-capital/performance-development/", moduleKey: "performance" },
  { prefix: "/06-human-capital/services-wellness/", moduleKey: "wellness" },
  { prefix: "/06-human-capital/knowledge-portal/", moduleKey: "knowledge" },
  { prefix: "/06-human-capital/hr-compliance/", moduleKey: "compliance" },
  { prefix: "/06-human-capital/hr-advanced/", moduleKey: "hr" },
  { prefix: "/07-projects/", moduleKey: "projects" },
  { prefix: "/08-assets/", moduleKey: "assets" },
  { prefix: "/09-intelligence/", moduleKey: "intelligence" },
  { prefix: "/10-platform/", moduleKey: "platform" },
];

export function resolveSetupReturnDestination(returnTo: string | null, state: SetupState | null): string {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//") || returnTo.includes(":") || returnTo.includes("\\")) {
    return DEFAULT_SETUP_DASHBOARD_ROUTE;
  }

  let url: URL;
  try {
    url = new URL(returnTo, "https://setup.invalid");
  } catch {
    return DEFAULT_SETUP_DASHBOARD_ROUTE;
  }
  if (url.origin !== "https://setup.invalid") return DEFAULT_SETUP_DASHBOARD_ROUTE;

  const path = url.pathname;
  if (path === "/01-enterprise-core/system-overview/dashboard" || path.startsWith("/01-enterprise-core/system-overview/dashboard/")) {
    return `${url.pathname}${url.search}${url.hash}`;
  }

  const destination = moduleReturnPrefixes.find(({ prefix }) => path.startsWith(prefix));
  if (!destination) return DEFAULT_SETUP_DASHBOARD_ROUTE;

  const destinationModule = state?.modules.find((item) => item.module_key === destination.moduleKey);
  const active = state?.active_module_keys.includes(destination.moduleKey) === true;
  const available = destinationModule?.is_configuration_module === true || destinationModule?.is_operational === true;
  return active && available
    ? `${url.pathname}${url.search}${url.hash}`
    : DEFAULT_SETUP_DASHBOARD_ROUTE;
}

export function isSetupLaunchReady(state: SetupState | null): boolean {
  const selectedKeys = state?.selected_module_keys ?? [];
  const starterKeys = state?.onboarding?.starter_module_keys ?? [];
  if (!state || state.setup_required || selectedKeys.length === 0 || starterKeys.length === 0) {
    return false;
  }

  const activeKeys = new Set(state.active_module_keys);
  return state.onboarding?.starter_bundle_active === true
    && starterKeys.every((moduleKey) => activeKeys.has(moduleKey));
}
