import type { SetupJourneyStepId } from "./components/SetupJourneyStepper";
import type { Readiness, SetupRequirement, SetupState } from "./types";

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

export function isSetupLaunchReady(state: SetupState | null): boolean {
  const selectedKeys = state?.selected_module_keys ?? [];
  if (!state || state.setup_required || selectedKeys.length === 0 || state.pending_module_keys.length > 0) {
    return false;
  }

  const activeKeys = new Set(state.active_module_keys);
  return selectedKeys.every((moduleKey) => activeKeys.has(moduleKey));
}
