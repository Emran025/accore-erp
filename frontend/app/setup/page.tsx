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
import type { AccountOption, CenterOption, CurrencyOption, FactoryCalendarOption, FiscalPeriodOption, PosTerminalOption, WarehouseOption } from "./setup-api";
import { setupApi, type SetupListPayload } from "./setup-api";
import { omitSetupDraftSection, readSetupFormDraft, writeSetupFormDraft, type SetupFormDraft } from "./setup-draft";
import type { Item, OrganizationProfile, OrgNode, Readiness, SetupState } from "./types";
import { canNavigateToSetupStep, createSetupLoadSequence, detectStaleSetupState, getNextSetupJourneyStep, getSetupDirection, getSetupInferenceContextSignature, getSetupScopeCapabilities, hasActivatableSelectedModule, hasServerConfirmedModuleSelection, isSetupLaunchReady, resolveSetupReturnDestination } from "./setup-workflow";

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

function answerSignature(answers: Record<string, unknown>): string {
  return JSON.stringify(Object.fromEntries(Object.entries(answers).sort(([left], [right]) => left.localeCompare(right))));
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formDraft, setFormDraft] = useState<SetupFormDraft>(() => readSetupFormDraft());
  const formDraftRef = useRef(formDraft);
  const prevSetupStateRef = useRef<SetupState | null>(null);
  const setupRevisionRef = useRef<number | null>(null);
  const prevSetupRevisionRef = useRef<number | null>(null);
  const prevReadinessRef = useRef<Readiness | null>(null);
  const loadSequenceRef = useRef(createSetupLoadSequence());
  const inferenceRequestSequenceRef = useRef(0);
  const pendingStepFocusRef = useRef(false);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [setupState, setSetupState] = useState<SetupState | null>(null);
  const [costCenters, setCostCenters] = useState<CenterOption[]>([]);
  const [profitCenters, setProfitCenters] = useState<CenterOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [factoryCalendars, setFactoryCalendars] = useState<FactoryCalendarOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [periods, setPeriods] = useState<FiscalPeriodOption[]>([]);
  const [posTerminals, setPosTerminals] = useState<PosTerminalOption[]>([]);
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [selectedModuleKeys, setSelectedModuleKeys] = useState<string[]>(() => formDraft.moduleSelection?.selectedModuleKeys ?? []);
  const [journeyStep, setJourneyStep] = useState<SetupJourneyStepId>("module_selection");
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile>(() => formDraft.organizationProfile?.profile ?? emptyOrganizationProfile);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(() => formDraft.organizationProfile?.selectedTemplateKey ?? "");

  const [accountCode, setAccountCode] = useState(() => formDraft.account?.accountCode ?? "");
  const [accountName, setAccountName] = useState(() => formDraft.account?.accountName ?? "");
  const [accountType, setAccountType] = useState<AccountType>(() => formDraft.account?.accountType ?? "asset");
  const [periodName, setPeriodName] = useState(() => formDraft.fiscalPeriod?.periodName ?? "");
  const [periodStart, setPeriodStart] = useState(() => formDraft.fiscalPeriod?.periodStart ?? "");
  const [periodEnd, setPeriodEnd] = useState(() => formDraft.fiscalPeriod?.periodEnd ?? "");

  const [workingUnit, setWorkingUnit] = useState(() => formDraft.operatingScope?.workingUnit ?? "");
  const lastAutoPopulatedWorkingUnitRef = useRef<string | null>(null);
  const [workingUnitCode, setWorkingUnitCode] = useState(() => formDraft.workingUnitDetails?.workingUnitCode ?? "");
  const [workingUnitName, setWorkingUnitName] = useState(() => formDraft.workingUnitDetails?.workingUnitName ?? "");
  const [warehouseId, setWarehouseId] = useState<number | null>(() => formDraft.operatingScope?.warehouseId ?? null);
  const [costCenterId, setCostCenterId] = useState<number | null>(() => formDraft.operatingScope?.costCenterId ?? null);
  const [profitCenterId, setProfitCenterId] = useState<number | null>(() => formDraft.operatingScope?.profitCenterId ?? null);
  const [posTerminalId, setPosTerminalId] = useState<number | null>(() => formDraft.operatingScope?.posTerminalId ?? null);

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

  const updateFormDraft = <K extends keyof SetupFormDraft,>(section: K, value: SetupFormDraft[K] | undefined) => {
    setFormDraft((current) => value === undefined
      ? omitSetupDraftSection(current, section)
      : { ...current, [section]: value });
  };

  const clearDraft = () => {
    if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
    setLastDescription("");
    setInferenceEvaluation(null);
    setInferenceSignals(null);
    setAdaptiveQuestions([]);
    setQuestionAnswers({});
    setSynthesizedBlueprint(null);
    setStagedBlueprintUuid(null);
    setStagedBlueprintRevision(null);
    setInferenceContextSnapshot("");
    setInferenceDescriptionSnapshot("");
    setInferenceAnswersSnapshot("{}");
    setHasDraftData(Object.keys(formDraftRef.current).length > 0);
  };

  const invalidateStagedBlueprint = () => {
    setStagedBlueprintUuid(null);
    setStagedBlueprintRevision(null);
    saveDraft({ stagedBlueprintUuid: null, stagedBlueprintRevision: null });
  };

  const draft = readDraft();

  // Restore the saved-draft notice for both inference and ordinary setup forms.
  useEffect(() => {
    const stored = readDraft();
    setHasDraftData(
      Boolean(stored.lastDescription || stored.inferenceEvaluation || stored.synthesizedBlueprint || stored.stagedBlueprintUuid)
        || Object.keys(readSetupFormDraft()).length > 0,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    formDraftRef.current = formDraft;
    writeSetupFormDraft(formDraft);
    const stored = readDraft();
    setHasDraftData(
      Object.keys(formDraft).length > 0
        || Boolean(stored.lastDescription || stored.inferenceEvaluation || stored.synthesizedBlueprint || stored.stagedBlueprintUuid),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDraft]);

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
  const [stagedBlueprintRevision, setStagedBlueprintRevision] = useState<string | null>((draft.stagedBlueprintRevision as string | undefined) ?? null);
  const [inferenceContextSnapshot, setInferenceContextSnapshot] = useState<string>((draft.inferenceContextSnapshot as string | undefined) ?? "");
  const [inferenceDescriptionSnapshot, setInferenceDescriptionSnapshot] = useState<string>((draft.inferenceDescriptionSnapshot as string | undefined) ?? "");
  const [inferenceAnswersSnapshot, setInferenceAnswersSnapshot] = useState<string>((draft.inferenceAnswersSnapshot as string | undefined) ?? "{}");

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
        stagedBlueprintRevision,
        inferenceContextSnapshot,
        inferenceDescriptionSnapshot,
        inferenceAnswersSnapshot,
      });
    }
    setHasDraftData(
      Object.keys(formDraftRef.current).length > 0
        || Boolean(lastDescription || inferenceEvaluation || synthesizedBlueprint || stagedBlueprintUuid),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastDescription, inferenceEvaluation, inferenceSignals, adaptiveQuestions, questionAnswers, synthesizedBlueprint, stagedBlueprintUuid, stagedBlueprintRevision, inferenceContextSnapshot, inferenceDescriptionSnapshot, inferenceAnswersSnapshot]);

  const load = useCallback(async (options: { navigate?: boolean; acknowledgeStale?: boolean; mutationConfirmed?: boolean } = {}) => {
    const requestId = loadSequenceRef.current.begin();
    setIsLoading(true);
    try {
      const fetchSnapshot = () => Promise.all([
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
      let [readinessResponse, setupResponse, templateResponse, nodesResponse, costsResponse, profitsResponse, currenciesResponse, factoryCalendarsResponse, accountsResponse, periodsResponse] = await fetchSnapshot();

      if (!loadSequenceRef.current.isCurrent(requestId)) return null;
      if (!readinessResponse.success || !readinessResponse.data || !setupResponse.success || !setupResponse.data) {
        const message = readinessResponse.message || setupResponse.message || i18n.catalog["enterpriseCore.setup.failedToLoad"];
        setRequestError(message);
        showToast(message, "error");
        return null;
      }

      const readRevisions = [
        readinessResponse.setup_revision,
        setupResponse.setup_revision,
        templateResponse.setup_revision,
        nodesResponse.setup_revision,
      ].filter((revision): revision is number => typeof revision === "number");
      if (new Set(readRevisions).size > 1) {
        [readinessResponse, setupResponse, templateResponse, nodesResponse, costsResponse, profitsResponse, currenciesResponse, factoryCalendarsResponse, accountsResponse, periodsResponse] = await fetchSnapshot();
        if (!loadSequenceRef.current.isCurrent(requestId)) return null;
        if (!readinessResponse.success || !readinessResponse.data || !setupResponse.success || !setupResponse.data) {
          const message = readinessResponse.message || setupResponse.message || i18n.catalog["enterpriseCore.setup.failedToLoad"];
          setRequestError(message);
          showToast(message, "error");
          return null;
        }
        const retryRevisions = [
          readinessResponse.setup_revision,
          setupResponse.setup_revision,
          templateResponse.setup_revision,
          nodesResponse.setup_revision,
        ].filter((revision): revision is number => typeof revision === "number");
        if (new Set(retryRevisions).size > 1) {
          const message = i18n.catalog["enterpriseCore.setup.staleStateBanner"];
          setIsStaleState(true);
          setRequestError(message);
          showToast(message, "error");
          return null;
        }
      }

      const incomingReadiness = readinessResponse.data;
      const baseState = setupResponse.data;
      const incomingRevision = setupResponse.setup_revision;
      const revisionChanged = typeof incomingRevision === "number"
        && prevSetupRevisionRef.current !== null
        && incomingRevision !== prevSetupRevisionRef.current;
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
      const changed = revisionChanged || detectStaleSetupState(prevSetupStateRef.current, state, prevReadinessRef.current, incomingReadiness);
      if (changed && !options.mutationConfirmed && !options.acknowledgeStale) setIsStaleState(true);
      else if (options.acknowledgeStale || options.mutationConfirmed) setIsStaleState(false);
      setRequestError(null);
      prevSetupStateRef.current = state;
      if (typeof incomingRevision === "number") {
        setupRevisionRef.current = incomingRevision;
        prevSetupRevisionRef.current = incomingRevision;
      }
      prevReadinessRef.current = incomingReadiness;
      setReadiness(incomingReadiness);
      setSetupState(state);
      const hydrateDraftForms = firstSnapshot || options.navigate === true;
      if (hydrateDraftForms) {
        const savedFormDraft = options.mutationConfirmed ? {} : formDraftRef.current;
        setSelectedModuleKeys(savedFormDraft.moduleSelection?.selectedModuleKeys
          ?? (state.selected_module_keys.length ? state.selected_module_keys : state.onboarding?.starter_module_keys ?? []));
        setJourneyStep(getNextSetupJourneyStep(state, incomingReadiness));
        const savedProfile = state.organization_template?.profile;
        if (savedFormDraft.organizationProfile) {
          setOrganizationProfile(savedFormDraft.organizationProfile.profile);
          setSelectedTemplateKey(savedFormDraft.organizationProfile.selectedTemplateKey);
        } else if (savedProfile) {
          setOrganizationProfile({ ...emptyOrganizationProfile, ...savedProfile });
          setSelectedTemplateKey(savedProfile.template_key);
        } else if (state.organization_template?.templates[0]) {
          setSelectedTemplateKey((current) => current || state.organization_template!.templates[0].key);
        }
        const context = incomingReadiness.context;
        const savedScope = savedFormDraft.operatingScope;
        const restoredWorkingUnit = savedScope?.workingUnit ?? context?.org_node_uuid ?? "";
        setWorkingUnit(restoredWorkingUnit);
        setWarehouseId(savedScope ? savedScope.warehouseId : context?.warehouse_id ?? null);
        setCostCenterId(savedScope ? savedScope.costCenterId : context?.cost_center_id ?? null);
        setProfitCenterId(savedScope ? savedScope.profitCenterId : context?.profit_center_id ?? null);
        setPosTerminalId(savedScope ? savedScope.posTerminalId : context?.pos_terminal_id ?? null);
        if (savedFormDraft.workingUnitDetails) {
          setWorkingUnitCode(savedFormDraft.workingUnitDetails.workingUnitCode);
          setWorkingUnitName(savedFormDraft.workingUnitDetails.workingUnitName);
          lastAutoPopulatedWorkingUnitRef.current = restoredWorkingUnit;
        } else {
          lastAutoPopulatedWorkingUnitRef.current = null;
        }
        if (savedFormDraft.account) {
          setAccountCode(savedFormDraft.account.accountCode);
          setAccountName(savedFormDraft.account.accountName);
          setAccountType(savedFormDraft.account.accountType);
        }
        if (savedFormDraft.fiscalPeriod) {
          setPeriodName(savedFormDraft.fiscalPeriod.periodName);
          setPeriodStart(savedFormDraft.fiscalPeriod.periodStart);
          setPeriodEnd(savedFormDraft.fiscalPeriod.periodEnd);
        }
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
  const currentInferenceContextSignature = getSetupInferenceContextSignature(organizationProfile, selectedTemplateKey);
  const serverProfile = templateState?.profile;
  const serverInferenceContextSignature = serverProfile
    ? getSetupInferenceContextSignature({ ...emptyOrganizationProfile, ...serverProfile }, serverProfile.template_key)
    : null;
  const currentInferenceContextRef = useRef(currentInferenceContextSignature);
  useEffect(() => {
    currentInferenceContextRef.current = currentInferenceContextSignature;
  }, [currentInferenceContextSignature]);
  const hasInferencePreview = Boolean(inferenceEvaluation || synthesizedBlueprint);
  const inferenceContextIsStale = hasInferencePreview && (
    inferenceContextSnapshot !== currentInferenceContextSignature
    || (serverInferenceContextSignature !== null && inferenceContextSnapshot !== serverInferenceContextSignature)
  );
  const inferenceDescriptionIsStale = hasInferencePreview && inferenceDescriptionSnapshot !== lastDescription;
  const inferenceAnswersAreStale = hasInferencePreview && inferenceAnswersSnapshot !== answerSignature(questionAnswers);
  const inferencePreviewIsStale = inferenceContextIsStale || inferenceDescriptionIsStale || inferenceAnswersAreStale;
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
    value: currency.id,
    label: [currency.code, currency.name].filter(Boolean).join(" — "),
  })), [currencies]);
  const calendarOptions = useMemo(() => factoryCalendars.map((calendar) => ({
    value: calendar.id,
    label: [calendar.code, locale === "ar-SA" ? calendar.name_ar || calendar.name : calendar.name].filter(Boolean).join(" — "),
  })), [factoryCalendars, locale]);

  const clearFieldError = (field: string) => {
    setFieldErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const updateOrganizationProfile = (changes: Partial<OrganizationProfile>) => {
    const next = { ...organizationProfile, ...changes };
    setOrganizationProfile(next);
    updateFormDraft("organizationProfile", { profile: next, selectedTemplateKey });
    Object.keys(changes).forEach(clearFieldError);
  };

  const updateOperatingScope = (changes: Partial<NonNullable<SetupFormDraft["operatingScope"]>>) => {
    const next = {
      workingUnit,
      warehouseId,
      costCenterId,
      profitCenterId,
      posTerminalId,
      ...changes,
    };
    updateFormDraft("operatingScope", next);
    if ("workingUnit" in changes) clearFieldError("org_node_uuid");
    if ("warehouseId" in changes) clearFieldError("warehouse_id");
    if ("costCenterId" in changes) clearFieldError("cost_center_id");
    if ("profitCenterId" in changes) clearFieldError("profit_center_id");
    if ("posTerminalId" in changes) clearFieldError("pos_terminal_id");
  };

  const updateWorkingUnitDetails = (changes: Partial<NonNullable<SetupFormDraft["workingUnitDetails"]>>) => {
    const next = { workingUnitCode, workingUnitName, ...changes };
    updateFormDraft("workingUnitDetails", next);
    if ("workingUnitCode" in changes) clearFieldError("code");
    if ("workingUnitName" in changes) clearFieldError("attributes.name");
  };

  const updateAccountDraft = (changes: Partial<NonNullable<SetupFormDraft["account"]>>) => {
    updateFormDraft("account", { accountCode, accountName, accountType, ...changes });
    if ("accountCode" in changes) clearFieldError("code");
    if ("accountName" in changes) clearFieldError("name");
    if ("accountType" in changes) clearFieldError("type");
  };

  const updateFiscalPeriodDraft = (changes: Partial<NonNullable<SetupFormDraft["fiscalPeriod"]>>) => {
    updateFormDraft("fiscalPeriod", { periodName, periodStart, periodEnd, ...changes });
    if ("periodName" in changes) clearFieldError("period_name");
    if ("periodStart" in changes) clearFieldError("start_date");
    if ("periodEnd" in changes) clearFieldError("end_date");
  };

  const callAndReload = async <T,>(
    action: () => Promise<{ success?: boolean; message?: string; data?: T; errors?: Record<string, string[]> | number; httpStatus?: number; code?: string; setup_revision?: number }>,
    savedSection?: keyof SetupFormDraft,
  ): Promise<T | null> => {
    setIsSaving(true);
    try {
      const response = await action();
      if (!response.success) {
        if (response.httpStatus === 409 || response.httpStatus === 428 || response.code === "setup_state_conflict" || response.code === "setup_revision_required") {
          await load();
          setIsStaleState(true);
        }
        const validationErrors = typeof response.errors === "object" && response.errors !== null
          ? response.errors
          : {};
        setFieldErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0 && typeof window !== "undefined") {
          window.setTimeout(() => document.getElementById("setup-field-error-summary")?.focus(), 0);
        }
        throw new Error(response.message);
      }
      if (typeof response.setup_revision === "number") setupRevisionRef.current = response.setup_revision;
      setFieldErrors({});
      if (savedSection) updateFormDraft(savedSection, undefined);
      setRequestError(null);
      showToast(i18n.catalog["enterpriseCore.setup.createdSuccessfully"], "success");
      await load({ mutationConfirmed: true });
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
    const requestId = ++inferenceRequestSequenceRef.current;
    const contextSnapshot = currentInferenceContextSignature;
    setIsInferenceLoading(true);
    setLastDescription(description);
    setQuestionAnswers({});
    setAdaptiveQuestions([]);
    setRequestError(null);
    try {
      const res = await setupApi.analyzeSetup({
        description,
        company_name: organizationProfile.company_name || undefined,
        country_code: organizationProfile.country_code || "SA",
        currency_id: organizationProfile.currency_id || undefined,
      });

      if (requestId !== inferenceRequestSequenceRef.current) return;
      if (contextSnapshot !== currentInferenceContextRef.current) {
        setRequestError(i18n.catalog["enterpriseCore.setup.staleStateBanner"]);
        return;
      }
      if (res.success && res.data) {
        setInferenceEvaluation(res.data.evaluation);
        setInferenceSignals(res.data.signals);
        setAdaptiveQuestions(res.data.adaptive_questions || []);
        setSynthesizedBlueprint(res.data.blueprint ?? null);
        setInferenceContextSnapshot(contextSnapshot);
        setInferenceDescriptionSnapshot(description);
        setInferenceAnswersSnapshot("{}");
        showToast("Structure inferred successfully", "success");
      } else {
        const message = res.message || "Failed to analyze business signals";
        setFieldErrors(typeof res.errors === "object" && res.errors !== null ? res.errors : {});
        setRequestError(message);
        showToast(message, "error");
      }
    } catch {
      const message = "Error analyzing business description";
      setRequestError(message);
      showToast(message, "error");
    } finally {
      if (requestId === inferenceRequestSequenceRef.current) setIsInferenceLoading(false);
    }
  };

  const handleApplyAnswers = async () => {
    if (!lastDescription) return;
    const requestId = ++inferenceRequestSequenceRef.current;
    const contextSnapshot = currentInferenceContextSignature;
    const descriptionSnapshot = lastDescription;
    const answersSnapshot = answerSignature(questionAnswers);
    setIsInferenceLoading(true);
    setRequestError(null);
    try {
      const res = await setupApi.analyzeSetup({
        description: lastDescription,
        company_name: organizationProfile.company_name || undefined,
        country_code: organizationProfile.country_code || "SA",
        currency_id: organizationProfile.currency_id || undefined,
        structured: questionAnswers,
      });

      if (requestId !== inferenceRequestSequenceRef.current) return;
      if (contextSnapshot !== currentInferenceContextRef.current) {
        setRequestError(i18n.catalog["enterpriseCore.setup.staleStateBanner"]);
        return;
      }
      if (res.success && res.data) {
        setInferenceEvaluation(res.data.evaluation);
        setInferenceSignals(res.data.signals);
        setAdaptiveQuestions(res.data.adaptive_questions || []);
        setSynthesizedBlueprint(res.data.blueprint ?? null);
        setInferenceContextSnapshot(contextSnapshot);
        setInferenceDescriptionSnapshot(descriptionSnapshot);
        setInferenceAnswersSnapshot(answersSnapshot);
        showToast("Blueprint refined with answers", "success");
      } else {
        const message = res.message || "Failed to refine blueprint";
        setFieldErrors(typeof res.errors === "object" && res.errors !== null ? res.errors : {});
        setRequestError(message);
        showToast(message, "error");
      }
    } catch {
      const message = "Failed to refine blueprint";
      setRequestError(message);
      showToast(message, "error");
    } finally {
      if (requestId === inferenceRequestSequenceRef.current) setIsInferenceLoading(false);
    }
  };

  const handleStageBlueprint = async () => {
    if (!synthesizedBlueprint) return;
    if (inferencePreviewIsStale || isStaleState) {
      setRequestError(i18n.catalog["enterpriseCore.setup.staleStateBanner"]);
      return;
    }
    setIsStaging(true);
    try {
      const res = await setupApi.stageBlueprint({
        name: organizationProfile.company_name || synthesizedBlueprint.archetype_id,
        archetype_id: synthesizedBlueprint.archetype_id,
        blueprint_json: synthesizedBlueprint,
      }, setupRevisionRef.current ?? undefined);

      if (res.success && res.data) {
        setStagedBlueprintUuid(res.data.blueprint_uuid);
        setStagedBlueprintRevision(res.data.blueprint_revision);
        if (typeof res.setup_revision === "number") setupRevisionRef.current = res.setup_revision;
        showToast("Blueprint draft saved", "success");
      } else {
        if (res.httpStatus === 409 || res.httpStatus === 428) {
          invalidateStagedBlueprint();
          await load();
          setIsStaleState(true);
        }
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
    if (inferencePreviewIsStale || isStaleState) {
      setRequestError(i18n.catalog["enterpriseCore.setup.staleStateBanner"]);
      return;
    }
    setIsPublishing(true);
    try {
      let uuid = stagedBlueprintUuid;
      let blueprintRevision = stagedBlueprintRevision;
      if (!uuid || !blueprintRevision) {
        const stageRes = await setupApi.stageBlueprint({
          name: organizationProfile.company_name || synthesizedBlueprint.archetype_id,
          archetype_id: synthesizedBlueprint.archetype_id,
          blueprint_json: synthesizedBlueprint,
        }, setupRevisionRef.current ?? undefined);
        if (stageRes.success && stageRes.data) {
          uuid = stageRes.data.blueprint_uuid;
          blueprintRevision = stageRes.data.blueprint_revision;
          setStagedBlueprintUuid(uuid);
          setStagedBlueprintRevision(blueprintRevision);
          if (typeof stageRes.setup_revision === "number") setupRevisionRef.current = stageRes.setup_revision;
        } else {
          if (stageRes.httpStatus === 409 || stageRes.httpStatus === 428) {
            invalidateStagedBlueprint();
            await load();
            setIsStaleState(true);
          }
          showToast(stageRes.message || "Failed to stage blueprint before publishing", "error");
          setIsPublishing(false);
          return;
        }
      }

      const pubRes = await setupApi.publishBlueprint(uuid!, {
        clear_existing: false,
        create_operating_context: true,
        blueprint_revision: blueprintRevision!,
      }, setupRevisionRef.current ?? undefined);

      if (pubRes.success) {
        if (typeof pubRes.setup_revision === "number") setupRevisionRef.current = pubRes.setup_revision;
        clearDraft();
        setRequestError(null);
        showToast(i18n.catalog["orgStudio.setup.publishedSuccess"], "success");
        await load({ mutationConfirmed: true });
      } else {
        if (pubRes.httpStatus === 409 || pubRes.httpStatus === 428) {
          invalidateStagedBlueprint();
          await load();
          setIsStaleState(true);
        }
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
    await callAndReload(() => setupApi.saveOrganizationProfile({ ...organizationProfile, template_key: selectedTemplateKey }, setupRevisionRef.current ?? undefined), "organizationProfile");
  };

  const applyOrganizationTemplate = async () => {
    await callAndReload(() => setupApi.applyOrganizationTemplate(setupRevisionRef.current ?? undefined), "organizationProfile");
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
    }), "account");
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
    }), "fiscalPeriod");
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
    await callAndReload(() => setupApi.configureOperatingContext(contextRequest, setupRevisionRef.current ?? undefined), "operatingScope");
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
    }, setupRevisionRef.current ?? undefined), "workingUnitDetails");
  };

  const saveModuleSelection = async () => {
    await callAndReload(() => setupApi.selectModules(selectedModuleKeys, setupRevisionRef.current ?? undefined), "moduleSelection");
  };

  const activateSelectedModules = async () => {
    setIsSaving(true);
    try {
      const fresh = await load();
      const ready = Boolean(fresh)
        && fresh!.state.onboarding?.phases.foundation.ready === true
        && fresh!.state.onboarding?.phases.core_operations.ready === true
        && hasActivatableSelectedModule(fresh!.state);
      if (!fresh || !ready) {
        const message = i18n.catalog["enterpriseCore.setup.modules.pendingReadiness"];
        setRequestError(message);
        showToast(message, "error");
        return;
      }
      const response = await setupApi.activateSelectedModules(setupRevisionRef.current ?? undefined);
      if (!response.success) {
        if (response.httpStatus === 409 || response.httpStatus === 428) {
          await load();
          setIsStaleState(true);
        }
        throw new Error(response.message);
      }
      if (typeof response.setup_revision === "number") setupRevisionRef.current = response.setup_revision;
      setRequestError(null);
      showToast(i18n.catalog["enterpriseCore.setup.createdSuccessfully"], "success");
      await load({ mutationConfirmed: true });
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : i18n.catalog["enterpriseCore.setup.failedToSave"];
      setRequestError(message);
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const returnTo = searchParams.get("returnTo");

  const openDashboard = async () => {
    const fresh = await load();
    if (!fresh || !isSetupLaunchReady(fresh.state)) {
      const message = i18n.catalog["enterpriseCore.setup.modules.pendingReadiness"];
      setRequestError(message);
      showToast(message, "error");
      return;
    }
    router.push(resolveSetupReturnDestination(returnTo, fresh.state));
  };

  const toggleModule = (moduleKey: string) => {
    const next = selectedModuleKeys.includes(moduleKey)
      ? selectedModuleKeys.filter((key) => key !== moduleKey)
      : [...selectedModuleKeys, moduleKey];
    setSelectedModuleKeys(next);
    updateFormDraft("moduleSelection", { selectedModuleKeys: next });
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
    && hasActivatableSelectedModule(setupState);
  const launchReady = isSetupLaunchReady(setupState);

  useEffect(() => {
    if (!moduleSelectionSaved) {
      if (journeyStep !== "module_selection") setJourneyStep("module_selection");
      return;
    }
    if (journeyStep === "operating_links" && !foundationComplete) setJourneyStep("foundation");
    if (journeyStep === "optional_capabilities" && !operatingLinksComplete) setJourneyStep(foundationComplete ? "operating_links" : "foundation");
  }, [foundationComplete, journeyStep, moduleSelectionSaved, operatingLinksComplete]);

  const navigateToStep = async (target: SetupJourneyStepId) => {
    const fresh = await load();
    if (!fresh) return;
    if (!canNavigateToSetupStep(target, fresh.state, fresh.readiness)) {
      const message = i18n.catalog["enterpriseCore.setup.modules.pendingReadiness"];
      setRequestError(message);
      showToast(message, "error");
      return;
    }
    pendingStepFocusRef.current = true;
    setJourneyStep(target);
  };

  useEffect(() => {
    if (!pendingStepFocusRef.current) return;
    pendingStepFocusRef.current = false;
    const headingId = journeyStep === "foundation"
      ? "setup-organization-profile-title"
      : journeyStep === "operating_links"
        ? "setup-operating-scope-title"
        : "setup-modules-title";
    window.requestAnimationFrame(() => document.getElementById(headingId)?.focus());
  }, [journeyStep]);

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

  const fieldErrorLabels = useMemo<Record<string, string>>(() => ({
    template_key: i18n.catalog["enterpriseCore.setup.profile.templateChoice.title"],
    organization_size: i18n.catalog["enterpriseCore.setup.profile.field.organizationSize"],
    company_name: i18n.catalog["enterpriseCore.setup.profile.field.companyName"],
    company_code: i18n.catalog["enterpriseCore.setup.profile.field.companyCode"],
    country_code: i18n.catalog["enterpriseCore.setup.profile.field.country"],
    currency_id: i18n.catalog["enterpriseCore.setup.profile.field.currency"],
    primary_site_name: i18n.catalog["enterpriseCore.setup.profile.field.siteName"],
    primary_site_code: i18n.catalog["enterpriseCore.setup.profile.field.siteCode"],
    factory_calendar_id: i18n.catalog["enterpriseCore.setup.profile.field.siteCalendar"],
    org_node_uuid: i18n.catalog["enterpriseCore.setup.scope.workingUnit"],
    warehouse_id: i18n.catalog["enterpriseCore.setup.scope.warehouse"],
    pos_terminal_id: i18n.catalog["enterpriseCore.setup.scope.pointOfSale"],
    cost_center_id: i18n.catalog["enterpriseCore.setup.scope.costCenter"],
    profit_center_id: i18n.catalog["enterpriseCore.setup.scope.profitCenter"],
    period_name: i18n.catalog["enterpriseCore.setup.accounting.periodName"],
    start_date: i18n.catalog["enterpriseCore.setup.accounting.startDate"],
    end_date: i18n.catalog["enterpriseCore.setup.accounting.endDate"],
    code: journeyStep === "operating_links"
      ? i18n.catalog["enterpriseCore.setup.scope.workingUnitCode"]
      : i18n.catalog["enterpriseCore.setup.accounting.accountCode"],
    name: journeyStep === "operating_links"
      ? i18n.catalog["enterpriseCore.setup.scope.workingUnitName"]
      : i18n.catalog["enterpriseCore.setup.accounting.accountName"],
    type: i18n.catalog["enterpriseCore.setup.accounting.accountType"],
    "attributes.name": i18n.catalog["enterpriseCore.setup.scope.workingUnitName"],
  }), [i18n.catalog, journeyStep]);

  const focusFieldError = (field: string) => {
    const targets: Record<string, string> = {
      template_key: "setup-template-choice-heading",
      organization_size: "setup-organization-size",
      company_name: "setup-company-name",
      company_code: "setup-company-code",
      country_code: "setup-country-code",
      currency_id: "setup-profile-currency",
      primary_site_name: "setup-primary-site-name",
      primary_site_code: "setup-primary-site-code",
      factory_calendar_id: "setup-profile-calendar",
      org_node_uuid: "setup-working-unit",
      warehouse_id: scopeCapabilities.requiresPosTerminal ? "setup-pos-terminal" : "setup-warehouse",
      pos_terminal_id: "setup-pos-terminal",
      cost_center_id: scopeCapabilities.requiresWarehouse || scopeCapabilities.requiresPosTerminal ? "setup-pos-terminal" : "setup-cost-center",
      profit_center_id: scopeCapabilities.requiresWarehouse || scopeCapabilities.requiresPosTerminal ? "setup-pos-terminal" : "setup-profit-center",
      period_name: "setup-period-name",
      start_date: "setup-period-start",
      end_date: "setup-period-end",
      code: journeyStep === "operating_links" ? "setup-working-unit-code" : "setup-account-code",
      name: journeyStep === "operating_links" ? "setup-working-unit-name" : "setup-account-name",
      type: "setup-account-type",
      "attributes.name": "setup-working-unit-name",
    };
    const target = document.getElementById(targets[field] ?? "");
    if (target instanceof HTMLElement) target.focus();
    else document.getElementById("setup-field-error-summary")?.focus();
  };

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
        staleMessage={isStaleState
          ? i18n.catalog["enterpriseCore.setup.staleStateBanner"]
          : inferencePreviewIsStale ? i18n.catalog["enterpriseCore.setup.previewStale"] : undefined}
        draftMessage={hasDraftData ? i18n.catalog["enterpriseCore.setup.draftBanner"] : undefined}
        errorMessage={requestError}
        fieldErrors={fieldErrors}
        fieldErrorsTitle={i18n.catalog["enterpriseCore.setup.validation.summaryTitle"]}
        fieldLabels={fieldErrorLabels}
        onFocusField={focusFieldError}
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
        onRefresh={() => void load({ navigate: true, acknowledgeStale: true })}
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
        onStepSelect={navigateToStep}
        onPrevious={() => {
          const index = journeySteps.findIndex((step) => step.id === journeyStep);
          const previous = journeySteps[index - 1];
          if (previous) void navigateToStep(previous.id);
        }}
        onNext={() => {
          const index = journeySteps.findIndex((step) => step.id === journeyStep);
          const next = journeySteps[index + 1];
          if (next?.enabled) void navigateToStep(next.id);
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
            fieldErrors={fieldErrors}
            onTemplateChange={(templateKey) => {
              setSelectedTemplateKey(templateKey);
              const nextProfile = { ...organizationProfile, template_key: templateKey };
              setOrganizationProfile(nextProfile);
              updateFormDraft("organizationProfile", { profile: nextProfile, selectedTemplateKey: templateKey });
              clearFieldError("template_key");
            }}
            onChange={updateOrganizationProfile}
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
              isPreviewStale={inferencePreviewIsStale || isStaleState}
              previewStaleMessage={i18n.catalog["enterpriseCore.setup.previewStale"]}
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
            fieldErrors={fieldErrors}
            onAccountCodeChange={(value) => { setAccountCode(value); updateAccountDraft({ accountCode: value }); }}
            onAccountNameChange={(value) => { setAccountName(value); updateAccountDraft({ accountName: value }); }}
            onAccountTypeChange={(value) => { setAccountType(value); updateAccountDraft({ accountType: value }); }}
            onPeriodNameChange={(value) => { setPeriodName(value); updateFiscalPeriodDraft({ periodName: value }); }}
            onPeriodStartChange={(value) => { setPeriodStart(value); updateFiscalPeriodDraft({ periodStart: value }); }}
            onPeriodEndChange={(value) => { setPeriodEnd(value); updateFiscalPeriodDraft({ periodEnd: value }); }}
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
          fieldErrors={fieldErrors}
          onWorkingUnitChange={(value) => {
            setWorkingUnit(value);
            updateOperatingScope({ workingUnit: value });
            updateFormDraft("workingUnitDetails", undefined);
            if (!value) lastAutoPopulatedWorkingUnitRef.current = null;
          }}
          onWorkingUnitCodeChange={(value) => { setWorkingUnitCode(value); updateWorkingUnitDetails({ workingUnitCode: value }); }}
          onWorkingUnitNameChange={(value) => { setWorkingUnitName(value); updateWorkingUnitDetails({ workingUnitName: value }); }}
          onSaveWorkingUnit={() => void saveWorkingUnit()}
          onWarehouseChange={(value) => { setWarehouseId(value); updateOperatingScope({ warehouseId: value }); }}
          onCostCenterChange={(value) => { setCostCenterId(value); updateOperatingScope({ costCenterId: value }); }}
          onProfitCenterChange={(value) => { setProfitCenterId(value); updateOperatingScope({ profitCenterId: value }); }}
          onPosTerminalChange={(value) => { setPosTerminalId(value); updateOperatingScope({ posTerminalId: value }); }}
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
