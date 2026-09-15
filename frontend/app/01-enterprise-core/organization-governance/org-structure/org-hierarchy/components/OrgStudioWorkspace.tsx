"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast, Button } from "@/components/ui";
import { getIcon } from "@/lib/icons";
import { PropertyInspector } from "./PropertyInspector";
import { TemporalRestructureModal } from "./TemporalRestructureModal";

type PerspectiveKey = "legal" | "facilities" | "workforce" | "financial" | "matrix" | "all";

interface StudioNode {
  node_uuid: string;
  node_type_id: string;
  code: string;
  name_en?: string;
  name_ar?: string;
  display_name?: string;
  status: string;
  facets?: string[];
  attributes_json?: Record<string, any>;
  meta_type?: {
    level_domain: string;
    display_name: string;
    display_name_ar?: string;
  };
}

interface StudioLink {
  id: number;
  source_node_uuid: string;
  target_node_uuid: string;
  plane_type: string;
  link_type: string;
  weight?: number;
}

interface PerspectivePayload {
  perspective: PerspectiveKey;
  as_of_date: string;
  nodes: StudioNode[];
  links: StudioLink[];
  root_nodes: StudioNode[];
  statistics: {
    total_nodes: number;
    total_links: number;
    root_count: number;
    facet_counts: Record<string, number>;
  };
}

interface TreeItem {
  node: StudioNode;
  children: TreeItem[];
}

const PERSPECTIVES: Array<{
  key: PerspectiveKey;
  labelKey: string;
  descKey: string;
  icon: string;
}> = [
  {
    key: "legal",
    labelKey: "orgStudio.perspectives.legal",
    descKey: "orgStudio.perspectives.legalDesc",
    icon: "briefcase",
  },
  {
    key: "facilities",
    labelKey: "orgStudio.perspectives.facilities",
    descKey: "orgStudio.perspectives.facilitiesDesc",
    icon: "box",
  },
  {
    key: "workforce",
    labelKey: "orgStudio.perspectives.workforce",
    descKey: "orgStudio.perspectives.workforceDesc",
    icon: "users",
  },
  {
    key: "financial",
    labelKey: "orgStudio.perspectives.financial",
    descKey: "orgStudio.perspectives.financialDesc",
    icon: "chart-line",
  },
  {
    key: "matrix",
    labelKey: "orgStudio.perspectives.matrix",
    descKey: "orgStudio.perspectives.matrixDesc",
    icon: "git-branch",
  },
  {
    key: "all",
    labelKey: "orgStudio.perspectives.all",
    descKey: "orgStudio.perspectives.title",
    icon: "layers",
  },
];

const DOMAIN_BORDER_COLORS: Record<string, string> = {
  Enterprise: "border-l-slate-400 rtl:border-l-0 rtl:border-r-slate-400",
  Financial: "border-l-amber-500 rtl:border-l-0 rtl:border-r-amber-500",
  Controlling: "border-l-amber-600 rtl:border-l-0 rtl:border-r-amber-600",
  Logistics: "border-l-blue-500 rtl:border-l-0 rtl:border-r-blue-500",
  Sales: "border-l-emerald-500 rtl:border-l-0 rtl:border-r-emerald-500",
  HR: "border-l-teal-500 rtl:border-l-0 rtl:border-r-teal-500",
  Project: "border-l-purple-500 rtl:border-l-0 rtl:border-r-purple-500",
};

