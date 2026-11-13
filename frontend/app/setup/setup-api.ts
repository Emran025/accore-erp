import type { APIResponse } from "@/lib/api";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { AdaptiveQuestion } from "./components/AdaptiveQuestionStepper";
import type { BlueprintData, EvaluationData } from "./components/BlueprintReviewCard";
import type {
  Item,
  OrganizationProfile,
  OrganizationTemplateState,
  OrgNode,
  Readiness,
  SetupState,
} from "./types";

export type SetupListPayload<T> = T[] | { data?: T[] };

export type CenterOption = {
  id: number;
  code: string;
  name: string;
  name_en?: string | null;
  is_active?: boolean;
  structure_node_uuid?: string | null;
};

export type WarehouseOption = {
  id: number;
  code: string;
  name: string;
  name_en?: string | null;
  org_node_uuid?: string | null;
  cost_center_id?: number | null;
  profit_center_id?: number | null;
  status: string;
  is_active: boolean;
};

export type PosTerminalOption = {
  id: number;
  code: string;
  name: string;
  name_en?: string | null;
  warehouse_id: number;
  cost_center_id?: number | null;
  profit_center_id?: number | null;
  status: string;
  is_active: boolean;
};

export type AccountOption = {
  id: number;
  account_code: string;
  account_name: string;
  account_type: string;
  parent_id: number | null;
  is_active: boolean;
};

export type FiscalPeriodOption = {
  id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  is_locked: boolean;
};

export type CreateAccountRequest = {
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
};

export type CreateFiscalPeriodRequest = {
  period_name: string;
  start_date: string;
  end_date: string;
};

export type OperatingContextRequest = {
  org_node_uuid: string;
  cost_center_id?: number | null;
  profit_center_id?: number | null;
  warehouse_id?: number | null;
  pos_terminal_id?: number | null;
};

export type OperatingContextRecord = {
  id: number;
  org_node_uuid: string;
  warehouse_id: number | null;
  pos_terminal_id: number | null;
  cost_center_id: number | null;
  profit_center_id: number | null;
  status: "draft" | "ready" | string;
  warehouse?: WarehouseOption | null;
  pos_terminal?: PosTerminalOption | null;
  cost_center?: CenterOption | null;
  profit_center?: CenterOption | null;
};

export type ModuleSelectionResponse = SetupState;

export type ModuleActivationResponse = {
  activation: {
    activated: string[];
    pending: Record<string, string[]>;
  };
  state: SetupState;
};

export type ApplyOrganizationTemplateResponse = {
  application: Record<string, unknown>;
  state: SetupState;
};

export type OrganizationNodeUpdateRequest = {
  code: string;
  attributes: Record<string, unknown>;
};

export type SetupBlueprint = BlueprintData;

export type SetupInferenceRequest = {
  description: string;
  company_name?: string;
  country_code?: string;
  currency_id?: number;
  structured?: Record<string, unknown>;
};

export type SetupInferenceResponse = {
  evaluation: EvaluationData;
  signals?: unknown;
  adaptive_questions?: AdaptiveQuestion[];
  blueprint?: SetupBlueprint;
};

export type BlueprintStageRequest = {
  name: string;
  archetype_id: string;
  blueprint_json: SetupBlueprint;
};

export type BlueprintStageResponse = { blueprint_uuid: string };

export type BlueprintPublishRequest = {
  clear_existing: boolean;
  create_operating_context: boolean;
};

function post<T>(endpoint: string, payload: unknown): Promise<APIResponse<T>> {
  return fetchAPI<T>(endpoint, { method: "POST", body: JSON.stringify(payload) });
}

