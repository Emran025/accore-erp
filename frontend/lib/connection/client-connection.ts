import { invoke } from '@tauri-apps/api/core';
import {
  ensureProtectedDesktopCredentialStore,
  readProtectedDesktopCredentials,
  writeProtectedDesktopCredentials,
} from './desktop-credential-vault';

export const CLIENT_CONNECTION_PROFILE_STORAGE_KEY = [
  'accore',
  'client',
  'connection',
  'profile',
  'v1',
].join('.');
export const DESKTOP_API_CONTRACT = 'desktop-v1';

export interface ClientConnectionProfile {
  apiBase: string;
  serverId: string;
  serverName: string;
  certificateFingerprint: string | null;
  apiContract: string;
  verifiedAt: string;
  deviceId: string;
}

export interface PairingCandidate {
  apiBase: string;
  serverId: string;
  certificateFingerprint: string;
  enrollmentEvidence: string;
}

export type PairingFailureCode =
  | 'invalid_endpoint'
  | 'insecure_endpoint'
  | 'invalid_pairing_payload'
  | 'server_unreachable'
  | 'server_identity_mismatch'
  | 'certificate_mismatch'
  | 'credential_storage_failed'
  | 'incompatible_server'
  | 'update_required'
  | 'enrollment_rejected'
  | 'device_revoked'
  | 'unexpected_response';

export class PairingError extends Error {
  constructor(
    public readonly code: PairingFailureCode,
    message = code
  ) {
    super(message);
    this.name = 'PairingError';
  }
}

function pairingError(code: PairingFailureCode): PairingError {
  return new PairingError(code);
}

interface DesktopBootstrapResponse {
  success: boolean;
  desktop?: {
    server?: { id?: string; name?: string };
    api_contract?: string;
    health?: { status?: string };
    certificate_binding?: { server_certificate_fingerprint?: string | null };
    compatibility?: { status?: string; minimum_client_version?: string };
  };
}

interface DesktopEnrollmentResponse {
  success: boolean;
  message_key?: string;
  device?: { id?: string; status?: string };
  device_access_token?: string;
}

interface DesktopPolicyResponse {
  success: boolean;
  message_key?: string;
  desktop?: {
    compatibility?: { status?: string; minimum_client_version?: string };
    device?: { status?: string };
  };
}

let runtimeProfile: ClientConnectionProfile | null = null;

function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function getBrowserStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

function normalizeFingerprint(value: string): string {
  return value.trim().toLowerCase();
}

function assertFingerprint(value: string): string {
  const fingerprint = normalizeFingerprint(value);
  if (!/^[a-f0-9]{64}$/.test(fingerprint)) {
    throw pairingError('invalid_pairing_payload');
  }

  return fingerprint;
}

export function normalizeClientApiBase(value: string): string {
  const candidate = value.trim();

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:') {
      throw pairingError('insecure_endpoint');
    }

    if (url.username || url.password || url.hash || url.search) {
      throw pairingError('invalid_endpoint');
    }

    const normalizedPath = url.pathname.replace(/\/+$/, '');
    return [url.origin, normalizedPath === '/' ? '' : normalizedPath].join('');
  } catch (error) {
    if (error instanceof PairingError) throw error;

    throw pairingError('invalid_endpoint');
  }
}

export function parsePairingPayload(value: string): PairingCandidate {
  const payload = value.trim();
  if (!payload) {
    throw pairingError('invalid_pairing_payload');
  }

  let source: Record<string, unknown>;

  try {
    if (payload.startsWith('{')) {
      source = JSON.parse(payload) as Record<string, unknown>;
    } else {
      const url = new URL(payload);
      const pairingScheme = 'accore';
      if (url.protocol.slice(0, -1) !== pairingScheme) {
        throw pairingError('invalid_pairing_payload');
      }

      source = {
        apiBase: url.searchParams.get('api_base') ?? url.searchParams.get('apiBase'),
        serverId: url.searchParams.get('server_id') ?? url.searchParams.get('serverId'),
        certificateFingerprint:
          url.searchParams.get('certificate_fingerprint') ??
          url.searchParams.get('certificateFingerprint'),
        enrollmentEvidence:
          url.searchParams.get('enrollment_evidence') ?? url.searchParams.get('enrollmentEvidence'),
      };
    }
  } catch (error) {
    if (error instanceof PairingError) throw error;
    throw pairingError('invalid_pairing_payload');
  }

  const apiBase = source.apiBase ?? source.api_base;
  const serverId = source.serverId ?? source.server_id;
  const certificateFingerprint = source.certificateFingerprint ?? source.certificate_fingerprint;
  const enrollmentEvidence = source.enrollmentEvidence ?? source.enrollment_evidence;

  if (
    typeof apiBase !== 'string' ||
    typeof serverId !== 'string' ||
    typeof certificateFingerprint !== 'string' ||
    typeof enrollmentEvidence !== 'string' ||
    !serverId.trim() ||
    !enrollmentEvidence.trim()
  ) {
    throw pairingError('invalid_pairing_payload');
  }

  return {
    apiBase: normalizeClientApiBase(apiBase),
    serverId: serverId.trim(),
    certificateFingerprint: assertFingerprint(certificateFingerprint),
    enrollmentEvidence: enrollmentEvidence.trim(),
  };
}

