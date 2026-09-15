"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { getIcon } from "@/lib/icons";

interface SetupConversationalPromptProps {
  onAnalyze: (description: string) => Promise<void>;
  isAnalyzing: boolean;
  disabled?: boolean;
}

export function SetupConversationalPrompt({
  onAnalyze,
  isAnalyzing,
  disabled = false,
}: SetupConversationalPromptProps) {
  const { t: i18n } = useI18n();
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isAnalyzing) return;
    onAnalyze(description.trim());
  };

  return (
    <div className="border border-neutral-800 bg-neutral-900/60 p-6 rounded-none shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 flex items-center justify-center bg-primary-950/40 border border-primary-500/30 text-primary-400">
          <span className="w-5 h-5 flex items-center justify-center">
            {getIcon("sparkles", "w-5 h-5")}
          </span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-neutral-100 tracking-tight">
            {i18n.catalog["orgStudio.setup.title"]}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {i18n.catalog["orgStudio.setup.subtitle"]}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={i18n.catalog["orgStudio.setup.naturalInputPlaceholder"]}
          disabled={isAnalyzing || disabled}
          className="w-full bg-neutral-950 border border-neutral-800 focus:border-primary-500 focus:outline-none p-3.5 text-sm text-neutral-100 placeholder:text-neutral-500 transition-colors resize-none rounded-none"
        />

        <div className="flex items-center justify-between gap-4">
          <div className="text-[11px] text-neutral-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-emerald-500 inline-block" />
            <span>AI Signal Engine: Arabic & English Semantic Parsing Active</span>
          </div>

          <Button
            type="submit"
            disabled={!description.trim() || isAnalyzing || disabled}
            className="rounded-none px-5 py-2 text-sm font-medium"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-neutral-300 border-t-transparent animate-spin" />
                {i18n.catalog["orgStudio.setup.analyzing"]}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {getIcon("sparkles", "w-4 h-4")}
                {i18n.catalog["orgStudio.setup.analyzeButton"]}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
