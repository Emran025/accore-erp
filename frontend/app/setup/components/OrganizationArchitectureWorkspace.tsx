import { Button, SearchableSelect } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { catalogText, getLocaleRegistry, type CatalogKey, useI18n } from "@/lib/i18n";
import { getIcon } from "@/lib/icons";
import { getTextDirection } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { OrganizationIntegrity, OrganizationMetaType, OrganizationNodeDraft, OrganizationTopologyRule, OrganizationWorkspaceNode, OrganizationWorkspacePhase } from "./organizationWorkspace.types";

interface OrganizationArchitectureWorkspaceProps {
  nodes: OrganizationWorkspaceNode[];
  metaTypes: OrganizationMetaType[];
  topologyRules: OrganizationTopologyRule[];
  integrity: OrganizationIntegrity | null;
  isLoading: boolean;
  isSaving: boolean;
  referenceOptionsByAttribute: Partial<Record<ReferenceAttributeKey, ReferenceOption[]>>;
  isReferenceDataLoading: boolean;
  onRefresh: () => void;
  onCreateNode: (draft: OrganizationNodeDraft) => Promise<boolean>;
}

type TreeNode = {
  node: OrganizationWorkspaceNode;
  children: TreeNode[];
};

type ReferenceAttributeKey = "currency_id" | "chart_of_accounts_id" | "factory_calendar_id";
type ReferenceOption = {
  value: string | number;
  label: string;
  subtitle?: string;
};

const PHASE_REQUIREMENTS: Record<OrganizationWorkspacePhase, string[]> = {
  foundation: ["CLIENT", "COMP_CODE", "CONTROLLING_AREA", "COST_CENTER", "PROFIT_CENTER"],
  core_operations: ["PLANT", "STORAGE_LOC", "PURCH_ORG", "SALES_ORG"],
  extensions: [],
};

const REQUIRED_PARENT_TYPES: Readonly<Record<string, readonly string[]>> = {
  COMP_CODE: ["CLIENT"],
  CONTROLLING_AREA: ["COMP_CODE"],
  COST_CENTER: ["CONTROLLING_AREA"],
  PROFIT_CENTER: ["CONTROLLING_AREA"],
  PLANT: ["COMP_CODE"],
  STORAGE_LOC: ["PLANT"],
  PURCH_ORG: ["COMP_CODE"],
  SALES_ORG: ["COMP_CODE"],
  PERSONNEL_AREA: ["COMP_CODE"],
};

const DOMAIN_ORDER = ["Enterprise", "Financial", "Controlling", "Logistics", "Sales", "HR", "Project"];
const DOMAIN_ICON: Record<string, string> = {
  Enterprise: "building",
  Financial: "wallet",
  Controlling: "chart-line",
  Logistics: "boxes",
  Sales: "shopping-cart",
  HR: "users",
  Project: "clipboard-list",
};

const ATTRIBUTE_LABEL_KEYS: Readonly<Record<string, CatalogKey>> = {
  address: "enterpriseCore.orgWorkspace.attribute.address",
  buyer_name: "enterpriseCore.orgWorkspace.attribute.buyerName",
  chart_of_accounts_id: "enterpriseCore.orgWorkspace.attribute.chartOfAccountsId",
  city: "enterpriseCore.orgWorkspace.attribute.city",
  cost_center_category: "enterpriseCore.orgWorkspace.attribute.costCenterCategory",
  country_code: "enterpriseCore.orgWorkspace.attribute.countryCode",
  currency_id: "enterpriseCore.orgWorkspace.attribute.currencyId",
  default_language: "enterpriseCore.orgWorkspace.attribute.defaultLanguage",
  factory_calendar_id: "enterpriseCore.orgWorkspace.attribute.factoryCalendarId",
  fiscal_year_variant: "enterpriseCore.orgWorkspace.attribute.fiscalYearVariant",
  headcount: "enterpriseCore.orgWorkspace.attribute.headcount",
  job_family: "enterpriseCore.orgWorkspace.attribute.jobFamily",
  language: "enterpriseCore.orgWorkspace.attribute.language",
  manager: "enterpriseCore.orgWorkspace.attribute.manager",
  name: "enterpriseCore.orgWorkspace.attribute.name",
  pay_scale_area: "enterpriseCore.orgWorkspace.attribute.payScaleArea",
  pay_scale_type: "enterpriseCore.orgWorkspace.attribute.payScaleType",
  profit_center_group: "enterpriseCore.orgWorkspace.attribute.profitCenterGroup",
  project_id: "enterpriseCore.orgWorkspace.attribute.projectId",
  public_holiday_calendar: "enterpriseCore.orgWorkspace.attribute.publicHolidayCalendar",
  responsible_cost_center: "enterpriseCore.orgWorkspace.attribute.responsibleCostCenter",
  responsible_person: "enterpriseCore.orgWorkspace.attribute.responsiblePerson",
  risk_category: "enterpriseCore.orgWorkspace.attribute.riskCategory",
  telephone: "enterpriseCore.orgWorkspace.attribute.telephone",
  vacancy_status: "enterpriseCore.orgWorkspace.attribute.vacancyStatus",
  valuation_grouping: "enterpriseCore.orgWorkspace.attribute.valuationGrouping",
};

