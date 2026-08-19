'use client';

import {
  type ChangeEvent,
  type ComponentType,
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  CheckCircle2,
  FileKey2,
  Fingerprint,
  KeyRound,
  LoaderCircle,
  QrCode,
  RefreshCw,
  Server,
  ShieldCheck,
  Upload,
  Wifi,
} from 'lucide-react';
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

const PAIRING_METHOD_ICONS: Record<PairingMethod, ComponentType<{ className?: string }>> = {
  file: Upload,
  manual: KeyRound,
  qr: QrCode,
};

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

function BrandPanel() {
  return (
    <aside className="relative overflow-hidden bg-gradient-to-br from-[#233045] via-[#30374c] to-[#556681] px-7 py-8 text-white sm:px-10 sm:py-12 lg:min-h-[680px] lg:px-12">
      <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full border border-white/10 bg-white/5" />
      <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full border border-cyan-200/10 bg-cyan-300/5" />
      <div className="relative flex h-full flex-col">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-100">
          <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          {catalogMessage('platform.product.client')}
        </div>

        <div className="mt-10 lg:mt-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
            <Wifi className="h-7 w-7 text-cyan-200" aria-hidden="true" />
          </div>
          <h1
            id="client-connection-title"
            className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
          >
            {catalogMessage('platform.connection.title')}
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-200 sm:text-base">
            {catalogMessage('platform.connection.description')}
          </p>
        </div>

        <div className="mt-10 space-y-4 border-t border-white/10 pt-7 lg:mt-auto">
          <TrustPoint
            icon={ShieldCheck}
            text={catalogMessage('platform.connection.trust.encryptedIdentity')}
          />
          <TrustPoint
            icon={Fingerprint}
            text={catalogMessage('platform.connection.trust.protectedCredential')}
          />
          <TrustPoint
            icon={CheckCircle2}
            text={catalogMessage('platform.connection.trust.compatibilityGuard')}
          />
        </div>
      </div>
    </aside>
  );
}

