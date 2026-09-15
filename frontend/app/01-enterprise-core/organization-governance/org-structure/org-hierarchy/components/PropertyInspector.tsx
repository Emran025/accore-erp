"use client";

import { useEffect, useState } from "react";
import { Button, showToast } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";

interface NodeData {
  node_uuid: string;
  code: string;
  name_en?: string;
  name_ar?: string;
  display_name?: string;
  node_type_id: string;
  status: string;
  facets?: string[];
  attributes_json?: Record<string, any>;
  legal_entity_uuid?: string;
}

interface ClosuresData {
  ancestors: NodeData[];
  descendants: NodeData[];
}

interface PropertyInspectorProps {
  node: NodeData | null;
  onClose: () => void;
  onFacetsUpdated: () => void;
  onOpenRestructure: (node: NodeData) => void;
}

const AVAILABLE_FACETS = [
  { key: "legal_entity", labelKey: "orgStudio.inspector.facetLegalEntity" },
  { key: "cost_center", labelKey: "orgStudio.inspector.facetCostCenter" },
  { key: "profit_center", labelKey: "orgStudio.inspector.facetProfitCenter" },
  { key: "warehouse", labelKey: "orgStudio.inspector.facetWarehouse" },
  { key: "department", labelKey: "orgStudio.inspector.facetDepartment" },
  { key: "facility", labelKey: "orgStudio.inspector.facetFacility" },
  { key: "sales_channel", labelKey: "orgStudio.inspector.facetSalesChannel" },
  { key: "project", labelKey: "orgStudio.inspector.facetProject" },
] as const;

