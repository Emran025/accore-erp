"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { catalogText, useI18n } from "@/lib/i18n";
import { SetupAccountingSection } from "./components/SetupAccountingSection";
import { SetupModuleSelection } from "./components/SetupModuleSelection";
import { SetupOperatingScopeSection } from "./components/SetupOperatingScopeSection";
import { OrganizationArchitectureWorkspace } from "./components/OrganizationArchitectureWorkspace";
import { OrganizationIntegrity, OrganizationMetaType, OrganizationNodeDraft, OrganizationTopologyRule, OrganizationWorkspaceNode } from "./components/organizationWorkspace.types";
import { SetupPhaseProgress } from "./components/SetupPhaseProgress";
import { SetupReadinessSummary } from "./components/SetupReadinessSummary";
import { Item, Readiness, SetupState } from "./types";

const accountTypes = ["asset", "liability", "equity", "revenue", "expense"] as const;
type AccountType = (typeof accountTypes)[number];
const recordFields = { code: "code", name: "name" } as const;

function listFrom(response: unknown): Item[] {
  const payload = (response as { data?: unknown } | undefined)?.data;
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

export default function SetupPage() {
  const { t: i18n, locale } = useI18n();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [setupState, setSetupState] = useState<SetupState | null>(null);
  const [nodes, setNodes] = useState<OrganizationWorkspaceNode[]>([]);
  const [metaTypes, setMetaTypes] = useState<OrganizationMetaType[]>([]);
  const [topologyRules, setTopologyRules] = useState<OrganizationTopologyRule[]>([]);
  const [organizationIntegrity, setOrganizationIntegrity] = useState<OrganizationIntegrity | null>(null);
  const [costCenters, setCostCenters] = useState<Item[]>([]);
  const [profitCenters, setProfitCenters] = useState<Item[]>([]);
  const [currencies, setCurrencies] = useState<Item[]>([]);
  const [factoryCalendars, setFactoryCalendars] = useState<Item[]>([]);
  const [accounts, setAccounts] = useState<Item[]>([]);
  const [periods, setPeriods] = useState<Item[]>([]);
  const [selectedModuleKeys, setSelectedModuleKeys] = useState<string[]>([]);

  const [accountCode, setAccountCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("asset");
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
      const [readinessResponse, setupResponse, nodesResponse, typesResponse, topologyResponse, integrityResponse, costsResponse, profitsResponse, currenciesResponse, factoryCalendarsResponse, accountsResponse, periodsResponse] = await Promise.all([
        fetchAPI<Readiness>(API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.READINESS),
        fetchAPI<SetupState>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.STATE),
        fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODES),
        fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.META_TYPES),
        fetchAPI<OrganizationTopologyRule[]>(API_ENDPOINTS.ENTERPRISE_CORE.ORG.TOPOLOGY_RULES),
        fetchAPI<OrganizationIntegrity>(API_ENDPOINTS.ENTERPRISE_CORE.ORG.INTEGRITY_CHECK),
        fetchAPI(`${API_ENDPOINTS.FINANCE.COST_CENTERS.BASE}?limit=500`),
        fetchAPI(`${API_ENDPOINTS.FINANCE.PROFIT_CENTERS.BASE}?limit=500`),
        fetchAPI(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.BASE),
        fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.FACTORY_CALENDARS),
        fetchAPI(`${API_ENDPOINTS.FINANCE.ACCOUNTS.BASE}?limit=500`),
        fetchAPI(`${API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE}?limit=500`),
      ]);

      setReadiness(readinessResponse.success ? readinessResponse.data ?? null : null);
      const state = setupResponse.success ? setupResponse.data ?? null : null;
      setSetupState(state);
      setSelectedModuleKeys(state?.selected_module_keys ?? []);
      setNodes(listFrom(nodesResponse) as OrganizationWorkspaceNode[]);
      setMetaTypes(listFrom(typesResponse) as OrganizationMetaType[]);
      setTopologyRules(listFrom(topologyResponse) as OrganizationTopologyRule[]);
      setOrganizationIntegrity(integrityResponse.success ? integrityResponse.data ?? null : null);
      setCostCenters(listFrom(costsResponse).filter((item) => item.is_active !== false));
      setProfitCenters(listFrom(profitsResponse).filter((item) => item.is_active !== false));
      setCurrencies(listFrom(currenciesResponse).filter((item) => item.is_active !== false));
      setFactoryCalendars(listFrom(factoryCalendarsResponse).filter((item) => item.is_active !== false));
      setAccounts(listFrom(accountsResponse).filter((item) => item.is_active !== false));
      setPeriods(listFrom(periodsResponse));
    } catch {
      showToast(i18n.catalog["enterpriseCore.setup.failedToLoad"], "error");
    } finally {
      setIsLoading(false);
    }
  }, [i18n.catalog]);

  useEffect(() => { void load(); }, [load]);

  const activeNodes = useMemo(() => nodes.filter((node) => node.status === "active"), [nodes]);
  const workingUnitOptions = useMemo(() => activeNodes
    .filter((node) => node.node_type_id === "COMP_CODE")
    .map((node) => ({
      value: node.node_uuid,
      label: catalogText(i18n, "enterpriseCore.setup.nodeSummary", {
        value0: node.code,
        value1: node.meta_type?.display_name_ar || node.meta_type?.display_name || node.node_type_id,
      }),
    })), [activeNodes, i18n]);
  const costOptions = useMemo(() => costCenters.map((center) => ({
    value: Number(center.id),
    label: catalogText(i18n, "enterpriseCore.setup.centerSummary", {
      value0: text(center, recordFields.code),
      value1: text(center, recordFields.name),
    }),
  })), [costCenters, i18n]);
  const profitOptions = useMemo(() => profitCenters.map((center) => ({
    value: Number(center.id),
    label: catalogText(i18n, "enterpriseCore.setup.centerSummary", {
      value0: text(center, recordFields.code),
      value1: text(center, recordFields.name),
    }),
  })), [profitCenters, i18n]);
  const organizationReferenceOptions = useMemo(() => ({
    currency_id: currencies.map((currency) => ({
      value: Number(currency.id),
      label: [text(currency, "code"), text(currency, "name")].filter(Boolean).join(" — "),
      subtitle: text(currency, "symbol"),
    })),
    chart_of_accounts_id: accounts.map((account) => ({
      value: Number(account.id),
      label: [text(account, "account_code"), text(account, "account_name")].filter(Boolean).join(" — "),
      subtitle: text(account, "account_type"),
    })),
    factory_calendar_id: factoryCalendars.map((calendar) => ({
      value: Number(calendar.id),
      label: [text(calendar, "code"), text(calendar, locale === "ar-SA" ? "name_ar" : "name")].filter(Boolean).join(" — "),
      subtitle: [text(calendar, "country_code"), text(calendar, "time_zone")].filter(Boolean).join(" · "),
    })),
  }), [accounts, currencies, factoryCalendars, locale]);

  const callAndReload = async <T,>(action: () => Promise<{ success?: boolean; message?: string; data?: T }>): Promise<T | null> => {
    setIsSaving(true);
    try {
      const response = await action();
      if (!response.success) throw new Error(response.message);
      showToast(i18n.catalog["enterpriseCore.setup.createdSuccessfully"], "success");
      await load();
      return response.data ?? null;
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : i18n.catalog["enterpriseCore.setup.failedToSave"];
      showToast(message, "error");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const createOrganizationNode = async (draft: OrganizationNodeDraft): Promise<boolean> => {
    const saved = await callAndReload<OrganizationWorkspaceNode>(() => fetchAPI<OrganizationWorkspaceNode>(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODES, {
      method: "POST",
      body: JSON.stringify({ ...draft, status: "active" }),
    }));

    return saved !== null;
  };

  const createAccount = async () => {
    if (!accountCode.trim() || !accountName.trim()) {
      showToast(i18n.catalog["enterpriseCore.setup.failedToSave"], "error");
      return;
    }
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
    if (!periodName.trim() || !periodStart || !periodEnd) {
      showToast(i18n.catalog["enterpriseCore.setup.failedToSave"], "error");
      return;
    }
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
      showToast(i18n.catalog["enterpriseCore.setup.failedToSave"], "error");
      return;
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

  const onboarding = setupState?.onboarding ?? readiness?.onboarding;
  const canConfigureModules = onboarding?.baseline_ready === true;

  const accountTypeLabels: Record<AccountType, string> = {
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

  return (
    <div className="settings-wrapper setup-workflow">
      <SetupReadinessSummary
        title={i18n.catalog["enterpriseCore.setup.title"]}
        description={i18n.catalog["enterpriseCore.setup.subtitle"]}
        refreshLabel={i18n.catalog["enterpriseCore.setup.refresh"]}
        openDashboardLabel={i18n.catalog["enterpriseCore.setup.openDashboard"]}
        completeLabel={i18n.catalog["enterpriseCore.setup.complete"]}
        incompleteLabel={i18n.catalog["enterpriseCore.setup.incomplete"]}
        readiness={readiness}
        readinessLabels={readinessLabels}
        isLoading={isLoading}
        canOpenDashboard={readiness?.ready === true && setupState?.setup_required === false}
        onRefresh={() => void load()}
        onOpenDashboard={() => router.push("/01-enterprise-core/system-overview/dashboard/global-dashboard")}
      />
      <SetupPhaseProgress
        onboarding={onboarding}
        foundationTitle={i18n.catalog["enterpriseCore.setup.phase.foundation"]}
        foundationDescription={i18n.catalog["enterpriseCore.setup.phase.foundationDescription"]}
        coreOperationsTitle={i18n.catalog["enterpriseCore.setup.phase.coreOperations"]}
        coreOperationsDescription={i18n.catalog["enterpriseCore.setup.phase.coreOperationsDescription"]}
        moduleActivationTitle={i18n.catalog["enterpriseCore.setup.phase.moduleActivation"]}
        moduleActivationDescription={i18n.catalog["enterpriseCore.setup.phase.moduleActivationDescription"]}
        currentLabel={i18n.catalog["enterpriseCore.setup.phase.current"]}
        lockedLabel={i18n.catalog["enterpriseCore.setup.phase.locked"]}
        completeLabel={i18n.catalog["enterpriseCore.setup.complete"]}
      />
      <OrganizationArchitectureWorkspace
        nodes={nodes}
        metaTypes={metaTypes}
        topologyRules={topologyRules}
        integrity={organizationIntegrity}
        isLoading={isLoading}
        isSaving={isSaving}
        referenceOptionsByAttribute={organizationReferenceOptions}
        isReferenceDataLoading={isLoading}
        onRefresh={() => void load()}
        onCreateNode={createOrganizationNode}
      />
      <SetupAccountingSection
        title={i18n.catalog["enterpriseCore.setup.accounting.title"]}
        description={i18n.catalog["enterpriseCore.setup.accounting.description"]}
        accountCodeLabel={i18n.catalog["enterpriseCore.setup.accounting.accountCode"]}
        accountNameLabel={i18n.catalog["enterpriseCore.setup.accounting.accountName"]}
        accountTypeLabel={i18n.catalog["enterpriseCore.setup.accounting.accountType"]}
        createAccountLabel={i18n.catalog["enterpriseCore.setup.accounting.createAccount"]}
        periodNameLabel={i18n.catalog["enterpriseCore.setup.accounting.periodName"]}
        startDateLabel={i18n.catalog["enterpriseCore.setup.accounting.startDate"]}
        endDateLabel={i18n.catalog["enterpriseCore.setup.accounting.endDate"]}
        createPeriodLabel={i18n.catalog["enterpriseCore.setup.accounting.createPeriod"]}
        accountCode={accountCode}
        accountName={accountName}
        accountType={accountType}
        accountTypes={accountTypes}
        accountTypeLabels={accountTypeLabels}
        periodName={periodName}
        periodStart={periodStart}
        periodEnd={periodEnd}
        recordSummary={catalogText(i18n, "enterpriseCore.setup.accounting.recordSummary", { value0: accounts.length, value1: periods.length })}
        isSaving={isSaving}
        onAccountCodeChange={setAccountCode}
        onAccountNameChange={setAccountName}
        onAccountTypeChange={setAccountType}
        onPeriodNameChange={setPeriodName}
        onPeriodStartChange={setPeriodStart}
        onPeriodEndChange={setPeriodEnd}
        onCreateAccount={() => void createAccount()}
        onCreatePeriod={() => void createPeriod()}
      />
      <SetupOperatingScopeSection
        title={i18n.catalog["enterpriseCore.setup.scope.title"]}
        description={i18n.catalog["enterpriseCore.setup.scope.description"]}
        foundationComplete={onboarding?.phases.foundation.ready === true}
        foundationRequiredLabel={i18n.catalog["enterpriseCore.setup.scope.foundationRequired"]}
        workingUnitLabel={i18n.catalog["enterpriseCore.setup.scope.workingUnit"]}
        costCenterLabel={i18n.catalog["enterpriseCore.setup.scope.costCenter"]}
        profitCenterLabel={i18n.catalog["enterpriseCore.setup.scope.profitCenter"]}
        warehouseCodeLabel={i18n.catalog["enterpriseCore.setup.scope.warehouseCode"]}
        warehouseNameLabel={i18n.catalog["enterpriseCore.setup.scope.warehouseName"]}
        posCodeLabel={i18n.catalog["enterpriseCore.setup.scope.posCode"]}
        posNameLabel={i18n.catalog["enterpriseCore.setup.scope.posName"]}
        saveLabel={i18n.catalog["enterpriseCore.setup.scope.save"]}
        workingUnit={workingUnit}
        costCenterId={costCenterId}
        profitCenterId={profitCenterId}
        warehouseCode={warehouseCode}
        warehouseName={warehouseName}
        posCode={posCode}
        posName={posName}
        nodeOptions={workingUnitOptions}
        costOptions={costOptions}
        profitOptions={profitOptions}
        isSaving={isSaving}
        onWorkingUnitChange={setWorkingUnit}
        onCostCenterChange={setCostCenterId}
        onProfitCenterChange={setProfitCenterId}
        onWarehouseCodeChange={setWarehouseCode}
        onWarehouseNameChange={setWarehouseName}
        onPosCodeChange={setPosCode}
        onPosNameChange={setPosName}
        onSave={() => void saveContext()}
      />
      <SetupModuleSelection
        locale={locale}
        modules={setupState?.modules ?? []}
        selectedModuleKeys={selectedModuleKeys}
        coreModuleKeys={onboarding?.starter_module_keys ?? []}
        canActivate={canConfigureModules}
        title={i18n.catalog["enterpriseCore.setup.modules.title"]}
        description={i18n.catalog["enterpriseCore.setup.modules.description"]}
        coreTitle={i18n.catalog["enterpriseCore.setup.modules.coreTitle"]}
        coreDescription={i18n.catalog["enterpriseCore.setup.modules.coreDescription"]}
        optionalTitle={i18n.catalog["enterpriseCore.setup.modules.optionalTitle"]}
        optionalDescription={i18n.catalog["enterpriseCore.setup.modules.optionalDescription"]}
        baselineRequiredLabel={i18n.catalog["enterpriseCore.setup.modules.baselineRequired"]}
        saveSelectionLabel={i18n.catalog["enterpriseCore.setup.modules.saveSelection"]}
        activateSelectedLabel={i18n.catalog["enterpriseCore.setup.modules.activateSelected"]}
        notSelectedLabel={i18n.catalog["enterpriseCore.setup.modules.notSelected"]}
        pendingReadinessLabel={i18n.catalog["enterpriseCore.setup.modules.pendingReadiness"]}
        activeLabel={i18n.catalog["enterpriseCore.setup.modules.active"]}
        selectionRequiredLabel={i18n.catalog["enterpriseCore.setup.modules.selectionRequired"]}
        noRecordsLabel={i18n.catalog["enterpriseCore.setup.noRecords"]}
        isSaving={isSaving}
        onToggle={toggleModule}
        onSave={() => void saveModuleSelection()}
        onActivate={() => void activateSelectedModules()}
      />
    </div>
  );
}
