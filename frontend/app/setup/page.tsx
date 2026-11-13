"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { catalogText, useI18n } from "@/lib/i18n";
import { SetupAccountingSection } from "./components/SetupAccountingSection";
import { SetupJourneyStepper, type SetupJourneyStepId } from "./components/SetupJourneyStepper";
import { SetupModuleSelection } from "./components/SetupModuleSelection";
import { SetupOperatingScopeSection } from "./components/SetupOperatingScopeSection";
import { SetupOrganizationProfileSection } from "./components/SetupOrganizationProfileSection";
import { SetupReadinessSummary } from "./components/SetupReadinessSummary";
import { SetupRequirementQueue } from "./components/SetupRequirementQueue";
import { AdaptiveQuestionStepper, type AdaptiveQuestion } from "./components/AdaptiveQuestionStepper";
import { BlueprintReviewCard } from "./components/BlueprintReviewCard";
import { Item, OrganizationProfile, Readiness, SetupState } from "./types";
import { getIcon } from "@/lib/icons";
import { areSelectedModuleRequirementsReady, detectStaleSetupState, getNextSetupJourneyStep, hasServerConfirmedModuleSelection, isSetupLaunchReady } from "./setup-workflow";

const accountTypes = ["asset", "liability", "equity", "revenue", "expense"] as const;
type AccountType = (typeof accountTypes)[number];
const recordFields = { code: "code", name: "name" } as const;