export function PropertyInspector({
  node,
  onClose,
  onFacetsUpdated,
  onOpenRestructure,
}: PropertyInspectorProps) {
  const { t: i18n, locale } = useI18n();
  const isArabic = locale === "ar-SA";

  const [selectedFacets, setSelectedFacets] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [closures, setClosures] = useState<ClosuresData | null>(null);
  const [isLoadingClosures, setIsLoadingClosures] = useState(false);

  useEffect(() => {
    if (!node) {
      setSelectedFacets([]);
      setClosures(null);
      return;
    }

    setSelectedFacets(node.facets || []);

    const loadClosures = async () => {
      setIsLoadingClosures(true);
      try {
        const res = await fetchAPI(
          API_ENDPOINTS.ENTERPRISE_CORE.ORG_STUDIO.CLOSURES(node.node_uuid)
        );
        if (res.success) {
          const closurePayload = (res.data ?? res) as Partial<ClosuresData> | null;

          setClosures({
            ancestors: Array.isArray(closurePayload?.ancestors)
              ? (closurePayload.ancestors as NodeData[])
              : [],
            descendants: Array.isArray(closurePayload?.descendants)
              ? (closurePayload.descendants as NodeData[])
              : [],
          });
        }
      } catch {
        // closures non-blocking
      } finally {
        setIsLoadingClosures(false);
      }
    };

    void loadClosures();
  }, [node]);

  if (!node) {
    return (
      <div className="border border-neutral-800 bg-neutral-900/30 p-6 text-center rounded-none">
        <p className="text-xs text-neutral-500">
          {i18n.catalog["orgStudio.inspector.selectUnit"]}
        </p>
      </div>
    );
  }

  const toggleFacet = (facetKey: string) => {
    setSelectedFacets((prev) =>
      prev.includes(facetKey)
        ? prev.filter((f) => f !== facetKey)
        : [...prev, facetKey]
    );
  };

  const handleSaveFacets = async () => {
    setIsSaving(true);
    try {
      const res = await fetchAPI(
        API_ENDPOINTS.ENTERPRISE_CORE.ORG_STUDIO.NODE_FACETS(node.node_uuid),
        {
          method: "PUT",
          body: JSON.stringify({ facets: selectedFacets }),
        }
      );

      if (res.success) {
        showToast(i18n.catalog["orgStudio.inspector.syncNotice"], "success");
        onFacetsUpdated();
      } else {
        showToast(res.message || "Failed to save facets", "error");
      }
    } catch {
      showToast("Network error updating unit facets", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName =
    (isArabic && node.name_ar) ? node.name_ar : (node.name_en || node.display_name || node.code);

  return (
    <div className="border border-neutral-800 bg-neutral-900/80 p-5 rounded-none space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
        <div>
          <span className="text-[11px] font-mono text-primary-400 uppercase tracking-wider block">
            {i18n.catalog["orgStudio.inspector.title"]}
          </span>
          <h3 className="text-base font-bold text-neutral-100 mt-0.5">
            {displayName}
          </h3>
          <span className="text-xs font-mono text-neutral-400">
            {node.code} — TYPE: {node.node_type_id}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-200 p-1"
        >
          {getIcon("x", "w-4 h-4")}
        </button>
      </div>

      {/* Restructure Trigger */}
      <div>
        <Button
          type="button"
          onClick={() => onOpenRestructure(node)}
          variant="secondary"
          className="w-full rounded-none text-xs py-2 flex items-center justify-center gap-2 border-neutral-700 hover:border-primary-500"
        >
          {getIcon("git-branch", "w-4 h-4 text-primary-400")}
          <span>{i18n.catalog["orgStudio.restructure.title"]}</span>
        </Button>
      </div>

      {/* Facet Configuration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
            {i18n.catalog["orgStudio.inspector.facetsTitle"]}
          </h4>
          <span className="text-[10px] font-mono text-neutral-500">
            {selectedFacets.length} Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_FACETS.map((facet) => {
            const isChecked = selectedFacets.includes(facet.key);
            const label = i18n.catalog[facet.labelKey as keyof typeof i18n.catalog] || facet.key;

            return (
              <label
                key={facet.key}
                onClick={() => toggleFacet(facet.key)}
                className={`flex items-center gap-2 p-2 text-xs cursor-pointer border rounded-none transition-colors ${
                  isChecked
                    ? "bg-primary-950/40 border-primary-500 text-primary-200"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="rounded-none border-neutral-700 text-primary-600 focus:ring-0 bg-neutral-900"
                />
                <span className="truncate">{label}</span>
              </label>
            );
          })}
        </div>

        <p className="text-[11px] text-neutral-500 leading-normal">
          {i18n.catalog["orgStudio.inspector.syncNotice"]}
        </p>

        <Button
          type="button"
          onClick={handleSaveFacets}
          disabled={isSaving}
          className="w-full rounded-none text-xs py-2 font-medium"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>{i18n.catalog["orgStudio.inspector.saveFacets"]}</span>
          )}
        </Button>
      </div>

      {/* Transitive Closures (Ancestors / Descendants) */}
      <div className="border-t border-neutral-800 pt-4 space-y-3">
        <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Transitive Closures (DAG Path)
        </h4>

        {isLoadingClosures ? (
          <div className="text-xs text-neutral-500 flex items-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-neutral-400 border-t-transparent animate-spin" />
            <span>Resolving graph ancestry...</span>
          </div>
        ) : closures ? (
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[11px] text-neutral-400 block mb-1">
                Ancestors ({closures.ancestors.length}):
              </span>
              {closures.ancestors.length === 0 ? (
                <span className="text-[11px] text-neutral-500 font-mono">
                  [ROOT NODE — No higher reporting line]
                </span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {closures.ancestors.map((anc) => (
                    <span
                      key={anc.node_uuid}
                      className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 rounded-none"
                    >
                      {anc.code}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 block mb-1">
                Descendants ({closures.descendants.length}):
              </span>
              {closures.descendants.length === 0 ? (
                <span className="text-[11px] text-neutral-500 font-mono">
                  [LEAF NODE — No child units reporting]
                </span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {closures.descendants.map((desc) => (
                    <span
                      key={desc.node_uuid}
                      className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-400 rounded-none"
                    >
                      {desc.code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
