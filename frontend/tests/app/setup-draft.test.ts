import { describe, expect, it } from "vitest";
import { omitSetupDraftSection, readSetupFormDraft, SETUP_FORM_DRAFT_KEY, writeSetupFormDraft } from "../../app/setup/setup-draft";
import type { SetupFormDraft } from "../../app/setup/setup-draft";

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    values,
  };
}

const draft: SetupFormDraft = {
  moduleSelection: { selectedModuleKeys: ["general_ledger", "projects"] },
  organizationProfile: {
    profile: {
      template_key: "professional_services",
      industry: "services",
      organization_size: "small",
      company_name: "Example Company",
      company_code: "EX-01",
      country_code: "YE",
      currency_id: 1,
      primary_site_name: "Main site",
      primary_site_code: "SITE-01",
      factory_calendar_id: 3,
      language: "ar-SA",
      inventory_enabled: false,
    },
    selectedTemplateKey: "professional_services",
  },
  operatingScope: {
    workingUnit: "company-node",
    warehouseId: 2,
    costCenterId: null,
    profitCenterId: null,
    posTerminalId: null,
  },
  workingUnitDetails: { workingUnitCode: "EX-01", workingUnitName: "Example Company" },
  account: { accountCode: "1000", accountName: "Cash", accountType: "asset" },
  fiscalPeriod: { periodName: "FY-2026", periodStart: "2026-01-01", periodEnd: "2026-12-31" },
};

describe("setup form drafts", () => {
  it("restores unsaved module, profile, accounting, and operating-scope inputs after refresh", () => {
    const storage = createStorage();
    writeSetupFormDraft(draft, storage);

    expect(storage.values.has(SETUP_FORM_DRAFT_KEY)).toBe(true);
    expect(readSetupFormDraft(storage)).toEqual(draft);
  });

  it("can clear a saved section without discarding other unsaved work", () => {
    const storage = createStorage();
    const remaining = omitSetupDraftSection(draft, "organizationProfile");
    writeSetupFormDraft(remaining, storage);

    expect(readSetupFormDraft(storage)).toEqual(remaining);
    expect(remaining.moduleSelection).toEqual(draft.moduleSelection);
  });

  it("ignores corrupt storage instead of breaking the setup page", () => {
    const storage = createStorage({ [SETUP_FORM_DRAFT_KEY]: "not-json" });
    expect(readSetupFormDraft(storage)).toEqual({});
  });
});
