'use client';

import { CalendarCheck2, Link2, Server, ShieldCheck, Trash2 } from 'lucide-react';
import { catalogMessage } from '@/lib/i18n';
import { useClientConnectionStore } from '@/stores/useClientConnectionStore';

export default function ConnectionPage() {
  const { profile, removeProfile } = useClientConnectionStore();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f4f6] px-4 py-6 text-slate-900 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(85,102,129,0.16),transparent_65%)]" />
      <section className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(35,48,69,0.14)]">
        <header className="bg-gradient-to-l from-[#233045] via-[#30374c] to-[#556681] px-7 py-8 text-white sm:px-10">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
              <Server className="h-6 w-6 text-cyan-100" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-slate-200">
                {catalogMessage('platform.product.client')}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                {catalogMessage('platform.connection.profileTitle')}
              </h1>
            </div>
          </div>
        </header>

        <div className="px-7 py-9 sm:px-10 sm:py-10">
          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#556681]" aria-hidden="true" />
            <p className="text-sm leading-7 text-slate-700">
              {catalogMessage('platform.connection.profileDescription')}
            </p>
          </div>

          {profile ? (
            <dl className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <ConnectionValue
                icon={Server}
                label={catalogMessage('platform.connection.serverIdentity')}
                value={profile.serverId}
              />
              <ConnectionValue
                icon={Server}
                label={catalogMessage('platform.connection.serverName')}
                value={profile.serverName}
              />
              <ConnectionValue
                icon={Link2}
                label={catalogMessage('platform.connection.apiBase')}
                value={profile.apiBase}
                direction="ltr"
              />
              <ConnectionValue
                icon={ShieldCheck}
                label={catalogMessage('platform.connection.apiContract')}
                value={profile.apiContract}
                direction="ltr"
              />
              <ConnectionValue
                icon={CalendarCheck2}
                label={catalogMessage('platform.connection.verifiedAt')}
                value={profile.verifiedAt}
              />
            </dl>
          ) : null}

          <div className="mt-7 flex justify-start border-t border-slate-100 pt-6">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-extrabold text-rose-800 transition hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
              onClick={() => void removeProfile()}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {catalogMessage('platform.connection.removeProfile')}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function ConnectionValue({
  icon: Icon,
  label,
  value,
  direction,
}: {
  icon: typeof Server;
  label: string;
  value: string;
  direction?: 'ltr';
}) {
  return (
    <div className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:grid-cols-[minmax(11rem,0.7fr)_1.3fr] sm:items-center sm:px-6">
      <dt className="flex items-center gap-2 text-sm font-bold text-slate-600">
        <Icon className="h-4 w-4 text-[#556681]" aria-hidden="true" />
        {label}
      </dt>
      <dd
        className="break-all rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium leading-6 text-slate-800"
        dir={direction}
      >
        {value}
      </dd>
    </div>
  );
}
