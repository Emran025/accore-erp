"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui";
import { getIcon } from "@/lib/icons";

export interface BlueprintUnit {
  id?: string;
  temp_id?: string;
  code: string;
  name?: string;
  name_en?: string;
  name_ar?: string;
  type?: string;
  type_id?: string;
  facets?: string[];
  attributes?: Record<string, unknown>;
}

export interface BlueprintData {
  version?: string;
  archetype_id: string;
  units: BlueprintUnit[];
  relationships?: Array<{
    source?: string;
    target?: string;
    source_temp_id?: string;
    target_temp_id?: string;
    plane?: string;
    plane_type?: string;
    type?: string;
    link_type?: string;
  }>;
  positions?: Array<{
    code?: string;
    position_code?: string;
    title?: string;
    title_en?: string;
    title_ar?: string;
    unit_id?: string;
    unit_temp_id?: string;
  }>;
}

export interface EvaluationData {
  primary_archetype: string;
  confidence?: number;
  confidence_score?: number;
  complexity_grade: number;
  explainability?: {
    rationale?: string;
    rationale_ar?: string;
    summary_en?: string;
    summary_ar?: string;
    key_factors?: string[];
    reasons?: Array<{ factor: string; en: string; ar: string }>;
  };
  conflicts?: Array<{ factor: string; message_en: string; message_ar?: string }>;
}

interface BlueprintReviewCardProps {
  evaluation: EvaluationData;
  blueprint: BlueprintData;
  onUpdateBlueprint?: (updated: BlueprintData) => void;
  onStage: () => Promise<void>;
  onPublish: () => Promise<void>;
  isStaging: boolean;
  isPublishing: boolean;
  deferredQuestions?: Array<{ id: string; question: string; question_ar?: string }>;
}

const ARCHETYPE_META: Record<string, { en: string; ar: string; icon: string }> = {
  MICRO_FLAT: { en: "Micro-Business (Flat Unified)", ar: "منشأة مصغرة (هيكل موحد مسطح)", icon: "home" },
  SIMPLE_HIERARCHY: { en: "Simple Line Hierarchy", ar: "هيكل هرمي خطي بسيط", icon: "building" },
  GEOGRAPHIC_MULTI_BRANCH: { en: "Geographic Multi-Branch Chain", ar: "شبكة فروع ومستودعات جغرافية", icon: "shopping-bag" },
  HOLDING_SUBSIDIARIES: { en: "Multi-Entity Holding & Subsidiaries", ar: "مجموعة قابضة وشركات تابعة", icon: "network" },
  HOLDING_CONGLOMERATE: { en: "Multi-Entity Holding Group", ar: "مجموعة قابضة متعددة الكيانات", icon: "network" },
  FUNCTIONAL_PROJECT_MATRIX: { en: "Functional & Project Matrix", ar: "مصفوفة وظيفية ومشاريع", icon: "briefcase" },
  FUNCTIONAL: { en: "Functional Departmental", ar: "هيكل وظيفي بالأقسام", icon: "briefcase" },
  MATRIX: { en: "Matrix (Dual Reporting)", ar: "هيكل مصفوفي مزدوج", icon: "layers" },
  DIVISIONAL: { en: "Divisional Business Units", ar: "قطاعات ووحدات أعمال", icon: "pie-chart" },
  DIVISONAL_BUSINESS_UNIT: { en: "Multi-Divisional Units", ar: "قطاعات أعمال متعددة", icon: "pie-chart" },
  DISTRIBUTED_LOGISTICS_HUB: { en: "Hub & Spoke Logistics Distribution", ar: "شبكة توزيع محورية ومستودعات", icon: "truck" },
  PROJECTIZED: { en: "Projectized & Squad-Based", ar: "هيكل مشاريع وفرق عمل", icon: "clipboard-list" },
};

