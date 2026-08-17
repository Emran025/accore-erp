export type Item = Record<string, unknown>;

export type ReadinessCheck = {
  key: string;
  complete: boolean;
};

export type OnboardingPhase = {
  id: "foundation" | "core_operations";
  ready: boolean;
  required_node_types: string[];
  missing_node_types: string[];
  unlinked_node_types?: string[];
  reason_codes: string[];
};

export type Onboarding = {
  policy_version: string;
  profile: string;
  baseline_ready: boolean;
  next_phase: "foundation" | "core_operations" | "module_activation";
  starter_module_keys: string[];
  starter_bundle_active?: boolean;
  missing_starter_module_keys?: string[];
  active_starter_module_keys?: string[];
  phases: {
    foundation: OnboardingPhase;
    core_operations: OnboardingPhase;
  };
};

export type Readiness = {
  ready: boolean;
  onboarding?: Onboarding;
  checks?: ReadinessCheck[];
  missing?: Array<{ key: string }>;
  accounting_readiness?: {
    open_fiscal_period: { ready: boolean };
    chart_of_accounts: { ready: boolean; missing_account_types?: string[] };
  };
};

export type MetaType = {
  id: string;
  display_name: string;
  display_name_ar?: string;
  attributes?: Array<{ attribute_key: string; is_mandatory: boolean }>;
};

export type OrgNode = {
  node_uuid: string;
  node_type_id: string;
  code: string;
  status: string;
  attributes_json?: Record<string, unknown>;
  meta_type?: MetaType;
};

export type SetupModule = {
  module_key: string;
  category?: string;
  module_name_ar?: string | null;
  module_name_en?: string | null;
  is_configuration_module: boolean;
  is_selected: boolean;
  is_operational: boolean;
  lifecycle: "configuration_access" | "not_selected" | "selected_pending_readiness" | "active";
};

export type SetupState = {
  setup_required: boolean;
  onboarding?: Onboarding;
  selected_module_keys: string[];
  active_module_keys: string[];
  pending_module_keys: string[];
  modules: SetupModule[];
};

export type SelectOption = {
  value: string | number;
  label: string;
};