const CALENDAR_YEAR_VARIANT = "K4";
const SUPPORTED_LANGUAGE_OPTIONS = Object.values(getLocaleRegistry()).map((item) => ({
  value: item.code,
  label: item.nativeName,
  subtitle: item.displayName,
}));

function readableAttributeFallback(attributeKey: string): string {
  return attributeKey
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function nodeName(node: OrganizationWorkspaceNode): string {
  const name = node.attributes_json?.name;
  return typeof name === "string" && name.trim() ? name : node.code;
}

export function OrganizationArchitectureWorkspace({
  nodes,
  metaTypes,
  topologyRules,
  integrity,
  isLoading,
  isSaving,
  referenceOptionsByAttribute,
  isReferenceDataLoading,
  onRefresh,
  onCreateNode,
}: OrganizationArchitectureWorkspaceProps) {
  const { t: i18n, locale } = useI18n();
  const [activePhase, setActivePhase] = useState<OrganizationWorkspacePhase>("foundation");
  const [selectedNodeUuid, setSelectedNodeUuid] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [nodeCode, setNodeCode] = useState("");
  const [nodeNameValue, setNodeNameValue] = useState("");
  const [linkTargetsByRule, setLinkTargetsByRule] = useState<Record<number, string[]>>({});
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [scopeContext, setScopeContext] = useState<Record<string, unknown> | null>(null);
  const [isScopeLoading, setIsScopeLoading] = useState(false);

  const labelForType = (typeId: string) => {
    const type = metaTypes.find((item) => item.id === typeId);
    if (!type) return typeId;
    return locale === "ar-SA" ? type.display_name_ar || type.display_name : type.display_name;
  };

  const labelForAttribute = (attributeKey: string) => {
    const catalogKey = ATTRIBUTE_LABEL_KEYS[attributeKey];
    if (catalogKey) return i18n.catalog[catalogKey];
    return catalogText(i18n, "enterpriseCore.orgWorkspace.attribute.unknown", {
      value0: readableAttributeFallback(attributeKey),
    });
  };

  const referenceHelpForAttribute = (attributeKey: ReferenceAttributeKey, hasOptions: boolean) => {
    if (attributeKey === "factory_calendar_id") {
      return hasOptions
        ? i18n.catalog["enterpriseCore.orgWorkspace.reference.factoryCalendar.help"]
        : i18n.catalog["enterpriseCore.orgWorkspace.reference.factoryCalendar.empty"];
    }
    if (attributeKey === "currency_id") {
      return hasOptions
        ? i18n.catalog["enterpriseCore.orgWorkspace.reference.currency.help"]
        : i18n.catalog["enterpriseCore.orgWorkspace.reference.currency.empty"];
    }
    return hasOptions
      ? i18n.catalog["enterpriseCore.orgWorkspace.reference.chartOfAccounts.help"]
      : i18n.catalog["enterpriseCore.orgWorkspace.reference.chartOfAccounts.empty"];
  };

  const inputTypeForAttribute = (attributeType?: string) => {
    if (attributeType === "integer" || attributeType === "decimal") return "number";
    if (attributeType === "date") return "date";
    return "text";
  };
  const defaultTextDirection = locale === "ar-SA" ? "rtl" : "ltr";

  const domainForType = (typeId: string) => metaTypes.find((item) => item.id === typeId)?.level_domain || "";
  const selectedType = metaTypes.find((item) => item.id === selectedTypeId);
  const selectedNode = nodes.find((node) => node.node_uuid === selectedNodeUuid) ?? null;

  const phaseState = useMemo(() => (Object.entries(PHASE_REQUIREMENTS) as [OrganizationWorkspacePhase, string[]][]).map(([phase, requirements]) => {
    const missing = requirements.filter((typeId) => !nodes.some((node) => node.node_type_id === typeId && node.status === "active"));
    return { phase, requirements, missing, complete: missing.length === 0 };
  }), [nodes]);

  useEffect(() => {
    const firstIncomplete = phaseState.find((phase) => !phase.complete)?.phase;
    if (firstIncomplete) setActivePhase(firstIncomplete);
  }, [phaseState]);

  const suggestedTypes = useMemo(() => {
    const current = phaseState.find((phase) => phase.phase === activePhase);
    if (activePhase === "extensions") return metaTypes.filter((type) => !PHASE_REQUIREMENTS.foundation.includes(type.id) && !PHASE_REQUIREMENTS.core_operations.includes(type.id));
    return metaTypes.filter((type) => current?.missing.includes(type.id));
  }, [activePhase, metaTypes, phaseState]);

  const groupedTypes = useMemo(() => {
    const source = activePhase === "extensions"
      ? suggestedTypes
      : metaTypes.filter((type) => PHASE_REQUIREMENTS[activePhase].includes(type.id));
    return DOMAIN_ORDER.map((domain) => ({
      domain,
      types: source.filter((type) => type.level_domain === domain),
    })).filter((group) => group.types.length > 0);
  }, [activePhase, metaTypes, suggestedTypes]);

  const selectedTypeRules = useMemo(
    () => topologyRules.filter((rule) => rule.source_node_type_id === selectedTypeId),
    [selectedTypeId, topologyRules],
  );
  const linkCandidatesForRule = (rule: OrganizationTopologyRule) => nodes.filter(
    (node) => node.status === "active" && node.node_type_id === rule.target_node_type_id,
  );

  const tree = useMemo(() => {
    const nodeMap = new Map(nodes.map((node) => [node.node_uuid, node]));
    const childMap = new Map<string, string[]>();
    const childIds = new Set<string>();
    const seenLinks = new Set<number>();

    nodes.forEach((node) => {
      (node.outgoing_links ?? []).forEach((link) => {
        if (seenLinks.has(link.id) || !nodeMap.has(link.target_node_uuid)) return;
        seenLinks.add(link.id);
        childIds.add(link.source_node_uuid);
        const children = childMap.get(link.target_node_uuid) ?? [];
        children.push(link.source_node_uuid);
        childMap.set(link.target_node_uuid, children);
      });
    });

    const build = (nodeUuid: string, visited = new Set<string>()): TreeNode | null => {
      if (visited.has(nodeUuid)) return null;
      const node = nodeMap.get(nodeUuid);
      if (!node) return null;
      const nextVisited = new Set(visited);
      nextVisited.add(nodeUuid);
      const children = (childMap.get(nodeUuid) ?? [])
        .map((childUuid) => build(childUuid, nextVisited))
        .filter((child): child is TreeNode => child !== null);
      return { node, children };
    };

    const roots = nodes.filter((node) => !childIds.has(node.node_uuid));
    return roots.map((node) => build(node.node_uuid)).filter((item): item is TreeNode => item !== null);
  }, [nodes]);

  const resetComposer = () => {
    setSelectedTypeId("");
    setNodeCode("");
    setNodeNameValue("");
    setLinkTargetsByRule({});
    setAttributes({});
  };

  const chooseType = (typeId: string) => {
    setSelectedTypeId(typeId);
    setLinkTargetsByRule({});
    setAttributes({});
  };

  const createNode = async () => {
    if (!selectedTypeId || !nodeCode.trim()) return;
    const draftAttributes = {
      ...attributes,
      ...(nodeNameValue.trim() ? { name: nodeNameValue.trim() } : {}),
    };
    const created = await onCreateNode({
      node_type_id: selectedTypeId,
      code: nodeCode.trim(),
      attributes: draftAttributes,
      links: Object.entries(linkTargetsByRule).flatMap(([, targetUuids]) => targetUuids.map((target_node_uuid) => ({
        target_node_uuid,
        validate_constraints: true as const,
      }))),
    });
    if (created) resetComposer();
  };

  const inspectScope = async (nodeUuid: string) => {
    setSelectedNodeUuid(nodeUuid);
    setScopeContext(null);
    setIsScopeLoading(true);
    try {
      const response = await fetchAPI<Record<string, unknown>>(API_ENDPOINTS.ENTERPRISE_CORE.ORG.SCOPE_CONTEXT(nodeUuid));
      setScopeContext(response.success ? response.data ?? null : null);
    } finally {
      setIsScopeLoading(false);
    }
  };

  const phaseTitles: Record<OrganizationWorkspacePhase, string> = {
    foundation: i18n.catalog["enterpriseCore.orgWorkspace.phase.foundation.title"],
    core_operations: i18n.catalog["enterpriseCore.orgWorkspace.phase.coreOperations.title"],
    extensions: i18n.catalog["enterpriseCore.orgWorkspace.phase.extensions.title"],
  };
  const phaseDescriptions: Record<OrganizationWorkspacePhase, string> = {
    foundation: i18n.catalog["enterpriseCore.orgWorkspace.phase.foundation.description"],
    core_operations: i18n.catalog["enterpriseCore.orgWorkspace.phase.coreOperations.description"],
    extensions: i18n.catalog["enterpriseCore.orgWorkspace.phase.extensions.description"],
  };
  const phaseTitle = (phase: OrganizationWorkspacePhase) => phaseTitles[phase];
  const phaseDescription = (phase: OrganizationWorkspacePhase) => phaseDescriptions[phase];
  const requiredParentTypes = REQUIRED_PARENT_TYPES[selectedTypeId] ?? [];
  const requiredRelationshipsComplete = requiredParentTypes.every((targetTypeId) => selectedTypeRules.some(
    (rule) => rule.target_node_type_id === targetTypeId && (linkTargetsByRule[rule.id] ?? []).length > 0,
  ));
  const mandatoryAttributesComplete = (selectedType?.attributes ?? [])
    .filter((attribute) => attribute.is_mandatory)
    .every((attribute) => (attributes[attribute.attribute_key] || (attribute.attribute_key === "name" ? nodeNameValue : "")).trim());
  const isNodeReadyToCreate = Boolean(selectedTypeId && nodeCode.trim() && mandatoryAttributesComplete && requiredRelationshipsComplete);

  const renderTree = (treeNode: TreeNode, depth = 0) => {
    const { node, children } = treeNode;
    const domain = domainForType(node.node_type_id).toLowerCase() || "other";
    const selected = node.node_uuid === selectedNodeUuid;
    return (
      <li key={node.node_uuid} className="org-workspace-tree-item">
        <button
          type="button"
          className={`org-workspace-tree-node org-workspace-domain-${domain} org-workspace-depth-${Math.min(depth, 8)} ${selected ? "is-selected" : ""}`}
          onClick={() => void inspectScope(node.node_uuid)}
        >
          <span className="org-workspace-tree-icon" aria-hidden="true">{getIcon(DOMAIN_ICON[domainForType(node.node_type_id)] || "sitemap")}</span>
          <span className="org-workspace-tree-node-copy">
            <strong>{nodeName(node)}</strong>
            <span>{node.code}</span>
          </span>
          <span className="org-workspace-tree-type">{labelForType(node.node_type_id)}</span>
        </button>
        {children.length > 0 ? <ul className="org-workspace-tree-children">{children.map((child) => renderTree(child, depth + 1))}</ul> : null}
      </li>
    );
  };

  const resolved = (scopeContext?.resolved ?? {}) as Record<string, { code?: string }>;
  const selectedNodeRules = selectedNode ? topologyRules.filter((rule) => rule.source_node_type_id === selectedNode.node_type_id || rule.target_node_type_id === selectedNode.node_type_id) : [];

  return (
    <section className="org-workspace" aria-labelledby="org-workspace-title">
      <header className="org-workspace-hero">
        <div>
          <span className="org-workspace-eyebrow">{i18n.catalog["enterpriseCore.orgWorkspace.eyebrow"]}</span>
          <h3 id="org-workspace-title">{i18n.catalog["enterpriseCore.orgWorkspace.title"]}</h3>
          <p>{i18n.catalog["enterpriseCore.orgWorkspace.description"]}</p>
        </div>
        <Button type="button" variant="secondary" icon="refresh-cw" onClick={onRefresh} isLoading={isLoading}>
          {i18n.catalog["enterpriseCore.orgWorkspace.refresh"]}
        </Button>
      </header>

      <div className="org-workspace-phase-rail" role="tablist" aria-label={i18n.catalog["enterpriseCore.orgWorkspace.phase.ariaLabel"]}>
        {phaseState.map((phase, index) => {
          const current = activePhase === phase.phase;
          return (
            <button
              key={phase.phase}
              type="button"
              role="tab"
              aria-selected={current}
              className={`org-workspace-phase ${phase.complete ? "is-complete" : ""} ${current ? "is-current" : ""}`}
              onClick={() => setActivePhase(phase.phase)}
            >
              <span className="org-workspace-phase-number">{index + 1}</span>
              <span>
                <strong>{phaseTitle(phase.phase)}</strong>
                <small>{phase.complete ? i18n.catalog["enterpriseCore.orgWorkspace.complete"] : catalogText(i18n, "enterpriseCore.orgWorkspace.itemsRemaining", { value0: phase.missing.length })}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="org-workspace-layout">
        <aside className="org-workspace-plan" aria-label={i18n.catalog["enterpriseCore.orgWorkspace.plan.ariaLabel"]}>
          <div className="org-workspace-panel-heading">
            <span className="org-workspace-panel-icon" aria-hidden="true">{getIcon("route")}</span>
            <div>
              <h4>{phaseTitle(activePhase)}</h4>
              <p>{phaseDescription(activePhase)}</p>
            </div>
          </div>
          <div className="org-workspace-checklist">
            {(phaseState.find((phase) => phase.phase === activePhase)?.requirements ?? []).map((typeId) => {
              const complete = nodes.some((node) => node.node_type_id === typeId && node.status === "active");
              return (
                <div key={typeId} className={`org-workspace-check ${complete ? "is-complete" : ""}`}>
                  <span aria-hidden="true">{getIcon(complete ? "check-circle" : "circle")}</span>
                  <span>{labelForType(typeId)}</span>
                </div>
              );
            })}
            {activePhase === "extensions" ? <p className="org-workspace-empty-copy">{i18n.catalog["enterpriseCore.orgWorkspace.extensionsHelper"]}</p> : null}
          </div>
          <div className="org-workspace-recommendations">
            <h5>{i18n.catalog["enterpriseCore.orgWorkspace.recommendedTypes"]}</h5>
            <div className="org-workspace-type-chips">
              {suggestedTypes.map((type) => (
                <button key={type.id} type="button" className={`org-workspace-type-chip org-workspace-domain-${(type.level_domain || "other").toLowerCase()} ${selectedTypeId === type.id ? "is-selected" : ""}`} onClick={() => chooseType(type.id)}>
                  {labelForType(type.id)}
                </button>
              ))}
            </div>
          </div>
          <div className={`org-workspace-integrity ${integrity?.summary.errors ? "has-errors" : ""}`}>
            <span aria-hidden="true">{getIcon(integrity?.summary.errors ? "shield-alert" : "shield-check")}</span>
            <div>
              <strong>{i18n.catalog["enterpriseCore.orgWorkspace.integrity.title"]}</strong>
              <p>{catalogText(i18n, "enterpriseCore.orgWorkspace.integrity.summary", { value0: integrity?.summary.errors ?? 0, value1: integrity?.summary.warnings ?? 0 })}</p>
            </div>
          </div>
        </aside>

        <div className="org-workspace-canvas">
          <div className="org-workspace-canvas-header">
            <div>
              <h4>{i18n.catalog["enterpriseCore.orgWorkspace.architecture.title"]}</h4>
              <p>{catalogText(i18n, "enterpriseCore.orgWorkspace.architecture.summary", { value0: nodes.length, value1: metaTypes.length })}</p>
            </div>
            {selectedNode ? <span className="badge badge-primary">{labelForType(selectedNode.node_type_id)}</span> : null}
          </div>
          {tree.length ? <ul className="org-workspace-tree">{tree.map((treeNode) => renderTree(treeNode))}</ul> : (
            <div className="org-workspace-empty-state">
              <span aria-hidden="true">{getIcon("sitemap")}</span>
              <h5>{i18n.catalog["enterpriseCore.orgWorkspace.empty.title"]}</h5>
              <p>{i18n.catalog["enterpriseCore.orgWorkspace.empty.description"]}</p>
              <Button type="button" variant="primary" onClick={() => { setActivePhase("foundation"); chooseType("CLIENT"); }}>
                {i18n.catalog["enterpriseCore.orgWorkspace.empty.action"]}
              </Button>
            </div>
          )}
        </div>

        <aside className="org-workspace-inspector" aria-live="polite">
          {selectedNode ? (
            <>
              <div className="org-workspace-panel-heading">
                <span className={`org-workspace-panel-icon org-workspace-domain-${(domainForType(selectedNode.node_type_id) || "other").toLowerCase()}`} aria-hidden="true">{getIcon(DOMAIN_ICON[domainForType(selectedNode.node_type_id)] || "sitemap")}</span>
                <div>
                  <h4>{nodeName(selectedNode)}</h4>
                  <p>{selectedNode.code}</p>
                </div>
              </div>
              <div className="org-workspace-inspector-section">
                <h5>{i18n.catalog["enterpriseCore.orgWorkspace.scope.title"]}</h5>
                {isScopeLoading ? <span className="org-workspace-loading-line" /> : null}
                {!isScopeLoading && Object.keys(resolved).length === 0 ? <p className="org-workspace-empty-copy">{i18n.catalog["enterpriseCore.orgWorkspace.scope.empty"]}</p> : null}
                {!isScopeLoading && Object.entries(resolved).map(([typeId, context]) => (
                  <div key={typeId} className="org-workspace-scope-row">
                    <span>{labelForType(typeId)}</span>
                    <strong>{context.code || "—"}</strong>
                  </div>
                ))}
              </div>
              <div className="org-workspace-inspector-section">
                <h5>{i18n.catalog["enterpriseCore.orgWorkspace.relationships.title"]}</h5>
                {selectedNodeRules.length ? selectedNodeRules.map((rule) => (
                  <p key={rule.id} className="org-workspace-relationship">
                    {labelForType(rule.source_node_type_id)} <span aria-hidden="true">←</span> {labelForType(rule.target_node_type_id)}
                  </p>
                )) : <p className="org-workspace-empty-copy">{i18n.catalog["enterpriseCore.orgWorkspace.relationships.empty"]}</p>}
              </div>
            </>
          ) : (
            <div className="org-workspace-inspector-placeholder">
              <span aria-hidden="true">{getIcon("scan-search")}</span>
              <h4>{i18n.catalog["enterpriseCore.orgWorkspace.inspector.title"]}</h4>
              <p>{i18n.catalog["enterpriseCore.orgWorkspace.inspector.description"]}</p>
            </div>
          )}
        </aside>
      </div>

      <div className="org-workspace-composer">
        <div className="org-workspace-composer-heading">
          <span className="org-workspace-panel-icon" aria-hidden="true">{getIcon("plus-circle")}</span>
          <div>
            <h4>{i18n.catalog["enterpriseCore.orgWorkspace.composer.title"]}</h4>
            <p>{i18n.catalog["enterpriseCore.orgWorkspace.composer.description"]}</p>
          </div>
        </div>
        <div className="org-workspace-domain-groups">
          {groupedTypes.map((group) => (
            <div key={group.domain} className={`org-workspace-domain-group org-workspace-domain-${group.domain.toLowerCase()}`}>
              <h5>{group.domain}</h5>
              <div className="org-workspace-domain-type-grid">
                {group.types.map((type) => (
                  <button key={type.id} type="button" className={`org-workspace-domain-type ${selectedTypeId === type.id ? "is-selected" : ""}`} onClick={() => chooseType(type.id)}>
                    <strong>{labelForType(type.id)}</strong>
                    <span>{type.description || type.id}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedType ? (
          <div className="org-workspace-composer-form">
            <div className="org-workspace-selected-type">
              <span className={`org-workspace-panel-icon org-workspace-domain-${(selectedType.level_domain || "other").toLowerCase()}`} aria-hidden="true">{getIcon(DOMAIN_ICON[selectedType.level_domain || ""] || "sitemap")}</span>
              <div>
                <strong>{labelForType(selectedType.id)}</strong>
                <span>{selectedType.description || selectedType.id}</span>
              </div>
            </div>
            <div className="settings-form-grid setup-form-grid">
              <label className="form-group" htmlFor="org-workspace-code">
                <span>{i18n.catalog["enterpriseCore.orgWorkspace.composer.code"]}</span>
                <input id="org-workspace-code" className="setup-input" dir="ltr" value={nodeCode} onChange={(event) => setNodeCode(event.target.value)} required />
              </label>
              <label className="form-group" htmlFor="org-workspace-name">
                <span>{i18n.catalog["enterpriseCore.orgWorkspace.composer.name"]}</span>
                <input id="org-workspace-name" className="setup-input" dir={getTextDirection(nodeNameValue, defaultTextDirection)} value={nodeNameValue} onChange={(event) => setNodeNameValue(event.target.value)} />
              </label>
              {selectedTypeRules.map((rule) => {
                const candidates = linkCandidatesForRule(rule);
                const selectedTargets = linkTargetsByRule[rule.id] ?? [];
                const isRequired = (REQUIRED_PARENT_TYPES[selectedTypeId] ?? []).includes(rule.target_node_type_id);
                const allowsMultiple = rule.cardinality === "N:M";
                return (
                  <fieldset key={rule.id} className="form-group org-workspace-link-rule">
                    <legend>{labelForType(rule.target_node_type_id)}{isRequired ? " *" : ""}</legend>
                    <small>{rule.description || labelForType(rule.target_node_type_id)}</small>
                    {allowsMultiple ? (
                      <div className="org-workspace-link-options">
                        {candidates.map((node) => (
                          <label key={node.node_uuid} className="org-workspace-link-option">
                            <input
                              type="checkbox"
                              checked={selectedTargets.includes(node.node_uuid)}
                              onChange={() => setLinkTargetsByRule((current) => {
                                const existing = current[rule.id] ?? [];
                                return {
                                  ...current,
                                  [rule.id]: existing.includes(node.node_uuid)
                                    ? existing.filter((uuid) => uuid !== node.node_uuid)
                                    : [...existing, node.node_uuid],
                                };
                              })}
                            />
                            <span>{node.code}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <SearchableSelect
                        id={`org-workspace-link-${rule.id}`}
                        className="setup-select"
                        value={selectedTargets[0] ?? ""}
                        onChange={(value) => setLinkTargetsByRule((current) => ({
                          ...current,
                          [rule.id]: value ? [String(value)] : [],
                        }))}
                        options={candidates.map((node) => ({ value: node.node_uuid, label: catalogText(i18n, "enterpriseCore.setup.nodeSummary", { value0: node.code, value1: labelForType(node.node_type_id) }) }))}
                      />
                    )}
                  </fieldset>
                );
              })}
              {(selectedType.attributes ?? []).filter((attribute) => attribute.attribute_key !== "name").map((attribute) => {
                const referenceKey = attribute.attribute_key as ReferenceAttributeKey;
                const referenceOptions = referenceOptionsByAttribute[referenceKey];
                const isReferenceAttribute = referenceOptions !== undefined;
                const hasReferenceOptions = (referenceOptions?.length ?? 0) > 0;

                return (
                  <label key={attribute.attribute_key} className="form-group" htmlFor={attribute.attribute_key}>
                    <span>{labelForAttribute(attribute.attribute_key)}{attribute.is_mandatory ? " *" : ""}</span>
                    {isReferenceAttribute ? (
                      <>
                        <SearchableSelect
                          id={attribute.attribute_key}
                          className="setup-select"
                          value={attributes[attribute.attribute_key] || ""}
                          options={referenceOptions}
                          required={attribute.is_mandatory}
                          disabled={isReferenceDataLoading || !hasReferenceOptions}
                          placeholder={isReferenceDataLoading ? i18n.catalog["enterpriseCore.orgWorkspace.reference.loading"] : i18n.catalog["enterpriseCore.orgWorkspace.reference.placeholder"]}
                          noResultsText={i18n.catalog["enterpriseCore.orgWorkspace.reference.noResults"]}
                          onChange={(value) => setAttributes((current) => ({ ...current, [attribute.attribute_key]: value === null ? "" : String(value) }))}
                        />
                        <small className={`org-workspace-reference-help ${hasReferenceOptions ? "" : "is-actionable"}`}>
                          {referenceHelpForAttribute(referenceKey, hasReferenceOptions)}
                        </small>
                      </>
                    ) : attribute.attribute_key === "fiscal_year_variant" ? (
                      <>
                        <select
                          id={attribute.attribute_key}
                          className="setup-input"
                          value={attributes[attribute.attribute_key] || ""}
                          required={attribute.is_mandatory}
                          onChange={(event) => setAttributes((current) => ({ ...current, [attribute.attribute_key]: event.target.value }))}
                        >
                          <option value="">{i18n.catalog["enterpriseCore.orgWorkspace.fiscalYearVariant.placeholder"]}</option>
                          <option value={CALENDAR_YEAR_VARIANT}>{i18n.catalog["enterpriseCore.orgWorkspace.fiscalYearVariant.calendarYear"]}</option>
                        </select>
                        <small className="org-workspace-reference-help">
                          {i18n.catalog["enterpriseCore.orgWorkspace.fiscalYearVariant.help"]}
                        </small>
                      </>
                    ) : attribute.attribute_key === "language" || attribute.attribute_key === "default_language" ? (
                      <>
                        <select
                          id={attribute.attribute_key}
                          className="setup-input"
                          value={attributes[attribute.attribute_key] || ""}
                          required={attribute.is_mandatory}
                          onChange={(event) => setAttributes((current) => ({ ...current, [attribute.attribute_key]: event.target.value }))}
                        >
                          <option value="">{i18n.catalog["enterpriseCore.orgWorkspace.companyLanguage.placeholder"]}</option>
                          {SUPPORTED_LANGUAGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label} — {option.subtitle}</option>
                          ))}
                        </select>
                        <small className="org-workspace-reference-help">
                          {i18n.catalog["enterpriseCore.orgWorkspace.companyLanguage.help"]}
                        </small>
                      </>
                    ) : attribute.attribute_type === "boolean" ? (
                      <select
                        id={attribute.attribute_key}
                        className="setup-input"
                        value={attributes[attribute.attribute_key] || ""}
                        required={attribute.is_mandatory}
                        onChange={(event) => setAttributes((current) => ({ ...current, [attribute.attribute_key]: event.target.value }))}
                      >
                        <option value="">—</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : attribute.attribute_type === "json" ? (
                      <textarea
                        id={attribute.attribute_key}
                        className="setup-input"
                        rows={3}
                        value={attributes[attribute.attribute_key] || ""}
                        dir="ltr"
                        required={attribute.is_mandatory}
                        onChange={(event) => setAttributes((current) => ({ ...current, [attribute.attribute_key]: event.target.value }))}
                      />
                    ) : (
                      <input
                        id={attribute.attribute_key}
                        className="setup-input"
                        type={inputTypeForAttribute(attribute.attribute_type)}
                        value={attributes[attribute.attribute_key] || ""}
                        step={attribute.attribute_type === "decimal" ? "any" : undefined}
                        dir={attribute.attribute_type === "integer" || attribute.attribute_type === "decimal" || attribute.attribute_type === "date" ? "ltr" : getTextDirection(attributes[attribute.attribute_key] || "", defaultTextDirection)}
                        required={attribute.is_mandatory}
                        onChange={(event) => setAttributes((current) => ({ ...current, [attribute.attribute_key]: event.target.value }))}
                      />
                    )}
                  </label>
                );
              })}
            </div>
            <div className="org-workspace-composer-footer">
              <p>{selectedTypeRules.length ? i18n.catalog["enterpriseCore.orgWorkspace.composer.parentHelper"] : i18n.catalog["enterpriseCore.orgWorkspace.composer.rootHelper"]}</p>
              <div className="setup-actions">
                <Button type="button" variant="secondary" onClick={resetComposer}>{i18n.catalog["common.general.cancel"]}</Button>
                <Button type="button" variant="primary" icon="check" onClick={() => void createNode()} isLoading={isSaving} disabled={!isNodeReadyToCreate}>
                  {i18n.catalog["enterpriseCore.orgWorkspace.composer.create"]}
                </Button>
              </div>
            </div>
          </div>
        ) : <p className="org-workspace-composer-empty">{i18n.catalog["enterpriseCore.orgWorkspace.composer.selectType"]}</p>}
      </div>
    </section>
  );
}
