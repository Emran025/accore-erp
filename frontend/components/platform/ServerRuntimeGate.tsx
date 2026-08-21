'use client';

import { type ReactNode, useEffect, useState } from 'react';
import {
  Activity,
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { catalogMessage } from '@/lib/i18n';
import {
  initialServerReadiness,
  resolveServerReadiness,
  type ServerReadinessState,
} from '@/lib/server-readiness';
import {
  readServerRuntimeStatus,
  readServerBackupStatus,
  requestServerBackup,
  startServerRuntime,
  type ServerBackupStatus,
  type ServerRuntimeComponent,
  type ServerRuntimeStatus,
} from '@/lib/server-runtime';
import {
  checkSignedServerDesktopUpdate,
  installSignedServerDesktopUpdate,
  type SignedServerDesktopUpdate,
} from '@/lib/server-desktop-updater';

interface ServerRuntimeGateProps {
  children: ReactNode;
}

function RuntimeShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f5f7] px-4 py-6 text-slate-900 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(85,102,129,0.13),transparent_68%)]" />
      <section className="relative w-full max-w-3xl overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_20px_55px_rgba(35,48,69,0.12)]">
        <header className="bg-gradient-to-l from-[#233045] via-[#30374c] to-[#556681] px-5 py-4 text-white sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/20">
              <Server className="h-5 w-5 text-cyan-100" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-slate-200">
                {catalogMessage('platform.product.server')}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-slate-100/80">
                {catalogMessage('platform.product.serverRuntimeApiComponent')}
              </p>
            </div>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}

function ServerOperationsPanel() {
  const [backupStatus, setBackupStatus] = useState<ServerBackupStatus | null>(null);
  const [update, setUpdate] = useState<SignedServerDesktopUpdate | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isInstallingUpdate, setIsInstallingUpdate] = useState(false);
  const [operationFailed, setOperationFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const status = await readServerBackupStatus();
      if (active && status) setBackupStatus(status);
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 5_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const requestBackup = async () => {
    setIsBackingUp(true);
    setOperationFailed(false);
    try {
      const status = await requestServerBackup();
      if (!status) {
        setOperationFailed(true);
        return;
      }
      setBackupStatus({
        ...status,
        state: 'pending',
        detail: catalogMessage('platform.product.serverBackupRequested'),
      });
    } catch {
      setOperationFailed(true);
    } finally {
      setIsBackingUp(false);
    }
  };

  const checkUpdate = async () => {
    setIsCheckingUpdate(true);
    setOperationFailed(false);
    try {
      setUpdate(await checkSignedServerDesktopUpdate());
    } catch {
      setOperationFailed(true);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const installUpdate = async () => {
    setIsInstallingUpdate(true);
    setOperationFailed(false);
    try {
      await installSignedServerDesktopUpdate();
    } catch {
      setOperationFailed(true);
      setIsInstallingUpdate(false);
    }
  };

  return (
    <aside className="fixed bottom-4 right-4 z-40 w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_45px_rgba(35,48,69,0.18)] backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
        <ShieldCheck className="h-4 w-4 text-[#556681]" aria-hidden="true" />
        {catalogMessage('platform.product.serverOperationsTitle')}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <section className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-800">
            {catalogMessage('platform.product.serverBackupTitle')}
          </p>
          <p className="mt-1 min-h-10 text-xs leading-5 text-slate-600" aria-live="polite">
            {backupStatus?.detail ?? catalogMessage('platform.product.serverBackupUnavailable')}
          </p>
          <button
            type="button"
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void requestBackup()}
            disabled={isBackingUp || isInstallingUpdate}
          >
            {isBackingUp
              ? catalogMessage('platform.product.serverBackupRequested')
              : catalogMessage('platform.product.serverBackupCreate')}
          </button>
        </section>
        <section className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-800">
            {catalogMessage('platform.product.serverUpdateTitle')}
          </p>
          <p className="mt-1 min-h-10 text-xs leading-5 text-slate-600" aria-live="polite">
            {update
              ? `${catalogMessage('platform.product.serverUpdateAvailable')}: ${update.version}`
              : catalogMessage('platform.product.serverUpdateNone')}
          </p>
          {update ? (
            <button
              type="button"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#30374c] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#233045] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void installUpdate()}
              disabled={isInstallingUpdate || isBackingUp}
            >
              {isInstallingUpdate
                ? catalogMessage('platform.product.serverUpdateInstalling')
                : catalogMessage('platform.product.serverUpdateInstall')}
            </button>
          ) : (
            <button
              type="button"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void checkUpdate()}
              disabled={isCheckingUpdate || isBackingUp}
            >
              {catalogMessage('platform.product.serverUpdateCheck')}
            </button>
          )}
        </section>
      </div>
      {operationFailed ? (
        <p className="mt-3 text-xs leading-5 text-rose-700">
          {catalogMessage('platform.product.serverOperationRetry')}
        </p>
      ) : null}
    </aside>
  );
}

