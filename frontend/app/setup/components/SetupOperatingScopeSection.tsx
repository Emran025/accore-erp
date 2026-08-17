import { Button, SearchableSelect } from "@/components/ui";
import { SelectOption } from "../types";
import { SetupField } from "./SetupField";
import { SetupSection } from "./SetupSection";
import styles from "../setup.module.css";

interface SetupOperatingScopeSectionProps {
  title: string;
  description: string;
  workingUnitLabel: string;
  costCenterLabel: string;
  profitCenterLabel: string;
  warehouseCodeLabel: string;
  warehouseNameLabel: string;
  posCodeLabel: string;
  posNameLabel: string;
  saveLabel: string;
  workingUnit: string;
  costCenterId: number | null;
  profitCenterId: number | null;
  warehouseCode: string;
  warehouseName: string;
  posCode: string;
  posName: string;
  nodeOptions: SelectOption[];
  costOptions: SelectOption[];
  profitOptions: SelectOption[];
  isSaving: boolean;
  onWorkingUnitChange: (value: string) => void;
  onCostCenterChange: (value: number | null) => void;
  onProfitCenterChange: (value: number | null) => void;
  onWarehouseCodeChange: (value: string) => void;
  onWarehouseNameChange: (value: string) => void;
  onPosCodeChange: (value: string) => void;
  onPosNameChange: (value: string) => void;
  onSave: () => void;
}

export function SetupOperatingScopeSection({
  title,
  description,
  workingUnitLabel,
  costCenterLabel,
  profitCenterLabel,
  warehouseCodeLabel,
  warehouseNameLabel,
  posCodeLabel,
  posNameLabel,
  saveLabel,
  workingUnit,
  costCenterId,
  profitCenterId,
  warehouseCode,
  warehouseName,
  posCode,
  posName,
  nodeOptions,
  costOptions,
  profitOptions,
  isSaving,
  onWorkingUnitChange,
  onCostCenterChange,
  onProfitCenterChange,
  onWarehouseCodeChange,
  onWarehouseNameChange,
  onPosCodeChange,
  onPosNameChange,
  onSave,
}: SetupOperatingScopeSectionProps) {
  return (
    <SetupSection id="setup-operating-scope" title={title} description={description}>
      <div className={styles.grid}>
        <SetupField id="setup-working-unit" label={workingUnitLabel} required>
          <SearchableSelect id="setup-working-unit" className={styles.select} options={nodeOptions} value={workingUnit} onChange={(value) => onWorkingUnitChange(String(value || ""))} />
        </SetupField>
        <SetupField id="setup-cost-center" label={costCenterLabel} required>
          <SearchableSelect id="setup-cost-center" className={styles.select} options={costOptions} value={costCenterId} onChange={(value) => onCostCenterChange(typeof value === "number" ? value : null)} />
        </SetupField>
        <SetupField id="setup-profit-center" label={profitCenterLabel} required>
          <SearchableSelect id="setup-profit-center" className={styles.select} options={profitOptions} value={profitCenterId} onChange={(value) => onProfitCenterChange(typeof value === "number" ? value : null)} />
        </SetupField>
        <SetupField id="setup-warehouse-code" label={warehouseCodeLabel} required>
          <input id="setup-warehouse-code" className={styles.input} value={warehouseCode} onChange={(event) => onWarehouseCodeChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-warehouse-name" label={warehouseNameLabel} required>
          <input id="setup-warehouse-name" className={styles.input} value={warehouseName} onChange={(event) => onWarehouseNameChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-pos-code" label={posCodeLabel} required>
          <input id="setup-pos-code" className={styles.input} value={posCode} onChange={(event) => onPosCodeChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-pos-name" label={posNameLabel} required>
          <input id="setup-pos-name" className={styles.input} value={posName} onChange={(event) => onPosNameChange(event.target.value)} required />
        </SetupField>
      </div>
      <div className={styles.actionRow}>
        <Button type="button" onClick={onSave} isLoading={isSaving}>{saveLabel}</Button>
      </div>
    </SetupSection>
  );
}
