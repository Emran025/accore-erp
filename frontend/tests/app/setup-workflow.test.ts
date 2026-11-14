import { describe, expect, it } from "vitest";
import type { OrganizationProfile, Readiness, SetupState } from "../../app/setup/types";
import {
  areSelectedModuleRequirementsReady,
  canNavigateToSetupStep,
  createSetupLoadSequence,
  detectStaleSetupState,
  getNextSetupJourneyStep,
  getSetupDirection,
  getSetupInferenceContextSignature,
  getSetupScopeCapabilities,
  hasActivatableSelectedModule,
  hasServerConfirmedModuleSelection,
  isSetupLaunchReady,
  resolveSetupReturnDestination,
  DEFAULT_SETUP_DASHBOARD_ROUTE,
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

  it("navigates only to steps supported by the latest server-confirmed phases", () => {
    const readyState = makeState({
      selected_module_keys: ["general_ledger"],
      onboarding: {
        next_phase: "module_activation",
        phases: { foundation: { ready: true }, core_operations: { ready: true } },
      } as SetupState["onboarding"],
    });
    expect(canNavigateToSetupStep("foundation", readyState)).toBe(true);
    expect(canNavigateToSetupStep("optional_capabilities", readyState)).toBe(true);
    expect(canNavigateToSetupStep("operating_links", readyState)).toBe(false);
    expect(canNavigateToSetupStep("operating_links", {
      ...readyState,
      requirement_queue: [{ key: "warehouse", phase: "cross_family", required_by_module_keys: ["products"] }],
    })).toBe(true);
    expect(canNavigateToSetupStep("optional_capabilities", makeState({ selected_module_keys: [] }))).toBe(false);
    expect(canNavigateToSetupStep("module_selection", makeState({ selected_module_keys: [] }))).toBe(true);
  });

  it("signs all inference-relevant company fields so profile changes invalidate previews", () => {
    const profile: OrganizationProfile = {
      template_key: "services",
      industry: "services",
      organization_size: "small",
      company_name: "Example Company",
      company_code: "EX-01",
      country_code: "YE",
      currency_id: 1,
      inventory_enabled: false,
    };
    const original = getSetupInferenceContextSignature(profile, "services");
    expect(getSetupInferenceContextSignature({ ...profile, country_code: "SA" }, "services")).not.toBe(original);
    expect(getSetupInferenceContextSignature({ ...profile, currency_id: 2 }, "services")).not.toBe(original);
    expect(getSetupInferenceContextSignature(profile, "retail")).not.toBe(original);
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

  it("opens on the required starter bundle even when an optional selected module remains pending", () => {
    const state = makeState({
      setup_required: false,
      selected_module_keys: ["general_ledger", "projects"],
      active_module_keys: ["general_ledger"],
      pending_module_keys: ["projects"],
      modules: [
        {
          module_key: "general_ledger",
          is_configuration_module: false,
          is_selected: true,
          is_operational: true,
          requirements_satisfied: true,
          lifecycle: "active",
        },
        {
          module_key: "projects",
          is_configuration_module: false,
          is_selected: true,
          is_operational: false,
          requirements_satisfied: false,
          lifecycle: "selected_pending_org_setup",
        },
      ],
      onboarding: {
        next_phase: "module_activation",
        starter_module_keys: ["general_ledger"],
        starter_bundle_active: true,
      } as SetupState["onboarding"],
    });
    expect(isSetupLaunchReady(state)).toBe(true);
    expect(hasActivatableSelectedModule(state)).toBe(false);
    expect(hasActivatableSelectedModule({
      ...state,
      modules: state.modules.map((module) => module.module_key === "projects"
        ? { ...module, requirements_satisfied: true }
        : module),
    })).toBe(true);
    expect(isSetupLaunchReady(makeState({
      setup_required: false,
      active_module_keys: [],
      pending_module_keys: [],
    }))).toBe(false);
    expect(isSetupLaunchReady(makeState({
      setup_required: false,
      selected_module_keys: ["general_ledger"],
      active_module_keys: ["general_ledger"],
      onboarding: {
        next_phase: "module_activation",
        starter_module_keys: ["general_ledger", "sales"],
        starter_bundle_active: false,
      } as SetupState["onboarding"],
    }))).toBe(false);
  });

  it("allows only internal return paths owned by an operational module", () => {
    const state = makeState({
      setup_required: false,
      selected_module_keys: ["general_ledger", "projects"],
      active_module_keys: ["general_ledger"],
      pending_module_keys: ["projects"],
      modules: [
        { module_key: "general_ledger", is_configuration_module: false, is_selected: true, is_operational: true, requirements_satisfied: true, lifecycle: "active" },
        { module_key: "projects", is_configuration_module: false, is_selected: true, is_operational: false, requirements_satisfied: false, lifecycle: "selected_pending_org_setup" },
      ],
      onboarding: { next_phase: "module_activation", starter_module_keys: ["general_ledger"], starter_bundle_active: true } as SetupState["onboarding"],
    });

    expect(resolveSetupReturnDestination("/03-finance/general-ledger/ledger-core/chart-of-accounts", state))
      .toBe("/03-finance/general-ledger/ledger-core/chart-of-accounts");
    expect(resolveSetupReturnDestination("/07-projects/project-planning", state)).toBe(DEFAULT_SETUP_DASHBOARD_ROUTE);
    expect(resolveSetupReturnDestination("//attacker.example/path", state)).toBe(DEFAULT_SETUP_DASHBOARD_ROUTE);
    expect(resolveSetupReturnDestination("/unmapped/internal/path", state)).toBe(DEFAULT_SETUP_DASHBOARD_ROUTE);
    expect(resolveSetupReturnDestination("/03-finance/general-ledger/ledger-core/chart-of-accounts?tab=accounts#root", state))
      .toBe("/03-finance/general-ledger/ledger-core/chart-of-accounts?tab=accounts#root");
    expect(resolveSetupReturnDestination("/03-finance/general-ledger/../platform/setup", state)).toBe(DEFAULT_SETUP_DASHBOARD_ROUTE);
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

  it("detects cross-tab profile country and currency changes", () => {
    const current = makeState({
      organization_template: {
        profile: {
          template_key: "services", industry: "services", organization_size: "small", company_name: "Example",
          company_code: "EX", country_code: "YE", currency_id: 1, inventory_enabled: false,
        },
        templates: [], is_applied: false, can_apply: true,
      },
    });
    const incoming = {
      ...current,
      organization_template: {
        ...current.organization_template!,
        profile: { ...current.organization_template!.profile!, country_code: "SA", currency_id: 2 },
      },
    };
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
