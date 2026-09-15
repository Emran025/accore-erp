"use client";

import { useState } from "react";
import { Button, Dialog } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/components/ui";
import { getIcon } from "@/lib/icons";

interface NodeItem {
  node_uuid: string;
  code: string;
  name_en?: string;
  name_ar?: string;
  display_name?: string;
}

interface TemporalRestructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceNode: NodeItem | null;
  allNodes: NodeItem[];
  currentPlane?: string;
  onSuccess: () => void;
}

export function TemporalRestructureModal({
  isOpen,
  onClose,
  sourceNode,
  allNodes,
  currentPlane = "OPERATIONAL_HIERARCHY",
  onSuccess,
}: TemporalRestructureModalProps) {
  const { t: i18n, locale } = useI18n();
  const isArabic = locale === "ar-SA";

  const [targetNodeUuid, setTargetNodeUuid] = useState("");
  const [planeType, setPlaneType] = useState(currentPlane);
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !sourceNode) return null;

  const eligibleParents = allNodes.filter(
    (n) => n.node_uuid !== sourceNode.node_uuid
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNodeUuid) {
      showToast(isArabic ? "يرجى اختيار الوحدة الرئيسية الجديدة" : "Please select a new parent unit", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG_STUDIO.RESTRUCTURE, {
        method: "POST",
        body: JSON.stringify({
          source_node_uuid: sourceNode.node_uuid,
          target_node_uuid: targetNodeUuid,
          plane_type: planeType,
          effective_date: effectiveDate,
          link_type: "line_management",
          reason: reason.trim() || undefined,
        }),
      });

      if (response.success) {
        showToast(i18n.catalog["orgStudio.restructure.success"], "success");
        onSuccess();
        onClose();
      } else {
        showToast(response.message || "Failed to restructure link", "error");
      }
    } catch {
      showToast("Network error executing restructuring", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisplayName = (n: NodeItem) => {
    if (isArabic && n.name_ar) return `${n.code} — ${n.name_ar}`;
    if (n.name_en) return `${n.code} — ${n.name_en}`;
    return `${n.code} — ${n.display_name || n.node_uuid.slice(0, 8)}`;
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={i18n.catalog["orgStudio.restructure.title"]}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Source Unit Display */}
        <div>
          <label className="text-xs font-semibold text-neutral-400 block mb-1">
            {i18n.catalog["orgStudio.restructure.sourceUnit"]}
          </label>
          <div className="p-2.5 bg-neutral-900 border border-neutral-800 text-sm font-medium text-neutral-100 rounded-none">
            {getDisplayName(sourceNode)}
          </div>
        </div>

        {/* New Parent Selection */}
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">
            {i18n.catalog["orgStudio.restructure.newParent"]} *
          </label>
          <select
            value={targetNodeUuid}
            onChange={(e) => setTargetNodeUuid(e.target.value)}
            required
            className="w-full bg-neutral-950 border border-neutral-700 p-2 text-sm text-neutral-100 rounded-none focus:border-primary-500 focus:outline-none"
          >
            <option value="">{isArabic ? "— اختر الوحدة الجديدة —" : "— Select New Parent —"}</option>
            {eligibleParents.map((n) => (
              <option key={n.node_uuid} value={n.node_uuid}>
                {getDisplayName(n)}
              </option>
            ))}
          </select>
        </div>

        {/* Plane Type */}
        <div>
          <label className="text-xs font-semibold text-neutral-400 block mb-1">
            Relationship Plane
          </label>
          <select
            value={planeType}
            onChange={(e) => setPlaneType(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 p-2 text-sm text-neutral-100 rounded-none focus:border-primary-500 focus:outline-none"
          >
            <option value="OPERATIONAL_HIERARCHY">OPERATIONAL_HIERARCHY (Line Management)</option>
            <option value="LEGAL_OWNERSHIP">LEGAL_OWNERSHIP (Corporate / Subsidiary)</option>
            <option value="GEOGRAPHIC_CONTAINMENT">GEOGRAPHIC_CONTAINMENT (Facilities / Region)</option>
            <option value="FINANCIAL_ROLLUP">FINANCIAL_ROLLUP (Cost & Profit Rollup)</option>
            <option value="FUNCTIONAL_MATRIX">FUNCTIONAL_MATRIX (Dual Reporting)</option>
          </select>
        </div>

        {/* Effective Date */}
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">
            {i18n.catalog["orgStudio.restructure.effectiveDate"]} *
          </label>
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            required
            className="w-full bg-neutral-950 border border-neutral-700 p-2 text-sm text-neutral-100 rounded-none focus:border-primary-500 focus:outline-none"
          />
          <p className="text-[11px] text-neutral-500 mt-1">
            {isArabic
              ? "يتم إغلاق خط التقارير السابق في اليوم السابق لهذا التاريخ وسريان الخط الجديد من هذا التاريخ."
              : "Prior reporting edge closes the day before; new edge takes effect on this date without altering past records."}
          </p>
        </div>

        {/* Reason */}
        <div>
          <label className="text-xs font-semibold text-neutral-400 block mb-1">
            {i18n.catalog["orgStudio.restructure.reason"]}
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isArabic ? "مثال: قرار مجلس الإدارة رقم 42 لسنة 2026" : "E.g. Board Resolution #42/2026 Reorganization"}
            className="w-full bg-neutral-950 border border-neutral-700 p-2 text-sm text-neutral-100 rounded-none focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-none text-xs px-4 py-2"
          >
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !targetNodeUuid}
            className="rounded-none text-xs px-5 py-2 font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {getIcon("git-branch", "w-4 h-4")}
                <span>{i18n.catalog["orgStudio.restructure.confirm"]}</span>
              </span>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
