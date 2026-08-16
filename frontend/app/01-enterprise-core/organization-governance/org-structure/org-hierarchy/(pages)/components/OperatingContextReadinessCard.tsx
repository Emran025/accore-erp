'use client';

import { Button, SearchableSelect, type SelectOption } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import type { OperatingContext, OperatingReadiness } from '@/stores/useOperatingContextStore';
import {
  operatingContextReadinessContent,
  type OperatingReadinessKey,
} from './OperatingContextReadinessCard.content';
import styles from './OperatingContextReadinessCard.module.css';

type OperatingContextReadinessCardProps = {
  isSetupFlow: boolean;
  readiness: OperatingReadiness | null;
  contexts: OperatingContext[];
  isSelectingContext: boolean;
  isActivatingModules: boolean;
  setupError: string | null;
  onConfigure: () => void;
  onStartModuleSetup: () => void;
  onActivateReadyModules: () => void;
  onSelectContext: (value: string | number | null) => void;
};

export function OperatingContextReadinessCard({
  isSetupFlow,
  readiness,
  contexts,
  isSelectingContext,
  isActivatingModules,
  setupError,
  onConfigure,
  onStartModuleSetup,
  onActivateReadyModules,
  onSelectContext,
}: OperatingContextReadinessCardProps) {
  const { t: i18n } = useI18n();
  const content = operatingContextReadinessContent;
  const canActivate = isSetupFlow && readiness?.ready === true;
  const nextReadinessKey = readiness?.missing?.[0]?.key as OperatingReadinessKey | undefined;
  const nextReadiness = nextReadinessKey ? content.readiness[nextReadinessKey] : undefined;
  const contextOptions: SelectOption[] = contexts.map((context) => ({
    value: context.id,
    label: `${context.warehouse?.code || context.id} — ${context.warehouse?.name || ''}`,
    subtitle:
      context.scope === 'organization'
        ? i18n.catalog[content.organizationScope]
        : i18n.catalog[content.personalScope],
  }));

  return (
    <section
      className={`sales-card ${styles.card}`}
      aria-labelledby="operating-context-readiness-title"
    >
      <div className="card-header-flex">
        <div>
          <h3 id="operating-context-readiness-title">{i18n.catalog[content.title]}</h3>
          <p>
            {readiness?.ready
              ? i18n.catalog[content.readyDescription]
              : i18n.catalog[nextReadiness?.action ?? content.fallbackDescription]}
          </p>
        </div>
        <div className={styles.actions}>
          {!isSetupFlow ? (
            <Button variant="secondary" onClick={onStartModuleSetup}>
              {i18n.catalog[content.continueModuleSetupAction]}
            </Button>
          ) : null}
          <Button
            variant={readiness?.ready ? 'secondary' : 'primary'}
            onClick={canActivate ? onActivateReadyModules : onConfigure}
            isLoading={canActivate && isActivatingModules}
          >
            {canActivate
              ? i18n.catalog[content.activateAction]
              : readiness?.ready
                ? i18n.catalog[content.readyAction]
                : i18n.catalog[content.configureAction]}
          </Button>
        </div>
      </div>

      {setupError ? <p className="text-error">{setupError}</p> : null}

      {readiness?.checks?.length ? (
        <div className={`badge-container ${styles.checks}`}>
          {readiness.checks.map((check) => {
            const definition = content.readiness[check.key as OperatingReadinessKey];
            const label = definition?.label ?? content.fallbackReadinessLabel;

            return (
              <span
                key={check.key}
                className={`badge ${check.complete ? 'badge-success' : 'badge-warning'}`}
              >
                {i18n.catalog[label]}:{' '}
                {check.complete
                  ? i18n.catalog[content.readinessReady]
                  : i18n.catalog[content.required]}
              </span>
            );
          })}
        </div>
      ) : null}

      {!isSetupFlow && contextOptions.length > 1 ? (
        <div className={`form-group ${styles.selector}`}>
          <label htmlFor="operating-context-selector">{i18n.catalog[content.selectorLabel]}</label>
          <SearchableSelect
            id="operating-context-selector"
            options={contextOptions}
            value={readiness?.context?.id ?? null}
            onChange={onSelectContext}
            disabled={isSelectingContext}
            placeholder={i18n.catalog[content.selectorLabel]}
          />
        </div>
      ) : null}
    </section>
  );
}
