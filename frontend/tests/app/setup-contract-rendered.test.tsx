import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SetupFeedbackMessages } from "../../app/setup/components/SetupFeedbackMessages";
import { SetupJourneyStepper, type SetupJourneyStep } from "../../app/setup/components/SetupJourneyStepper";
import { SetupOperatingScopeSection } from "../../app/setup/components/SetupOperatingScopeSection";
import { getSetupDirection, getSetupScopeCapabilities } from "../../app/setup/setup-workflow";
import type { SetupRequirement } from "../../app/setup/types";
import type { ComponentProps } from "react";

type ScopeProps = ComponentProps<typeof SetupOperatingScopeSection>;

const setupRequirement = (key: string): SetupRequirement => ({
  key,
  phase: key.startsWith("node_type:") ? "common_organization" : "cross_family",
  required_by_module_keys: ["test"],
});

const baseScopeProps: ScopeProps = {
  title: "Company and operating context",
  description: "Use only selected-module resources.",
  foundationComplete: true,
  foundationRequiredLabel: "Complete foundation first",
  workingUnitLabel: "Legal entity or working unit",
  workingUnitCodeLabel: "Unit code",
  workingUnitNameLabel: "Unit name",
  saveWorkingUnitLabel: "Save unit details",
  costCenterLabel: "Cost center",
  profitCenterLabel: "Profit center",
  warehouseLabel: "Warehouse",
  pointOfSaleLabel: "Point of sale",
  linkedWarehouseLabel: "Linked warehouse",
  linkedCostCenterLabel: "Linked cost center",
  linkedProfitCenterLabel: "Linked profit center",
  missingLinkedResourceLabel: "No confirmed link",
  contextHelper: "Resource choices follow the live requirement queue.",
  saveLabel: "Save context",
  requiresCostCenter: false,
  requiresProfitCenter: false,
  requiresWarehouse: false,
  requiresPosTerminal: false,
  workingUnit: "company-node",
  workingUnitCode: "CO-01",
  workingUnitName: "Example Company",
  warehouseId: null,
  costCenterId: null,
  profitCenterId: null,
  posTerminalId: null,
  linkedWarehouseSummary: null,
  linkedCostCenterSummary: null,
  linkedProfitCenterSummary: null,
  nodeOptions: [{ value: "company-node", label: "CO-01 — Company code" }],
  costOptions: [{ value: 5, label: "CC-05 — Payroll" }],
  profitOptions: [{ value: 7, label: "PC-07 — Operations" }],
  warehouseOptions: [{ value: 2, label: "WH-02 — Main warehouse" }],
  posOptions: [{ value: 3, label: "POS-03 — Front counter" }],
  isSaving: false,
  onWorkingUnitChange: () => undefined,
  onWorkingUnitCodeChange: () => undefined,
  onWorkingUnitNameChange: () => undefined,
  onSaveWorkingUnit: () => undefined,
  onWarehouseChange: () => undefined,
  onCostCenterChange: () => undefined,
  onProfitCenterChange: () => undefined,
  onPosTerminalChange: () => undefined,
  onSave: () => undefined,
};

const steps: SetupJourneyStep[] = [
  { id: "module_selection", title: "Select modules", description: "Choose modules", complete: true, enabled: true },
  { id: "foundation", title: "Foundation", description: "Save legal entity", complete: false, enabled: true },
  { id: "operating_links", title: "Operating links", description: "Link required resources", complete: false, enabled: false },
  { id: "optional_capabilities", title: "Activation", description: "Activate ready modules", complete: false, enabled: false },
];