export function parseManualPairingCandidate(input: PairingCandidate): PairingCandidate {
  return parsePairingPayload(JSON.stringify(input));
}

export async function readClientConnectionProfile(): Promise<ClientConnectionProfile | null> {
  if (runtimeProfile) return runtimeProfile;

  if (isTauriRuntime()) {
    const profile = await invoke<ClientConnectionProfile | null>('read_client_connection_profile');
    runtimeProfile = profile;
    return profile;
  }

  const serialized = getBrowserStorage()?.getItem(CLIENT_CONNECTION_PROFILE_STORAGE_KEY);
  if (!serialized) return null;

  try {
    const profile = JSON.parse(serialized) as ClientConnectionProfile;
    runtimeProfile = profile;
    return profile;
  } catch {
    getBrowserStorage()?.removeItem(CLIENT_CONNECTION_PROFILE_STORAGE_KEY);
    return null;
  }
}

export async function persistClientConnectionProfile(
  profile: ClientConnectionProfile
): Promise<void> {
  runtimeProfile = profile;

  if (isTauriRuntime()) {
    await invoke('write_client_connection_profile', { profile });
    return;
  }

  getBrowserStorage()?.setItem(CLIENT_CONNECTION_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export async function removeClientConnectionProfile(): Promise<void> {
  runtimeProfile = null;

  if (isTauriRuntime()) {
    await invoke('remove_client_connection_profile');
    return;
  }

  getBrowserStorage()?.removeItem(CLIENT_CONNECTION_PROFILE_STORAGE_KEY);
}

export function getRuntimeClientApiBase(): string | undefined {
  return runtimeProfile?.apiBase;
}

function desktopUrl(apiBase: string, segment: string): string {
  return [apiBase.replace(/\/+$/, ''), 'v1', 'desktop', segment].join('/');
}

function clientVersion(): string {
  return process.env.NEXT_PUBLIC_ACCORE_CLIENT_VERSION ?? '0.1.0';
}

function pairingHeaders(): HeadersInit {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Accore-Client-Version': clientVersion(),
  };
}

async function responseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw pairingError('unexpected_response');
  }
}

async function fetchPairing(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw pairingError('server_unreachable');
  }
}

/**
 * Checks a paired device on every Client start before exposing ERP routes.
 * The device access token stays in the encrypted vault and is never added to
 * the persisted public connection profile or to application state.
 */
export async function verifyClientConnectionPolicy(
  profile: ClientConnectionProfile
): Promise<void> {
  let credentials;
  try {
    credentials = await readProtectedDesktopCredentials();
  } catch {
    throw pairingError('credential_storage_failed');
  }

  if (!credentials || credentials.deviceId !== profile.deviceId) {
    throw pairingError('device_revoked');
  }

  const policyResponse = await fetchPairing(desktopUrl(profile.apiBase, 'policy'), {
    method: 'GET',
    headers: {
      ...pairingHeaders(),
      'X-Accore-Device-Id': credentials.deviceId,
      'X-Accore-Device-Token': credentials.deviceAccessToken,
    },
  });
  const policy = await responseJson<DesktopPolicyResponse>(policyResponse);

  if (policy.message_key === 'desktop.error.device_revoked') {
    throw pairingError('device_revoked');
  }

  if (
    !policyResponse.ok ||
    !policy.success ||
    policy.desktop?.compatibility?.status === 'update_required'
  ) {
    throw pairingError('update_required');
  }
}

function mapEnrollmentFailure(response: DesktopEnrollmentResponse): PairingError {
  switch (response.message_key) {
    case 'desktop.error.update_required':
      return pairingError('update_required');
    case 'desktop.error.certificate_mismatch':
      return pairingError('certificate_mismatch');
    case 'desktop.error.device_revoked':
      return pairingError('device_revoked');
    default:
      return pairingError('enrollment_rejected');
  }
}

/**
 * One trusted verification path shared by manual, QR, and pairing-file inputs.
 * Device and refresh credentials are persisted only through the encrypted
 * desktop vault; the public connection profile contains no secret material.
 */
