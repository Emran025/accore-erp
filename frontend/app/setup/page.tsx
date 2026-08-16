'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores/useAuthStore';
import { SetupModuleState, useSetupStateStore } from '@/stores/useSetupStateStore';
import { SetupJourney } from './components/SetupJourney';
import { SetupModuleChoice } from './components/SetupModuleChoice';
import { setupContent } from './setup.content';
import styles from './setup.module.css';

const ORGANIZATION_SETUP_PATH =
  '/01-enterprise-core/organization-governance/org-structure/org-hierarchy?setup=1';

export default function SetupPage() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  const { state, isLoading, isSaving, error, loadState, selectModules } = useSetupStateStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [isContinuation, setIsContinuation] = useState(false);

  useEffect(() => {
    const load = async () => {
      const isAuthenticated = await checkAuth(true);
      if (!isAuthenticated) {
        router.replace('/auth/login');
        return;
      }

      const continuation = new URLSearchParams(window.location.search).get('continue') === '1';
      const setupState = await loadState();
      if (setupState && !setupState.setup_required && !continuation) {
        router.replace('/navigation');
        return;
      }

      setIsContinuation(continuation);
      setAuthChecked(true);
    };

    void load();
  }, [checkAuth, loadState, router]);

  useEffect(() => {
    if (state) {
      setSelected(state.selected_module_keys);
    }
  }, [state]);

  const businessModules = useMemo(
    () => (state?.modules || []).filter((module) => !module.is_core),
    [state]
  );

  const toggleModule = (module: SetupModuleState) => {
    setSelected((current) =>
      current.includes(module.module_key)
        ? current.filter((key) => key !== module.module_key)
        : [...current, module.module_key]
    );
  };

  const saveSelection = async () => {
    const updated = await selectModules(selected);
    if (updated?.next_action === 'complete_organization_setup') {
      router.push(`${ORGANIZATION_SETUP_PATH}${isContinuation ? '&continue=1' : ''}`);
    }
  };

  if (!authChecked || isLoading) {
    return (
      <main className={styles.shell} aria-busy="true" aria-label={setupContent.shell.loadingLabel}>
        <p>{setupContent.shell.loading}</p>
      </main>
    );
  }

  if (!state) {
    return (
      <main className={styles.shell}>
        <section className={`${styles.card} ${styles.recoveryCard}`} role="alert">
          <header className={styles.header}>
            <p className={styles.kicker}>{setupContent.recovery.kicker}</p>
            <h1 className={styles.title}>{setupContent.recovery.title}</h1>
            <p className={styles.introduction}>{error || setupContent.recovery.fallbackMessage}</p>
          </header>
          <Button type="button" variant="primary" onClick={() => void loadState()} icon="refresh">
            {setupContent.recovery.retry}
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card} aria-labelledby="setup-title">
        <header className={styles.header}>
          <p className={styles.kicker}>
            {isContinuation ? setupContent.scope.continuationKicker : setupContent.scope.kicker}
          </p>
          <h1 id="setup-title" className={styles.title}>
            {isContinuation ? setupContent.scope.continuationTitle : setupContent.scope.title}
          </h1>
          <p className={styles.introduction}>
            {isContinuation
              ? setupContent.scope.continuationIntroduction
              : setupContent.scope.introduction}
          </p>
        </header>

        <SetupJourney activeStep="scope" completedSteps={[]} />

        <section
          aria-label={
            isContinuation
              ? setupContent.scope.continuationModulesLabel
              : setupContent.scope.modulesLabel
          }
        >
          <div
            className={styles.moduleGrid}
            role="group"
            aria-label={
              isContinuation
                ? setupContent.scope.continuationModulesLabel
                : setupContent.scope.modulesLabel
            }
          >
            {businessModules.map((module) => (
              <SetupModuleChoice
                key={module.module_key}
                module={module}
                selected={selected.includes(module.module_key)}
                onToggle={toggleModule}
              />
            ))}
          </div>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <footer className={styles.actions}>
            <Button
              type="button"
              variant="primary"
              isLoading={isSaving}
              disabled={selected.length === 0}
              onClick={() => void saveSelection()}
              icon="arrow-left"
              iconPosition="right"
            >
              {setupContent.scope.saveAndContinue}
            </Button>
            <p className={styles.notice}>
              {selected.length === 0
                ? setupContent.scope.emptySelectionHint
                : setupContent.scope.deferredNotice}
            </p>
          </footer>
        </section>
      </section>
    </main>
  );
}