export function BlueprintReviewCard({
  evaluation,
  blueprint,
  onUpdateBlueprint,
  onStage,
  onPublish,
  isStaging,
  isPublishing,
  deferredQuestions = [],
}: BlueprintReviewCardProps) {
  const { t: i18n, locale } = useI18n();
  const isArabic = locale === "ar-SA";

  const units = useMemo(() => blueprint.units || [], [blueprint.units]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => {
    const first = units[0];
    return first ? (first.id || first.temp_id || first.code) : "";
  });
  const [deferredOpen, setDeferredOpen] = useState(false);

  // Inspector form states for currently selected unit
  const activeUnit = useMemo(() => {
    return units.find((u) => (u.id || u.temp_id || u.code) === selectedUnitId) || units[0] || null;
  }, [units, selectedUnitId]);

  const [editNameAr, setEditNameAr] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editCity, setEditCity] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Synchronize local edit state whenever selected unit changes
  const selectUnit = (u: BlueprintUnit) => {
    const uid = u.id || u.temp_id || u.code;
    setSelectedUnitId(uid);
    setEditNameAr(u.name_ar || u.name || "");
    setEditNameEn(u.name_en || u.name || "");
    setEditCode(u.code || "");
    const attrs = (u.attributes || {}) as Record<string, unknown>;
    setEditCity((attrs.city as string) || "");
    setIsEditing(false);
  };

  const confidenceScore = evaluation.confidence ?? evaluation.confidence_score ?? 0.85;
  const confidencePct = Math.round(confidenceScore * 100);

  const archInfo = ARCHETYPE_META[evaluation.primary_archetype] ?? {
    en: evaluation.primary_archetype,
    ar: evaluation.primary_archetype,
    icon: "building",
  };

  // Unit Mutators for Graph Adjustments
  const handleSaveUnitEdit = () => {
    if (!activeUnit || !onUpdateBlueprint) return;
    const currentUid = activeUnit.id || activeUnit.temp_id || activeUnit.code;
    const updatedUnits = units.map((u) => {
      const uid = u.id || u.temp_id || u.code;
      if (uid === currentUid) {
        return {
          ...u,
          code: editCode.trim().toUpperCase(),
          name_ar: editNameAr.trim(),
          name_en: editNameEn.trim(),
          name: isArabic ? editNameAr.trim() : editNameEn.trim(),
          attributes: {
            ...(u.attributes || {}),
            city: editCity.trim(),
          },
          is_user_locked: true,
        };
      }
      return u;
    });

    onUpdateBlueprint({
      ...blueprint,
      units: updatedUnits,
    });
    setIsEditing(false);
  };

  const handleDeleteUnit = (targetUnit: BlueprintUnit) => {
    if (!onUpdateBlueprint) return;
    const targetUid = targetUnit.id || targetUnit.temp_id || targetUnit.code;
    const updatedUnits = units.filter((u) => (u.id || u.temp_id || u.code) !== targetUid);
    onUpdateBlueprint({
      ...blueprint,
      units: updatedUnits,
    });
    if (updatedUnits.length > 0) {
      selectUnit(updatedUnits[0]);
    }
  };

  const handleAddUnit = (type: "STORE" | "WAREHOUSE" | "DEPARTMENT") => {
    if (!onUpdateBlueprint) return;
    const count = units.length + 1;
    let newUnit: BlueprintUnit;

    if (type === "STORE") {
      newUnit = {
        temp_id: `u_store_${count}`,
        code: `STR-${String(count).padStart(2, "0")}`,
        name_ar: `فرع تجاري جديد ${count}`,
        name_en: `New Retail Store ${count}`,
        type_id: "PLANT",
        facets: ["OperationalFacilityFacet", "CommercialChannelFacet", "PointOfSaleFacet"],
        attributes: { facility_type: "store", city: isArabic ? "الرياض" : "Riyadh" },
        // is_user_locked: true,
      };
    } else if (type === "WAREHOUSE") {
      newUnit = {
        temp_id: `u_wh_${count}`,
        code: `WH-${String(count).padStart(2, "0")}`,
        name_ar: `مستودع تخزين ${count}`,
        name_en: `Warehouse Depot ${count}`,
        type_id: "PLANT",
        facets: ["OperationalFacilityFacet", "InventoryStorageFacet"],
        attributes: { facility_type: "warehouse", city: isArabic ? "الرياض" : "Riyadh" },
        // is_user_locked: true,
      };
    } else {
      newUnit = {
        temp_id: `u_dept_${count}`,
        code: `DEP-${String(count).padStart(2, "0")}`,
        name_ar: `قسم تشغيلي ${count}`,
        name_en: `Operational Dept ${count}`,
        type_id: "COST_CENTER",
        facets: ["FinancialResponsibilityFacet"],
        attributes: {},
        // is_user_locked: true,
      };
    }

    const updatedUnits = [...units, newUnit];
    onUpdateBlueprint({
      ...blueprint,
      units: updatedUnits,
    });
    selectUnit(newUnit);
  };

  const explainSummary = isArabic
    ? (evaluation.explainability?.rationale_ar || evaluation.explainability?.summary_ar || evaluation.explainability?.rationale)
    : (evaluation.explainability?.rationale || evaluation.explainability?.summary_en);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6 transition-all">
      {/* Conflict / Discrepancy Alert */}
      {evaluation.conflicts && evaluation.conflicts.length > 0 && (
        <div className="border border-amber-300 bg-amber-50/70 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <span className="text-amber-600">{getIcon("alert-triangle", "w-4 h-4")}</span>
            <span>
              {isArabic
                ? "تنبيه: تم اكتشاف مؤشرات تشغيلية متباينة، يُرجى فحص الهيكل قبل النشر."
                : "Notice: Divergent operational signals detected, please review the blueprint."}
            </span>
          </div>
          <ul className="space-y-1 ps-5 list-disc text-[11px] text-amber-800">
            {evaluation.conflicts.map((c, i) => (
              <li key={i}>{isArabic && c.message_ar ? c.message_ar : c.message_en}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Header: Archetype, Confidence, & Complexity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
            {getIcon(archInfo.icon, "w-6 h-6")}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {isArabic ? "الهيكل التنظيمي المقترح" : "Synthesized Archetype"}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {evaluation.primary_archetype}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {isArabic ? archInfo.ar : archInfo.en}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
          {/* Confidence */}
          <div className="text-center px-2">
            <span className="text-[10px] font-bold text-slate-500 block mb-1">
              {isArabic ? "نسبة المطابقة" : "Confidence"}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {confidencePct}%
              </span>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-200" />

          {/* Complexity Grade */}
          <div className="text-center px-2">
            <span className="text-[10px] font-bold text-slate-500 block mb-1">
              {isArabic ? "درجة التعقيد" : "Complexity"}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <span
                  key={lvl}
                  className={`w-2.5 h-2.5 rounded-full ${
                    lvl <= evaluation.complexity_grade ? "bg-amber-500" : "bg-slate-200"
                  }`}
                />
              ))}
              <span className="text-xs font-bold text-slate-700 font-mono ms-1">
                L{evaluation.complexity_grade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rationale Explainability */}
      {explainSummary && (
        <div className="border border-blue-100 bg-blue-50/50 p-3.5 rounded-lg flex items-start gap-3">
          <span className="text-blue-600 mt-0.5 shrink-0">{getIcon("info", "w-4 h-4")}</span>
          <p className="text-xs text-blue-900 leading-relaxed">
            {explainSummary}
          </p>
        </div>
      )}

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
          <span className="text-xl font-bold font-mono text-slate-900 block">
            {units.length}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            {isArabic ? "وحدات تنظيمية" : "Organizational Units"}
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
          <span className="text-xl font-bold font-mono text-slate-900 block">
            {blueprint.relationships?.length || Math.max(0, units.length - 1)}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            {isArabic ? "روابط هيكلية" : "Hierarchy Links"}
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
          <span className="text-xl font-bold font-mono text-slate-900 block">
            {blueprint.positions?.length || 1}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            {isArabic ? "مناصب قيادية" : "Key Positions"}
          </span>
        </div>
      </div>

      {/* ── Interactive Graph Adjustments Workspace (Doc 04 §5.2) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {isArabic ? "مخطط الهيكل التنظيمي ومفتش الخصائص" : "Blueprint Navigator & Unit Inspector"}
          </h3>
          {/* Quick Graph Mutation Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleAddUnit("STORE")}
              className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 rounded-md transition-all flex items-center gap-1 text-slate-700 shadow-2xs"
            >
              <span>+</span>
              <span>{isArabic ? "إضافة متجر / فرع" : "Add Store"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddUnit("WAREHOUSE")}
              className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 rounded-md transition-all flex items-center gap-1 text-slate-700 shadow-2xs"
            >
              <span>+</span>
              <span>{isArabic ? "إضافة مستودع" : "Add Warehouse"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddUnit("DEPARTMENT")}
              className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 rounded-md transition-all flex items-center gap-1 text-slate-700 shadow-2xs"
            >
              <span>+</span>
              <span>{isArabic ? "إضافة قسم" : "Add Department"}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Navigator Tree on Left, Unit Inspector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30">
          {/* Left Column: Blueprint Tree (7 cols) */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-e border-slate-200 p-3 max-h-80 overflow-y-auto space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {isArabic ? "انقر على أي وحدة لفحصها وتعديل خصائصها:" : "Click any unit to inspect & adjust:"}
            </span>
            {units.map((u, idx) => {
              const uid = u.id || u.temp_id || u.code;
              const isSelected = (activeUnit && (activeUnit.id || activeUnit.temp_id || activeUnit.code) === uid);
              const name = (isArabic && u.name_ar) ? u.name_ar : (u.name_en || u.name || u.code);
              const isRoot = idx === 0 || u.type_id === "COMP_CODE" || u.type === "COMP_CODE";

              return (
                <div
                  key={uid}
                  onClick={() => selectUnit(u)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-300"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs ${
                        isRoot
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {getIcon(isRoot ? "building" : "box", "w-3.5 h-3.5")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {u.code}
                        </span>
                        <span className="text-slate-300">—</span>
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {u.type_id || u.type || "ORG_UNIT"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {(u.facets || []).slice(0, 2).map((f) => (
                      <span
                        key={f}
                        className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200 rounded"
                      >
                        #{f.replace("Facet", "")}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Unit Inspector (5 cols) */}
          <div className="lg:col-span-5 p-4 bg-white space-y-3">
            {activeUnit ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                      {isArabic ? "مفتش خصائص الوحدة" : "Unit Inspector"}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">
                      {activeUnit.code} — {(isArabic && activeUnit.name_ar) ? activeUnit.name_ar : (activeUnit.name_en || activeUnit.name)}
                    </h4>
                  </div>
                  {/* Delete unit button (if not root) */}
                  {units.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteUnit(activeUnit)}
                      className="text-[10px] text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 border border-transparent hover:border-red-200 transition-all font-medium"
                      title={isArabic ? "حذف هذه الوحدة" : "Delete unit"}
                    >
                      {isArabic ? "حذف الوحدة" : "Delete"}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isArabic ? "رمز الوحدة (Code)" : "Unit Code"}
                      </label>
                      <input
                        type="text"
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-1.5 text-xs text-slate-900 rounded font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isArabic ? "الاسم بالعربية" : "Name (Arabic)"}
                      </label>
                      <input
                        type="text"
                        value={editNameAr}
                        onChange={(e) => setEditNameAr(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-1.5 text-xs text-slate-900 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isArabic ? "الاسم بالإنجليزية" : "Name (English)"}
                      </label>
                      <input
                        type="text"
                        value={editNameEn}
                        onChange={(e) => setEditNameEn(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-1.5 text-xs text-slate-900 rounded font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isArabic ? "المدينة / الموقع" : "City / Location"}
                      </label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-1.5 text-xs text-slate-900 rounded"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        type="button"
                        onClick={handleSaveUnitEdit}
                        className="px-3 py-1 text-xs font-bold rounded"
                      >
                        {isArabic ? "حفظ التعديلات" : "Save Changes"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                      >
                        {isArabic ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">{isArabic ? "النوع التقني:" : "Type ID:"}</span>
                        <span className="font-mono font-bold text-slate-800">{activeUnit.type_id || activeUnit.type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{isArabic ? "المدينة:" : "City:"}</span>
                        <span className="text-slate-800 font-medium">
                          {((activeUnit.attributes || {}) as Record<string, unknown>).city as string || (isArabic ? "الرياض" : "Riyadh")}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block mb-1">{isArabic ? "السمات والقدرات المفعلة:" : "Attached Facets:"}</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {(activeUnit.facets || []).map((f) => (
                          <span key={f} className="px-2 py-0.5 text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="w-full py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-md transition-all flex items-center justify-center gap-1.5"
                      >
                        {getIcon("edit", "w-3.5 h-3.5")}
                        <span>{isArabic ? "تعديل بيانات هذه الوحدة" : "Edit Unit Details"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                {isArabic ? "حدد وحدة من المخطط لفحص تفاصيلها" : "Select a unit to inspect"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Deferred Decisions Collapsible Section */}
      {deferredQuestions.length > 0 && (
        <div className="border border-amber-200 bg-amber-50/40 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setDeferredOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-amber-900 hover:bg-amber-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-amber-600">{getIcon("clock", "w-4 h-4")}</span>
              <span>
                {isArabic
                  ? `${deferredQuestions.length} قرار تشغيلي مؤجل — سيتم اعتماد الخيارات الافتراضية`
                  : `${deferredQuestions.length} Deferred Decisions — Default options configured`}
              </span>
            </span>
            <span className="text-slate-400 text-xs">{deferredOpen ? "▲" : "▼"}</span>
          </button>
          {deferredOpen && (
            <ul className="divide-y divide-amber-100 px-4 pb-3">
              {deferredQuestions.map((q) => (
                <li key={q.id} className="py-2 text-[11px] text-amber-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{isArabic && q.question_ar ? q.question_ar : q.question}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <Button
          type="button"
          onClick={onStage}
          disabled={isStaging || isPublishing}
          variant="secondary"
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-lg"
        >
          {isStaging ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent animate-spin rounded-full" />
              <span>{isArabic ? "جارٍ الحفظ كمسودة..." : "Saving draft..."}</span>
            </span>
          ) : (
            <span>{i18n.catalog["orgStudio.setup.stageBlueprint"] || (isArabic ? "حفظ كمسودة أولية" : "Save as Draft")}</span>
          )}
        </Button>

        <Button
          type="button"
          onClick={onPublish}
          disabled={isPublishing || isStaging}
          className="w-full sm:w-auto px-7 py-2.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
        >
          {isPublishing ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
              <span>{i18n.catalog["orgStudio.setup.publishing"] || (isArabic ? "جارٍ تجميع وتفعيل الهيكل..." : "Compiling Organization...")}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {getIcon("check-circle", "w-4 h-4")}
              <span>{i18n.catalog["orgStudio.setup.publishBlueprint"] || (isArabic ? "تأكيد وتفعيل الهيكل التنظيمي" : "Confirm & Publish Organization")}</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
