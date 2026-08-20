export type ProductFlavor = 'server' | 'client' | 'development';

export type ClientConnectionState =
  | { kind: 'not-client' }
  | { kind: 'ready'; apiBase: string }
  | { kind: 'profile-required' };

export interface ProductBuildEnvironment {
  NEXT_PUBLIC_ACCORE_PRODUCT_FLAVOR?: string;
  NEXT_PUBLIC_API_BASE?: string;
  NEXT_PUBLIC_ACCORE_CLIENT_API_BASE?: string;
  NEXT_PUBLIC_ACCORE_CLIENT_PROFILE_VERIFIED?: string;
  NEXT_PUBLIC_ACCORE_SERVER_API_BASE?: string;
  NODE_ENV?: string;
}

const INVALID_ENVIRONMENT_VALUES = new Set(['', 'null', 'undefined']);
const LOCAL_DEVELOPMENT_API_BASE = 'http://127.0.0.1:8000/api';
const SERVER_RUNTIME_API_BASE = 'http://127.0.0.1:8765/api';

function normalized(value: string | undefined): string | undefined {
  const candidate = value?.trim();
  return candidate && !INVALID_ENVIRONMENT_VALUES.has(candidate.toLowerCase())
    ? candidate
    : undefined;
}

function isApprovedApiBase(value: string | undefined, allowLocalhost: boolean): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return true;

    return (
      allowLocalhost &&
      url.protocol === 'http:' &&
      (url.hostname === '127.0.0.1' || url.hostname === 'localhost')
    );
  } catch {
    return false;
  }
}

export function resolveProductFlavor(
  environment: ProductBuildEnvironment = process.env
): ProductFlavor {
  switch (normalized(environment.NEXT_PUBLIC_ACCORE_PRODUCT_FLAVOR)?.toLowerCase()) {
    case 'server':
      return 'server';
    case 'client':
      return 'client';
    default:
      return 'development';
  }
}

export function resolveApiBase(
  environment: ProductBuildEnvironment = process.env
): string | undefined {
  const flavor = resolveProductFlavor(environment);
  const apiBase = normalized(environment.NEXT_PUBLIC_API_BASE);

  if (flavor === 'server') {
    const serverApiBase = normalized(environment.NEXT_PUBLIC_ACCORE_SERVER_API_BASE);
    return isApprovedApiBase(serverApiBase, true) ? serverApiBase : SERVER_RUNTIME_API_BASE;
  }

  if (flavor === 'client') {
    const profileApiBase = normalized(environment.NEXT_PUBLIC_ACCORE_CLIENT_API_BASE);
    const profileVerified =
      normalized(environment.NEXT_PUBLIC_ACCORE_CLIENT_PROFILE_VERIFIED) === 'true';

    return profileVerified && isApprovedApiBase(profileApiBase, false) ? profileApiBase : undefined;
  }

  if (isApprovedApiBase(apiBase, true)) return apiBase;
  return environment.NODE_ENV === 'production' ? undefined : LOCAL_DEVELOPMENT_API_BASE;
}

export function resolveClientConnectionState(
  environment: ProductBuildEnvironment = process.env
): ClientConnectionState {
  if (resolveProductFlavor(environment) !== 'client') return { kind: 'not-client' };

  const apiBase = resolveApiBase(environment);
  return apiBase ? { kind: 'ready', apiBase } : { kind: 'profile-required' };
}

// Next.js replaces direct NEXT_PUBLIC_* references in browser bundles. Do not pass
// the dynamic process.env object here: it is not populated in a static Tauri asset.
export const COMPILED_PRODUCT_ENVIRONMENT: ProductBuildEnvironment = {
  NEXT_PUBLIC_ACCORE_PRODUCT_FLAVOR: process.env.NEXT_PUBLIC_ACCORE_PRODUCT_FLAVOR,
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  NEXT_PUBLIC_ACCORE_CLIENT_API_BASE: process.env.NEXT_PUBLIC_ACCORE_CLIENT_API_BASE,
  NEXT_PUBLIC_ACCORE_CLIENT_PROFILE_VERIFIED: process.env.NEXT_PUBLIC_ACCORE_CLIENT_PROFILE_VERIFIED,
  NEXT_PUBLIC_ACCORE_SERVER_API_BASE: process.env.NEXT_PUBLIC_ACCORE_SERVER_API_BASE,
  NODE_ENV: process.env.NODE_ENV,
};

export const PRODUCT_FLAVOR = resolveProductFlavor(COMPILED_PRODUCT_ENVIRONMENT);
export const API_BASE = resolveApiBase(COMPILED_PRODUCT_ENVIRONMENT);
export const CLIENT_CONNECTION_STATE = resolveClientConnectionState(COMPILED_PRODUCT_ENVIRONMENT);

export function isClientRelease(): boolean {
  return PRODUCT_FLAVOR === 'client';
}

export function requiresVerifiedServerProfile(): boolean {
  return CLIENT_CONNECTION_STATE.kind === 'profile-required';
}
