import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const source = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("standalone phased setup onboarding", () => {
  it("keeps setup outside the operational MainLayout and protects it with its own authenticated shell", () => {
    const page = source("app/setup/page.tsx");
    const layout = source("app/setup/layout.tsx");

    expect(page).not.toContain("MainLayout");
    expect(layout).not.toContain("SideNavigationBar");
    expect(layout).toContain("verifySetupAccess");
    expect(layout).toContain("setup_required");
  });

  it("renders one guarded guided-setup journey before optional capability activation", () => {
    const page = source("app/setup/page.tsx");
    const moduleSelection = source("app/setup/components/SetupModuleSelection.tsx");
    const journey = source("app/setup/components/SetupJourneyStepper.tsx");

    expect(page.indexOf("<SetupJourneyStepper")).toBeLessThan(page.indexOf("<SetupModuleSelection"));
    expect(page).toContain("journeyStep");
    expect(page).toContain("optional_capabilities");
    expect(journey).toContain("onPrevious");
    expect(journey).toContain("onNext");
    expect(moduleSelection).toContain("coreModuleKeys");
    expect(moduleSelection).toContain("canActivate");
    expect(moduleSelection).toContain("setup-module-group-included");
    expect(moduleSelection).toContain("optionalTitle");
  });

  it("refreshes readiness after every successful save and edits existing operating links instead of recreating resources", () => {
    const page = source("app/setup/page.tsx");
    const scope = source("app/setup/components/SetupOperatingScopeSection.tsx");
    const accounting = source("app/setup/components/SetupAccountingSection.tsx");
    const englishCatalog = source("lib/i18n/catalog/en-US.ts");

    expect(page).toContain("await load();");
    expect(page).toContain("pos_terminal_id: posTerminalId");
    expect(page).toContain("saveWorkingUnit");
    expect(scope).toContain("posTerminalId");
    expect(scope).not.toContain("warehouseCode");
    expect(scope).not.toContain("profitCenterId");
    expect(accounting).toContain("chartReady");
    expect(accounting).toContain("periodReady");
    expect(englishCatalog).toContain("Profit-center ownership remains on the organizational unit");
  });

  it("uses the professional organizational architecture workspace rather than the flat node form", () => {
    const page = source("app/setup/page.tsx");
    const workspace = source("app/setup/components/OrganizationArchitectureWorkspace.tsx");

    expect(page).toContain("<OrganizationArchitectureWorkspace");
    expect(page).not.toContain("<SetupOrganizationSection");
    expect(page).toContain("ORG.TOPOLOGY_RULES");
    expect(page).toContain("ORG.INTEGRITY_CHECK");
    expect(workspace).toContain("ORG.SCOPE_CONTEXT");
    expect(workspace).toContain("validParentNodes");
    expect(workspace).toContain("foundation");
    expect(workspace).toContain("core_operations");
    expect(workspace).toContain("extensions");
  });

  it("resolves organizational attribute keys to bilingual professional labels", () => {
    const workspace = source("app/setup/components/OrganizationArchitectureWorkspace.tsx");
    const englishCatalog = source("lib/i18n/catalog/en-US.ts");
    const arabicCatalog = source("lib/i18n/catalog/ar-SA.ts");

    expect(workspace).toContain("ATTRIBUTE_LABEL_KEYS");
    expect(workspace).toContain("labelForAttribute(attribute.attribute_key)");
    expect(workspace).toContain("readableAttributeFallback");
    expect(workspace).not.toContain("{attribute.attribute_key}{attribute.is_mandatory");
    expect(englishCatalog).toMatch(
      /['"]enterpriseCore\.orgWorkspace\.attribute\.countryCode['"]:\s*['"]Country \/ region code['"]/
    );
    expect(englishCatalog).toMatch(
      /['"]enterpriseCore\.orgWorkspace\.attribute\.fiscalYearVariant['"]:\s*['"]Fiscal year structure['"]/
    );
    expect(arabicCatalog).toMatch(
      /['"]enterpriseCore\.orgWorkspace\.attribute\.countryCode['"]:\s*['"]رمز الدولة أو الإقليم['"]/
    );
    expect(arabicCatalog).toMatch(
      /['"]enterpriseCore\.orgWorkspace\.attribute\.fiscalYearVariant['"]:\s*['"]هيكل السنة المالية['"]/
    );
  });

  it("loads organizational currencies and chart-of-account references from live financial records", () => {
    const page = source("app/setup/page.tsx");
    const workspace = source("app/setup/components/OrganizationArchitectureWorkspace.tsx");
    const englishCatalog = source("lib/i18n/catalog/en-US.ts");
    const arabicCatalog = source("lib/i18n/catalog/ar-SA.ts");

    expect(page).toContain("FINANCE.FOREIGN_EXCHANGE.CURRENCIES.BASE");
    expect(page).toContain("organizationReferenceOptions");
    expect(page).toContain("currency_id: currencies.map");
    expect(page).toContain("PRIMARY_GENERAL_LEDGER_REFERENCE");
    expect(page).toMatch(/setAccounts\(listFrom\(accountsResponse\)\.filter\(\(item\) => item\.is_active !== false\)\)/);
    expect(page).toContain("hasGovernedLedger");
    expect(workspace).toContain("referenceOptionsByAttribute");
    expect(workspace).toContain("SearchableSelect");
    expect(workspace).toContain("referenceHelpForAttribute");
    expect(englishCatalog).toContain("Only active currencies defined in Currency Management are offered");
    expect(englishCatalog).toContain("This is not a choice of one posting account");
    expect(arabicCatalog).toContain("لا يستخدم النظام قائمة عملات افتراضية");
    expect(arabicCatalog).toContain("لا يمثل هذا اختيار حساب ترحيل مفرد");
  });

  it("uses a controlled fiscal-year structure rather than an unbounded free-text value", () => {
    const workspace = source("app/setup/components/OrganizationArchitectureWorkspace.tsx");
    const englishCatalog = source("lib/i18n/catalog/en-US.ts");
    const arabicCatalog = source("lib/i18n/catalog/ar-SA.ts");

    expect(workspace).toMatch(/const CALENDAR_YEAR_VARIANT = ['"]K4['"]/);
    expect(workspace).toMatch(/attribute\.attribute_key === ['"]fiscal_year_variant['"]/);
    expect(workspace).toContain("fiscalYearVariant.calendarYear");
    expect(englishCatalog).toContain("Fiscal year structure");
    expect(arabicCatalog).toContain("هيكل السنة المالية");
  });

  it("loads factory calendars from controlled reference data for plants", () => {
    const page = source("app/setup/page.tsx");
    const workspace = source("app/setup/components/OrganizationArchitectureWorkspace.tsx");
    const englishCatalog = source("lib/i18n/catalog/en-US.ts");
    const arabicCatalog = source("lib/i18n/catalog/ar-SA.ts");

    expect(page).toContain("ORG.FACTORY_CALENDARS");
    expect(page).toContain("factory_calendar_id: factoryCalendars.map");
    expect(workspace).toMatch(/ReferenceAttributeKey\s*=\s*[^;]*['"]factory_calendar_id['"]/);
    expect(workspace).toContain("reference.factoryCalendar.help");
    expect(englishCatalog).toContain("arbitrary calendar codes are not accepted");
    expect(arabicCatalog).toContain("لا يسمح النظام بإدخال رمز تقويم حر");
  });

  it("exposes interface-language settings from the setup shell while keeping company-code language controlled and separate", () => {
    const layout = source("app/setup/layout.tsx");
    const workspace = source("app/setup/components/OrganizationArchitectureWorkspace.tsx");
    const englishCatalog = source("lib/i18n/catalog/en-US.ts");
    const arabicCatalog = source("lib/i18n/catalog/ar-SA.ts");

    expect(layout).toContain("setup-top-utility");
    expect(layout).toContain("ApplicationLanguageSettingsTab");
    expect(workspace).toContain("SUPPORTED_LANGUAGE_OPTIONS");
    expect(workspace).toMatch(/attribute\.attribute_key === ['"]language['"]/);
    expect(englishCatalog).toContain("It does not change the current user's application interface language");
    expect(arabicCatalog).toContain("ولا تغيّر لغة واجهة التطبيق للمستخدم الحالي");
  });

  it("emits setup in the static catch-all parameter set", () => {
    const virtualRoute = source("app/[...virtual]/page.tsx");

    expect(virtualRoute).toMatch(/paths\.set\(["']setup["'], \{ virtual: \[["']setup["']\] \}\)/);
  });
});