function TrustPoint({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm leading-6 text-slate-200">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
        <Icon className="h-3.5 w-3.5 text-cyan-200" aria-hidden="true" />
      </span>
      <span>{text}</span>
    </div>
  );
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
    <main
      aria-labelledby="client-connection-title"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f4f6] px-4 py-6 text-slate-900 sm:px-6 lg:px-8"
      data-testid="client-connection-gate"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(85,102,129,0.15),transparent_66%)]" />
      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(35,48,69,0.16)] lg:grid-cols-[0.85fr_1.15fr]">
        <BrandPanel />
        <div className="bg-white px-6 py-8 sm:px-10 sm:py-12 lg:px-12">
          <div className="mx-auto max-w-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#556681]">
                  {catalogMessage('platform.connection.setupEyebrow')}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                  {catalogMessage('platform.connection.setupTitle')}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {catalogMessage('platform.connection.setupDescription')}
                </p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#30374c]">
                <Server className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <div
              className="mt-8 grid grid-cols-3 rounded-xl bg-slate-100 p-1.5"
              role="tablist"
              aria-label={catalogMessage('platform.connection.methodLabel')}
            >
              {(['manual', 'qr', 'file'] as const).map((candidateMethod) => {
                const Icon = PAIRING_METHOD_ICONS[candidateMethod];
                const active = method === candidateMethod;
                return (
                  <button
                    key={candidateMethod}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`flex min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-xs font-bold transition sm:px-3 sm:text-sm ${
                      active
                        ? 'bg-white text-[#30374c] shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
                    }`}
                    onClick={() => {
                      setMethod(candidateMethod);
                      setLocalError(null);
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {catalogMessage(PAIRING_METHOD_KEYS[candidateMethod])}
                    </span>
                  </button>
                );
              })}
            </div>

            <form className="mt-7 space-y-5" onSubmit={submit}>
              {method === 'manual' ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <ConnectionField
                    className="sm:col-span-2"
                    icon={Wifi}
                    label={catalogMessage('platform.connection.apiBase')}
                    placeholder="https://server.example/api"
                    value={manual.apiBase}
                    onChange={(apiBase) => setManual((fields) => ({ ...fields, apiBase }))}
                  />
                  <ConnectionField
                    icon={Server}
                    label={catalogMessage('platform.connection.serverIdentity')}
                    placeholder="accore-server-001"
                    value={manual.serverId}
                    onChange={(serverId) => setManual((fields) => ({ ...fields, serverId }))}
                  />
                  <ConnectionField
                    icon={Fingerprint}
                    label={catalogMessage('platform.connection.certificateFingerprint')}
                    placeholder="SHA-256"
                    value={manual.certificateFingerprint}
                    onChange={(certificateFingerprint) =>
                      setManual((fields) => ({ ...fields, certificateFingerprint }))
                    }
                    autoComplete="off"
                  />
                  <ConnectionField
                    className="sm:col-span-2"
                    icon={FileKey2}
                    label={catalogMessage('platform.connection.enrollmentEvidence')}
                    placeholder={catalogMessage(
                      'platform.connection.enrollmentEvidencePlaceholder'
                    )}
                    value={manual.enrollmentEvidence}
                    onChange={(enrollmentEvidence) =>
                      setManual((fields) => ({ ...fields, enrollmentEvidence }))
                    }
                    autoComplete="one-time-code"
                  />
                </div>
              ) : null}

              {method === 'qr' ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    {catalogMessage('platform.connection.qrPayload')}
                  </span>
                  <textarea
                    className="min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#556681] focus:bg-white focus:ring-4 focus:ring-[#8192a5]/20"
                    value={pairingPayload}
                    onChange={(event) => setPairingPayload(event.target.value)}
                    placeholder="accore:?api_base=https%3A%2F%2Fserver.example%2Fapi&server_id=..."
                    required
                    dir="ltr"
                  />
                </label>
              ) : null}

              {method === 'file' ? (
                <label className="block rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-[#8192a5] hover:bg-slate-100/70">
                  <Upload className="mx-auto h-6 w-6 text-[#556681]" aria-hidden="true" />
                  <span className="mt-3 block text-sm font-bold text-slate-700">
                    {catalogMessage('platform.connection.pairingFile')}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {catalogMessage('platform.connection.fileHint')}
                  </span>
                  <input
                    className="sr-only"
                    type="file"
                    accept={['application/json', '.json', '.accorepair'].join(',')}
                    onChange={onPairingFileSelected}
                    required
                  />
                  <span className="mt-4 inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#30374c] shadow-sm">
                    {catalogMessage('platform.connection.method.file')}
                  </span>
                </label>
              ) : null}

              {visibleError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4" role="alert">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-rose-900">
                        {catalogMessage('platform.connection.pairingFailedTitle')}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-rose-800">{visibleError}</p>
                      <button
                        type="button"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-rose-800 underline decoration-rose-300 underline-offset-4 transition hover:text-rose-950"
                        onClick={() => void retry()}
                      >
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                        {catalogMessage('platform.connection.retry')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isPairing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#30374c] px-4 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(48,55,76,0.24)] transition hover:-translate-y-0.5 hover:bg-[#233045] hover:shadow-[0_14px_26px_rgba(48,55,76,0.28)] focus:outline-none focus:ring-4 focus:ring-[#8192a5]/35 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
              >
                {isPairing ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {isPairing
                  ? catalogMessage('platform.connection.pairing')
                  : catalogMessage('platform.connection.verifyAndPair')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function ConnectionField({
  className = '',
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  className?: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
        <Icon className="h-4 w-4 text-[#556681]" aria-hidden="true" />
        {label}
      </span>
      <input
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#556681] focus:bg-white focus:ring-4 focus:ring-[#8192a5]/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        dir="ltr"
      />
    </label>
  );
}

function CheckingConnection() {
  return (
    <main
      aria-labelledby="client-connection-title"
      className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-4 py-6 text-slate-900"
      data-testid="client-connection-gate"
    >
      <section className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-9 text-center shadow-[0_24px_60px_rgba(35,48,69,0.12)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#30374c] text-white shadow-lg shadow-slate-300">
          <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-bold tracking-[0.16em] text-[#556681]">
          {catalogMessage('platform.product.client')}
        </p>
        <h1 id="client-connection-title" className="mt-3 text-xl font-extrabold text-slate-900">
          {catalogMessage('platform.connection.checking')}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {catalogMessage('platform.connection.checkingDescription')}
        </p>
      </section>
    </main>
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

  return status === 'checking' ? <CheckingConnection /> : <ConnectionSetup />;
}
