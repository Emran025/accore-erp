'use client';

import { type ReactNode } from 'react';
import { CLIENT_CONNECTION_STATE, PRODUCT_FLAVOR } from '@/lib/product-flavor';
import { catalogMessage } from '@/lib/i18n';

interface ProductConnectionGateProps {
  children: ReactNode;
}

export function ProductConnectionGate({ children }: ProductConnectionGateProps) {
  if (PRODUCT_FLAVOR !== 'client' || CLIENT_CONNECTION_STATE.kind !== 'profile-required') {
    return <>{children}</>;
  }

  return (
    <main
      aria-labelledby="client-server-profile-title"
      className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-50"
      data-testid="client-server-profile-required"
    >
      <section className="w-full max-w-lg rounded-2xl border border-cyan-400/30 bg-slate-900 p-8 shadow-2xl shadow-cyan-950/20">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          {catalogMessage('platform.product.client')}
        </p>
        <h1 id="client-server-profile-title" className="text-2xl font-bold text-white">
          {catalogMessage('platform.product.serverProfileRequiredTitle')}
        </h1>
        <p className="mt-4 leading-7 text-slate-300">
          {catalogMessage('platform.product.serverProfileRequiredDescription')}
        </p>
        <p className="mt-6 rounded-lg border border-slate-700 bg-slate-950/70 p-4 text-sm leading-6 text-slate-400">
          {catalogMessage('platform.product.serverProfileRequiredNextStep')}
        </p>
      </section>
    </main>
  );
}
