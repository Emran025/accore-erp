'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { catalogMessage } from '@/lib/i18n';
import {
  initialServerReadiness,
  resolveServerReadiness,
  type ServerReadinessState,
} from '@/lib/server-readiness';

interface ServerRuntimeGateProps {
  children: ReactNode;
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
    <main
      aria-busy={isChecking}
      aria-labelledby="server-runtime-readiness-title"
      className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-50"
      data-testid={isChecking ? 'server-runtime-checking' : 'server-runtime-unavailable'}
    >
      <section className="w-full max-w-lg rounded-2xl border border-cyan-400/30 bg-slate-900 p-8 shadow-2xl shadow-cyan-950/20">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          {catalogMessage('platform.product.server')}
        </p>
        <h1 id="server-runtime-readiness-title" className="text-2xl font-bold text-white">
          {catalogMessage(
            isChecking
              ? 'platform.product.serverRuntimeChecking'
              : 'platform.product.serverRuntimeUnavailableTitle'
          )}
        </h1>
        {!isChecking && (
          <>
            <p className="mt-4 leading-7 text-slate-300">
              {catalogMessage('platform.product.serverRuntimeUnavailableDescription')}
            </p>
            <dl className="mt-6 space-y-3 rounded-lg border border-slate-700 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
              <div>
                <dt className="font-semibold text-slate-100">
                  {catalogMessage('platform.product.serverRuntimeFailedComponent')}
                </dt>
                <dd>{catalogMessage('platform.product.serverRuntimeApiComponent')}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-100">
                  {catalogMessage('platform.product.serverRuntimeRecommendedAction')}
                </dt>
                <dd>{catalogMessage('platform.product.serverRuntimeApiAction')}</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-4 text-sm leading-6 text-slate-400">
              {catalogMessage('platform.product.serverRuntimeUnavailableNextStep')}
            </p>
          </>
        )}
      </section>
    </main>
  );
}
