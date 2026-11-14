import type { OrganizationProfile } from "./types";

export const SETUP_FORM_DRAFT_KEY = "accore_erp_setup_form_draft";
export type SetupAccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type SetupFormDraft = {
  moduleSelection?: { selectedModuleKeys: string[] };
  organizationProfile?: { profile: OrganizationProfile; selectedTemplateKey: string };
  operatingScope?: {
    workingUnit: string;
    warehouseId: number | null;
    costCenterId: number | null;
    profitCenterId: number | null;
    posTerminalId: number | null;
  };
  workingUnitDetails?: { workingUnitCode: string; workingUnitName: string };
  account?: { accountCode: string; accountName: string; accountType: SetupAccountType };
  fiscalPeriod?: { periodName: string; periodStart: string; periodEnd: string };
};

type SetupDraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const accountTypes = new Set<SetupAccountType>(["asset", "liability", "equity", "revenue", "expense"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function nullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isOrganizationProfile(value: unknown): value is OrganizationProfile {
  if (!isRecord(value)) return false;
  return typeof value.template_key === "string"
    && typeof value.industry === "string"
    && ["micro", "small", "medium", "enterprise"].includes(String(value.organization_size))
    && typeof value.company_name === "string"
    && typeof value.company_code === "string"
    && typeof value.country_code === "string"
    && typeof value.currency_id === "number"
    && typeof value.inventory_enabled === "boolean";
}

function safeStorage(): SetupDraftStorage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readSetupFormDraft(storage: SetupDraftStorage | undefined = safeStorage()): SetupFormDraft {
  if (!storage) return {};
  try {
    const parsed: unknown = JSON.parse(storage.getItem(SETUP_FORM_DRAFT_KEY) ?? "{}");
    if (!isRecord(parsed)) return {};
    const result: SetupFormDraft = {};

    if (isRecord(parsed.moduleSelection) && isStringArray(parsed.moduleSelection.selectedModuleKeys)) {
      result.moduleSelection = { selectedModuleKeys: parsed.moduleSelection.selectedModuleKeys };
    }
    if (isRecord(parsed.organizationProfile)
      && isOrganizationProfile(parsed.organizationProfile.profile)
      && typeof parsed.organizationProfile.selectedTemplateKey === "string") {
      result.organizationProfile = {
        profile: parsed.organizationProfile.profile,
        selectedTemplateKey: parsed.organizationProfile.selectedTemplateKey,
      };
    }
    if (isRecord(parsed.operatingScope)
      && typeof parsed.operatingScope.workingUnit === "string"
      && nullableNumber(parsed.operatingScope.warehouseId)
      && nullableNumber(parsed.operatingScope.costCenterId)
      && nullableNumber(parsed.operatingScope.profitCenterId)
      && nullableNumber(parsed.operatingScope.posTerminalId)) {
      result.operatingScope = {
        workingUnit: parsed.operatingScope.workingUnit,
        warehouseId: parsed.operatingScope.warehouseId,
        costCenterId: parsed.operatingScope.costCenterId,
        profitCenterId: parsed.operatingScope.profitCenterId,
        posTerminalId: parsed.operatingScope.posTerminalId,
      };
    }
    if (isRecord(parsed.workingUnitDetails)
      && typeof parsed.workingUnitDetails.workingUnitCode === "string"
      && typeof parsed.workingUnitDetails.workingUnitName === "string") {
      result.workingUnitDetails = {
        workingUnitCode: parsed.workingUnitDetails.workingUnitCode,
        workingUnitName: parsed.workingUnitDetails.workingUnitName,
      };
    }
    if (isRecord(parsed.account)
      && typeof parsed.account.accountCode === "string"
      && typeof parsed.account.accountName === "string"
      && accountTypes.has(parsed.account.accountType as SetupAccountType)) {
      result.account = {
        accountCode: parsed.account.accountCode,
        accountName: parsed.account.accountName,
        accountType: parsed.account.accountType as SetupAccountType,
      };
    }
    if (isRecord(parsed.fiscalPeriod)
      && typeof parsed.fiscalPeriod.periodName === "string"
      && typeof parsed.fiscalPeriod.periodStart === "string"
      && typeof parsed.fiscalPeriod.periodEnd === "string") {
      result.fiscalPeriod = {
        periodName: parsed.fiscalPeriod.periodName,
        periodStart: parsed.fiscalPeriod.periodStart,
        periodEnd: parsed.fiscalPeriod.periodEnd,
      };
    }

    return result;
  } catch {
    return {};
  }
}

export function writeSetupFormDraft(draft: SetupFormDraft, storage: SetupDraftStorage | undefined = safeStorage()): void {
  if (!storage) return;
  try {
    if (Object.keys(draft).length === 0) storage.removeItem(SETUP_FORM_DRAFT_KEY);
    else storage.setItem(SETUP_FORM_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage can be unavailable or full; keep the current in-memory draft.
  }
}

export function omitSetupDraftSection<K extends keyof SetupFormDraft>(draft: SetupFormDraft, section: K): SetupFormDraft {
  const { [section]: _removed, ...remaining } = draft;
  return remaining;
}
