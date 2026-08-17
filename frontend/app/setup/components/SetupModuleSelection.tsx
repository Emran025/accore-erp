import { Button } from "@/components/ui";
import { SupportedLocale } from "@/lib/i18n/types";
import { SetupModule } from "../types";
import { SetupSection } from "./SetupSection";

interface SetupModuleSelectionProps {
  locale: SupportedLocale;
  modules: SetupModule[];
  selectedModuleKeys: string[];
  title: string;
  description: string;
  saveSelectionLabel: string;
  activateSelectedLabel: string;
  notSelectedLabel: string;
  pendingReadinessLabel: string;
  activeLabel: string;
  selectionRequiredLabel: string;
  noRecordsLabel: string;
  isSaving: boolean;
  onToggle: (moduleKey: string) => void;
  onSave: () => void;
  onActivate: () => void;
}

export function SetupModuleSelection({
  locale,
  modules,
  selectedModuleKeys,
  title,
  description,
  saveSelectionLabel,
  activateSelectedLabel,
  notSelectedLabel,
  pendingReadinessLabel,
  activeLabel,
  selectionRequiredLabel,
  noRecordsLabel,
  isSaving,
  onToggle,
  onSave,
  onActivate,
}: SetupModuleSelectionProps) {
  const businessModules = modules.filter((module) => !module.is_configuration_module);

  const moduleLabel = (module: SetupModule) => locale === "ar-SA"
    ? module.module_name_ar || module.module_name_en || module.module_key
    : module.module_name_en || module.module_name_ar || module.module_key;

  const statusLabel = (module: SetupModule) => {
    if (module.is_operational) return activeLabel;
    if (selectedModuleKeys.includes(module.module_key)) return pendingReadinessLabel;
    return notSelectedLabel;
  };

  return (
    <SetupSection id="setup-modules" title={title} description={description}>
      <fieldset className="setup-module-grid" aria-describedby={selectedModuleKeys.length === 0 ? "setup-modules-hint" : undefined}>
        <legend className="sr-only">{title}</legend>
        {businessModules.length === 0 ? <p className="setup-empty-state">{noRecordsLabel}</p> : null}
        {businessModules.map((module) => {
          const selected = selectedModuleKeys.includes(module.module_key);
          return (
            <label className="setup-module-card" key={module.module_key}>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(module.module_key)}
              />
              <span>
                <strong className="setup-module-name">{moduleLabel(module)}</strong>
                <span className={`setup-module-status ${module.is_operational ? "is-operational" : ""}`.trim()}>
                  {statusLabel(module)}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
      <div className="setup-actions">
        <Button type="button" onClick={onSave} isLoading={isSaving}>
          {saveSelectionLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onActivate} isLoading={isSaving} disabled={selectedModuleKeys.length === 0}>
          {activateSelectedLabel}
        </Button>
        {selectedModuleKeys.length === 0 ? <p id="setup-modules-hint" className="setup-helper-text">{selectionRequiredLabel}</p> : null}
      </div>
    </SetupSection>
  );
}
