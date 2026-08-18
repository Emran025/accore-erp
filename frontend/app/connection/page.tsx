'use client';

import { catalogMessage } from '@/lib/i18n';
import { useClientConnectionStore } from '@/stores/useClientConnectionStore';

export default function ConnectionPage() {
  const { profile, removeProfile } = useClientConnectionStore();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-cyan-400/30 bg-slate-900 p-8 shadow-2xl shadow-cyan-950/20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          {catalogMessage('platform.product.client')}
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white">
          {catalogMessage('platform.connection.profileTitle')}
        </h1>
        <p className="mt-3 leading-7 text-slate-300">
          {catalogMessage('platform.connection.profileDescription')}
        </p>

        {profile ? (
          <dl className="mt-8 divide-y divide-slate-700 rounded-xl border border-slate-700 bg-slate-950/60">
            <ConnectionValue
              label={catalogMessage('platform.connection.serverIdentity')}
              value={profile.serverId}
            />
            <ConnectionValue
              label={catalogMessage('platform.connection.serverName')}
              value={profile.serverName}
            />
            <ConnectionValue
              label={catalogMessage('platform.connection.apiBase')}
              value={profile.apiBase}
            />
            <ConnectionValue
              label={catalogMessage('platform.connection.apiContract')}
              value={profile.apiContract}
            />
            <ConnectionValue
              label={catalogMessage('platform.connection.verifiedAt')}
              value={profile.verifiedAt}
            />
          </dl>
        ) : null}

        <button
          type="button"
          className="mt-8 rounded-lg border border-rose-400/50 px-4 py-3 font-semibold text-rose-200 transition hover:bg-rose-950/50"
          onClick={() => void removeProfile()}
        >
          {catalogMessage('platform.connection.removeProfile')}
        </button>
      </section>
    </main>
  );
}

function ConnectionValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 px-5 py-4 sm:grid-cols-[11rem_1fr]">
      <dt className="text-sm font-medium text-slate-400">{label}</dt>
      <dd className="break-all text-sm text-slate-100">{value}</dd>
    </div>
  );
}
