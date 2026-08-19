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

interface ServerRuntimeGateProps {
  children: ReactNode;
}

function RuntimeShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f4f6] px-4 py-6 text-slate-900 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(85,102,129,0.16),transparent_65%)]" />
      <section className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(35,48,69,0.14)]">
        <header className="bg-gradient-to-l from-[#233045] via-[#30374c] to-[#556681] px-7 py-7 text-white sm:px-10">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
              <Server className="h-6 w-6 text-cyan-100" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-slate-200">
                {catalogMessage('platform.product.server')}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-100/80">
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

export function ServerRuntimeGate({ children }: ServerRuntimeGateProps) {
  const [readiness, setReadiness] = useState<ServerReadinessState>(() => initialServerReadiness());

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

  if (readiness.kind === 'not-server' || readiness.kind === 'ready') return <>{children}</>;

  const isChecking = readiness.kind === 'checking';
  return (
    <RuntimeShell>
      <div
        aria-busy={isChecking}
        aria-labelledby="server-runtime-readiness-title"
        className="px-7 py-9 sm:px-10 sm:py-11"
        data-testid={isChecking ? 'server-runtime-checking' : 'server-runtime-unavailable'}
      >
        {isChecking ? (
          <div className="mx-auto max-w-md text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-[#30374c]">
              <LoaderCircle className="h-7 w-7 animate-spin" aria-hidden="true" />
            </span>
            <h1
              id="server-runtime-readiness-title"
              className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900"
            >
              {catalogMessage('platform.product.serverRuntimeChecking')}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {catalogMessage('platform.product.serverRuntimeApiComponent')}
              </span>
            </p>
          </div>
        ) : (
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100">
              <CircleAlert className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1
              id="server-runtime-readiness-title"
              className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900"
            >
              {catalogMessage('platform.product.serverRuntimeUnavailableTitle')}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              {catalogMessage('platform.product.serverRuntimeUnavailableDescription')}
            </p>

            <dl className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <dt className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Activity className="h-4 w-4 text-[#556681]" aria-hidden="true" />
                  {catalogMessage('platform.product.serverRuntimeFailedComponent')}
                </dt>
                <dd className="mt-3 text-sm leading-6 text-slate-600">
                  {catalogMessage('platform.product.serverRuntimeApiComponent')}
                </dd>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
                <dt className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Wrench className="h-4 w-4 text-amber-700" aria-hidden="true" />
                  {catalogMessage('platform.product.serverRuntimeRecommendedAction')}
                </dt>
                <dd className="mt-3 text-sm leading-6 text-slate-600">
                  {catalogMessage('platform.product.serverRuntimeApiAction')}
                </dd>
              </div>
            </dl>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#556681]"
                  aria-hidden="true"
                />
                <p className="text-sm leading-7 text-slate-700">
                  {catalogMessage('platform.product.serverRuntimeUnavailableNextStep')}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#30374c] px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(48,55,76,0.2)] transition hover:-translate-y-0.5 hover:bg-[#233045] focus:outline-none focus:ring-4 focus:ring-[#8192a5]/35"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {catalogMessage('platform.connection.retry')}
            </button>
          </div>
        )}
      </div>
    </RuntimeShell>
  );
}
