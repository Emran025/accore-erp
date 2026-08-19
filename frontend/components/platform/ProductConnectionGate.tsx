'use client';

import { type ReactNode } from 'react';
import { FileKey2, Server, ShieldCheck } from 'lucide-react';
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
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f4f6] px-4 py-6 text-slate-900 sm:px-6"
      data-testid="client-server-profile-required"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(85,102,129,0.16),transparent_65%)]" />
      <section className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(35,48,69,0.14)]">
        <header className="bg-gradient-to-l from-[#233045] via-[#30374c] to-[#556681] px-7 py-8 text-white sm:px-10">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
              <Server className="h-6 w-6 text-cyan-100" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-slate-200">
                {catalogMessage('platform.product.client')}
              </p>
              <p className="mt-1 text-sm text-slate-100/80">
                {catalogMessage('platform.connection.title')}
              </p>
            </div>
          </div>
        </header>
        <div className="px-7 py-9 sm:px-10 sm:py-11">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#30374c]">
            <FileKey2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1
            id="client-server-profile-title"
            className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900"
          >
            {catalogMessage('platform.product.serverProfileRequiredTitle')}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {catalogMessage('platform.product.serverProfileRequiredDescription')}
          </p>
          <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#556681]" aria-hidden="true" />
              <p className="text-sm leading-7 text-slate-700">
                {catalogMessage('platform.product.serverProfileRequiredNextStep')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
