"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { showToast } from "@/components/ui";
import { catalogText, useI18n } from "@/lib/i18n";
import { SetupAccountingSection } from "./components/SetupAccountingSection";
import { SetupFeedbackMessages } from "./components/SetupFeedbackMessages";
import { SetupJourneyStepper, type SetupJourneyStepId } from "./components/SetupJourneyStepper";
import { SetupModuleSelection } from "./components/SetupModuleSelection";
import { SetupOperatingScopeSection } from "./components/SetupOperatingScopeSection";
import { SetupOrganizationProfileSection } from "./components/SetupOrganizationProfileSection";
import { SetupReadinessSummary } from "./components/SetupReadinessSummary";
import { SetupRequirementQueue } from "./components/SetupRequirementQueue";
import { AdaptiveQuestionStepper, type AdaptiveQuestion } from "./components/AdaptiveQuestionStepper";
import { BlueprintReviewCard, type BlueprintData, type EvaluationData } from "./components/BlueprintReviewCard";
import type { AccountOption, CenterOption, FiscalPeriodOption, PosTerminalOption, WarehouseOption } from "./setup-api";
import { setupApi, type SetupListPayload } from "./setup-api";
import type { Item, OrganizationProfile, OrgNode, Readiness, SetupState } from "./types";
import { areSelectedModuleRequirementsReady, createSetupLoadSequence, detectStaleSetupState, getNextSetupJourneyStep, getSetupDirection, getSetupScopeCapabilities, hasServerConfirmedModuleSelection, isSetupLaunchReady } from "./setup-workflow";

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

function listFrom<T>(response: { data?: SetupListPayload<T> } | undefined | null): T[] {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray(payload.data)) return payload.data;
  return [];
}

