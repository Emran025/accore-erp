'use client';

import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { catalogMessage } from '@/lib/i18n';
import {
  type PairingCandidate,
  parseManualPairingCandidate,
  parsePairingPayload,
} from '@/lib/connection/client-connection';
import { PRODUCT_FLAVOR } from '@/lib/product-flavor';
import { useClientConnectionStore } from '@/stores/useClientConnectionStore';

type PairingMethod = 'manual' | 'qr' | 'file';

interface ClientConnectionGateProps {
  children: ReactNode;
}

interface ManualFields {
  apiBase: string;
  serverId: string;
  certificateFingerprint: string;
  enrollmentEvidence: string;
}

const EMPTY_MANUAL_FIELDS: ManualFields = {
  apiBase: '',
  serverId: '',
  certificateFingerprint: '',
  enrollmentEvidence: '',
};

const PAIRING_METHOD_KEYS = {
  file: 'platform.connection.method.file',
  manual: 'platform.connection.method.manual',
  qr: 'platform.connection.method.qr',
} as const;

const CONNECTION_ERROR_KEYS = {
  certificate_mismatch: 'platform.connection.error.certificateMismatch',
  credential_storage_failed: 'platform.connection.error.credentialStorageFailed',
  device_revoked: 'platform.connection.error.deviceRevoked',
  enrollment_rejected: 'platform.connection.error.enrollmentRejected',
  incompatible_server: 'platform.connection.error.incompatibleServer',
  insecure_endpoint: 'platform.connection.error.insecureEndpoint',
  invalid_endpoint: 'platform.connection.error.invalidEndpoint',
  invalid_pairing_payload: 'platform.connection.error.invalidPairingPayload',
  server_identity_mismatch: 'platform.connection.error.serverIdentityMismatch',
  server_unreachable: 'platform.connection.error.serverUnreachable',
  unexpected_response: 'platform.connection.error.unexpectedResponse',
  update_required: 'platform.connection.error.updateRequired',
} as const;

function errorMessage(code: string | undefined): string {
  const resolvedCode =
    code && code in CONNECTION_ERROR_KEYS
      ? (code as keyof typeof CONNECTION_ERROR_KEYS)
      : 'unexpected_response';
  return catalogMessage(CONNECTION_ERROR_KEYS[resolvedCode]);
}