export function OrgStudioWorkspace() {
  const { t: i18n, locale } = useI18n();
  const isArabic = locale === "ar-SA";

  const [activePerspective, setActivePerspective] = useState<PerspectiveKey>("all");
  const [data, setData] = useState<PerspectivePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [expandedUuids, setExpandedUuids] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<StudioNode | null>(null);

  // Restructure Modal state
  const [restructureModalOpen, setRestructureModalOpen] = useState(false);
  const [nodeToRestructure, setNodeToRestructure] = useState<StudioNode | null>(null);

  const loadPerspective = useCallback(async (key: PerspectiveKey) => {
    setIsLoading(true);
    try {
      const res = await fetchAPI<PerspectivePayload>(
        API_ENDPOINTS.ENTERPRISE_CORE.ORG_STUDIO.PERSPECTIVE(key)
      );

      if (res.success && res.data) {
        setData(res.data);
        // Expand all roots by default
        const roots = res.data.root_nodes || [];
        setExpandedUuids(new Set(roots.map((r) => r.node_uuid)));
      } else {
        showToast(res.message || "Failed to load perspective", "error");
      }
    } catch {
      showToast("Error loading organizational perspective", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPerspective(activePerspective);
  }, [activePerspective, loadPerspective]);

  const toggleExpand = (uuid: string) => {
    setExpandedUuids((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!data) return;
    setExpandedUuids(new Set(data.nodes.map((n) => n.node_uuid)));
  };

  const collapseAll = () => {
    setExpandedUuids(new Set());
  };

  // Build hierarchical tree structure from nodes and links
  const treeRoots = useMemo((): TreeItem[] => {
    if (!data || !data.nodes.length) return [];

    const nodeMap = new Map<string, StudioNode>(
      data.nodes.map((n) => [n.node_uuid, n])
    );

    // Map parent (target) -> children (sources)
    const childMap = new Map<string, string[]>();
    for (const link of data.links) {
      const parentUuid = link.target_node_uuid;
      const childUuid = link.source_node_uuid;
      const children = childMap.get(parentUuid) || [];
      if (!children.includes(childUuid)) {
        children.push(childUuid);
      }
      childMap.set(parentUuid, children);
    }

    const buildSubTree = (uuid: string, visited = new Set<string>()): TreeItem | null => {
      if (visited.has(uuid)) return null; // Cycle guard
      visited.add(uuid);

      const node = nodeMap.get(uuid);
      if (!node) return null;

      const childUuids = childMap.get(uuid) || [];
      const children = childUuids
        .map((c) => buildSubTree(c, new Set(visited)))
        .filter(Boolean) as TreeItem[];

      return { node, children };
    };

    // Roots are given by data.root_nodes, or nodes with no parent in this perspective
    const rootNodes = data.root_nodes.length > 0 ? data.root_nodes : data.nodes;
    return rootNodes
      .map((r) => buildSubTree(r.node_uuid)!)
      .filter(Boolean);
  }, [data]);

  const activePerspectiveMeta = PERSPECTIVES.find((p) => p.key === activePerspective);

  const getNodeTitle = (node: StudioNode) => {
    if (isArabic && node.name_ar) return node.name_ar;
    if (node.name_en) return node.name_en;
    if (node.display_name) return node.display_name;
    return node.code;
  };

  const renderTreeNode = (item: TreeItem, depth = 0) => {
    const { node, children } = item;
    const isExpanded = expandedUuids.has(node.node_uuid);
    const isSelected = selectedNode?.node_uuid === node.node_uuid;
    const hasChildren = children.length > 0;
    const domain = node.meta_type?.level_domain || "Enterprise";
    const borderClass = DOMAIN_BORDER_COLORS[domain] || "border-l-neutral-600";

    // Filtering check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSelf =
        node.code.toLowerCase().includes(q) ||
        (node.name_en && node.name_en.toLowerCase().includes(q)) ||
        (node.name_ar && node.name_ar.toLowerCase().includes(q));
      if (!matchSelf && !hasChildren) return null;
    }

    return (
      <div key={node.node_uuid} className="select-none">
        <div
          className={`flex items-center gap-2 p-2.5 my-1 border transition-all cursor-pointer rounded-none ${borderClass} border-l-4 rtl:border-l rtl:border-r-4 ${
            isSelected
              ? "bg-primary-950/40 border-primary-500 shadow-sm"
              : "bg-neutral-950/80 border-neutral-800/80 hover:bg-neutral-900/60 hover:border-neutral-700"
          }`}
          style={{
            marginInlineStart: `${depth * 24}px`,
          }}
          onClick={() => setSelectedNode(node)}
        >
          {/* Expand/Collapse Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(node.node_uuid);
            }}
            className={`w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-neutral-100 rounded-none border border-neutral-800 bg-neutral-900 ${
              !hasChildren ? "opacity-20 pointer-events-none" : ""
            }`}
          >
            {hasChildren ? (
              <span className="text-[10px] font-bold">
                {isExpanded ? "−" : "+"}
              </span>
            ) : null}
          </button>

          {/* Unit Info */}
          <div className="flex-1 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-neutral-200 bg-neutral-900 px-2 py-0.5 border border-neutral-800">
                {node.code}
              </span>
              <span className="text-sm font-semibold text-neutral-100">
                {getNodeTitle(node)}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                ({node.node_type_id})
              </span>
            </div>

            {/* Facets & Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                {(node.facets || []).map((f) => (
                  <span
                    key={f}
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-none"
                  >
                    #{f}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setNodeToRestructure(node);
                  setRestructureModalOpen(true);
                }}
                className="px-2 py-1 text-[11px] font-medium text-neutral-300 hover:text-primary-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-none flex items-center gap-1 transition-colors"
                title={i18n.catalog["orgStudio.restructure.title"]}
              >
                {getIcon("git-branch", "w-3 h-3")}
                <span className="hidden md:inline">Restructure</span>
              </button>
            </div>
          </div>
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div className="space-y-0.5 border-l border-neutral-800/40 rtl:border-l-0 rtl:border-r rtl:border-neutral-800/40">
            {children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Perspective Switcher Tabs */}
      <div className="border border-neutral-800 bg-neutral-900/60 p-2 rounded-none">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-1.5">
          {PERSPECTIVES.map((p) => {
            const isActive = activePerspective === p.key;
            const label = i18n.catalog[p.labelKey as keyof typeof i18n.catalog] || p.key;

            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setActivePerspective(p.key)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-none border transition-all ${
                  isActive
                    ? "bg-primary-950/70 border-primary-500 text-primary-200 shadow-sm"
                    : "bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                }`}
              >
                {getIcon(p.icon, "w-3.5 h-3.5")}
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Perspective Banner */}
        {activePerspectiveMeta && (
          <div className="mt-2.5 px-3 py-2 bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-none inline-block" />
              <span>
                {i18n.catalog[activePerspectiveMeta.descKey as keyof typeof i18n.catalog]}
              </span>
            </div>

            {data && (
              <div className="font-mono text-[11px] text-neutral-500 flex items-center gap-4">
                <span>UNITS: {data.statistics.total_nodes}</span>
                <span>LINKS: {data.statistics.total_links}</span>
                <span>ROOTS: {data.statistics.root_count}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Main Studio Workspace (Canvas + Property Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Graph Canvas / Hierarchy Tree */}
        <div className="lg:col-span-2 border border-neutral-800 bg-neutral-900/40 p-5 rounded-none space-y-4">
          {/* Canvas Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? "بحث في الوحدات والرموز..." : "Filter units by code or name..."}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 rounded-none focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 self-end">
              <button
                type="button"
                onClick={expandAll}
                className="px-2.5 py-1 text-xs font-mono bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-none"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-2.5 py-1 text-xs font-mono bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-none"
              >
                Collapse All
              </button>
              <button
                type="button"
                onClick={() => void loadPerspective(activePerspective)}
                className="px-2.5 py-1 text-xs font-mono bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-none"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Tree Rendering Area */}
          <div className="min-h-[420px] max-h-[640px] overflow-y-auto pr-1 rtl:pr-0 rtl:pl-1">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-neutral-500 text-xs">
                <span className="w-5 h-5 border-2 border-primary-500 border-t-transparent animate-spin inline-block" />
                <span>Projecting perspective graph...</span>
              </div>
            ) : treeRoots.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-800 text-neutral-500 text-xs">
                <span className="text-neutral-600 mb-2">
                  {getIcon("layers", "w-8 h-8")}
                </span>
                <p>{i18n.catalog["orgStudio.canvas.emptyPerspective"]}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {treeRoots.map((root) => renderTreeNode(root, 0))}
              </div>
            )}
          </div>
        </div>

        {/* Property Inspector Panel */}
        <div className="lg:col-span-1">
          <PropertyInspector
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onFacetsUpdated={() => void loadPerspective(activePerspective)}
            onOpenRestructure={(node) => {
              setNodeToRestructure(node);
              setRestructureModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* 3. Temporal Restructure Modal */}
      <TemporalRestructureModal
        isOpen={restructureModalOpen}
        onClose={() => {
          setRestructureModalOpen(false);
          setNodeToRestructure(null);
        }}
        sourceNode={nodeToRestructure}
        allNodes={data?.nodes || []}
        currentPlane={activePerspective === "financial" ? "FINANCIAL_ROLLUP" : activePerspective === "facilities" ? "GEOGRAPHIC_CONTAINMENT" : "OPERATIONAL_HIERARCHY"}
        onSuccess={() => void loadPerspective(activePerspective)}
      />
    </div>
  );
}