export async function verifyAndPairClient(
  candidate: PairingCandidate
): Promise<ClientConnectionProfile> {
  try {
    await ensureProtectedDesktopCredentialStore();
  } catch {
    throw pairingError('credential_storage_failed');
  }

  const bootstrapResponse = await fetchPairing(desktopUrl(candidate.apiBase, 'bootstrap'), {
    method: 'GET',
    headers: pairingHeaders(),
  });
  const bootstrap = await responseJson<DesktopBootstrapResponse>(bootstrapResponse);

  if (!bootstrapResponse.ok || !bootstrap.success || !bootstrap.desktop) {
    throw pairingError('server_unreachable');
  }

  const server = bootstrap.desktop.server;
  const compatibility = bootstrap.desktop.compatibility;
  const serverFingerprint = bootstrap.desktop.certificate_binding?.server_certificate_fingerprint;

  if (bootstrap.desktop.health?.status !== 'healthy') {
    throw pairingError('server_unreachable');
  }

  if (bootstrap.desktop.api_contract !== DESKTOP_API_CONTRACT) {
    throw pairingError('incompatible_server');
  }

  if (compatibility?.status === 'update_required') {
    throw pairingError('update_required');
  }

  if (!server?.id || server.id !== candidate.serverId) {
    throw pairingError('server_identity_mismatch');
  }

  if (
    !serverFingerprint ||
    normalizeFingerprint(serverFingerprint) !== candidate.certificateFingerprint
  ) {
    throw pairingError('certificate_mismatch');
  }

  const deviceId = crypto.randomUUID();
  const publicKeyFingerprint = await fingerprintForDevice(deviceId);
  const enrollmentResponse = await fetchPairing(desktopUrl(candidate.apiBase, 'enroll'), {
    method: 'POST',
    headers: pairingHeaders(),
    body: JSON.stringify({
      server_id: candidate.serverId,
      device_id: deviceId,
      display_name: deviceDisplayName(),
      platform: platformForEnrollment(),
      client_version: clientVersion(),
      public_key_fingerprint: publicKeyFingerprint,
      certificate_fingerprint: candidate.certificateFingerprint,
      enrollment_evidence: candidate.enrollmentEvidence,
    }),
  });
  const enrollment = await responseJson<DesktopEnrollmentResponse>(enrollmentResponse);

  if (
    !enrollmentResponse.ok ||
    !enrollment.success ||
    !enrollment.device?.id ||
    !enrollment.device_access_token
  ) {
    throw mapEnrollmentFailure(enrollment);
  }

  const policyResponse = await fetchPairing(desktopUrl(candidate.apiBase, 'policy'), {
    method: 'GET',
    headers: {
      ...pairingHeaders(),
      'X-Accore-Device-Id': enrollment.device.id,
      'X-Accore-Device-Token': enrollment.device_access_token,
    },
  });
  const policy = await responseJson<DesktopPolicyResponse>(policyResponse);

  if (policy.message_key === 'desktop.error.device_revoked') {
    throw pairingError('device_revoked');
  }

  if (
    !policyResponse.ok ||
    !policy.success ||
    policy.desktop?.compatibility?.status === 'update_required'
  ) {
    throw pairingError('update_required');
  }

  const profile: ClientConnectionProfile = {
    apiBase: candidate.apiBase,
    serverId: server.id,
    serverName: server.name?.trim() || candidate.serverId,
    certificateFingerprint: candidate.certificateFingerprint,
    apiContract: DESKTOP_API_CONTRACT,
    verifiedAt: new Date().toISOString(),
    deviceId: enrollment.device.id,
  };

  try {
    await writeProtectedDesktopCredentials({
      schemaVersion: 1,
      deviceAccessToken: enrollment.device_access_token,
      deviceId: enrollment.device.id,
      refreshToken: null,
      refreshExpiresAt: null,
    });
  } catch {
    // A paired device is not usable until its credential bundle is durably
    // encrypted. Never fall back to browser storage or an unprotected token.
    throw pairingError('credential_storage_failed');
  }

  await persistClientConnectionProfile(profile);
  return profile;
}

async function fingerprintForDevice(deviceId: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${deviceId}:${crypto.randomUUID()}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function deviceDisplayName(): string {
  if (typeof navigator !== 'undefined' && navigator.userAgent.trim()) {
    return navigator.userAgent.slice(0, 120);
  }

  return ['accore', 'client', 'device'].join(' ');
}

function platformForEnrollment(): 'linux' | 'macos' | 'windows' {
  if (typeof navigator === 'undefined') return 'linux';
  const platform = navigator.userAgent.toLowerCase();
  if (platform.includes('windows')) return 'windows';
  if (platform.includes('mac')) return 'macos';
  return 'linux';
}
