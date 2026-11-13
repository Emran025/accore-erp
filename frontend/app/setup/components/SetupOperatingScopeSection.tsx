import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
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
  profitCenterLabel: string;
  warehouseLabel: string;
  pointOfSaleLabel: string;
  linkedWarehouseLabel: string;
  linkedCostCenterLabel: string;
  linkedProfitCenterLabel: string;
  missingLinkedResourceLabel: string;
  contextHelper: string;
  saveLabel: string;
  requiresCostCenter: boolean;
  requiresProfitCenter: boolean;
  requiresWarehouse: boolean;
  requiresPosTerminal: boolean;
  workingUnit: string;
  workingUnitCode: string;
  workingUnitName: string;
  warehouseId: number | null;
  costCenterId: number | null;
  profitCenterId: number | null;
  posTerminalId: number | null;
  linkedWarehouseSummary: string | null;
  linkedCostCenterSummary: string | null;
  linkedProfitCenterSummary: string | null;
  nodeOptions: SelectOption[];
  costOptions: SelectOption[];
  profitOptions: SelectOption[];
  warehouseOptions: SelectOption[];
  posOptions: SelectOption[];
  isSaving: boolean;
  onWorkingUnitChange: (value: string) => void;
  onWorkingUnitCodeChange: (value: string) => void;
  onWorkingUnitNameChange: (value: string) => void;
  onSaveWorkingUnit: () => void;
  onWarehouseChange: (value: number | null) => void;
  onCostCenterChange: (value: number | null) => void;
  onProfitCenterChange: (value: number | null) => void;
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
  profitCenterLabel,
  warehouseLabel,
  pointOfSaleLabel,
  linkedWarehouseLabel,
  linkedCostCenterLabel,
  linkedProfitCenterLabel,
  missingLinkedResourceLabel,
  contextHelper,
  saveLabel,
  requiresCostCenter,
  requiresProfitCenter,
  requiresWarehouse,
  requiresPosTerminal,
  workingUnit,
  workingUnitCode,
  workingUnitName,
  warehouseId,
  costCenterId,
  profitCenterId,
  posTerminalId,
  linkedWarehouseSummary,
  linkedCostCenterSummary,
  linkedProfitCenterSummary,
  nodeOptions,
  costOptions,
  profitOptions,
  warehouseOptions,
  posOptions,
  isSaving,
  onWorkingUnitChange,
  onWorkingUnitCodeChange,
  onWorkingUnitNameChange,
  onSaveWorkingUnit,
  onWarehouseChange,
  onCostCenterChange,
  onProfitCenterChange,
  onPosTerminalChange,
  onSave,
}: SetupOperatingScopeSectionProps) {
  const resourceSelectionReady = (!requiresWarehouse || requiresPosTerminal || warehouseId !== null)
    && (!requiresPosTerminal || posTerminalId !== null)
    && (!requiresCostCenter || costCenterId !== null)
    && (!requiresProfitCenter || profitCenterId !== null);
  const linkedCenterSource = requiresWarehouse || requiresPosTerminal;

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

        {requiresWarehouse && !requiresPosTerminal ? (
          <SetupField id="setup-warehouse" label={warehouseLabel} required>
            <SearchableSelect id="setup-warehouse" className="setup-select" options={warehouseOptions} value={warehouseId} onChange={(value) => onWarehouseChange(typeof value === "number" ? value : null)} />
          </SetupField>
        ) : null}
        {requiresPosTerminal ? (
          <SetupField id="setup-pos-terminal" label={pointOfSaleLabel} required>
            <SearchableSelect id="setup-pos-terminal" className="setup-select" options={posOptions} value={posTerminalId} onChange={(value) => onPosTerminalChange(typeof value === "number" ? value : null)} />
          </SetupField>
        ) : null}

        {requiresWarehouse && !requiresPosTerminal && (requiresCostCenter || requiresProfitCenter || linkedCostCenterSummary || linkedProfitCenterSummary) ? (
          <div className="setup-context-summary" role="status">
            {requiresCostCenter || linkedCostCenterSummary ? <><strong>{linkedCostCenterLabel}:</strong> {linkedCostCenterSummary || missingLinkedResourceLabel}</> : null}
            {requiresProfitCenter || linkedProfitCenterSummary ? <><br /><strong>{linkedProfitCenterLabel}:</strong> {linkedProfitCenterSummary || missingLinkedResourceLabel}</> : null}
          </div>
        ) : null}
        {requiresPosTerminal ? (
          <div className="setup-context-summary" role="status">
            <strong>{linkedWarehouseLabel}:</strong> {linkedWarehouseSummary || missingLinkedResourceLabel}
            {requiresCostCenter || linkedCostCenterSummary ? <><br /><strong>{linkedCostCenterLabel}:</strong> {linkedCostCenterSummary || missingLinkedResourceLabel}</> : null}
            {requiresProfitCenter || linkedProfitCenterSummary ? <><br /><strong>{linkedProfitCenterLabel}:</strong> {linkedProfitCenterSummary || missingLinkedResourceLabel}</> : null}
          </div>
        ) : null}

        {requiresCostCenter && !linkedCenterSource ? (
          <SetupField id="setup-cost-center" label={costCenterLabel} required>
            <SearchableSelect id="setup-cost-center" className="setup-select" options={costOptions} value={costCenterId} onChange={(value) => onCostCenterChange(typeof value === "number" ? value : null)} />
          </SetupField>
        ) : null}
        {requiresProfitCenter && !linkedCenterSource ? (
          <SetupField id="setup-profit-center" label={profitCenterLabel} required>
            <SearchableSelect id="setup-profit-center" className="setup-select" options={profitOptions} value={profitCenterId} onChange={(value) => onProfitCenterChange(typeof value === "number" ? value : null)} />
          </SetupField>
        ) : null}
      </fieldset>
      <div className="setup-actions">
        <Button type="button" variant="secondary" onClick={onSaveWorkingUnit} isLoading={isSaving} disabled={!foundationComplete || !workingUnit || !workingUnitCode.trim()}>{saveWorkingUnitLabel}</Button>
        <Button type="button" onClick={onSave} isLoading={isSaving} disabled={!foundationComplete || !workingUnit || !resourceSelectionReady}>{saveLabel}</Button>
      </div>
    </SetupSection>
  );
}
