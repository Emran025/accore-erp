export type Item = Record<string, unknown>;

export type ReadinessCheck = {
  key: string;
  complete: boolean;
};

export type Readiness = {
  ready: boolean;
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
  module_name_ar?: string | null;
  module_name_en?: string | null;
  is_configuration_module: boolean;
  is_selected: boolean;
  is_operational: boolean;
  lifecycle: "configuration_access" | "not_selected" | "selected_pending_readiness" | "active";
};

export type SetupState = {
  setup_required: boolean;
  selected_module_keys: string[];
  active_module_keys: string[];
  pending_module_keys: string[];
  modules: SetupModule[];
};

export type SelectOption = {
  value: string | number;
  label: string;
};