const emptyOrganizationProfile: OrganizationProfile = {
  template_key: "",
  industry: "",
  organization_size: "small",
  company_name: "",
  company_code: "",
  country_code: "SA",
  currency_id: 0,
  primary_site_name: "",
  primary_site_code: "",
  factory_calendar_id: null,
  language: "ar-SA",
  inventory_enabled: false,
};

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
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraftData, setHasDraftData] = useState(false);
  const [isStaleState, setIsStaleState] = useState(false);
  const prevSetupStateRef = useRef<SetupState | null>(null);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [setupState, setSetupState] = useState<SetupState | null>(null);
  const [costCenters, setCostCenters] = useState<Item[]>([]);
  const [currencies, setCurrencies] = useState<Item[]>([]);
  const [factoryCalendars, setFactoryCalendars] = useState<Item[]>([]);
  const [accounts, setAccounts] = useState<Item[]>([]);
  const [periods, setPeriods] = useState<Item[]>([]);
  const [posTerminals, setPosTerminals] = useState<Item[]>([]);
  const [nodes, setNodes] = useState<Item[]>([]);
  const [selectedModuleKeys, setSelectedModuleKeys] = useState<string[]>([]);
  const [journeyStep, setJourneyStep] = useState<SetupJourneyStepId>("module_selection");
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile>(emptyOrganizationProfile);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("");

  const [accountCode, setAccountCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("asset");
  const [periodName, setPeriodName] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const [workingUnit, setWorkingUnit] = useState("");
  const [workingUnitCode, setWorkingUnitCode] = useState("");
  const [workingUnitName, setWorkingUnitName] = useState("");
  const [costCenterId, setCostCenterId] = useState<number | null>(null);
  const [posTerminalId, setPosTerminalId] = useState<number | null>(null);

  // ── Intelligent Organization Setup state ────────────────────────────────────
  // Draft persistence: read stored values from localStorage on first render so
  // that a page refresh or accidental tab close does not lose the user's work.
  const DRAFT_KEY = "accore_erp_setup_inference_draft";

  const readDraft = () => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}") as Record<string, unknown>;
    } catch {
      return {};
    }
  };

  const saveDraft = (patch: Record<string, unknown>) => {
    if (typeof window === "undefined") return;
    try {
      const current = readDraft();
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...current, ...patch }));
    } catch {
      // quota or private-mode error — silently ignore
    }
  };

  const clearDraft = () => {
    if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
    setHasDraftData(false);
  };

  const draft = readDraft();

  // Set hasDraftData on mount: true if any inference key is stored
  useEffect(() => {
    const stored = readDraft();
    setHasDraftData(
      Boolean(stored.lastDescription || stored.inferenceEvaluation || stored.synthesizedBlueprint || stored.stagedBlueprintUuid)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isInferenceLoading, setIsInferenceLoading] = useState(false);
  const [isStaging, setIsStaging] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastDescription, setLastDescription] = useState<string>((draft.lastDescription as string) ?? "");
  const [inferenceEvaluation, setInferenceEvaluation] = useState<any>(draft.inferenceEvaluation ?? null);
  const [inferenceSignals, setInferenceSignals] = useState<any>(draft.inferenceSignals ?? null);
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<AdaptiveQuestion[]>((draft.adaptiveQuestions as AdaptiveQuestion[]) ?? []);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, any>>((draft.questionAnswers as Record<string, any>) ?? {});
  const [synthesizedBlueprint, setSynthesizedBlueprint] = useState<any>(draft.synthesizedBlueprint ?? null);
  const [stagedBlueprintUuid, setStagedBlueprintUuid] = useState<string | null>((draft.stagedBlueprintUuid as string) ?? null);

  // Persist draft whenever any inference state changes
  useEffect(() => {
    if (lastDescription || inferenceEvaluation) {
      saveDraft({
        lastDescription,
        inferenceEvaluation,
        inferenceSignals,
        adaptiveQuestions,
        questionAnswers,
        synthesizedBlueprint,
        stagedBlueprintUuid,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastDescription, inferenceEvaluation, inferenceSignals, adaptiveQuestions, questionAnswers, synthesizedBlueprint, stagedBlueprintUuid]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [readinessResponse, setupResponse, nodesResponse, costsResponse, currenciesResponse, factoryCalendarsResponse, accountsResponse, periodsResponse, posTerminalsResponse] = await Promise.all([
        fetchAPI<Readiness>(API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.READINESS),
        fetchAPI<SetupState>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.STATE),
        fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODES),
        fetchAPI(`${API_ENDPOINTS.FINANCE.COST_CENTERS.BASE}?limit=500`),
        fetchAPI(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.BASE),
        fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.FACTORY_CALENDARS),
        fetchAPI(`${API_ENDPOINTS.FINANCE.ACCOUNTS.BASE}?limit=500`),
        fetchAPI(`${API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE}?limit=500`),
        fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.POS_TERMINALS),
      ]);

      setReadiness(readinessResponse.success ? readinessResponse.data ?? null : null);
      const state = setupResponse.success ? setupResponse.data ?? null : null;
      if (detectStaleSetupState(prevSetupStateRef.current, state)) {
        setIsStaleState(true);
      }
      prevSetupStateRef.current = state;
      setSetupState(state);
      setSelectedModuleKeys(state?.selected_module_keys.length ? state.selected_module_keys : state?.onboarding?.starter_module_keys ?? []);
      setJourneyStep(getNextSetupJourneyStep(state));
      const templateState = state?.organization_template;
      const savedProfile = templateState?.profile;
      if (savedProfile) {
        setOrganizationProfile({ ...emptyOrganizationProfile, ...savedProfile });
        setSelectedTemplateKey(savedProfile.template_key);
      } else if (templateState?.templates[0]) {
        setSelectedTemplateKey((current) => current || templateState.templates[0].key);
      }
      setNodes(listFrom(nodesResponse).filter((node) => node.status === "active"));
      setCostCenters(listFrom(costsResponse).filter((item) => item.is_active !== false));
      setCurrencies(listFrom(currenciesResponse).filter((item) => item.is_active !== false));
      setFactoryCalendars(listFrom(factoryCalendarsResponse).filter((item) => item.is_active !== false));
      setAccounts(listFrom(accountsResponse).filter((item) => item.is_active !== false));
      setPeriods(listFrom(periodsResponse));
      setPosTerminals(listFrom(posTerminalsResponse).filter((item) => item.is_active !== false));
      const context = (readinessResponse.success ? readinessResponse.data?.context : null) as Item | null;
      setWorkingUnit(text(context ?? {}, "org_node_uuid"));
      setCostCenterId(Number(context?.cost_center_id) || null);
      setPosTerminalId(Number(context?.pos_terminal_id) || null);
    } catch {
      showToast(i18n.catalog["enterpriseCore.setup.failedToLoad"], "error");
    } finally {
      setIsLoading(false);
    }
  }, [i18n.catalog]);

  useEffect(() => { void load(); }, [load]);

  const templateState = setupState?.organization_template;
  const templateApplied = templateState?.is_applied === true;
  const activeNodes = useMemo(() => nodes.filter((node) => text(node, "node_type_id") === "COMP_CODE"), [nodes]);
  const workingUnitOptions = useMemo(() => activeNodes.map((node) => ({
    value: text(node, "node_uuid"),
    label: catalogText(i18n, "enterpriseCore.setup.nodeSummary", {
      value0: text(node, "code"),
      value1: text((node.meta_type as Item | undefined) ?? {}, locale === "ar-SA" ? "display_name_ar" : "display_name") || text(node, "node_type_id"),
    }),
  })), [activeNodes, i18n, locale]);
  const selectedWorkingUnitNode = useMemo(
    () => nodes.find((node) => text(node, "node_uuid") === workingUnit) ?? null,
    [nodes, workingUnit],
  );
  useEffect(() => {
    if (!selectedWorkingUnitNode) return;
    setWorkingUnitCode(text(selectedWorkingUnitNode, "code"));
    const attributes = selectedWorkingUnitNode.attributes_json as Item | undefined;
    setWorkingUnitName(text(attributes ?? {}, "name"));
  }, [selectedWorkingUnitNode]);
  const costOptions = useMemo(() => costCenters.map((center) => ({
    value: Number(center.id),
    label: catalogText(i18n, "enterpriseCore.setup.centerSummary", {
      value0: text(center, recordFields.code),
      value1: text(center, recordFields.name),
    }),
  })), [costCenters, i18n]);
  const posOptions = useMemo(() => posTerminals.map((terminal) => ({
    value: Number(terminal.id),
    label: [text(terminal, "code"), text(terminal, "name")].filter(Boolean).join(" — "),
  })), [posTerminals]);
  const currencyOptions = useMemo(() => currencies.map((currency) => ({
    value: Number(currency.id),
    label: [text(currency, "code"), text(currency, "name")].filter(Boolean).join(" — "),
  })), [currencies]);
  const calendarOptions = useMemo(() => factoryCalendars.map((calendar) => ({
    value: Number(calendar.id),
    label: [text(calendar, "code"), text(calendar, locale === "ar-SA" ? "name_ar" : "name")].filter(Boolean).join(" — "),
  })), [factoryCalendars, locale]);

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

  const handleAnalyzeInference = async (description: string) => {
    setIsInferenceLoading(true);
    setLastDescription(description);
    try {
      const res = await fetchAPI<any>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.INFERENCE_ANALYZE, {
        method: "POST",
        body: JSON.stringify({
          description,
          company_name: organizationProfile.company_name || undefined,
          country_code: organizationProfile.country_code || "SA",
          currency_id: organizationProfile.currency_id || undefined,
        }),
      });

      if (res.success && res.data) {
        setInferenceEvaluation(res.data.evaluation);
        setInferenceSignals(res.data.signals);
        setAdaptiveQuestions(res.data.adaptive_questions || []);
        setSynthesizedBlueprint(res.data.blueprint);
        showToast("Structure inferred successfully", "success");
      } else {
        showToast(res.message || "Failed to analyze business signals", "error");
      }
    } catch {
      showToast("Error analyzing business description", "error");
    } finally {
      setIsInferenceLoading(false);
    }
  };

  const handleApplyAnswers = async () => {
    if (!lastDescription) return;
    setIsInferenceLoading(true);
    try {
      const res = await fetchAPI<any>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.INFERENCE_ANALYZE, {
        method: "POST",
        body: JSON.stringify({
          description: lastDescription,
          company_name: organizationProfile.company_name || undefined,
          structured: questionAnswers,
        }),
      });

      if (res.success && res.data) {
        setInferenceEvaluation(res.data.evaluation);
        setInferenceSignals(res.data.signals);
        setAdaptiveQuestions(res.data.adaptive_questions || []);
        setSynthesizedBlueprint(res.data.blueprint);
        showToast("Blueprint refined with answers", "success");
      }
    } catch {
      showToast("Failed to refine blueprint", "error");
    } finally {
      setIsInferenceLoading(false);
    }
  };

  const handleStageBlueprint = async () => {
    if (!synthesizedBlueprint) return;
    setIsStaging(true);
    try {
      const res = await fetchAPI<any>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.BLUEPRINT_STAGE, {
        method: "POST",
        body: JSON.stringify({
          name: organizationProfile.company_name || synthesizedBlueprint.archetype_id,
          archetype_id: synthesizedBlueprint.archetype_id,
          blueprint_json: synthesizedBlueprint,
        }),
      });

      if (res.success && res.data) {
        setStagedBlueprintUuid(res.data.blueprint_uuid);
        showToast("Blueprint draft saved", "success");
      } else {
        showToast(res.message || "Failed to save draft", "error");
      }
    } catch {
      showToast("Error staging blueprint", "error");
    } finally {
      setIsStaging(false);
    }
  };

  const handlePublishBlueprint = async () => {
    if (!synthesizedBlueprint) return;
    setIsPublishing(true);
    try {
      let uuid = stagedBlueprintUuid;
      if (!uuid) {
        const stageRes = await fetchAPI<any>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.BLUEPRINT_STAGE, {
          method: "POST",
          body: JSON.stringify({
            name: organizationProfile.company_name || synthesizedBlueprint.archetype_id,
            archetype_id: synthesizedBlueprint.archetype_id,
            blueprint_json: synthesizedBlueprint,
          }),
        });
        if (stageRes.success && stageRes.data) {
          uuid = stageRes.data.blueprint_uuid;
          setStagedBlueprintUuid(uuid);
        } else {
          showToast("Failed to stage blueprint before publishing", "error");
          setIsPublishing(false);
          return;
        }
      }

      const pubRes = await fetchAPI<any>(
        API_ENDPOINTS.ENTERPRISE_CORE.SETUP.BLUEPRINT_PUBLISH(uuid!),
        {
          method: "POST",
          body: JSON.stringify({
            clear_existing: false,
            create_operating_context: true,
          }),
        }
      );

      if (pubRes.success) {
        clearDraft();
        showToast(i18n.catalog["orgStudio.setup.publishedSuccess"], "success");
        await load();
      } else {
        showToast(pubRes.message || "Failed to compile organization", "error");
      }
    } catch {
      showToast("Network error during blueprint compilation", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const saveOrganizationProfile = async () => {
    await callAndReload(() => fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.ORGANIZATION_PROFILE, {
      method: "POST",
      body: JSON.stringify({ ...organizationProfile, template_key: selectedTemplateKey }),
    }));
  };

  const applyOrganizationTemplate = async () => {
    await callAndReload(() => fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.APPLY_ORGANIZATION_TEMPLATE, { method: "POST" }));
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

  const handleApproveDefaultChart = async () => {
    await callAndReload(() => fetchAPI(API_ENDPOINTS.FINANCE.ACCOUNTS.STANDARD, { method: "POST" }));
  };

  const handleGenerateFiscalPeriods = async (year: number, variant: "calendar" | "quarterly" | "hijri") => {
    setIsSaving(true);
    try {
      if (variant === "quarterly") {
        const quarters = [
          { period_name: `${year}-Q1`, start_date: `${year}-01-01`, end_date: `${year}-03-31` },
          { period_name: `${year}-Q2`, start_date: `${year}-04-01`, end_date: `${year}-06-30` },
          { period_name: `${year}-Q3`, start_date: `${year}-07-01`, end_date: `${year}-09-30` },
          { period_name: `${year}-Q4`, start_date: `${year}-10-01`, end_date: `${year}-12-31` },
        ];
        for (const q of quarters) {
          await fetchAPI(API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE, {
            method: "POST",
            body: JSON.stringify(q),
          }).catch(() => null);
        }
      } else {
        // Standard 12 monthly calendar periods
        for (let m = 1; m <= 12; m++) {
          const mStr = String(m).padStart(2, "0");
          const lastDay = new Date(year, m, 0).getDate();
          const p = {
            period_name: `${year}-M${mStr}`,
            start_date: `${year}-${mStr}-01`,
            end_date: `${year}-${mStr}-${String(lastDay).padStart(2, "0")}`,
          };
          await fetchAPI(API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE, {
            method: "POST",
            body: JSON.stringify(p),
          }).catch(() => null);
        }
      }

      showToast(i18n.catalog["enterpriseCore.setup.createdSuccessfully"] || "Fiscal periods generated", "success");
      await load();
    } catch {
      showToast(i18n.catalog["enterpriseCore.setup.failedToSave"] || "Error generating periods", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const saveContext = async () => {
    if (!workingUnit || !costCenterId || !posTerminalId) {
      showToast(i18n.catalog["enterpriseCore.setup.failedToSave"], "error");
      return;
    }
    await callAndReload(() => fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.CONFIGURE, {
      method: "POST",
      body: JSON.stringify({
        org_node_uuid: workingUnit,
        cost_center_id: costCenterId,
        pos_terminal_id: posTerminalId,
      }),
    }));
  };

  const saveWorkingUnit = async () => {
    if (!selectedWorkingUnitNode || !workingUnitCode.trim()) {
      showToast(i18n.catalog["enterpriseCore.setup.failedToSave"], "error");
      return;
    }
    const currentAttributes = (selectedWorkingUnitNode.attributes_json as Item | undefined) ?? {};
    await callAndReload(() => fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODE(text(selectedWorkingUnitNode, "node_uuid")), {
      method: "PUT",
      body: JSON.stringify({
        code: workingUnitCode.trim(),
        attributes: { ...currentAttributes, ...(workingUnitName.trim() ? { name: workingUnitName.trim() } : {}) },
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

  // Protected return destination: validate returnTo to prevent open redirects
  const returnTo = searchParams.get("returnTo");
  const isValidReturnTo = (path: string | null): path is string =>
    typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.includes(":");

  const toggleModule = (moduleKey: string) => {
    setSelectedModuleKeys((current) => current.includes(moduleKey)
      ? current.filter((key) => key !== moduleKey)
      : [...current, moduleKey]);
  };

  const [foundationMode, setFoundationMode] = useState<"ai_studio" | "manual_template">("ai_studio");

  const onboarding = setupState?.onboarding ?? readiness?.onboarding;
  const moduleSelectionSaved = hasServerConfirmedModuleSelection(setupState);
  const requirementQueue = setupState?.requirement_queue ?? [];
  const requiresOperatingContext = requirementQueue.some((requirement) => requirement.key === "operating_context");
  const foundationComplete = onboarding?.phases.foundation.ready === true;
  const operatingLinksComplete = foundationComplete && onboarding?.phases.core_operations.ready === true;
  const workingUnitRequirementPending = moduleSelectionSaved
    && requirementQueue.some((requirement) => requirement.key === "working_unit")
    && readiness?.checks?.find((check) => check.key === "working_unit")?.complete !== true;
  const includeOperatingLinksStep = requiresOperatingContext
    || workingUnitRequirementPending
    || (moduleSelectionSaved && foundationComplete && !operatingLinksComplete);
  const canActivateModules = moduleSelectionSaved
    && foundationComplete
    && operatingLinksComplete
    && areSelectedModuleRequirementsReady(setupState);
  const launchReady = isSetupLaunchReady(setupState);

  useEffect(() => {
    if (!moduleSelectionSaved) {
      if (journeyStep !== "module_selection") setJourneyStep("module_selection");
      return;
    }
    if (journeyStep === "operating_links" && !foundationComplete) setJourneyStep("foundation");
    if (journeyStep === "optional_capabilities" && !operatingLinksComplete) setJourneyStep(foundationComplete ? "operating_links" : "foundation");
  }, [foundationComplete, journeyStep, moduleSelectionSaved, operatingLinksComplete]);

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
    operating_context: i18n.catalog["enterpriseCore.setup.scope.title"],
  };

  const dynamicChecks = useMemo(() => {
    const requirementKeys = new Set(requirementQueue
      .map((requirement) => requirement.key)
      .filter((key) => key !== "organizational_structure" && !key.startsWith("node_type:")));

    return (readiness?.checks ?? [])
      .filter((check) => requirementKeys.has(check.key))
      .map((check) => ({
        key: check.key,
        label: readinessLabels[check.key] ?? check.key,
        complete: check.complete,
      }));
  }, [
    requirementQueue,
    readiness?.checks,
    readinessLabels,
  ]);

  const journeySteps = [
    {
      id: "module_selection" as const,
      title: i18n.catalog["enterpriseCore.setup.modules.title"],
      description: i18n.catalog["enterpriseCore.setup.modules.description"],
      complete: moduleSelectionSaved,
      enabled: true,
    },
    {
      id: "foundation" as const,
      title: i18n.catalog["enterpriseCore.setup.profile.step.foundationTitle"],
      description: i18n.catalog["enterpriseCore.setup.profile.step.foundationDescription"],
      complete: foundationComplete,
      enabled: moduleSelectionSaved,
    },
    ...(includeOperatingLinksStep ? [{
      id: "operating_links" as const,
      title: i18n.catalog["enterpriseCore.setup.profile.step.operationsTitle"],
      description: i18n.catalog["enterpriseCore.setup.profile.step.operationsDescription"],
      complete: operatingLinksComplete,
      enabled: foundationComplete,
    }] : []),
    {
      id: "optional_capabilities" as const,
      title: i18n.catalog["enterpriseCore.setup.profile.step.expansionTitle"],
      description: i18n.catalog["enterpriseCore.setup.profile.step.expansionDescription"],
      complete: launchReady,
      enabled: moduleSelectionSaved && operatingLinksComplete,
    },
  ];

  const currentStepIndex = Math.max(0, journeySteps.findIndex((step) => step.id === journeyStep)) + 1;
  const currentStepTitle = journeySteps.find((s) => s.id === journeyStep)?.title;

  return (
    <div className="settings-wrapper setup-workflow space-y-6">
      {isStaleState ? (
        <div className="setup-stale-banner" role="alert" aria-live="assertive">
          {i18n.catalog["enterpriseCore.setup.staleStateBanner"]}
        </div>
      ) : null}
      {hasDraftData ? (
        <div className="setup-draft-banner" role="status" aria-live="polite">
          {i18n.catalog["enterpriseCore.setup.draftBanner"]}
        </div>
      ) : null}
      <SetupReadinessSummary
        title={i18n.catalog["enterpriseCore.setup.title"]}
        description={i18n.catalog["enterpriseCore.setup.subtitle"]}
        refreshLabel={i18n.catalog["enterpriseCore.setup.refresh"]}
        openDashboardLabel={i18n.catalog["enterpriseCore.setup.openDashboard"]}
        completeLabel={i18n.catalog["enterpriseCore.setup.complete"]}
        incompleteLabel={i18n.catalog["enterpriseCore.setup.incomplete"]}
        readiness={readiness}
        onboarding={onboarding}
        templateApplied={templateApplied}
        foundationLabel={i18n.catalog["enterpriseCore.setup.profile.step.foundationLabel"]}
        templateLabel={i18n.catalog["enterpriseCore.setup.profile.step.templateLabel"]}
        readinessLabels={readinessLabels}
        isLoading={isLoading}
        isSetupComplete={launchReady}
        progressLabel={i18n.catalog["enterpriseCore.setup.progress.title"]}
        formatCompletedCount={(completedCount, totalCount) => catalogText(i18n, "enterpriseCore.setup.progress.completed", { value0: completedCount, value1: totalCount })}
        canOpenDashboard={launchReady}
        onRefresh={() => void load()}
        onOpenDashboard={() => router.push(launchReady && isValidReturnTo(returnTo) ? returnTo : "/01-enterprise-core/system-overview/dashboard/global-dashboard")}
        dynamicChecks={dynamicChecks}
        activeStepTitle={currentStepTitle}
        activeStepIndex={currentStepIndex}
        totalSteps={journeySteps.length}
      />
      <SetupRequirementQueue
        requirements={requirementQueue}
        modules={setupState?.modules ?? []}
        readinessLabels={readinessLabels}
        locale={locale}
        title={i18n.catalog["enterpriseCore.setup.requirements.title"]}
        description={i18n.catalog["enterpriseCore.setup.requirements.description"]}
        formatRequiredBy={(moduleNames) => catalogText(i18n, "enterpriseCore.setup.requirements.requiredBy", { value0: moduleNames.join(" · ") })}
      />
      <SetupJourneyStepper
        activeStep={journeyStep}
        previousLabel={i18n.catalog["common.general.previous"]}
        nextLabel={i18n.catalog["common.general.next"]}
        completeLabel={i18n.catalog["enterpriseCore.setup.complete"]}
        steps={journeySteps}
        onPrevious={() => {
          const index = journeySteps.findIndex((step) => step.id === journeyStep);
          const previous = journeySteps[index - 1];
          if (previous) setJourneyStep(previous.id);
        }}
        onNext={() => {
          const index = journeySteps.findIndex((step) => step.id === journeyStep);
          const next = journeySteps[index + 1];
          if (next?.enabled) setJourneyStep(next.id);
        }}
      />
      {journeyStep === "foundation" ? <>
        <div className="space-y-6">
          <SetupOrganizationProfileSection
            templates={templateState?.templates ?? []}
            selectedTemplateKey={selectedTemplateKey}
            draft={organizationProfile}
            currencyOptions={currencyOptions}
            calendarOptions={calendarOptions}
            isSaving={isSaving}
            isApplied={templateApplied}
            canApply={templateState?.can_apply === true && Boolean(selectedTemplateKey)}
            onTemplateChange={(templateKey) => {
              setSelectedTemplateKey(templateKey);
              setOrganizationProfile((current) => ({ ...current, template_key: templateKey }));
            }}
            onChange={(changes) => setOrganizationProfile((current) => ({ ...current, ...changes }))}
            onSave={() => void saveOrganizationProfile()}
            onApply={() => void applyOrganizationTemplate()}
          />

          {inferenceEvaluation && synthesizedBlueprint ? (
            <BlueprintReviewCard
              evaluation={inferenceEvaluation}
              blueprint={synthesizedBlueprint}
              onUpdateBlueprint={(updated) => setSynthesizedBlueprint(updated)}
              onStage={handleStageBlueprint}
              onPublish={handlePublishBlueprint}
              isStaging={isStaging}
              isPublishing={isPublishing}
              deferredQuestions={adaptiveQuestions
                .filter((q) => questionAnswers[q.id] === null)
                .map((q) => ({ id: q.id, question: q.question, question_ar: q.question_ar }))}
            />
          ) : null}

          {templateApplied ? <p className="readiness-notice success">
            {i18n.catalog["enterpriseCore.setup.profile.appliedNotice"]}
          </p> : null}

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
            chartReady={readiness?.accounting_readiness?.chart_of_accounts.ready === true}
            periodReady={readiness?.accounting_readiness?.open_fiscal_period.ready === true}
            completeLabel={i18n.catalog["enterpriseCore.setup.complete"]}
            isSaving={isSaving}
            onAccountCodeChange={setAccountCode}
            onAccountNameChange={setAccountName}
            onAccountTypeChange={setAccountType}
            onPeriodNameChange={setPeriodName}
            onPeriodStartChange={setPeriodStart}
            onPeriodEndChange={setPeriodEnd}
            onCreateAccount={() => void createAccount()}
            onCreatePeriod={() => void createPeriod()}
            onApproveDefaultChart={handleApproveDefaultChart}
            onGenerateFiscalPeriods={handleGenerateFiscalPeriods}
            existingAccounts={accounts as any}
            existingPeriods={periods as any}
          />
        </div>
      </> : null}
      {journeyStep === "operating_links" && requiresOperatingContext ? (
        <SetupOperatingScopeSection
          title={i18n.catalog["enterpriseCore.setup.scope.title"]}
          description={i18n.catalog["enterpriseCore.setup.scope.description"]}
          foundationComplete={foundationComplete}
          foundationRequiredLabel={i18n.catalog["enterpriseCore.setup.scope.foundationRequired"]}
          workingUnitLabel={i18n.catalog["enterpriseCore.setup.scope.workingUnit"]}
          workingUnitCodeLabel={i18n.catalog["enterpriseCore.setup.scope.workingUnitCode"]}
          workingUnitNameLabel={i18n.catalog["enterpriseCore.setup.scope.workingUnitName"]}
          saveWorkingUnitLabel={i18n.catalog["enterpriseCore.setup.scope.saveWorkingUnit"]}
          costCenterLabel={i18n.catalog["enterpriseCore.setup.scope.costCenter"]}
          pointOfSaleLabel={i18n.catalog["enterpriseCore.setup.scope.pointOfSale"]}
          contextHelper={i18n.catalog["enterpriseCore.setup.scope.contextHelper"]}
          saveLabel={i18n.catalog["enterpriseCore.setup.scope.save"]}
          workingUnit={workingUnit}
          workingUnitCode={workingUnitCode}
          workingUnitName={workingUnitName}
          costCenterId={costCenterId}
          posTerminalId={posTerminalId}
          nodeOptions={workingUnitOptions}
          costOptions={costOptions}
          posOptions={posOptions}
          isSaving={isSaving}
          onWorkingUnitChange={setWorkingUnit}
          onWorkingUnitCodeChange={setWorkingUnitCode}
          onWorkingUnitNameChange={setWorkingUnitName}
          onSaveWorkingUnit={() => void saveWorkingUnit()}
          onCostCenterChange={setCostCenterId}
          onPosTerminalChange={setPosTerminalId}
          onSave={() => void saveContext()}
        />
      ) : null}
      {journeyStep === "module_selection" || journeyStep === "optional_capabilities" ? (
        <SetupModuleSelection
          locale={locale}
          modules={setupState?.modules ?? []}
          selectedModuleKeys={selectedModuleKeys}
          coreModuleKeys={onboarding?.starter_module_keys ?? []}
          mode={journeyStep === "module_selection" ? "selection" : "activation"}
          canSelect={journeyStep === "module_selection" && !isSaving}
          canActivate={journeyStep === "optional_capabilities" && canActivateModules && !isSaving}
          title={journeyStep === "module_selection" ? i18n.catalog["enterpriseCore.setup.modules.title"] : i18n.catalog["enterpriseCore.setup.profile.step.expansionTitle"]}
          description={journeyStep === "module_selection" ? i18n.catalog["enterpriseCore.setup.modules.description"] : i18n.catalog["enterpriseCore.setup.profile.step.expansionDescription"]}
          coreTitle={i18n.catalog["enterpriseCore.setup.modules.coreTitle"]}
          coreDescription={i18n.catalog["enterpriseCore.setup.modules.coreDescription"]}
          optionalTitle={i18n.catalog["enterpriseCore.setup.modules.optionalTitle"]}
          optionalDescription={i18n.catalog["enterpriseCore.setup.modules.optionalDescription"]}
          baselineRequiredLabel={i18n.catalog["enterpriseCore.setup.modules.baselineRequired"]}
          saveSelectionLabel={i18n.catalog["enterpriseCore.setup.modules.saveSelection"]}
          activateSelectedLabel={i18n.catalog["enterpriseCore.setup.modules.activateSelected"]}
          notSelectedLabel={i18n.catalog["enterpriseCore.setup.modules.notSelected"]}
          pendingReadinessLabel={i18n.catalog["enterpriseCore.setup.modules.pendingReadiness"]}
          readyToActivateLabel={i18n.catalog["enterpriseCore.setup.modules.readyToActivate"]}
          activeLabel={i18n.catalog["enterpriseCore.setup.modules.active"]}
          selectionRequiredLabel={i18n.catalog["enterpriseCore.setup.modules.selectionRequired"]}
          noRecordsLabel={i18n.catalog["enterpriseCore.setup.noRecords"]}
          isSaving={isSaving}
          onToggle={toggleModule}
          onSave={() => void saveModuleSelection()}
          onActivate={() => void activateSelectedModules()}
        />
      ) : null}
    </div>
  );
}
