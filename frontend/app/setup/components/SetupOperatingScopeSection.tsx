import { Button, SearchableSelect } from "@/components/ui";
import { SelectOption } from "../types";
import { SetupField } from "./SetupField";
import { SetupSection } from "./SetupSection";

interface SetupOperatingScopeSectionProps {
  title: string;
  description: string;
  foundationComplete: boolean;
  foundationRequiredLabel: string;
  workingUnitLabel: string;
  workingUnitCodeLabel: string;
  workingUnitNameLabel: string;
  saveWorkingUnitLabel: string;
  costCenterLabel: string;
  pointOfSaleLabel: string;
  contextHelper: string;
  saveLabel: string;
  workingUnit: string;
  workingUnitCode: string;
  workingUnitName: string;
  costCenterId: number | null;
  posTerminalId: number | null;
  nodeOptions: SelectOption[];
  costOptions: SelectOption[];
  posOptions: SelectOption[];
  isSaving: boolean;
  onWorkingUnitChange: (value: string) => void;
  onWorkingUnitCodeChange: (value: string) => void;
  onWorkingUnitNameChange: (value: string) => void;
  onSaveWorkingUnit: () => void;
  onCostCenterChange: (value: number | null) => void;
  onPosTerminalChange: (value: number | null) => void;
  onSave: () => void;
}

export function SetupOperatingScopeSection({
  title,
  description,
  foundationComplete,
  foundationRequiredLabel,
  workingUnitLabel,
  workingUnitCodeLabel,
  workingUnitNameLabel,
  saveWorkingUnitLabel,
  costCenterLabel,
  pointOfSaleLabel,
  contextHelper,
  saveLabel,
  workingUnit,
  workingUnitCode,
  workingUnitName,
  costCenterId,
  posTerminalId,
  nodeOptions,
  costOptions,
  posOptions,
  isSaving,
  onWorkingUnitChange,
  onWorkingUnitCodeChange,
  onWorkingUnitNameChange,
  onSaveWorkingUnit,
  onCostCenterChange,
  onPosTerminalChange,
  onSave,
}: SetupOperatingScopeSectionProps) {
  return (
    <SetupSection id="setup-operating-scope" title={title} description={description}>
      {!foundationComplete ? <p className="readiness-notice warning">{foundationRequiredLabel}</p> : null}
      <p className="setup-context-summary">{contextHelper}</p>
      <fieldset className="settings-form-grid setup-form-grid" disabled={!foundationComplete}>
        <legend className="sr-only">{title}</legend>
        <SetupField id="setup-working-unit" label={workingUnitLabel} required>
          <SearchableSelect id="setup-working-unit" className="setup-select" options={nodeOptions} value={workingUnit} onChange={(value) => onWorkingUnitChange(String(value || ""))} />
        </SetupField>
        <SetupField id="setup-working-unit-code" label={workingUnitCodeLabel} required>
          <input id="setup-working-unit-code" className="setup-input" dir="ltr" value={workingUnitCode} onChange={(event) => onWorkingUnitCodeChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-working-unit-name" label={workingUnitNameLabel}>
          <input id="setup-working-unit-name" className="setup-input" value={workingUnitName} onChange={(event) => onWorkingUnitNameChange(event.target.value)} />
        </SetupField>
        <SetupField id="setup-cost-center" label={costCenterLabel} required>
          <SearchableSelect id="setup-cost-center" className="setup-select" options={costOptions} value={costCenterId} onChange={(value) => onCostCenterChange(typeof value === "number" ? value : null)} />
        </SetupField>
        <SetupField id="setup-pos-terminal" label={pointOfSaleLabel} required>
          <SearchableSelect id="setup-pos-terminal" className="setup-select" options={posOptions} value={posTerminalId} onChange={(value) => onPosTerminalChange(typeof value === "number" ? value : null)} />
        </SetupField>
      </fieldset>
      <div className="setup-actions">
        <Button type="button" variant="secondary" onClick={onSaveWorkingUnit} isLoading={isSaving} disabled={!foundationComplete || !workingUnit || !workingUnitCode.trim()}>{saveWorkingUnitLabel}</Button>
        <Button type="button" onClick={onSave} isLoading={isSaving} disabled={!foundationComplete}>{saveLabel}</Button>
      </div>
    </SetupSection>
  );
}
