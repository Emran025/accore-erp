import { describe, expect, it } from "vitest";
import { buildSetupRequirementQueueItems } from "../../app/setup/components/SetupRequirementQueue";
import type { SetupModule, SetupRequirement } from "../../app/setup/types";

const salesModule: SetupModule = {
  module_key: "sales",
  module_name_ar: "المبيعات",
  module_name_en: "Sales",
  is_configuration_module: false,
  is_selected: true,
  is_operational: false,
  requirements_satisfied: false,
  lifecycle: "selected_pending_org_setup",
};

const requirements: SetupRequirement[] = [
  { key: "chart_of_accounts", phase: "cross_family", required_by_module_keys: ["sales"] },
  { key: "node_type:PLANT", phase: "module_specific", required_by_module_keys: ["sales"] },
];

const labels = {
  chart_of_accounts: "دليل الحسابات",
  organizational_structure: "الهيكل التنظيمي",
};

describe("setup requirement queue presentation", () => {
  it("uses localized module names and readable node-type labels from the server queue", () => {
    expect(buildSetupRequirementQueueItems(requirements, [salesModule], labels, "ar-SA")).toEqual([
      { key: "chart_of_accounts", label: "دليل الحسابات", requiredBy: ["المبيعات"] },
      { key: "node_type:PLANT", label: "الهيكل التنظيمي — PLANT", requiredBy: ["المبيعات"] },
    ]);
    expect(buildSetupRequirementQueueItems(requirements, [salesModule], labels, "en-US")[0].requiredBy).toEqual(["Sales"]);
  });
});
