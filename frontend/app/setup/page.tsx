"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { Button, SearchableSelect, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { catalogText, useI18n } from "@/lib/i18n";

type Item = Record<string, unknown>;

type Readiness = {
  ready: boolean;
  checks?: Array<{ key: string; complete: boolean }>;
  missing?: Array<{ key: string }>;
  accounting_readiness?: {
    open_fiscal_period: { ready: boolean };
    chart_of_accounts: { ready: boolean; missing_account_types?: string[] };
  };
};

type MetaType = {
  id: string;
  display_name: string;
  display_name_ar?: string;
  attributes?: Array<{ attribute_key: string; is_mandatory: boolean }>;
};

type OrgNode = {
  node_uuid: string;
  node_type_id: string;
  code: string;
  status: string;
  attributes_json?: Record<string, unknown>;
  meta_type?: MetaType;
};

type SetupModule = {
  module_key: string;
  module_name_ar?: string | null;
  module_name_en?: string | null;
  is_configuration_module: boolean;
  is_selected: boolean;
  is_operational: boolean;
  lifecycle: "configuration_access" | "not_selected" | "selected_pending_readiness" | "active";
};

type SetupState = {
  setup_required: boolean;
  selected_module_keys: string[];
  active_module_keys: string[];
  pending_module_keys: string[];
  modules: SetupModule[];
};

function listFrom(response: unknown): Item[] {
  const value = response as { data?: unknown } | undefined;
  const payload = value?.data;
  if (Array.isArray(payload)) return payload as Item[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: Item[] }).data;
  }
  return [];
}