describe("setup UI contract and accessibility", () => {
  it.each([
    ["ar-SA", "rtl", "التالي"],
    ["en-US", "ltr", "Next"],
  ] as const)("renders semantic, keyboard-operable journey controls in %s", (locale, direction, nextLabel) => {
    const markup = renderToStaticMarkup(
      <LocaleProvider initialLocale={locale}>
        <div dir={getSetupDirection(locale)}>
          <SetupJourneyStepper
            steps={steps}
            activeStep="module_selection"
            previousLabel={locale === "ar-SA" ? "السابق" : "Previous"}
            nextLabel={nextLabel}
            completeLabel={locale === "ar-SA" ? "مكتمل" : "Complete"}
            onPrevious={() => undefined}
            onNext={() => undefined}
            onStepSelect={() => undefined}
          />
        </div>
      </LocaleProvider>,
    );

    expect(markup).toContain(`<div dir="${direction}">`);
    expect(markup).toContain("<ol");
    expect(markup).toContain("aria-current=\"step\"");
    expect(markup).toContain("type=\"button\"");
    expect(markup).toContain("aria-label=\"1. Select modules.");
    expect(markup).toContain("disabled=\"\"");
    expect(markup).toContain(nextLabel);
  });

  it("renders error, stale-state, and saved-draft notices with announced roles", () => {
    const markup = renderToStaticMarkup(
      <SetupFeedbackMessages staleMessage="Server state changed" draftMessage="Unsaved draft" errorMessage="Unable to load setup" />,
    );

    expect(markup).toContain("role=\"alert\" aria-live=\"assertive\">Server state changed");
    expect(markup).toContain("role=\"status\" aria-live=\"polite\">Unsaved draft");
    expect(markup).toContain("role=\"alert\" aria-live=\"assertive\">Unable to load setup");
  });

  it("renders inventory-only scope with a warehouse selector but no point-of-sale or center prompts", () => {
    const capabilities = getSetupScopeCapabilities([
      setupRequirement("working_unit"),
      setupRequirement("operating_context"),
      setupRequirement("warehouse"),
    ]);
    expect(capabilities.requiresWarehouse).toBe(true);
    expect(capabilities.requiresPosTerminal).toBe(false);
    expect(capabilities.requiresCostCenter).toBe(false);
    expect(capabilities.requiresProfitCenter).toBe(false);

    const markup = renderToStaticMarkup(
      <LocaleProvider initialLocale="ar-SA">
        <SetupOperatingScopeSection {...baseScopeProps} {...capabilities} />
      </LocaleProvider>,
    );
    expect(markup).toContain("id=\"setup-warehouse\"");
    expect(markup).not.toContain("id=\"setup-pos-terminal\"");
    expect(markup).not.toContain("id=\"setup-cost-center\"");
    expect(markup).not.toContain("id=\"setup-profit-center\"");
  });

  it("renders Finance/HR centers without retail warehouse/POS controls", () => {
    const capabilities = getSetupScopeCapabilities([
      setupRequirement("node_type:COST_CENTER"),
      setupRequirement("node_type:PROFIT_CENTER"),
    ]);
    expect(capabilities.requiresWarehouse).toBe(false);
    expect(capabilities.requiresPosTerminal).toBe(false);

    const markup = renderToStaticMarkup(
      <LocaleProvider initialLocale="en-US">
        <SetupOperatingScopeSection {...baseScopeProps} {...capabilities} requiresCostCenter />
      </LocaleProvider>,
    );
    expect(markup).toContain("id=\"setup-cost-center\"");
    expect(markup).not.toContain("id=\"setup-warehouse\"");
    expect(markup).not.toContain("id=\"setup-pos-terminal\"");
    expect(markup).not.toContain("Warehouse linked to the point of sale");
  });

  it("shows the server-listed warehouse and centers for a selected POS instead of asking for IDs", () => {
    const capabilities = getSetupScopeCapabilities([
      setupRequirement("working_unit"),
      setupRequirement("operating_context"),
      setupRequirement("warehouse"),
      setupRequirement("pos_terminal"),
      setupRequirement("node_type:COST_CENTER"),
      setupRequirement("node_type:PROFIT_CENTER"),
    ]);

    const markup = renderToStaticMarkup(
      <LocaleProvider initialLocale="en-US">
        <SetupOperatingScopeSection
          {...baseScopeProps}
          {...capabilities}
          requiresCostCenter
          requiresProfitCenter
          posTerminalId={3}
          linkedWarehouseSummary="WH-02 — Main warehouse"
          linkedCostCenterSummary="CC-05 — Payroll"
          linkedProfitCenterSummary="PC-07 — Operations"
        />
      </LocaleProvider>,
    );
    expect(markup).toContain("id=\"setup-pos-terminal\"");
    expect(markup).not.toContain("id=\"setup-warehouse\"");
    expect(markup).toContain("WH-02 — Main warehouse");
    expect(markup).toContain("CC-05 — Payroll");
    expect(markup).toContain("PC-07 — Operations");
    expect(markup).not.toContain("warehouse_id");
    expect(markup).not.toContain("pos_terminal_id");
  });
});