function ConnectionSetup(): ReactNode {
  const [method, setMethod] = useState<PairingMethod>('manual');
  const [manual, setManual] = useState<ManualFields>(EMPTY_MANUAL_FIELDS);
  const [pairingPayload, setPairingPayload] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { pair, retry, status, error } = useClientConnectionStore();

  const isPairing = status === 'pairing';
  const remoteError = error ? errorMessage(error.code) : null;
  const visibleError = localError ?? remoteError;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    try {
      const candidate: PairingCandidate =
        method === 'manual'
          ? parseManualPairingCandidate(manual)
          : parsePairingPayload(pairingPayload);
      await pair(candidate);
    } catch (reason) {
      setLocalError(
        errorMessage(
          typeof reason === 'object' && reason && 'code' in reason
            ? String(reason.code)
            : 'unexpected_response'
        )
      );
    }
  };

  const onPairingFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLocalError(null);
    try {
      setPairingPayload(await file.text());
    } catch {
      setLocalError(catalogMessage('platform.connection.error.invalidPairingPayload'));
    }
  };

  return (
    <section className="w-full max-w-2xl rounded-2xl border border-cyan-400/30 bg-slate-900 p-8 shadow-2xl shadow-cyan-950/20">
      <div className="border-b border-slate-700 pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          {catalogMessage('platform.product.client')}
        </p>
        <h1 id="client-connection-title" className="mt-3 text-2xl font-bold text-white">
          {catalogMessage('platform.connection.title')}
        </h1>
        <p className="mt-3 leading-7 text-slate-300">
          {catalogMessage('platform.connection.description')}
        </p>
      </div>

      <div
        className="mt-6 grid grid-cols-3 gap-2"
        role="tablist"
        aria-label={catalogMessage('platform.connection.methodLabel')}
      >
        {(['manual', 'qr', 'file'] as const).map((candidateMethod) => (
          <button
            key={candidateMethod}
            type="button"
            role="tab"
            aria-selected={method === candidateMethod}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              method === candidateMethod
                ? 'bg-cyan-400 text-slate-950'
                : 'border border-slate-700 bg-slate-950 text-slate-200 hover:border-cyan-400/60'
            }`}
            onClick={() => {
              setMethod(candidateMethod);
              setLocalError(null);
            }}
          >
            {catalogMessage(PAIRING_METHOD_KEYS[candidateMethod])}
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        {method === 'manual' ? (
          <>
            <ConnectionField
              label={catalogMessage('platform.connection.apiBase')}
              placeholder="https://server.example/api"
              value={manual.apiBase}
              onChange={(apiBase) => setManual((fields) => ({ ...fields, apiBase }))}
            />
            <ConnectionField
              label={catalogMessage('platform.connection.serverIdentity')}
              placeholder="accore-server-001"
              value={manual.serverId}
              onChange={(serverId) => setManual((fields) => ({ ...fields, serverId }))}
            />
            <ConnectionField
              label={catalogMessage('platform.connection.certificateFingerprint')}
              placeholder="SHA-256"
              value={manual.certificateFingerprint}
              onChange={(certificateFingerprint) =>
                setManual((fields) => ({ ...fields, certificateFingerprint }))
              }
              autoComplete="off"
            />
            <ConnectionField
              label={catalogMessage('platform.connection.enrollmentEvidence')}
              placeholder={catalogMessage('platform.connection.enrollmentEvidencePlaceholder')}
              value={manual.enrollmentEvidence}
              onChange={(enrollmentEvidence) =>
                setManual((fields) => ({ ...fields, enrollmentEvidence }))
              }
              autoComplete="one-time-code"
            />
          </>
        ) : null}

        {method === 'qr' ? (
          <label className="block text-sm font-medium text-slate-200">
            {catalogMessage('platform.connection.qrPayload')}
            <textarea
              className="mt-2 min-h-32 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none focus:border-cyan-400"
              value={pairingPayload}
              onChange={(event) => setPairingPayload(event.target.value)}
              placeholder="accore:?api_base=https%3A%2F%2Fserver.example%2Fapi&server_id=..."
              required
            />
          </label>
        ) : null}

        {method === 'file' ? (
          <label className="block text-sm font-medium text-slate-200">
            {catalogMessage('platform.connection.pairingFile')}
            <input
              className="mt-2 block w-full cursor-pointer rounded-lg border border-dashed border-slate-600 bg-slate-950 px-3 py-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:font-semibold file:text-slate-950"
              type="file"
              accept={['application/json', '.json', '.accorepair'].join(',')}
              onChange={onPairingFileSelected}
              required
            />
            <span className="mt-2 block text-xs font-normal leading-5 text-slate-400">
              {catalogMessage('platform.connection.fileHint')}
            </span>
          </label>
        ) : null}

        {visibleError ? (
          <div className="space-y-3">
            <p
              role="alert"
              className="rounded-lg border border-rose-400/40 bg-rose-950/30 p-3 text-sm leading-6 text-rose-200"
            >
              {visibleError}
            </p>
            <button
              type="button"
              className="text-sm font-semibold text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
              onClick={() => void retry()}
            >
              {catalogMessage('platform.connection.retry')}
            </button>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPairing}
          className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPairing
            ? catalogMessage('platform.connection.pairing')
            : catalogMessage('platform.connection.verifyAndPair')}
        </button>
      </form>
    </section>
  );
}

function ConnectionField({
  label,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-200">
      {label}
      <input
        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}

export function ClientConnectionGate({ children }: ClientConnectionGateProps) {
  const { hydrate, status } = useClientConnectionStore();
  const isClient = PRODUCT_FLAVOR === 'client';

  useEffect(() => {
    if (isClient) void hydrate();
  }, [hydrate, isClient]);

  if (!isClient || status === 'ready') {
    return <>{children}</>;
  }

  return (
    <main
      aria-labelledby="client-connection-title"
      className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-50"
      data-testid="client-connection-gate"
    >
      {status === 'checking' ? (
        <section className="w-full max-w-lg rounded-2xl border border-cyan-400/30 bg-slate-900 p-8 text-center shadow-2xl shadow-cyan-950/20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            {catalogMessage('platform.product.client')}
          </p>
          <h1 id="client-connection-title" className="mt-3 text-2xl font-bold text-white">
            {catalogMessage('platform.connection.checking')}
          </h1>
        </section>
      ) : (
        <ConnectionSetup />
      )}
    </main>
  );
}
