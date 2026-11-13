"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui";
import { getIcon } from "@/lib/icons";

export interface AdaptiveQuestion {
  id: string;
  question: string;
  question_ar?: string;
  type: "boolean" | "number" | "select" | "text" | "choice";
  options?: Array<{ value: string; label?: string; label_en?: string; label_ar?: string }>;
  default?: unknown;
  help_text?: string;
  help_text_en?: string;
  help_text_ar?: string;
  mandatory?: boolean;
}

interface AdaptiveQuestionStepperProps {
  questions: AdaptiveQuestion[];
  answers: Record<string, unknown>;
  onAnswerChange: (questionId: string, value: unknown) => void;
  onApplyAnswers: () => void;
  isLoading?: boolean;
}

export function AdaptiveQuestionStepper({
  questions,
  answers,
  onAnswerChange,
  onApplyAnswers,
  isLoading = false,
}: AdaptiveQuestionStepperProps) {
  const { t: i18n, locale } = useI18n();
  const isArabic = locale === "ar-SA";
  const [expandedHelp, setExpandedHelp] = useState<Record<string, boolean>>({});

  if (!questions || questions.length === 0) return null;

  const deferredCount = questions.filter((q) => answers[q.id] === null).length;
  const answeredCount = questions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== null
  ).length;

  const toggleHelp = (id: string) =>
    setExpandedHelp((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDefer = (id: string) => onAnswerChange(id, null);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            {getIcon("help-circle", "w-5 h-5")}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {i18n.catalog["orgStudio.setup.adaptiveQuestionsTitle"] || (isArabic ? "استفسارات ضبط الهيكل التنظيمي" : "Adaptive Structure Inquiries")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isArabic ? "إجاباتك تساعد النظام على تخصيص الفروع والمستودعات والمراكز المالية بدقة" : "Your answers help the engine calibrate branches, warehouses, and financial centers"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {deferredCount > 0 && (
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {deferredCount} {isArabic ? "مؤجلة" : "deferred"}
            </span>
          )}
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {answeredCount} / {questions.length}
          </span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions.map((q) => {
          const currentVal = answers[q.id] !== undefined ? answers[q.id] : (q.default ?? "");
          const isDeferred = answers[q.id] === null;
          const text = isArabic && q.question_ar ? q.question_ar : q.question;
          const helpText = isArabic && q.help_text_ar ? q.help_text_ar : (q.help_text_en || q.help_text);
          const isHelpOpen = expandedHelp[q.id] ?? false;

          return (
            <div
              key={q.id}
              className={`border rounded-lg p-4 space-y-3 transition-all ${
                isDeferred
                  ? "border-amber-200 bg-amber-50/40"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {/* Question label row */}
              <div className="flex items-start justify-between gap-2">
                <label className="text-xs font-bold text-slate-800 leading-snug flex-1">
                  {text}
                  {q.mandatory && (
                    <span className="text-red-500 ms-1">*</span>
                  )}
                </label>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Help tooltip toggle */}
                  {helpText && (
                    <button
                      type="button"
                      onClick={() => toggleHelp(q.id)}
                      title={isArabic ? "لماذا نسأل هذا؟" : "Why are we asking this?"}
                      className={`w-6 h-6 flex items-center justify-center rounded-md border text-xs font-bold transition-all ${
                        isHelpOpen
                          ? "border-blue-400 text-blue-600 bg-blue-50"
                          : "border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 bg-white"
                      }`}
                    >
                      ⓘ
                    </button>
                  )}
                  {/* Defer button */}
                  {!q.mandatory && (
                    <button
                      type="button"
                      onClick={() => (isDeferred ? onAnswerChange(q.id, q.default ?? "") : handleDefer(q.id))}
                      title={
                        isDeferred
                          ? (isArabic ? "إلغاء التأجيل" : "Undo defer")
                          : (isArabic ? "تحديد لاحقاً" : "Decide later")
                      }
                      className={`text-[10px] px-2 py-1 border rounded-md font-medium transition-all ${
                        isDeferred
                          ? "border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100"
                          : "border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-300 bg-white"
                      }`}
                    >
                      {isDeferred
                        ? (isArabic ? "↩ تراجع" : "↩ Undo")
                        : (isArabic ? "لاحقاً ←" : "Later →")}
                    </button>
                  )}
                </div>
              </div>

              {/* Inline help panel */}
              {isHelpOpen && helpText && (
                <div className="border border-blue-200 bg-blue-50/60 p-3 rounded-md animate-fadeIn">
                  <p className="text-[11px] text-blue-800 leading-relaxed font-normal">
                    {helpText}
                  </p>
                </div>
              )}

              {/* Deferred state or input controls */}
              {isDeferred ? (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
                  <span>
                    {isArabic
                      ? "تم تأجيل القرار — سيستخدم النظام الإعداد القياسي الافتراضي ويمكن تعديله لاحقاً."
                      : "Deferred — a standard default will be used and can be adjusted later."}
                  </span>
                </div>
              ) : (
                <div>
                  {q.type === "boolean" ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onAnswerChange(q.id, true)}
                        className={`px-4 py-1.5 text-xs font-bold transition-all rounded-md border ${
                          currentVal === true
                            ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                            : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {isArabic ? "نعم" : "Yes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAnswerChange(q.id, false)}
                        className={`px-4 py-1.5 text-xs font-bold transition-all rounded-md border ${
                          currentVal === false
                            ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                            : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {isArabic ? "لا" : "No"}
                      </button>
                    </div>
                  ) : q.type === "number" ? (
                    <input
                      type="number"
                      min={0}
                      value={typeof currentVal === "number" ? currentVal : ""}
                      onChange={(e) => onAnswerChange(q.id, Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  ) : (q.type === "select" || q.type === "choice") && q.options ? (
                    <select
                      value={typeof currentVal === "string" ? currentVal : ""}
                      onChange={(e) => onAnswerChange(q.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    >
                      <option value="">
                        {isArabic ? "— حدد الخيار المناسب —" : "— Select an option —"}
                      </option>
                      {q.options.map((opt) => {
                        const optLabel = (isArabic && opt.label_ar) ? opt.label_ar : (opt.label || opt.label_en || opt.value);
                        return (
                          <option key={opt.value} value={opt.value}>
                            {optLabel}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={typeof currentVal === "string" ? currentVal : ""}
                      onChange={(e) => onAnswerChange(q.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-500">
          {deferredCount > 0
            ? (isArabic
                ? `${deferredCount} سؤال مؤجل — سيتم استخدام الإعدادات الافتراضية في المخطط.`
                : `${deferredCount} questions deferred — defaults will be applied in the blueprint.`)
            : (isArabic
                ? "يمكنك تعديل أي قرار في أي وقت من استوديو الهيكل التنظيمي."
                : "You can adjust decisions at any time from Organization Studio.")}
        </span>
        <Button
          type="button"
          onClick={onApplyAnswers}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-lg shadow-sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
              <span>{isArabic ? "جارٍ تحديث الهيكل..." : "Refining Blueprint..."}</span>
            </span>
          ) : (
            isArabic ? "تحديث الهيكل وفق الإجابات" : "Update Blueprint with Answers"
          )}
        </Button>
      </div>
    </div>
  );
}