export const setupApi = {
  getState: (): Promise<APIResponse<SetupState>> =>
    fetchAPI<SetupState>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.STATE),
  getOrganizationTemplates: (): Promise<APIResponse<OrganizationTemplateState>> =>
    fetchAPI<OrganizationTemplateState>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.ORGANIZATION_TEMPLATES),
  saveOrganizationProfile: (profile: OrganizationProfile): Promise<APIResponse<OrganizationProfile>> =>
    post<OrganizationProfile>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.ORGANIZATION_PROFILE, profile),
  applyOrganizationTemplate: (): Promise<APIResponse<ApplyOrganizationTemplateResponse>> =>
    fetchAPI<ApplyOrganizationTemplateResponse>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.APPLY_ORGANIZATION_TEMPLATE, { method: "POST" }),
  selectModules: (moduleKeys: string[]): Promise<APIResponse<ModuleSelectionResponse>> =>
    post<ModuleSelectionResponse>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.MODULES, { module_keys: moduleKeys }),
  activateSelectedModules: (): Promise<APIResponse<ModuleActivationResponse>> =>
    fetchAPI<ModuleActivationResponse>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.ACTIVATE_SELECTED, { method: "POST" }),
  getReadiness: (): Promise<APIResponse<Readiness>> =>
    fetchAPI<Readiness>(API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.READINESS),
  getOrganizationNodes: (): Promise<APIResponse<SetupListPayload<OrgNode>>> =>
    fetchAPI<SetupListPayload<OrgNode>>(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODES),
  updateOrganizationNode: (uuid: string, request: OrganizationNodeUpdateRequest): Promise<APIResponse<OrgNode>> =>
    fetchAPI<OrgNode>(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODE(uuid), {
      method: "PUT",
      body: JSON.stringify(request),
    }),
  configureOperatingContext: (request: OperatingContextRequest): Promise<APIResponse<OperatingContextRecord>> =>
    post<OperatingContextRecord>(API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.CONFIGURE, request),
  getWarehouses: (): Promise<APIResponse<SetupListPayload<WarehouseOption>>> =>
    fetchAPI<SetupListPayload<WarehouseOption>>(`${API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.WAREHOUSES}?active_only=1`),
  getPosTerminals: (): Promise<APIResponse<SetupListPayload<PosTerminalOption>>> =>
    fetchAPI<SetupListPayload<PosTerminalOption>>(`${API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.POS_TERMINALS}?active_only=1`),
  getCostCenters: (): Promise<APIResponse<SetupListPayload<CenterOption>>> =>
    fetchAPI<SetupListPayload<CenterOption>>(`${API_ENDPOINTS.FINANCE.COST_CENTERS.BASE}?limit=500`),
  getProfitCenters: (): Promise<APIResponse<SetupListPayload<CenterOption>>> =>
    fetchAPI<SetupListPayload<CenterOption>>(`${API_ENDPOINTS.FINANCE.PROFIT_CENTERS.BASE}?limit=500`),
  getCurrencies: (): Promise<APIResponse<SetupListPayload<Item>>> =>
    fetchAPI<SetupListPayload<Item>>(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.BASE),
  getFactoryCalendars: (): Promise<APIResponse<SetupListPayload<Item>>> =>
    fetchAPI<SetupListPayload<Item>>(API_ENDPOINTS.ENTERPRISE_CORE.ORG.FACTORY_CALENDARS),
  getAccounts: (): Promise<APIResponse<SetupListPayload<AccountOption>>> =>
    fetchAPI<SetupListPayload<AccountOption>>(`${API_ENDPOINTS.FINANCE.ACCOUNTS.BASE}?limit=500`),
  getFiscalPeriods: (): Promise<APIResponse<SetupListPayload<FiscalPeriodOption>>> =>
    fetchAPI<SetupListPayload<FiscalPeriodOption>>(`${API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE}?limit=500`),
  createAccount: (request: CreateAccountRequest): Promise<APIResponse<AccountOption>> =>
    post<AccountOption>(API_ENDPOINTS.FINANCE.ACCOUNTS.BASE, request),
  createFiscalPeriod: (request: CreateFiscalPeriodRequest): Promise<APIResponse<FiscalPeriodOption>> =>
    post<FiscalPeriodOption>(API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE, request),
  ensureStandardChart: (): Promise<APIResponse<{ data: { account_count: number } }>> =>
    fetchAPI<{ data: { account_count: number } }>(API_ENDPOINTS.FINANCE.ACCOUNTS.STANDARD, { method: "POST" }),
  analyzeSetup: (request: SetupInferenceRequest): Promise<APIResponse<SetupInferenceResponse>> =>
    post<SetupInferenceResponse>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.INFERENCE_ANALYZE, request),
  stageBlueprint: (request: BlueprintStageRequest): Promise<APIResponse<BlueprintStageResponse>> =>
    post<BlueprintStageResponse>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.BLUEPRINT_STAGE, request),
  publishBlueprint: (uuid: string, request: BlueprintPublishRequest): Promise<APIResponse<Record<string, unknown>>> =>
    post<Record<string, unknown>>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.BLUEPRINT_PUBLISH(uuid), request),
};
