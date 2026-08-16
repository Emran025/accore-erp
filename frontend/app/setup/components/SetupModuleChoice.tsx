'use client';

import { Checkbox } from '@/components/ui';
import { SetupModuleState } from '@/stores/useSetupStateStore';
import { setupContent } from '../setup.content';
import styles from '../setup.module.css';

interface SetupModuleChoiceProps {
  module: SetupModuleState;
  selected: boolean;
  onToggle: (module: SetupModuleState) => void;
}

export function SetupModuleChoice({ module, selected, onToggle }: SetupModuleChoiceProps) {
  const isActive = module.lifecycle === 'active';
  const status = isActive
    ? setupContent.moduleStatus.active
    : selected
      ? setupContent.moduleStatus.selected
      : setupContent.moduleStatus.pending;

  const classNames = [
    styles.moduleCard,
    selected ? styles.moduleCardSelected : '',
    isActive ? styles.moduleCardActive : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classNames}>
      <Checkbox
        checked={selected || isActive}
        disabled={isActive}
        onChange={() => onToggle(module)}
        aria-describedby={`module-status-${module.module_key}`}
      />
      <span className={styles.moduleCardBody}>
        <strong>{module.name_ar || module.name_en}</strong>
        <small id={`module-status-${module.module_key}`} className={styles.moduleCardStatus}>
          {status}
        </small>
      </span>
    </label>
  );
}
