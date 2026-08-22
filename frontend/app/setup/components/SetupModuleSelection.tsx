import { Button } from "@/components/ui";
import { SupportedLocale } from "@/lib/i18n/types";
import { SetupModule } from "../types";
import { SetupSection } from "./SetupSection";

interface SetupModuleSelectionProps {
  locale: SupportedLocale;
  modules: SetupModule[];
  selectedModuleKeys: string[];
  coreModuleKeys: string[];
  canActivate: boolean;
  title: string;
  description: string;
  coreTitle: string;
  coreDescription: string;
  optionalTitle: string;
  optionalDescription: string;
  baselineRequiredLabel: string;
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
  coreModuleKeys,
  canActivate,
  title,
  description,
  coreTitle,
  coreDescription,
  optionalTitle,
  optionalDescription,
  baselineRequiredLabel,
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
  const optionalModules = businessModules.filter((module) => !coreModuleKeys.includes(module.module_key));

  const moduleLabel = (module: Pick<SetupModule, "module_key" | "module_name_ar" | "module_name_en">) => locale === "ar-SA"
    ? module.module_name_ar || module.module_name_en || module.module_key
    : module.module_name_en || module.module_name_ar || module.module_key;

  const statusLabel = (module: SetupModule) => {
    if (module.is_operational) return activeLabel;
    if (selectedModuleKeys.includes(module.module_key)) return pendingReadinessLabel;
    return notSelectedLabel;
  };

  const renderGroup = (groupModules: SetupModule[], required: boolean) => (
    <fieldset className="setup-module-grid" disabled={!canActivate}>
      <legend className="sr-only">{required ? coreTitle : optionalTitle}</legend>
      {groupModules.length === 0 ? <p className="setup-empty-state">{noRecordsLabel}</p> : null}
      {groupModules.map((module) => {
        const selected = selectedModuleKeys.includes(module.module_key);
        const className = [
          "setup-module-card",
          required ? "is-required" : "",
          !canActivate ? "is-disabled" : "",
        ].filter(Boolean).join(" ");

        return (
          <label className={className} key={module.module_key}>
            <input
              type="checkbox"
              checked={selected}
              disabled={!canActivate}
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
  );

  return (
    <SetupSection id="setup-modules" title={title} description={description}>
      {!canActivate ? <p className="readiness-notice warning">{baselineRequiredLabel}</p> : null}
      <div className="setup-module-groups">
        <div className="setup-module-group setup-module-group-included">
          <h4 className="setup-module-group-title">{coreTitle}</h4>
          <p className="setup-module-group-description">{coreDescription}</p>
          <p className="setup-context-summary">{coreModuleKeys.map((key) => moduleLabel(businessModules.find((module) => module.module_key === key) ?? { module_key: key })).join(" · ")}</p>
        </div>
        <div className="setup-module-group">
          <h4 className="setup-module-group-title">{optionalTitle}</h4>
          <p className="setup-module-group-description">{optionalDescription}</p>
          {renderGroup(optionalModules, false)}
        </div>
      </div>
      <div className="setup-actions">
        <Button type="button" onClick={onSave} isLoading={isSaving} disabled={!canActivate}>
          {saveSelectionLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onActivate} isLoading={isSaving} disabled={!canActivate || selectedModuleKeys.length === 0}>
          {activateSelectedLabel}
        </Button>
        {canActivate && selectedModuleKeys.length === 0 ? <p id="setup-modules-hint" className="setup-helper-text">{selectionRequiredLabel}</p> : null}
      </div>
    </SetupSection>
  );
}