function text(item: Item, key: string): string {
  const value = item[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

const inputStyle = { width: "100%", minHeight: 40, borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-color)", color: "var(--text-primary)", padding: "0 0.75rem" };
const panelStyle = { padding: "1.15rem", border: "1px solid var(--border-color)", borderRadius: 12, background: "var(--card-bg, var(--bg-color))", marginBottom: "1rem" };

export default function SetupPage() {
  const { t: i18n, locale } = useI18n();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [metaTypes, setMetaTypes] = useState<MetaType[]>([]);
  const [costCenters, setCostCenters] = useState<Item[]>([]);
  const [profitCenters, setProfitCenters] = useState<Item[]>([]);
  const [accounts, setAccounts] = useState<Item[]>([]);
  const [periods, setPeriods] = useState<Item[]>([]);
  const [setupState, setSetupState] = useState<SetupState | null>(null);
  const [selectedModuleKeys, setSelectedModuleKeys] = useState<string[]>([]);

  const [nodeType, setNodeType] = useState("");
  const [nodeCode, setNodeCode] = useState("");
  const [nodeName, setNodeName] = useState("");
  const [nodeParent, setNodeParent] = useState("");
  const [nodeAttributes, setNodeAttributes] = useState<Record<string, string>>({});

  const [accountCode, setAccountCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("asset");
  const [periodName, setPeriodName] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const [workingUnit, setWorkingUnit] = useState("");
  const [costCenterId, setCostCenterId] = useState<number | null>(null);
  const [profitCenterId, setProfitCenterId] = useState<number | null>(null);
  const [warehouseCode, setWarehouseCode] = useState("WH-MAIN");
  const [warehouseName, setWarehouseName] = useState("");
  const [posCode, setPosCode] = useState("POS-MAIN");
  const [posName, setPosName] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [readinessResponse, setupResponse, nodesResponse, typesResponse, costsResponse, profitsResponse, accountsResponse, periodsResponse] = await Promise.all([
        fetchAPI<Readiness>(API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.READINESS),
        fetchAPI<SetupState>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.STATE),
        fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODES),
        fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.META_TYPES),
        fetchAPI(`${API_ENDPOINTS.FINANCE.COST_CENTERS.BASE}?limit=500`),
        fetchAPI(`${API_ENDPOINTS.FINANCE.PROFIT_CENTERS.BASE}?limit=500`),
        fetchAPI(`${API_ENDPOINTS.FINANCE.ACCOUNTS.BASE}?limit=500`),
        fetchAPI(`${API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE}?limit=500`),
      ]);

      setReadiness(readinessResponse.success ? readinessResponse.data ?? null : null);
      const loadedSetupState = setupResponse.success ? setupResponse.data ?? null : null;
      setSetupState(loadedSetupState);
      setSelectedModuleKeys(loadedSetupState?.selected_module_keys ?? []);
      setNodes(listFrom(nodesResponse) as OrgNode[]);
      const loadedTypes = listFrom(typesResponse) as MetaType[];
      setMetaTypes(loadedTypes);
      setNodeType((current) => current || loadedTypes[0]?.id || "");
      setCostCenters(listFrom(costsResponse).filter((item) => item.is_active !== false));
      setProfitCenters(listFrom(profitsResponse).filter((item) => item.is_active !== false));
      setAccounts(listFrom(accountsResponse).filter((item) => item.is_active !== false));
      setPeriods(listFrom(periodsResponse));
    } catch {
      showToast(i18n.catalog["enterpriseCore.setup.failedToLoad"], "error");
    } finally {
      setIsLoading(false);
    }
  }, [i18n.catalog]);

  useEffect(() => { void load(); }, [load]);

  const selectedType = useMemo(() => metaTypes.find((type) => type.id === nodeType), [metaTypes, nodeType]);
  const activeNodes = useMemo(() => nodes.filter((node) => node.status === "active"), [nodes]);
  const nodeOptions = activeNodes.map((node) => ({
    value: node.node_uuid,
    label: `${node.code} — ${node.meta_type?.display_name_ar || node.meta_type?.display_name || node.node_type_id}`,
  }));
  const typeOptions = metaTypes.map((type) => ({ value: type.id, label: type.display_name_ar || type.display_name || type.id }));
  const costOptions = costCenters.map((center) => ({ value: Number(center.id), label: `${text(center, "code")} — ${text(center, "name")}` }));
  const profitOptions = profitCenters.map((center) => ({ value: Number(center.id), label: `${text(center, "code")} — ${text(center, "name")}` }));

  const callAndReload = async (action: () => Promise<{ success?: boolean; message?: string }>) => {
    setIsSaving(true);
    try {
      const response = await action();
      if (!response.success) throw new Error(response.message);
      showToast(i18n.catalog["enterpriseCore.setup.createdSuccessfully"], "success");
      await load();
      return true;
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : i18n.catalog["enterpriseCore.setup.failedToSave"];
      showToast(message, "error");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const createNode = async () => {
    if (!nodeType || !nodeCode.trim()) return showToast(i18n.catalog["enterpriseCore.setup.failedToSave"], "error");
    const attributes = { ...nodeAttributes, ...(nodeName.trim() ? { name: nodeName.trim() } : {}) };
    const saved = await callAndReload(() => fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODES, {
      method: "POST",
      body: JSON.stringify({
        node_type_id: nodeType,
        code: nodeCode.trim(),
        status: "active",
        attributes,
        ...(nodeParent ? { link: { target_node_uuid: nodeParent, validate_constraints: true } } : {}),
      }),
    }));
    if (saved) {
      setNodeCode("");
      setNodeName("");
      setNodeParent("");
      setNodeAttributes({});
    }
  };

  const createAccount = async () => {
    if (!accountCode.trim() || !accountName.trim()) return showToast(i18n.catalog["enterpriseCore.setup.failedToSave"], "error");
    const saved = await callAndReload(() => fetchAPI(API_ENDPOINTS.FINANCE.ACCOUNTS.BASE, {
      method: "POST",
      body: JSON.stringify({ code: accountCode.trim(), name: accountName.trim(), type: accountType }),
    }));
    if (saved) {
      setAccountCode("");
      setAccountName("");
    }
  };

  const createPeriod = async () => {
    if (!periodName.trim() || !periodStart || !periodEnd) return showToast(i18n.catalog["enterpriseCore.setup.failedToSave"], "error");
    const saved = await callAndReload(() => fetchAPI(API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE, {
      method: "POST",
      body: JSON.stringify({ period_name: periodName.trim(), start_date: periodStart, end_date: periodEnd }),
    }));
    if (saved) {
      setPeriodName("");
      setPeriodStart("");
      setPeriodEnd("");
    }
  };

  const saveContext = async () => {
    if (!workingUnit || !costCenterId || !profitCenterId || !warehouseCode.trim() || !warehouseName.trim() || !posCode.trim() || !posName.trim()) {
      return showToast(i18n.catalog["enterpriseCore.setup.failedToSave"], "error");
    }
    await callAndReload(() => fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.CONFIGURE, {
      method: "POST",
      body: JSON.stringify({
        org_node_uuid: workingUnit,
        cost_center_id: costCenterId,
        profit_center_id: profitCenterId,
        warehouse: { code: warehouseCode.trim(), name: warehouseName.trim() },
        pos_terminal: { code: posCode.trim(), name: posName.trim() },
      }),
    }));
  };

  const saveModuleSelection = async () => {
    await callAndReload(() => fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.MODULES, {
      method: "POST",
      body: JSON.stringify({ module_keys: selectedModuleKeys }),
    }));
  };

  const activateSelectedModules = async () => {
    await callAndReload(() => fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.ACTIVATE_SELECTED, { method: "POST" }));
  };

  const toggleModule = (moduleKey: string) => {
    setSelectedModuleKeys((current) => current.includes(moduleKey)
      ? current.filter((key) => key !== moduleKey)
      : [...current, moduleKey]);
  };

  const accountTypes = ["asset", "liability", "equity", "revenue", "expense"] as const;
  const accountTypeLabels: Record<(typeof accountTypes)[number], string> = {
    asset: i18n.catalog["enterpriseCore.setup.accountType.asset"],
    liability: i18n.catalog["enterpriseCore.setup.accountType.liability"],
    equity: i18n.catalog["enterpriseCore.setup.accountType.equity"],
    revenue: i18n.catalog["enterpriseCore.setup.accountType.revenue"],
    expense: i18n.catalog["enterpriseCore.setup.accountType.expense"],
  };
  const readinessLabels: Record<string, string> = {
    working_unit: i18n.catalog["enterpriseCore.setup.check.workingUnit"],
    warehouse: i18n.catalog["enterpriseCore.setup.check.warehouse"],
    cost_center: i18n.catalog["enterpriseCore.setup.check.costCenter"],
    profit_center: i18n.catalog["enterpriseCore.setup.check.profitCenter"],
    pos_terminal: i18n.catalog["enterpriseCore.setup.check.posTerminal"],
    organizational_structure: i18n.catalog["enterpriseCore.setup.check.organizationalStructure"],
    open_fiscal_period: i18n.catalog["enterpriseCore.setup.check.openFiscalPeriod"],
    chart_of_accounts: i18n.catalog["enterpriseCore.setup.check.chartOfAccounts"],
  };
  const readinessChecks = readiness?.checks || [];

  return (
    <MainLayout requiredModule="settings" requiredAction="view">
      <div className="settings-wrapper animate-fade" style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ ...panelStyle, borderColor: readiness?.ready ? "rgba(16,185,129,0.5)" : "rgba(245,158,11,0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0 }}>{i18n.catalog["enterpriseCore.setup.title"]}</h2>
              <p style={{ margin: "0.5rem 0 0", color: "var(--text-secondary)", maxWidth: 760 }}>{i18n.catalog["enterpriseCore.setup.subtitle"]}</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button variant="secondary" onClick={() => void load()} isLoading={isLoading}>{i18n.catalog["enterpriseCore.setup.refresh"]}</Button>
              <Button disabled={!readiness?.ready || setupState?.setup_required !== false} onClick={() => router.push("/01-enterprise-core/system-overview/dashboard/global-dashboard")}>{i18n.catalog["enterpriseCore.setup.openDashboard"]}</Button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
            {readinessChecks.map((check) => (
              <span key={check.key} className={`badge ${check.complete ? "badge-success" : "badge-warning"}`}>
                {readinessLabels[check.key] || check.key}: {check.complete ? i18n.catalog["enterpriseCore.setup.complete"] : i18n.catalog["enterpriseCore.setup.incomplete"]}
              </span>
            ))}
          </div>
        </div>

        <section style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>{i18n.catalog["enterpriseCore.setup.modules.title"]}</h3>
          <p style={{ color: "var(--text-secondary)" }}>{i18n.catalog["enterpriseCore.setup.modules.description"]}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "0.65rem" }}>
            {(setupState?.modules ?? []).filter((module) => !module.is_configuration_module).map((module) => {
              const label = locale === "ar-SA" ? module.module_name_ar || module.module_name_en || module.module_key : module.module_name_en || module.module_name_ar || module.module_key;
              const status = module.is_operational
                ? i18n.catalog["enterpriseCore.setup.modules.active"]
                : (selectedModuleKeys.includes(module.module_key)
                  ? i18n.catalog["enterpriseCore.setup.modules.pendingReadiness"]
                  : i18n.catalog["enterpriseCore.setup.modules.notSelected"]);
              return (
                <label key={module.module_key} style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start", padding: "0.7rem", border: "1px solid var(--border-color)", borderRadius: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={selectedModuleKeys.includes(module.module_key)} onChange={() => toggleModule(module.module_key)} />
                  <span><strong style={{ display: "block" }}>{label}</strong><small style={{ color: module.is_operational ? "var(--success-color)" : "var(--text-muted)" }}>{status}</small></span>
                </label>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", flexWrap: "wrap", marginTop: "0.85rem" }}>
            <Button onClick={() => void saveModuleSelection()} isLoading={isSaving}>{i18n.catalog["enterpriseCore.setup.modules.saveSelection"]}</Button>
            <Button variant="secondary" onClick={() => void activateSelectedModules()} isLoading={isSaving} disabled={selectedModuleKeys.length === 0}>{i18n.catalog["enterpriseCore.setup.modules.activateSelected"]}</Button>
            {selectedModuleKeys.length === 0 ? <small style={{ color: "var(--warning-color)" }}>{i18n.catalog["enterpriseCore.setup.modules.selectionRequired"]}</small> : null}
          </div>
        </section>

        <section style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>{i18n.catalog["enterpriseCore.setup.organization.title"]}</h3>
          <p style={{ color: "var(--text-secondary)" }}>{i18n.catalog["enterpriseCore.setup.organization.description"]}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "0.75rem" }}>
            <div><label>{i18n.catalog["enterpriseCore.setup.organization.type"]}</label><SearchableSelect options={typeOptions} value={nodeType} onChange={(value) => { setNodeType(String(value)); setNodeAttributes({}); }} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.organization.code"]}</label><input style={inputStyle} value={nodeCode} onChange={(event) => setNodeCode(event.target.value)} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.organization.name"]}</label><input style={inputStyle} value={nodeName} onChange={(event) => setNodeName(event.target.value)} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.organization.parent"]}</label><SearchableSelect options={nodeOptions} value={nodeParent} onChange={(value) => setNodeParent(String(value || ""))} /></div>
            {(selectedType?.attributes || []).map((attribute) => (
              <div key={attribute.attribute_key}>
                <label>{attribute.attribute_key}{attribute.is_mandatory ? " *" : ""}</label>
                <input style={inputStyle} value={nodeAttributes[attribute.attribute_key] || ""} onChange={(event) => setNodeAttributes((current) => ({ ...current, [attribute.attribute_key]: event.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: "0.85rem" }}><Button onClick={() => void createNode()} isLoading={isSaving}>{i18n.catalog["enterpriseCore.setup.organization.create"]}</Button></div>
          <p style={{ margin: "1rem 0 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>{activeNodes.length ? activeNodes.map((node) => catalogText(i18n, "enterpriseCore.setup.nodeSummary", { value0: node.code, value1: node.node_type_id })).join(" • ") : i18n.catalog["enterpriseCore.setup.noRecords"]}</p>
        </section>

        <section style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>{i18n.catalog["enterpriseCore.setup.accounting.title"]}</h3>
          <p style={{ color: "var(--text-secondary)" }}>{i18n.catalog["enterpriseCore.setup.accounting.description"]}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "0.75rem", alignItems: "end" }}>
            <div><label>{i18n.catalog["enterpriseCore.setup.accounting.accountCode"]}</label><input style={inputStyle} value={accountCode} onChange={(event) => setAccountCode(event.target.value)} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.accounting.accountName"]}</label><input style={inputStyle} value={accountName} onChange={(event) => setAccountName(event.target.value)} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.accounting.accountType"]}</label><select style={inputStyle} value={accountType} onChange={(event) => setAccountType(event.target.value)}>{accountTypes.map((type) => <option key={type} value={type}>{accountTypeLabels[type]}</option>)}</select></div>
            <Button onClick={() => void createAccount()} isLoading={isSaving}>{i18n.catalog["enterpriseCore.setup.accounting.createAccount"]}</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "0.75rem", alignItems: "end", marginTop: "1rem" }}>
            <div><label>{i18n.catalog["enterpriseCore.setup.accounting.periodName"]}</label><input style={inputStyle} value={periodName} onChange={(event) => setPeriodName(event.target.value)} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.accounting.startDate"]}</label><input style={inputStyle} type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.accounting.endDate"]}</label><input style={inputStyle} type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} /></div>
            <Button onClick={() => void createPeriod()} isLoading={isSaving}>{i18n.catalog["enterpriseCore.setup.accounting.createPeriod"]}</Button>
          </div>
          <p style={{ margin: "1rem 0 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>
            {accounts.length} {i18n.catalog["enterpriseCore.setup.accounting.createAccount"]} · {periods.length} {i18n.catalog["enterpriseCore.setup.accounting.createPeriod"]}
          </p>
        </section>

        <section style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>{i18n.catalog["enterpriseCore.setup.scope.title"]}</h3>
          <p style={{ color: "var(--text-secondary)" }}>{i18n.catalog["enterpriseCore.setup.scope.description"]}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "0.75rem" }}>
            <div><label>{i18n.catalog["enterpriseCore.setup.scope.workingUnit"]}</label><SearchableSelect options={nodeOptions} value={workingUnit} onChange={(value) => setWorkingUnit(String(value || ""))} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.scope.costCenter"]}</label><SearchableSelect options={costOptions} value={costCenterId} onChange={(value) => setCostCenterId(typeof value === "number" ? value : null)} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.scope.profitCenter"]}</label><SearchableSelect options={profitOptions} value={profitCenterId} onChange={(value) => setProfitCenterId(typeof value === "number" ? value : null)} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.scope.warehouseCode"]}</label><input style={inputStyle} value={warehouseCode} onChange={(event) => setWarehouseCode(event.target.value)} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.scope.warehouseName"]}</label><input style={inputStyle} value={warehouseName} onChange={(event) => setWarehouseName(event.target.value)} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.scope.posCode"]}</label><input style={inputStyle} value={posCode} onChange={(event) => setPosCode(event.target.value)} /></div>
            <div><label>{i18n.catalog["enterpriseCore.setup.scope.posName"]}</label><input style={inputStyle} value={posName} onChange={(event) => setPosName(event.target.value)} /></div>
          </div>
          <div style={{ marginTop: "0.85rem" }}><Button onClick={() => void saveContext()} isLoading={isSaving}>{i18n.catalog["enterpriseCore.setup.scope.save"]}</Button></div>
        </section>
      </div>
    </MainLayout>
  );
}
