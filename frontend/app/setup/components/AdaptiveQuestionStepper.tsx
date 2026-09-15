"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui";
import { getIcon } from "@/lib/icons";

export interface AdaptiveQuestion {
  id: string;
  question: string;
  question_ar?: string;
  type: "boolean" | "number" | "select" | "text";
  options?: Array<{ value: string; label: string; label_ar?: string }>;
  default?: any;
}

interface AdaptiveQuestionStepperProps {
  questions: AdaptiveQuestion[];
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, value: any) => void;
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

  if (!questions || questions.length === 0) return null;

  return (
    <div className="border border-neutral-800 bg-neutral-900/40 p-5 rounded-none space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-primary-400">
            {getIcon("help-circle", "w-4 h-4")}
          </span>
          <h3 className="text-sm font-semibold text-neutral-100">
            {i18n.catalog["orgStudio.setup.adaptiveQuestionsTitle"]}
          </h3>
        </div>
        <span className="text-xs text-neutral-500 font-mono">
          {questions.length} Questions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions.map((q) => {
          const currentVal = answers[q.id] ?? q.default ?? "";
          const text = (isArabic && q.question_ar) ? q.question_ar : q.question;

          return (
            <div
              key={q.id}
              className="border border-neutral-800 bg-neutral-950/60 p-3.5 space-y-2 rounded-none"
            >
              <label className="text-xs font-medium text-neutral-200 block">
                {text}
              </label>

              {q.type === "boolean" ? (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onAnswerChange(q.id, true)}
                    className={`px-3 py-1 text-xs font-medium transition-colors rounded-none border ${
                      currentVal === true
                        ? "bg-primary-950 border-primary-500 text-primary-300"
                        : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {isArabic ? "نعم" : "Yes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAnswerChange(q.id, false)}
                    className={`px-3 py-1 text-xs font-medium transition-colors rounded-none border ${
                      currentVal === false
                        ? "bg-primary-950 border-primary-500 text-primary-300"
                        : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {isArabic ? "لا" : "No"}
                  </button>
                </div>
              ) : q.type === "number" ? (
                <input
                  type="number"
                  min={0}
                  value={currentVal}
                  onChange={(e) => onAnswerChange(q.id, Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-700 p-1.5 text-xs text-neutral-100 rounded-none focus:border-primary-500 focus:outline-none"
                />
              ) : q.type === "select" && q.options ? (
                <select
                  value={currentVal}
                  onChange={(e) => onAnswerChange(q.id, e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 p-1.5 text-xs text-neutral-100 rounded-none focus:border-primary-500 focus:outline-none"
                >
                  {q.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {(isArabic && opt.label_ar) ? opt.label_ar : opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={currentVal}
                  onChange={(e) => onAnswerChange(q.id, e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 p-1.5 text-xs text-neutral-100 rounded-none focus:border-primary-500 focus:outline-none"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={onApplyAnswers}
          disabled={isLoading}
          className="rounded-none text-xs px-4 py-1.5 font-medium"
        >
          {isArabic ? "تحديث الاستنتاج مع الإجابات" : "Re-evaluate with Answers"}
        </Button>
      </div>
    </div>
  );
}
