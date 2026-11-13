import { SupportedLocale } from "@/lib/i18n/types";
import { SetupModule, SetupRequirement } from "../types";
import { SetupSection } from "./SetupSection";

export type SetupRequirementQueueItem = {
  key: string;
  label: string;
  requiredBy: string[];
};

export function buildSetupRequirementQueueItems(
  requirements: SetupRequirement[],
  modules: SetupModule[],
  readinessLabels: Record<string, string>,
  locale: SupportedLocale,
): SetupRequirementQueueItem[] {
  const moduleNames = new Map(modules.map((module) => [
    module.module_key,
    locale === "ar-SA"
      ? module.module_name_ar || module.module_name_en || module.module_key
      : module.module_name_en || module.module_name_ar || module.module_key,
  ]));

  return requirements.map((requirement) => {
    const nodeTypePrefix = "node_type:";
    const label = requirement.key.startsWith(nodeTypePrefix)
      ? [readinessLabels.organizational_structure, requirement.key.slice(nodeTypePrefix.length)].filter(Boolean).join(" — ")
      : readinessLabels[requirement.key] ?? requirement.key.replaceAll("_", " ");

    return {
      key: requirement.key,
      label,
      requiredBy: requirement.required_by_module_keys.map((moduleKey) => moduleNames.get(moduleKey) ?? moduleKey),
    };
  });
}

interface SetupRequirementQueueProps {
  requirements: SetupRequirement[];
  modules: SetupModule[];
  readinessLabels: Record<string, string>;
  locale: SupportedLocale;
  title: string;
  description: string;
  formatRequiredBy: (moduleNames: string[]) => string;
}

export function SetupRequirementQueue({
  requirements,
  modules,
  readinessLabels,
  locale,
  title,
  description,
  formatRequiredBy,
}: SetupRequirementQueueProps) {
  const items = buildSetupRequirementQueueItems(requirements, modules, readinessLabels, locale);
  if (items.length === 0) return null;

  return (
    <SetupSection id="setup-requirement-queue" title={title} description={description}>
      <ol className="setup-requirement-list" aria-label={title}>
        {items.map((item, index) => (
          <li className="setup-requirement-item" key={item.key}>
            <span className="setup-requirement-index" aria-hidden="true">{index + 1}</span>
            <span className="setup-requirement-content">
              <strong>{item.label}</strong>
              {item.requiredBy.length > 0 ? <small>{formatRequiredBy(item.requiredBy)}</small> : null}
            </span>
          </li>
        ))}
      </ol>
    </SetupSection>
  );
}
