import { describe, expect, it } from "vitest";
import type { Readiness, SetupState } from "../../app/setup/types";
import {
  areSelectedModuleRequirementsReady,
  createSetupLoadSequence,
  detectStaleSetupState,
  getNextSetupJourneyStep,
  getSetupDirection,
  getSetupScopeCapabilities,
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

  it("resumes a non-retail scope step when server readiness says the selected center context is incomplete", () => {
    const state = makeState({
      onboarding: { next_phase: "module_activation" } as SetupState["onboarding"],
      requirement_queue: [{ key: "node_type:COST_CENTER", phase: "common_organization", required_by_module_keys: ["hr"] }],
    });
    const readiness = { ready: false, structural_readiness: { ready: false } } as Readiness;
    expect(getNextSetupJourneyStep(state, readiness)).toBe("operating_links");
  });

  it("maps Arabic and English locale directions", () => {
    expect(getSetupDirection("ar-SA")).toBe("rtl");
    expect(getSetupDirection("en-US")).toBe("ltr");
  });

  it("derives retail controls from live requirements and omits them for Finance/HR", () => {
    const financeHr = getSetupScopeCapabilities([
      { key: "working_unit", phase: "cross_family", required_by_module_keys: ["general_ledger"] },
      { key: "node_type:COST_CENTER", phase: "common_organization", required_by_module_keys: ["hr"] },
    ]);
    expect(financeHr.requiresWorkingUnit).toBe(true);
    expect(financeHr.requiresWarehouse).toBe(false);
    expect(financeHr.requiresPosTerminal).toBe(false);

    const inventory = getSetupScopeCapabilities([
      { key: "operating_context", phase: "cross_family", required_by_module_keys: ["products"] },
      { key: "warehouse", phase: "cross_family", required_by_module_keys: ["products"] },
    ]);
    expect(inventory.requiresWarehouse).toBe(true);
    expect(inventory.requiresPosTerminal).toBe(false);
    expect(inventory.requiresCostCenter).toBe(false);
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

describe("detectStaleSetupState", () => {
  it("returns false when both states are null", () => {
    expect(detectStaleSetupState(null, null)).toBe(false);
  });

  it("returns false when policy version and selected modules are the same", () => {
    const base = makeState({
      selected_module_keys: ["finance", "sales"],
      onboarding: { next_phase: "foundation", policy_version: "v1" } as SetupState["onboarding"],
    });
    expect(detectStaleSetupState(base, { ...base })).toBe(false);
  });

  it("returns true when policy version differs", () => {
    const current = makeState({
      selected_module_keys: ["finance"],
      onboarding: { next_phase: "foundation", policy_version: "v1" } as SetupState["onboarding"],
    });
    const incoming = makeState({
      selected_module_keys: ["finance"],
      onboarding: { next_phase: "foundation", policy_version: "v2" } as SetupState["onboarding"],
    });
    expect(detectStaleSetupState(current, incoming)).toBe(true);
  });

  it("returns true when selected module keys differ (order-independent)", () => {
    const current = makeState({ selected_module_keys: ["finance", "sales"] });
    const incoming = makeState({ selected_module_keys: ["sales", "hr"] });
    expect(detectStaleSetupState(current, incoming)).toBe(true);
    // same keys in different order → not stale
    const incomingReordered = makeState({ selected_module_keys: ["sales", "finance"] });
    expect(detectStaleSetupState(current, incomingReordered)).toBe(false);
  });

  it("detects server readiness and linked-resource changes independently of module selection", () => {
    const state = makeState();
    const current = { ready: false, structural_readiness: { ready: false }, context: { org_node_uuid: "company-a" } } as Readiness;
    const incoming = { ready: true, structural_readiness: { ready: true }, context: { org_node_uuid: "company-b", warehouse_id: 8 } } as Readiness;
    expect(detectStaleSetupState(state, { ...state }, current, incoming)).toBe(true);
  });
});

describe("latest setup request sequence", () => {
  it("does not apply an older response that resolves after the latest response", async () => {
    const sequence = createSetupLoadSequence();
    const olderId = sequence.begin();
    let resolveOlder!: (value: string) => void;
    const older = new Promise<string>((resolve) => { resolveOlder = resolve; });
    const latestId = sequence.begin();
    let applied = "";

    const latest = Promise.resolve("latest server state").then((value) => {
      if (sequence.isCurrent(latestId)) applied = value;
    });
    await latest;
    resolveOlder("outdated server state");
    const olderCompletion = older.then((value) => {
      if (sequence.isCurrent(olderId)) applied = value;
    });
    await olderCompletion;

    expect(applied).toBe("latest server state");
  });
});
