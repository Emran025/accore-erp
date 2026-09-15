"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui";
import { getIcon } from "@/lib/icons";

interface BlueprintUnit {
  id: string;
  code: string;
  name: string;
  name_ar?: string;
  type: string;
  facets?: string[];
  attributes?: Record<string, any>;
}

interface BlueprintData {
  version: string;
  archetype_id: string;
  units: BlueprintUnit[];
  relationships: Array<{
    source: string;
    target: string;
    plane: string;
    type?: string;
  }>;
  positions?: Array<{
    code: string;
    title: string;
    title_ar?: string;
    unit_id: string;
  }>;
}

interface EvaluationData {
  primary_archetype: string;
  confidence: number;
  complexity_grade: number;
  explainability: {
    rationale: string;
    rationale_ar?: string;
    key_factors: string[];
  };
}

interface BlueprintReviewCardProps {
  evaluation: EvaluationData;
  blueprint: BlueprintData;
  onStage: () => Promise<void>;
  onPublish: () => Promise<void>;
  isStaging: boolean;
  isPublishing: boolean;
}

const ARCHETYPE_LABELS: Record<string, { en: string; ar: string }> = {
  MICRO_FLAT: { en: "Micro-Business (Flat Unified)", ar: "منشأة مصغرة (هيكل موحد مسطح)" },
  GEOGRAPHIC_MULTI_BRANCH: { en: "Geographic Multi-Branch Chain", ar: "شبكة فروع ومستودعات جغرافية" },
  HOLDING_SUBSIDIARIES: { en: "Multi-Entity Holding & Subsidiaries", ar: "مجموعة قابضة وشركات تابعة متعددة" },
  FUNCTIONAL_PROJECT_MATRIX: { en: "Functional & Project Matrix", ar: "مصفوفة وظيفية وإدارة مشاريع" },
  DIVISONAL_BUSINESS_UNIT: { en: "Multi-Divisional Business Units", ar: "قطاعات ووحدات أعمال مستقلة" },
  DISTRIBUTED_LOGISTICS_HUB: { en: "Hub & Spoke Logistics Distribution", ar: "شبكة لوجستية وتوزيع محوري" },
  FRANCHISE_NETWORK: { en: "Franchise & Agency Network", ar: "شبكة امتياز تجاري ووكالات" },
};

