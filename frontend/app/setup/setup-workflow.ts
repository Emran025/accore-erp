import type { SetupJourneyStepId } from "./components/SetupJourneyStepper";
import type { SetupState } from "./types";

export function detectStaleSetupState(
  current: SetupState | null,
  incoming: SetupState | null
): boolean {
  if (!current || !incoming) return false;
  // If policy version changed or selected modules changed, state is stale
  const currentVersion = current.onboarding?.policy_version;
  const incomingVersion = incoming.onboarding?.policy_version;
  if (currentVersion && incomingVersion && currentVersion !== incomingVersion) return true;
  const currentSelected = JSON.stringify([...(current.selected_module_keys ?? [])].sort());
  const incomingSelected = JSON.stringify([...(incoming.selected_module_keys ?? [])].sort());
  return currentSelected !== incomingSelected;
}

export function hasServerConfirmedModuleSelection(state: SetupState | null): boolean {
  return (state?.selected_module_keys.length ?? 0) > 0;
}

export function getNextSetupJourneyStep(state: SetupState | null): SetupJourneyStepId {
  if (!hasServerConfirmedModuleSelection(state)) return "module_selection";

  switch (state?.onboarding?.next_phase) {
    case "core_operations":
      return "operating_links";
    case "module_activation":
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
