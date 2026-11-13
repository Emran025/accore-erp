import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAPI } from "@/lib/api";
import { setupApi } from "../../app/setup/setup-api";

const mockedFetchAPI = vi.mocked(fetchAPI);

describe("typed setup API adapters", () => {
  beforeEach(() => mockedFetchAPI.mockReset());

  it("uses the existing selection, activation, profile, and template contracts", async () => {
    await setupApi.selectModules(["general_ledger", "hr"]);
    await setupApi.activateSelectedModules();
    await setupApi.getOrganizationTemplates();
    await setupApi.saveOrganizationProfile({
      template_key: "professional_services",
      industry: "services",
      organization_size: "small",
      company_name: "Example Company",
      company_code: "EX-01",
      country_code: "YE",
      currency_id: 2,
      inventory_enabled: false,
    });
    await setupApi.applyOrganizationTemplate();

    expect(mockedFetchAPI).toHaveBeenNthCalledWith(1, "/v2/setup/modules", {
      method: "POST",
      body: JSON.stringify({ module_keys: ["general_ledger", "hr"] }),
    });
    expect(mockedFetchAPI).toHaveBeenNthCalledWith(2, "/v2/setup/activate-selected", { method: "POST" });
    expect(mockedFetchAPI).toHaveBeenNthCalledWith(3, "/v2/setup/organization-templates");
    expect(mockedFetchAPI).toHaveBeenNthCalledWith(4, "/v2/setup/organization-profile", {
      method: "POST",
      body: JSON.stringify({
        template_key: "professional_services",
        industry: "services",
        organization_size: "small",
        company_name: "Example Company",
        company_code: "EX-01",
        country_code: "YE",
        currency_id: 2,
        inventory_enabled: false,
      }),
    });
    expect(mockedFetchAPI).toHaveBeenNthCalledWith(5, "/v2/setup/apply-organization-template", { method: "POST" });
  });

  it("uses existing organization, readiness, and operating-context endpoints", async () => {
    await setupApi.getReadiness();
    await setupApi.getOrganizationNodes();
    await setupApi.updateOrganizationNode("node-uuid", { code: "EX-01", attributes: { name: "Example" } });
    await setupApi.configureOperatingContext({
      org_node_uuid: "node-uuid",
      cost_center_id: 5,
      profit_center_id: 7,
    });
    await setupApi.getWarehouses();
    await setupApi.getPosTerminals();

    expect(mockedFetchAPI).toHaveBeenNthCalledWith(1, "/v2/operating-context/readiness");
    expect(mockedFetchAPI).toHaveBeenNthCalledWith(2, "/v2/org-structure/nodes");
    expect(mockedFetchAPI).toHaveBeenNthCalledWith(3, "/v2/org-structure/nodes/node-uuid", {
      method: "PUT",
      body: JSON.stringify({ code: "EX-01", attributes: { name: "Example" } }),
    });
    expect(mockedFetchAPI).toHaveBeenNthCalledWith(4, "/v2/operating-context/configure", {
      method: "POST",
      body: JSON.stringify({ org_node_uuid: "node-uuid", cost_center_id: 5, profit_center_id: 7 }),
    });
    expect(mockedFetchAPI).toHaveBeenNthCalledWith(5, "/v2/operating-context/warehouses?active_only=1");
    expect(mockedFetchAPI).toHaveBeenNthCalledWith(6, "/v2/operating-context/pos-terminals?active_only=1");
  });

  it("uses the existing typed account and fiscal-period mutation contracts", async () => {
    await setupApi.createAccount({ code: "1000", name: "Cash", type: "asset" });
    await setupApi.createFiscalPeriod({ period_name: "FY-2026", start_date: "2026-01-01", end_date: "2026-12-31" });
    await setupApi.ensureStandardChart();

    expect(mockedFetchAPI).toHaveBeenNthCalledWith(1, "/v2/chart-of-accounts", {
      method: "POST",
      body: JSON.stringify({ code: "1000", name: "Cash", type: "asset" }),
    });
    expect(mockedFetchAPI).toHaveBeenNthCalledWith(2, "/v2/fiscal-periods", {
      method: "POST",
      body: JSON.stringify({ period_name: "FY-2026", start_date: "2026-01-01", end_date: "2026-12-31" }),
    });
    expect(mockedFetchAPI).toHaveBeenNthCalledWith(3, "/v2/chart-of-accounts/standard", { method: "POST" });
  });
});