export function BlueprintReviewCard({
  evaluation,
  blueprint,
  onStage,
  onPublish,
  isStaging,
  isPublishing,
}: BlueprintReviewCardProps) {
  const { t: i18n, locale } = useI18n();
  const isArabic = locale === "ar-SA";

  const archInfo = ARCHETYPE_LABELS[evaluation.primary_archetype] ?? {
    en: evaluation.primary_archetype,
    ar: evaluation.primary_archetype,
  };

  const confidencePct = Math.round(evaluation.confidence * 100);
  const units = blueprint.units || [];
  const rels = blueprint.relationships || [];
  const positions = blueprint.positions || [];

  return (
    <div className="border border-neutral-800 bg-neutral-900/60 p-6 rounded-none space-y-6">
      {/* Header & Archetype Recommendation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <span className="text-[11px] font-mono text-primary-400 uppercase tracking-wider block mb-1">
            {i18n.catalog["orgStudio.setup.archetypeRecommendation"]}
          </span>
          <h2 className="text-xl font-bold text-neutral-100">
            {isArabic ? archInfo.ar : archInfo.en}
          </h2>
          <span className="text-xs font-mono text-neutral-400 mt-0.5 inline-block">
            ARCHETYPE_ID: {evaluation.primary_archetype}
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Confidence Score */}
          <div className="text-right">
            <span className="text-xs text-neutral-400 block mb-1">
              {i18n.catalog["orgStudio.setup.confidence"]}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-neutral-800 rounded-none overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-none transition-all duration-500"
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {confidencePct}%
              </span>
            </div>
          </div>

          {/* Complexity Grade */}
          <div className="text-right border-l border-neutral-800 pl-6 rtl:border-l-0 rtl:border-r rtl:pr-6 rtl:pl-0">
            <span className="text-xs text-neutral-400 block mb-1">
              {i18n.catalog["orgStudio.setup.complexityGrade"]}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <span
                  key={lvl}
                  className={`w-3 h-3 rounded-none ${
                    lvl <= evaluation.complexity_grade
                      ? "bg-amber-500"
                      : "bg-neutral-800"
                  }`}
                  title={`Grade ${evaluation.complexity_grade} / 5`}
                />
              ))}
              <span className="text-xs font-mono text-neutral-300 ml-1.5 rtl:mr-1.5 rtl:ml-0">
                L{evaluation.complexity_grade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Explainability Rationale */}
      <div className="border border-neutral-800 bg-neutral-950/80 p-4 space-y-2 rounded-none">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
          <span className="text-amber-400">{getIcon("info", "w-4 h-4")}</span>
          <span>{i18n.catalog["orgStudio.setup.whyThisArchetype"]}</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          {(isArabic && evaluation.explainability?.rationale_ar)
            ? evaluation.explainability.rationale_ar
            : evaluation.explainability?.rationale}
        </p>
      </div>

      {/* Blueprint Statistics Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-neutral-800 bg-neutral-950 p-3 text-center rounded-none">
          <span className="text-2xl font-bold font-mono text-neutral-100 block">
            {units.length}
          </span>
          <span className="text-[11px] text-neutral-400">
            {i18n.catalog["orgStudio.setup.unitsCount"]}
          </span>
        </div>
        <div className="border border-neutral-800 bg-neutral-950 p-3 text-center rounded-none">
          <span className="text-2xl font-bold font-mono text-neutral-100 block">
            {rels.length}
          </span>
          <span className="text-[11px] text-neutral-400">
            {i18n.catalog["orgStudio.setup.relationshipsCount"]}
          </span>
        </div>
        <div className="border border-neutral-800 bg-neutral-950 p-3 text-center rounded-none">
          <span className="text-2xl font-bold font-mono text-neutral-100 block">
            {positions.length}
          </span>
          <span className="text-[11px] text-neutral-400">
            {i18n.catalog["orgStudio.setup.positionsCount"]}
          </span>
        </div>
      </div>

      {/* Synthesized Units Preview */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          {i18n.catalog["orgStudio.setup.blueprintPreview"]}
        </h4>
        <div className="max-h-60 overflow-y-auto border border-neutral-800 divide-y divide-neutral-800/60 bg-neutral-950">
          {units.map((u) => (
            <div
              key={u.id}
              className="p-3 flex items-center justify-between text-xs hover:bg-neutral-900/50 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-neutral-200">
                    {u.code}
                  </span>
                  <span className="text-neutral-400">—</span>
                  <span className="text-neutral-100 font-semibold">
                    {(isArabic && u.name_ar) ? u.name_ar : u.name}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">
                  TYPE: {u.type}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {(u.facets || []).map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 text-[10px] font-mono bg-neutral-900 border border-neutral-700 text-neutral-300 rounded-none"
                  >
                    #{f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compilation Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
        <Button
          type="button"
          onClick={onStage}
          disabled={isStaging || isPublishing}
          variant="secondary"
          className="rounded-none text-xs px-4 py-2 font-medium"
        >
          {isStaging ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent animate-spin" />
              <span>Saving draft...</span>
            </span>
          ) : (
            <span>{i18n.catalog["orgStudio.setup.stageBlueprint"]}</span>
          )}
        </Button>

        <Button
          type="button"
          onClick={onPublish}
          disabled={isPublishing || isStaging}
          className="rounded-none text-xs px-6 py-2 font-medium bg-emerald-600 hover:bg-emerald-500 text-white border-none"
        >
          {isPublishing ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
              <span>{i18n.catalog["orgStudio.setup.publishing"]}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {getIcon("check-circle", "w-4 h-4")}
              <span>{i18n.catalog["orgStudio.setup.publishBlueprint"]}</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