function text<T extends object>(item: T, key: string): string {
  const value = (item as Record<string, unknown>)[key];
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
  const [requestError, setRequestError] = useState<string | null>(null);
  const prevSetupStateRef = useRef<SetupState | null>(null);
  const prevReadinessRef = useRef<Readiness | null>(null);
  const loadSequenceRef = useRef(createSetupLoadSequence());
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [setupState, setSetupState] = useState<SetupState | null>(null);
  const [costCenters, setCostCenters] = useState<CenterOption[]>([]);
  const [profitCenters, setProfitCenters] = useState<CenterOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [currencies, setCurrencies] = useState<Item[]>([]);
  const [factoryCalendars, setFactoryCalendars] = useState<Item[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [periods, setPeriods] = useState<FiscalPeriodOption[]>([]);
  const [posTerminals, setPosTerminals] = useState<PosTerminalOption[]>([]);
  const [nodes, setNodes] = useState<OrgNode[]>([]);
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
  const lastAutoPopulatedWorkingUnitRef = useRef<string | null>(null);
  const [workingUnitCode, setWorkingUnitCode] = useState("");
  const [workingUnitName, setWorkingUnitName] = useState("");
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [costCenterId, setCostCenterId] = useState<number | null>(null);
  const [profitCenterId, setProfitCenterId] = useState<number | null>(null);
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
  const [inferenceEvaluation, setInferenceEvaluation] = useState<EvaluationData | null>((draft.inferenceEvaluation as EvaluationData | undefined) ?? null);
  const [inferenceSignals, setInferenceSignals] = useState<unknown>(draft.inferenceSignals ?? null);
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<AdaptiveQuestion[]>((draft.adaptiveQuestions as AdaptiveQuestion[]) ?? []);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, unknown>>((draft.questionAnswers as Record<string, unknown>) ?? {});
  const [synthesizedBlueprint, setSynthesizedBlueprint] = useState<BlueprintData | null>((draft.synthesizedBlueprint as BlueprintData | undefined) ?? null);
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

  const load = useCallback(async (options: { navigate?: boolean; acknowledgeStale?: boolean; mutationConfirmed?: boolean } = {}) => {
    const requestId = loadSequenceRef.current.begin();
    setIsLoading(true);
    try {
      const [readinessResponse, setupResponse, templateResponse, nodesResponse, costsResponse, profitsResponse, currenciesResponse, factoryCalendarsResponse, accountsResponse, periodsResponse] = await Promise.all([
        setupApi.getReadiness(),
        setupApi.getState(),
        setupApi.getOrganizationTemplates(),
        setupApi.getOrganizationNodes(),
        setupApi.getCostCenters(),
        setupApi.getProfitCenters(),
        setupApi.getCurrencies(),
        setupApi.getFactoryCalendars(),
        setupApi.getAccounts(),
        setupApi.getFiscalPeriods(),
      ]);

      if (!loadSequenceRef.current.isCurrent(requestId)) return null;
      if (!readinessResponse.success || !readinessResponse.data || !setupResponse.success || !setupResponse.data) {
        const message = readinessResponse.message || setupResponse.message || i18n.catalog["enterpriseCore.setup.failedToLoad"];
        setRequestError(message);
        showToast(message, "error");
        return null;
      }

      const incomingReadiness = readinessResponse.data;
      const baseState = setupResponse.data;
      const templateState = baseState.organization_template
        ?? (templateResponse.success ? templateResponse.data : undefined);
      const state: SetupState = templateState
        ? { ...baseState, organization_template: templateState }
        : baseState;
      const capabilities = getSetupScopeCapabilities(state.requirement_queue ?? []);
      let warehousesResponse: Awaited<ReturnType<typeof setupApi.getWarehouses>> | null = null;
      let posTerminalsResponse: Awaited<ReturnType<typeof setupApi.getPosTerminals>> | null = null;
      if (capabilities.requiresWarehouse || capabilities.requiresPosTerminal) {
        [warehousesResponse, posTerminalsResponse] = await Promise.all([
          setupApi.getWarehouses(),
          setupApi.getPosTerminals(),
        ]);
      }
      if (!loadSequenceRef.current.isCurrent(requestId)) return null;

      const firstSnapshot = prevSetupStateRef.current === null;
      const changed = detectStaleSetupState(prevSetupStateRef.current, state, prevReadinessRef.current, incomingReadiness);
      if (changed && !options.mutationConfirmed) setIsStaleState(true);
      else if (options.acknowledgeStale || options.mutationConfirmed) setIsStaleState(false);
      setRequestError(null);
      prevSetupStateRef.current = state;
      prevReadinessRef.current = incomingReadiness;
      setReadiness(incomingReadiness);
      setSetupState(state);
      const hydrateDraftForms = firstSnapshot || options.navigate === true;
      if (hydrateDraftForms) {
        setSelectedModuleKeys(state.selected_module_keys.length ? state.selected_module_keys : state.onboarding?.starter_module_keys ?? []);
        setJourneyStep(getNextSetupJourneyStep(state, incomingReadiness));
        const savedProfile = state.organization_template?.profile;
        if (savedProfile) {
          setOrganizationProfile({ ...emptyOrganizationProfile, ...savedProfile });
          setSelectedTemplateKey(savedProfile.template_key);
        } else if (state.organization_template?.templates[0]) {
          setSelectedTemplateKey((current) => current || state.organization_template!.templates[0].key);
        }
        const context = incomingReadiness.context;
        setWorkingUnit(context?.org_node_uuid ?? "");
        setWarehouseId(context?.warehouse_id ?? null);
        setCostCenterId(context?.cost_center_id ?? null);
        setProfitCenterId(context?.profit_center_id ?? null);
        setPosTerminalId(context?.pos_terminal_id ?? null);
      }
      if (nodesResponse.success) setNodes(listFrom(nodesResponse).filter((node) => node.status === "active"));
      if (costsResponse.success) setCostCenters(listFrom(costsResponse).filter((item) => item.is_active !== false));
      if (profitsResponse.success) setProfitCenters(listFrom(profitsResponse).filter((item) => item.is_active !== false));
      if (currenciesResponse.success) setCurrencies(listFrom(currenciesResponse).filter((item) => item.is_active !== false));
      if (factoryCalendarsResponse.success) setFactoryCalendars(listFrom(factoryCalendarsResponse).filter((item) => item.is_active !== false));
      if (accountsResponse.success) setAccounts(listFrom(accountsResponse).filter((item) => item.is_active !== false));
      if (periodsResponse.success) setPeriods(listFrom(periodsResponse));
      if (warehousesResponse?.success) setWarehouses(listFrom(warehousesResponse).filter((item) => item.is_active));
      if (posTerminalsResponse?.success) setPosTerminals(listFrom(posTerminalsResponse).filter((item) => item.is_active));
      const failedReference = [
        nodesResponse,
        costsResponse,
        profitsResponse,
        currenciesResponse,
        factoryCalendarsResponse,
        accountsResponse,
        periodsResponse,
        ...(warehousesResponse ? [warehousesResponse] : []),
        ...(posTerminalsResponse ? [posTerminalsResponse] : []),
      ].find((response) => !response.success);
      if (failedReference) {
        const message = failedReference.message || i18n.catalog["enterpriseCore.setup.failedToLoad"];
        setRequestError(message);
        showToast(message, "error");
      }
      return { state, readiness: incomingReadiness };
    } catch {
      if (loadSequenceRef.current.isCurrent(requestId)) {
        const message = i18n.catalog["enterpriseCore.setup.failedToLoad"];
        setRequestError(message);
        showToast(message, "error");
      }
      return null;
    } finally {
      if (loadSequenceRef.current.isCurrent(requestId)) setIsLoading(false);
    }
  }, [i18n.catalog]);

  useEffect(() => { void load({ navigate: true }); }, [load]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [load]);

  const templateState = setupState?.organization_template;
  const templateApplied = templateState?.is_applied === true;
  const requirementQueue = useMemo(() => setupState?.requirement_queue ?? [], [setupState?.requirement_queue]);
  const scopeCapabilities = getSetupScopeCapabilities(requirementQueue);
  const activeNodes = useMemo(() => nodes.filter((node) => text(node, "node_type_id") === "COMP_CODE"), [nodes]);
  const workingUnitOptions = useMemo(() => activeNodes.map((node) => ({
    value: text(node, "node_uuid"),
    label: catalogText(i18n, "enterpriseCore.setup.nodeSummary", {
      value0: text(node, "code"),
      value1: text(node.meta_type ?? {}, locale === "ar-SA" ? "display_name_ar" : "display_name") || text(node, "node_type_id"),
    }),
  })), [activeNodes, i18n, locale]);
  const selectedWorkingUnitNode = useMemo(
    () => nodes.find((node) => text(node, "node_uuid") === workingUnit) ?? null,
    [nodes, workingUnit],
  );
  useEffect(() => {
    if (!selectedWorkingUnitNode) return;
    const nodeUuid = text(selectedWorkingUnitNode, "node_uuid");
    if (lastAutoPopulatedWorkingUnitRef.current === nodeUuid) return;
    setWorkingUnitCode(text(selectedWorkingUnitNode, "code"));
    const attributes = selectedWorkingUnitNode.attributes_json as Item | undefined;
    setWorkingUnitName(text(attributes ?? {}, "name"));
    lastAutoPopulatedWorkingUnitRef.current = nodeUuid;
  }, [selectedWorkingUnitNode]);
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
  const warehouseOptions = useMemo(() => warehouses.map((warehouse) => ({
    value: Number(warehouse.id),
    label: [text(warehouse, "code"), text(warehouse, locale === "ar-SA" ? "name" : "name_en") || text(warehouse, "name")].filter(Boolean).join(" — "),
  })), [warehouses, locale]);
  const posOptions = useMemo(() => posTerminals.map((terminal) => ({
    value: Number(terminal.id),
    label: [text(terminal, "code"), text(terminal, locale === "ar-SA" ? "name" : "name_en") || text(terminal, "name")].filter(Boolean).join(" — "),
  })), [posTerminals, locale]);
  const selectedPosTerminal = useMemo(
    () => posTerminals.find((terminal) => terminal.id === posTerminalId) ?? null,
    [posTerminals, posTerminalId],
  );
  const selectedScopeWarehouse = useMemo(() => {
    const linkedWarehouseId = scopeCapabilities.requiresPosTerminal ? selectedPosTerminal?.warehouse_id : warehouseId;
    return warehouses.find((warehouse) => warehouse.id === linkedWarehouseId) ?? null;
  }, [scopeCapabilities.requiresPosTerminal, selectedPosTerminal, warehouseId, warehouses]);
  const selectedCostCenterForScope = scopeCapabilities.requiresPosTerminal
    ? selectedPosTerminal?.cost_center_id ?? selectedScopeWarehouse?.cost_center_id ?? null
    : scopeCapabilities.requiresWarehouse ? selectedScopeWarehouse?.cost_center_id ?? null : costCenterId;
  const selectedProfitCenterForScope = scopeCapabilities.requiresPosTerminal
    ? selectedPosTerminal?.profit_center_id ?? selectedScopeWarehouse?.profit_center_id ?? null
    : scopeCapabilities.requiresWarehouse ? selectedScopeWarehouse?.profit_center_id ?? null : profitCenterId;
  const centerSummary = (id: number | null | undefined, centers: CenterOption[]) => {
    if (id == null) return null;
    const center = centers.find((item) => item.id === id);
    return center ? [text(center, "code"), text(center, locale === "ar-SA" ? "name" : "name_en") || text(center, "name")].filter(Boolean).join(" — ") : null;
  };
  const linkedWarehouseSummary = selectedScopeWarehouse
    ? [text(selectedScopeWarehouse, "code"), text(selectedScopeWarehouse, locale === "ar-SA" ? "name" : "name_en") || text(selectedScopeWarehouse, "name")].filter(Boolean).join(" — ")
    : null;
  const linkedCostCenterSummary = centerSummary(selectedCostCenterForScope, costCenters);
  const linkedProfitCenterSummary = centerSummary(selectedProfitCenterForScope, profitCenters);
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
      setRequestError(null);
      showToast(i18n.catalog["enterpriseCore.setup.createdSuccessfully"], "success");
      await load({ navigate: true, mutationConfirmed: true });
      return response.data ?? null;
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : i18n.catalog["enterpriseCore.setup.failedToSave"];
      setRequestError(message);
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
      const res = await setupApi.analyzeSetup({
        description,
        company_name: organizationProfile.company_name || undefined,
        country_code: organizationProfile.country_code || "SA",
        currency_id: organizationProfile.currency_id || undefined,
      });

      if (res.success && res.data) {
        setInferenceEvaluation(res.data.evaluation);
        setInferenceSignals(res.data.signals);
        setAdaptiveQuestions(res.data.adaptive_questions || []);
        setSynthesizedBlueprint(res.data.blueprint ?? null);
        showToast("Structure inferred successfully", "success");
      } else {
        const message = res.message || "Failed to analyze business signals";
        setRequestError(message);
        showToast(message, "error");
      }
    } catch {
      const message = "Error analyzing business description";
      setRequestError(message);
      showToast(message, "error");
    } finally {
      setIsInferenceLoading(false);
    }
  };

  const handleApplyAnswers = async () => {
    if (!lastDescription) return;
    setIsInferenceLoading(true);
    try {
      const res = await setupApi.analyzeSetup({
        description: lastDescription,
        company_name: organizationProfile.company_name || undefined,
        structured: questionAnswers,
      });

      if (res.success && res.data) {
        setInferenceEvaluation(res.data.evaluation);
        setInferenceSignals(res.data.signals);
        setAdaptiveQuestions(res.data.adaptive_questions || []);
        setSynthesizedBlueprint(res.data.blueprint ?? null);
        showToast("Blueprint refined with answers", "success");
      } else {
        const message = res.message || "Failed to refine blueprint";
        setRequestError(message);
        showToast(message, "error");
      }
    } catch {
      const message = "Failed to refine blueprint";
      setRequestError(message);
      showToast(message, "error");
    } finally {
      setIsInferenceLoading(false);
    }
  };

  const handleStageBlueprint = async () => {
    if (!synthesizedBlueprint) return;
    setIsStaging(true);
    try {
      const res = await setupApi.stageBlueprint({
        name: organizationProfile.company_name || synthesizedBlueprint.archetype_id,
        archetype_id: synthesizedBlueprint.archetype_id,
        blueprint_json: synthesizedBlueprint,
      });

      if (res.success && res.data) {
        setStagedBlueprintUuid(res.data.blueprint_uuid);
        showToast("Blueprint draft saved", "success");
      } else {
        const message = res.message || "Failed to save draft";
        setRequestError(message);
        showToast(message, "error");
      }
    } catch {
      const message = "Error staging blueprint";
      setRequestError(message);
      showToast(message, "error");
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
        const stageRes = await setupApi.stageBlueprint({
          name: organizationProfile.company_name || synthesizedBlueprint.archetype_id,
          archetype_id: synthesizedBlueprint.archetype_id,
          blueprint_json: synthesizedBlueprint,
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

      const pubRes = await setupApi.publishBlueprint(uuid!, {
        clear_existing: false,
        create_operating_context: true,
      });

      if (pubRes.success) {
        clearDraft();
        setRequestError(null);
        showToast(i18n.catalog["orgStudio.setup.publishedSuccess"], "success");
        await load({ navigate: true, mutationConfirmed: true });
      } else {
        const message = pubRes.message || "Failed to compile organization";
        setRequestError(message);
        showToast(message, "error");
      }
    } catch {
      const message = "Network error during blueprint compilation";
      setRequestError(message);
      showToast(message, "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const saveOrganizationProfile = async () => {
    await callAndReload(() => setupApi.saveOrganizationProfile({ ...organizationProfile, template_key: selectedTemplateKey }));
  };

  const applyOrganizationTemplate = async () => {
    await callAndReload(() => setupApi.applyOrganizationTemplate());
  };

  const createAccount = async () => {
    if (!accountCode.trim() || !accountName.trim()) {
      showToast(i18n.catalog["enterpriseCore.setup.failedToSave"], "error");
      return;
    }
    const saved = await callAndReload(() => setupApi.createAccount({
      code: accountCode.trim(),
      name: accountName.trim(),
      type: accountType,
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
    const saved = await callAndReload(() => setupApi.createFiscalPeriod({
      period_name: periodName.trim(),
      start_date: periodStart,
      end_date: periodEnd,
    }));
    if (saved) {
      setPeriodName("");
      setPeriodStart("");
      setPeriodEnd("");
    }
  };

  const handleApproveDefaultChart = async () => {
    await callAndReload(() => setupApi.ensureStandardChart());
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
          const response = await setupApi.createFiscalPeriod(q);
          if (!response.success) throw new Error(response.message || i18n.catalog["enterpriseCore.setup.failedToSave"]);
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
          const response = await setupApi.createFiscalPeriod(p);
          if (!response.success) throw new Error(response.message || i18n.catalog["enterpriseCore.setup.failedToSave"]);
        }
      }

      showToast(i18n.catalog["enterpriseCore.setup.createdSuccessfully"] || "Fiscal periods generated", "success");
      await load();
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : i18n.catalog["enterpriseCore.setup.failedToSave"] || "Error generating periods";
      setRequestError(message);
      showToast(message, "error");
      await load();
    } finally {
      setIsSaving(false);
    }
  };

  const saveContext = async () => {
    const contextRequest = {
      org_node_uuid: workingUnit,
      ...(scopeCapabilities.requiresCostCenter && !scopeCapabilities.requiresWarehouse && !scopeCapabilities.requiresPosTerminal && costCenterId !== null ? { cost_center_id: costCenterId } : {}),
      ...(scopeCapabilities.requiresProfitCenter && !scopeCapabilities.requiresWarehouse && !scopeCapabilities.requiresPosTerminal && profitCenterId !== null ? { profit_center_id: profitCenterId } : {}),
      ...(scopeCapabilities.requiresWarehouse && !scopeCapabilities.requiresPosTerminal && warehouseId !== null ? { warehouse_id: warehouseId } : {}),
      ...(scopeCapabilities.requiresPosTerminal && posTerminalId !== null ? { pos_terminal_id: posTerminalId } : {}),
    };
    const hasRequiredScope = Boolean(workingUnit)
      && (!scopeCapabilities.requiresWarehouse || scopeCapabilities.requiresPosTerminal || warehouseId !== null)
      && (!scopeCapabilities.requiresPosTerminal || posTerminalId !== null)
      && (!scopeCapabilities.requiresCostCenter || selectedCostCenterForScope !== null)
      && (!scopeCapabilities.requiresProfitCenter || selectedProfitCenterForScope !== null);
    if (!hasRequiredScope) {
      const message = i18n.catalog["enterpriseCore.setup.failedToSave"];
      setRequestError(message);
      showToast(message, "error");
      return;
    }
    await callAndReload(() => setupApi.configureOperatingContext(contextRequest));
  };

  const saveWorkingUnit = async () => {
    if (!selectedWorkingUnitNode || !workingUnitCode.trim()) {
      showToast(i18n.catalog["enterpriseCore.setup.failedToSave"], "error");
      return;
    }
    const currentAttributes = (selectedWorkingUnitNode.attributes_json as Item | undefined) ?? {};
    await callAndReload(() => setupApi.updateOrganizationNode(text(selectedWorkingUnitNode, "node_uuid"), {
      code: workingUnitCode.trim(),
      attributes: { ...currentAttributes, ...(workingUnitName.trim() ? { name: workingUnitName.trim() } : {}) },
    }));
  };

  const saveModuleSelection = async () => {
    await callAndReload(() => setupApi.selectModules(selectedModuleKeys));
  };

  const activateSelectedModules = async () => {
    setIsSaving(true);
    try {
      const fresh = await load();
      const ready = Boolean(fresh)
        && fresh!.state.onboarding?.phases.foundation.ready === true
        && fresh!.state.onboarding?.phases.core_operations.ready === true
        && areSelectedModuleRequirementsReady(fresh!.state);
      if (!fresh || !ready) {
        const message = i18n.catalog["enterpriseCore.setup.modules.pendingReadiness"];
        setRequestError(message);
        showToast(message, "error");
        return;
      }
      const response = await setupApi.activateSelectedModules();
      if (!response.success) throw new Error(response.message);
      setRequestError(null);
      showToast(i18n.catalog["enterpriseCore.setup.createdSuccessfully"], "success");
      await load({ navigate: true, mutationConfirmed: true });
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : i18n.catalog["enterpriseCore.setup.failedToSave"];
      setRequestError(message);
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Protected return destination: validate returnTo to prevent open redirects
  const returnTo = searchParams.get("returnTo");
  const isValidReturnTo = (path: string | null): path is string =>
    typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.includes(":");

  const openDashboard = async () => {
    const fresh = await load();
    if (!fresh || !isSetupLaunchReady(fresh.state)) {
      const message = i18n.catalog["enterpriseCore.setup.modules.pendingReadiness"];
      setRequestError(message);
      showToast(message, "error");
      return;
    }
    router.push(isValidReturnTo(returnTo) ? returnTo : "/01-enterprise-core/system-overview/dashboard/global-dashboard");
  };

  const toggleModule = (moduleKey: string) => {
    setSelectedModuleKeys((current) => current.includes(moduleKey)
      ? current.filter((key) => key !== moduleKey)
      : [...current, moduleKey]);
  };

  const [foundationMode, setFoundationMode] = useState<"ai_studio" | "manual_template">("ai_studio");

  const onboarding = setupState?.onboarding ?? readiness?.onboarding;
  const moduleSelectionSaved = hasServerConfirmedModuleSelection(setupState);
  const requiresOperatingContext = scopeCapabilities.requiresOperatingContext;
  const foundationComplete = onboarding?.phases.foundation.ready === true;
  const operatingLinksComplete = foundationComplete && onboarding?.phases.core_operations.ready === true;
  const workingUnitRequirementPending = moduleSelectionSaved
    && requirementQueue.some((requirement) => requirement.key === "working_unit")
    && readiness?.checks?.find((check) => check.key === "working_unit")?.complete !== true;
  const hasScopeRequirements = requiresOperatingContext
    || scopeCapabilities.requiresWorkingUnit
    || scopeCapabilities.requiresWarehouse
    || scopeCapabilities.requiresPosTerminal
    || scopeCapabilities.requiresCostCenter
    || scopeCapabilities.requiresProfitCenter;
  const includeOperatingLinksStep = moduleSelectionSaved && (
    hasScopeRequirements
    || workingUnitRequirementPending
    || (foundationComplete && !operatingLinksComplete)
  );
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

  const accountTypeLabels = useMemo<Record<AccountType, string>>(() => ({
    asset: i18n.catalog["enterpriseCore.setup.accountType.asset"],
    liability: i18n.catalog["enterpriseCore.setup.accountType.liability"],
    equity: i18n.catalog["enterpriseCore.setup.accountType.equity"],
    revenue: i18n.catalog["enterpriseCore.setup.accountType.revenue"],
    expense: i18n.catalog["enterpriseCore.setup.accountType.expense"],
  }), [i18n.catalog]);
  const readinessLabels = useMemo<Record<string, string>>(() => ({
    working_unit: i18n.catalog["enterpriseCore.setup.check.workingUnit"],
    warehouse: i18n.catalog["enterpriseCore.setup.check.warehouse"],
    cost_center: i18n.catalog["enterpriseCore.setup.check.costCenter"],
    profit_center: i18n.catalog["enterpriseCore.setup.check.profitCenter"],
    pos_terminal: i18n.catalog["enterpriseCore.setup.check.posTerminal"],
    organizational_structure: i18n.catalog["enterpriseCore.setup.check.organizationalStructure"],
    open_fiscal_period: i18n.catalog["enterpriseCore.setup.check.openFiscalPeriod"],
    chart_of_accounts: i18n.catalog["enterpriseCore.setup.check.chartOfAccounts"],
    operating_context: i18n.catalog["enterpriseCore.setup.scope.title"],
  }), [i18n.catalog]);

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
    <div className="settings-wrapper setup-workflow space-y-6" dir={getSetupDirection(locale)}>
      <SetupFeedbackMessages
        staleMessage={isStaleState ? i18n.catalog["enterpriseCore.setup.staleStateBanner"] : undefined}
        draftMessage={hasDraftData ? i18n.catalog["enterpriseCore.setup.draftBanner"] : undefined}
        errorMessage={requestError}
      />
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
        onRefresh={() => void load({ acknowledgeStale: true })}
        onOpenDashboard={() => void openDashboard()}
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
        onStepSelect={setJourneyStep}
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
            existingAccounts={accounts.map((account) => ({
              id: account.id,
              code: account.account_code,
              name: account.account_name,
              type: account.account_type,
            }))}
            existingPeriods={periods.map((period) => ({
              id: period.id,
              period_name: period.period_name,
              start_date: period.start_date,
              end_date: period.end_date,
              is_closed: period.is_closed,
            }))}
          />
        </div>
      </> : null}
      {journeyStep === "operating_links" && includeOperatingLinksStep ? (
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
          profitCenterLabel={i18n.catalog["enterpriseCore.setup.scope.profitCenter"]}
          warehouseLabel={i18n.catalog["enterpriseCore.setup.scope.warehouse"]}
          pointOfSaleLabel={i18n.catalog["enterpriseCore.setup.scope.pointOfSale"]}
          linkedWarehouseLabel={i18n.catalog["enterpriseCore.setup.scope.linkedWarehouse"]}
          linkedCostCenterLabel={i18n.catalog["enterpriseCore.setup.scope.linkedCostCenter"]}
          linkedProfitCenterLabel={i18n.catalog["enterpriseCore.setup.scope.linkedProfitCenter"]}
          missingLinkedResourceLabel={i18n.catalog["enterpriseCore.setup.scope.missingLinkedResource"]}
          contextHelper={i18n.catalog["enterpriseCore.setup.scope.contextHelper"]}
          saveLabel={i18n.catalog["enterpriseCore.setup.scope.save"]}
          requiresCostCenter={scopeCapabilities.requiresCostCenter}
          requiresProfitCenter={scopeCapabilities.requiresProfitCenter}
          requiresWarehouse={scopeCapabilities.requiresWarehouse}
          requiresPosTerminal={scopeCapabilities.requiresPosTerminal}
          workingUnit={workingUnit}
          workingUnitCode={workingUnitCode}
          workingUnitName={workingUnitName}
          warehouseId={warehouseId}
          costCenterId={selectedCostCenterForScope}
          profitCenterId={selectedProfitCenterForScope}
          posTerminalId={posTerminalId}
          linkedWarehouseSummary={linkedWarehouseSummary}
          linkedCostCenterSummary={linkedCostCenterSummary}
          linkedProfitCenterSummary={linkedProfitCenterSummary}
          nodeOptions={workingUnitOptions}
          costOptions={costOptions}
          profitOptions={profitOptions}
          warehouseOptions={warehouseOptions}
          posOptions={posOptions}
          isSaving={isSaving}
          onWorkingUnitChange={(value) => {
            setWorkingUnit(value);
            if (!value) lastAutoPopulatedWorkingUnitRef.current = null;
          }}
          onWorkingUnitCodeChange={setWorkingUnitCode}
          onWorkingUnitNameChange={setWorkingUnitName}
          onSaveWorkingUnit={() => void saveWorkingUnit()}
          onWarehouseChange={setWarehouseId}
          onCostCenterChange={setCostCenterId}
          onProfitCenterChange={setProfitCenterId}
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
