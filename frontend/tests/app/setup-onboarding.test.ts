import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const source = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("profile-driven setup onboarding", () => {
  it("keeps setup outside the operational MainLayout and protects it with its own authenticated shell", () => {
    const page = source("app/setup/page.tsx");
    const layout = source("app/setup/layout.tsx");

    expect(page).not.toContain("MainLayout");
    expect(layout).not.toContain("SideNavigationBar");
    expect(layout).toContain("verifySetupAccess");
    expect(layout).not.toContain("setup_required");
    expect(page).toContain("!isSetupLaunchReady(fresh.state)");
    expect(page).toContain("router.push(resolveSetupReturnDestination(returnTo, fresh.state))");
  });

  it("starts the guarded journey with module selection before foundation and activation", () => {
    const page = source("app/setup/page.tsx");
    const moduleSelection = source("app/setup/components/SetupModuleSelection.tsx");
    const journey = source("app/setup/components/SetupJourneyStepper.tsx");

    expect(page.indexOf("<SetupJourneyStepper")).toBeLessThan(page.indexOf("<SetupModuleSelection"));
    expect(page).toContain('useState<SetupJourneyStepId>("module_selection")');
    expect(page).toContain('id: "module_selection" as const');
    expect(page).toContain("journeyStep");
    expect(page).toContain("optional_capabilities");
    expect(journey).toContain("onPrevious");
    expect(journey).toContain("onNext");
    expect(moduleSelection).toContain("coreModuleKeys");
    expect(moduleSelection).toContain("const coreModules = businessModules.filter");
    expect(moduleSelection).toContain("{renderGroup(coreModules, false)}");
    expect(page).toContain("state.onboarding?.starter_module_keys");
    expect(moduleSelection).toContain('mode: "selection" | "activation"');
    expect(moduleSelection).toContain("canActivate");
  });

  it("resumes from server state and shows only the resolved requirement queue for selected modules", () => {
    const page = source("app/setup/page.tsx");
    const workflow = source("app/setup/setup-workflow.ts");
    const queue = source("app/setup/components/SetupRequirementQueue.tsx");

    expect(page).toContain("setJourneyStep(getNextSetupJourneyStep(state, incomingReadiness))");
    expect(page).toContain("<SetupRequirementQueue");
    expect(page).toContain("getSetupScopeCapabilities(requirementQueue)");
    expect(page).toContain("scopeCapabilities.requiresPosTerminal");
    expect(page).toContain('journeyStep === "operating_links" && includeOperatingLinksStep');
    expect(workflow).toContain('case "module_activation"');
    expect(queue).toContain("required_by_module_keys");
    expect(queue).toContain("module_name_ar");
  });

  it("does not treat unsaved local edits or unrelated module checks as completed readiness", () => {
    const page = source("app/setup/page.tsx");
    const summary = source("app/setup/components/SetupReadinessSummary.tsx");

    expect(page).not.toContain("hasAccounts ||");
    expect(page).not.toContain("Boolean(workingUnit) ||");
    expect(page).toContain("chartReady={readiness?.accounting_readiness?.chart_of_accounts.ready === true}");
    expect(page).toContain("periodReady={readiness?.accounting_readiness?.open_fiscal_period.ready === true}");
    expect(summary).toContain("dynamicChecks !== undefined");
    expect(summary).toContain("isSetupComplete");
    expect(summary).toContain("formatCompletedCount(completedCount, totalCount)");
    expect(summary).not.toContain("مؤشر تقدم التهيئة والجاهزية التشغيلية");
    expect(page).toContain('progressLabel={i18n.catalog["enterpriseCore.setup.progress.title"]}');
    expect(summary).not.toContain("readiness?.ready === true");
  });

  it("starts from a business profile and safely applies a generated organization template", () => {
    const page = source("app/setup/page.tsx");
    const profile = source("app/setup/components/SetupOrganizationProfileSection.tsx");
    const endpoints = source("lib/endpoints/enterprise-core.ts");

    expect(page).toContain("<SetupOrganizationProfileSection");
    const adapter = source("app/setup/setup-api.ts");

    expect(page).toContain("setupApi.saveOrganizationProfile");
    expect(page).toContain("setupApi.applyOrganizationTemplate");
    expect(adapter).toContain("API_ENDPOINTS.ENTERPRISE_CORE.SETUP.ORGANIZATION_PROFILE");
    expect(adapter).toContain("API_ENDPOINTS.ENTERPRISE_CORE.SETUP.APPLY_ORGANIZATION_TEMPLATE");
    expect(page).not.toContain("<OrganizationArchitectureWorkspace");
    expect(profile).toContain("SegmentedToggle");
    expect(profile).toContain("setup-template-card");
    expect(profile).toContain("primary_site_name");
    expect(profile).toContain("factory_calendar_id");
    expect(endpoints).toContain("ORGANIZATION_TEMPLATES");
    expect(endpoints).toContain("APPLY_ORGANIZATION_TEMPLATE");
  });

  it("refreshes readiness after every successful save and exposes foundation/template state in the header", () => {
    const page = source("app/setup/page.tsx");
    const summary = source("app/setup/components/SetupReadinessSummary.tsx");
    const scope = source("app/setup/components/SetupOperatingScopeSection.tsx");

    expect(page).toContain("await load({ mutationConfirmed: true });");
    expect(page).toContain("const callAndReload = async <T,>");
    expect(page).toContain("templateApplied={templateApplied}");
    expect(page).toContain("onboarding={onboarding}");
    expect(summary).toContain("foundationReady");
    expect(summary).toContain("templateApplied");
    expect(scope).toContain("posTerminalId");
    expect(scope).toContain("warehouseId");
    expect(scope).toContain("profitCenterId");
    expect(scope).toContain("requiresProfitCenter");
  });

  it("refreshes on a conditional-write conflict while preserving the editable draft until a confirmed mutation", () => {
    const page = source("app/setup/page.tsx");

    expect(page).toContain("response.httpStatus === 409 || response.httpStatus === 428");
    expect(page).toContain("await load();\n          setIsStaleState(true);");
    expect(page).toContain("const savedFormDraft = options.mutationConfirmed ? {} : formDraftRef.current;");
    expect(page).toContain("if (changed && !options.mutationConfirmed && !options.acknowledgeStale) setIsStaleState(true)");
    expect(page).toContain("setupRevisionRef.current = incomingRevision");
    expect(page).toContain("const fetchSnapshot = () => Promise.all([");
    expect(page).toContain("new Set(readRevisions).size > 1");
    expect(page).toContain("new Set(retryRevisions).size > 1");
    expect(page).toContain("const invalidateStagedBlueprint = () => {");
    expect(page).toContain("stagedBlueprintRevision");
    expect(page).toContain("blueprint_revision: blueprintRevision!");
  });

  it("uses controlled reference data for organization profile currency and calendar", () => {
    const page = source("app/setup/page.tsx");
    const profile = source("app/setup/components/SetupOrganizationProfileSection.tsx");

    const adapter = source("app/setup/setup-api.ts");

    expect(adapter).toContain("API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.BASE");
    expect(adapter).toContain("API_ENDPOINTS.ENTERPRISE_CORE.ORG.FACTORY_CALENDARS");
    expect(page).toContain("currencyOptions");
    expect(page).toContain("calendarOptions");
    expect(profile).toContain("SearchableSelect");
    expect(profile).toContain("setup-profile-currency");
    expect(profile).toContain("setup-profile-calendar");
  });

  it("keeps the raw organizational graph in the advanced designer instead of onboarding", () => {
    const page = source("app/setup/page.tsx");
    const workspace = source("app/01-enterprise-core/organization-governance/org-structure/org-hierarchy/components/NodeFormPanel.tsx");

    expect(page).not.toContain("OrganizationArchitectureWorkspace");
    expect(workspace).toContain("topologyRules");
    expect(workspace).toContain("dynamicAttrs");
    expect(workspace).toContain("target_node_uuid");
  });

  it("retains controlled accounting and operating-context components", () => {
    const page = source("app/setup/page.tsx");
    const accounting = source("app/setup/components/SetupAccountingSection.tsx");

    expect(page).toContain("<SetupAccountingSection");
    expect(page).toContain("<SetupOperatingScopeSection");
    expect(accounting).toContain("chartReady");
    expect(accounting).toContain("periodReady");
  });

  it("exposes interface-language settings from the setup shell", () => {
    const layout = source("app/setup/layout.tsx");

    expect(layout).toContain("setup-top-utility");
    expect(layout).toContain("ApplicationLanguageSettingsTab");
  });

  it("emits setup in the static catch-all parameter set", () => {
    const virtualRoute = source("app/[...virtual]/page.tsx");

    expect(virtualRoute).toMatch(/paths\.set\(["']setup["'], \{ virtual: \[["']setup["']\] \}\)/);
  });

  it("page.tsx imports detectStaleSetupState from setup-workflow", () => {
    const page = source("app/setup/page.tsx");
    expect(page).toContain("detectStaleSetupState");
  });

  it("page.tsx uses useSearchParams for protected return destination", () => {
    const page = source("app/setup/page.tsx");
    expect(page).toMatch(/returnTo|useSearchParams/);
  });

  it("setup-workflow.ts exports detectStaleSetupState", () => {
    const workflow = source("app/setup/setup-workflow.ts");
    expect(workflow).toContain("export function detectStaleSetupState");
  });

  it("page.tsx calls detectStaleSetupState at a call site inside the load callback", () => {
    const page = source("app/setup/page.tsx");
    // Must be a real call site, not just an import
    expect(page).toContain("detectStaleSetupState(prevSetupStateRef.current");
  });

  it("page.tsx uses i18n catalog key for draft banner — no hardcoded English string", () => {
    const page = source("app/setup/page.tsx");
    expect(page).toContain('i18n.catalog["enterpriseCore.setup.draftBanner"]');
    expect(page).not.toContain('"You have unsaved work');
  });

  it("page.tsx uses i18n catalog key for stale-state banner", () => {
    const page = source("app/setup/page.tsx");
    expect(page).toContain('i18n.catalog["enterpriseCore.setup.staleStateBanner"]');
  });

  it("en-US catalog contains enterpriseCore.setup.draftBanner key", () => {
    const catalog = source("lib/i18n/catalog/en-US.ts");
    expect(catalog).toContain('"enterpriseCore.setup.draftBanner"');
  });

  it("ar-SA catalog contains enterpriseCore.setup.draftBanner key", () => {
    const catalog = source("lib/i18n/catalog/ar-SA.ts");
    expect(catalog).toContain('"enterpriseCore.setup.draftBanner"');
  });
});
