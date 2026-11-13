import { describe, expect, it } from "vitest";
import type { SetupState } from "../../app/setup/types";
import {
  areSelectedModuleRequirementsReady,
  getNextSetupJourneyStep,
  hasServerConfirmedModuleSelection,
  isSetupLaunchReady,
} from "../../app/setup/setup-workflow";

function makeState(overrides: Partial<SetupState> = {}): SetupState {
  return {
    setup_required: true,
    selected_module_keys: ["finance"],
    active_module_keys: [],
    pending_module_keys: ["finance"],
    requirement_queue: [],
    modules: [{
      module_key: "finance",
      is_configuration_module: false,
      is_selected: true,
      is_operational: false,
      requirements_satisfied: false,
      lifecycle: "selected_pending_org_setup",
    }],
    onboarding: { next_phase: "foundation" } as SetupState["onboarding"],
    ...overrides,
  } as SetupState;
}

describe("server-driven setup workflow", () => {
  it("keeps module selection first until the server persists a selection", () => {
    const state = makeState({ selected_module_keys: [], onboarding: { next_phase: "module_activation" } as SetupState["onboarding"] });

    expect(hasServerConfirmedModuleSelection(state)).toBe(false);
    expect(getNextSetupJourneyStep(state)).toBe("module_selection");
  });

  it("resumes at the phase reported by the server", () => {
    expect(getNextSetupJourneyStep(makeState({ onboarding: { next_phase: "core_operations" } as SetupState["onboarding"] }))).toBe("operating_links");
    expect(getNextSetupJourneyStep(makeState({ onboarding: { next_phase: "module_activation" } as SetupState["onboarding"] }))).toBe("optional_capabilities");
    expect(getNextSetupJourneyStep(makeState())).toBe("foundation");
  });

  it("allows activation only when every selected module has server-confirmed prerequisites", () => {
    expect(areSelectedModuleRequirementsReady(makeState())).toBe(false);
    expect(areSelectedModuleRequirementsReady(makeState({
      modules: [{
        module_key: "finance",
        is_configuration_module: false,
        is_selected: true,
        is_operational: false,
        requirements_satisfied: true,
        lifecycle: "selected_pending_org_setup",
      }],
    }))).toBe(true);
    expect(areSelectedModuleRequirementsReady(makeState({ modules: [] }))).toBe(false);
  });

  it("opens the operational system only when all selected modules are active and none are pending", () => {
    expect(isSetupLaunchReady(makeState({
      setup_required: false,
      active_module_keys: ["finance"],
      pending_module_keys: [],
    }))).toBe(true);
    expect(isSetupLaunchReady(makeState({
      setup_required: false,
      active_module_keys: [],
      pending_module_keys: [],
    }))).toBe(false);
    expect(isSetupLaunchReady(makeState({
      setup_required: false,
      active_module_keys: ["finance"],
      pending_module_keys: ["hr"],
    }))).toBe(false);
  });
});
