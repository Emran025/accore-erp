import { Button, SearchableSelect } from "@/components/ui";
import { MetaType, SelectOption } from "../types";
import { SetupField } from "./SetupField";
import { SetupSection } from "./SetupSection";
import styles from "../setup.module.css";

interface SetupOrganizationSectionProps {
  title: string;
  description: string;
  createLabel: string;
  typeLabel: string;
  codeLabel: string;
  nameLabel: string;
  parentLabel: string;
  nodeType: string;
  nodeCode: string;
  nodeName: string;
  nodeParent: string;
  nodeAttributes: Record<string, string>;
  selectedType?: MetaType;
  typeOptions: SelectOption[];
  nodeOptions: SelectOption[];
  isSaving: boolean;
  onNodeTypeChange: (value: string) => void;
  onNodeCodeChange: (value: string) => void;
  onNodeNameChange: (value: string) => void;
  onNodeParentChange: (value: string) => void;
  onNodeAttributeChange: (key: string, value: string) => void;
  onCreate: () => void;
  summary: string;
}

export function SetupOrganizationSection({
  title,
  description,
  createLabel,
  typeLabel,
  codeLabel,
  nameLabel,
  parentLabel,
  nodeType,
  nodeCode,
  nodeName,
  nodeParent,
  nodeAttributes,
  selectedType,
  typeOptions,
  nodeOptions,
  isSaving,
  onNodeTypeChange,
  onNodeCodeChange,
  onNodeNameChange,
  onNodeParentChange,
  onNodeAttributeChange,
  onCreate,
  summary,
}: SetupOrganizationSectionProps) {
  return (
    <SetupSection id="setup-organization" title={title} description={description}>
      <div className={styles.grid}>
        <SetupField id="setup-node-type" label={typeLabel} required>
          <SearchableSelect
            id="setup-node-type"
            className={styles.select}
            options={typeOptions}
            value={nodeType}
            onChange={(value) => onNodeTypeChange(String(value || ""))}
          />
        </SetupField>
        <SetupField id="setup-node-code" label={codeLabel} required>
          <input id="setup-node-code" className={styles.input} value={nodeCode} onChange={(event) => onNodeCodeChange(event.target.value)} required />
        </SetupField>
        <SetupField id="setup-node-name" label={nameLabel}>
          <input id="setup-node-name" className={styles.input} value={nodeName} onChange={(event) => onNodeNameChange(event.target.value)} />
        </SetupField>
        <SetupField id="setup-node-parent" label={parentLabel}>
          <SearchableSelect
            id="setup-node-parent"
            className={styles.select}
            options={nodeOptions}
            value={nodeParent}
            onChange={(value) => onNodeParentChange(String(value || ""))}
          />
        </SetupField>
        {(selectedType?.attributes ?? []).map((attribute) => (
          <SetupField key={attribute.attribute_key} id={`setup-node-attribute-${attribute.attribute_key}`} label={attribute.attribute_key} required={attribute.is_mandatory}>
            <input
              id={`setup-node-attribute-${attribute.attribute_key}`}
              className={styles.input}
              value={nodeAttributes[attribute.attribute_key] || ""}
              onChange={(event) => onNodeAttributeChange(attribute.attribute_key, event.target.value)}
              required={attribute.is_mandatory}
            />
          </SetupField>
        ))}
      </div>
      <div className={styles.actionRow}>
        <Button type="button" onClick={onCreate} isLoading={isSaving}>{createLabel}</Button>
      </div>
      <p className={styles.contextSummary}>{summary}</p>
    </SetupSection>
  );
}