export function ServerRuntimeGate({ children }: ServerRuntimeGateProps) {
  const [readiness, setReadiness] = useState<ServerReadinessState>(() => initialServerReadiness());
  const [runtimeStatus, setRuntimeStatus] = useState<ServerRuntimeStatus | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    let active = true;
    void readServerRuntimeStatus().then((status) => {
      if (active) setRuntimeStatus(status);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      !runtimeStatus ||
      !['bootstrapping', 'recovering', 'stopping'].includes(runtimeStatus.state)
    ) {
      return;
    }

    let active = true;
    const refreshStatus = () => {
      void readServerRuntimeStatus().then((status) => {
        if (!active || !status) return;
        setRuntimeStatus(status);
        if (status.state === 'ready') setReadiness(initialServerReadiness());
      });
    };
    const interval = window.setInterval(refreshStatus, 2_000);
    refreshStatus();
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [runtimeStatus]);

  useEffect(() => {
    if (readiness.kind !== 'checking') return;

    const controller = new AbortController();
    void fetch(readiness.healthUrl, { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) setReadiness(resolveServerReadiness(response.ok));
      })
      .catch(() => {
        if (!controller.signal.aborted) setReadiness(resolveServerReadiness(false));
      });

    return () => controller.abort();
  }, [readiness]);

  if (readiness.kind === 'not-server') return <>{children}</>;
  if (readiness.kind === 'ready') {
    return (
      <>
        {children}
        <ServerOperationsPanel />
      </>
    );
  }

  const isRuntimeProgressing = ['bootstrapping', 'recovering', 'stopping'].includes(
    runtimeStatus?.state ?? ''
  );
  const isChecking = readiness.kind === 'checking' || isRuntimeProgressing;
  const runtimeDetail = runtimeStatus?.detail;
  const componentRows: Array<[string, ServerRuntimeComponent | undefined]> = [
    [catalogMessage('platform.product.serverRuntimeDatabaseComponent'), runtimeStatus?.database],
    [catalogMessage('platform.product.serverRuntimeApiComponent'), runtimeStatus?.api],
    [catalogMessage('platform.product.serverRuntimeQueueComponent'), runtimeStatus?.queue],
  ];
  const refreshRuntime = async () => {
    const status = await readServerRuntimeStatus();
    if (status) setRuntimeStatus(status);
  };
  const startRuntime = async () => {
    setIsStarting(true);
    try {
      const status = await startServerRuntime();
      if (status) setRuntimeStatus(status);
    } finally {
      setIsStarting(false);
    }
  };
  return (
    <RuntimeShell>
      <div
        aria-busy={isChecking}
        aria-labelledby="server-runtime-readiness-title"
        className="px-5 py-6 sm:px-7 sm:py-7"
        data-testid={isChecking ? 'server-runtime-checking' : 'server-runtime-unavailable'}
      >
        {isChecking ? (
          <div className="mx-auto max-w-lg text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#30374c]">
              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
            </span>
            <h1
              id="server-runtime-readiness-title"
              className="mt-4 text-xl font-extrabold tracking-tight text-slate-900"
            >
              {catalogMessage('platform.product.serverRuntimeChecking')}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {catalogMessage('platform.product.serverRuntimeApiComponent')}
              </span>
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100">
                  <CircleAlert className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h1 id="server-runtime-readiness-title" className="text-xl font-extrabold tracking-tight text-slate-900">
                    {catalogMessage('platform.product.serverRuntimeUnavailableTitle')}
                  </h1>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                    {catalogMessage('platform.product.serverRuntimeUnavailableDescription')}
                  </p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                <ShieldCheck className="h-3.5 w-3.5 text-[#556681]" aria-hidden="true" />
                {catalogMessage('platform.product.serverRuntimeServiceContinuity')}
              </span>
            </div>

            <dl className="mt-5 grid gap-2 sm:grid-cols-3">
              {componentRows.map(([label, status]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <dt className="text-xs font-bold text-slate-800">{label}</dt>
                  <dd className="mt-1 truncate text-xs leading-5 text-slate-500" title={status?.detail}>
                    {status?.detail ?? catalogMessage('platform.product.serverRuntimeUnavailableNextStep')}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
              <p className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                {catalogMessage('platform.product.serverRuntimeApiAction')}
              </p>
            </div>

            {runtimeDetail ? (
              <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <summary className="cursor-pointer text-xs font-bold text-slate-700">
                  {catalogMessage('platform.product.serverRuntimeTechnicalDetail')}
                </summary>
                <p className="mt-2 break-words font-mono text-[11px] leading-5 text-slate-600">{runtimeDetail}</p>
              </details>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                onClick={() => void refreshRuntime()}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {catalogMessage('platform.product.serverRuntimeRefreshStatus')}
              </button>
              {runtimeStatus?.runtimePresent ? (
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#30374c] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(48,55,76,0.18)] transition hover:bg-[#233045] focus:outline-none focus:ring-4 focus:ring-[#8192a5]/35 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => void startRuntime()}
                  disabled={isStarting}
                >
                  <Server className="h-4 w-4" aria-hidden="true" />
                  {isStarting
                    ? catalogMessage('platform.product.serverRuntimeChecking')
                    : catalogMessage('platform.product.serverRuntimeStartService')}
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </RuntimeShell>
  );
}
