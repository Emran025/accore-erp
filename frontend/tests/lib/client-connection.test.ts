import { afterEach, describe, expect, it, vi } from 'vitest';

const credentialVault = vi.hoisted(() => ({
  ensureProtectedDesktopCredentialStore: vi.fn(),
  readProtectedDesktopCredentials: vi.fn(),
  writeProtectedDesktopCredentials: vi.fn(),
}));

vi.mock('@/lib/connection/desktop-credential-vault', () => credentialVault);
import {
  CLIENT_CONNECTION_PROFILE_STORAGE_KEY,
  PairingError,
  normalizeClientApiBase,
  parsePairingPayload,
  removeClientConnectionProfile,
  verifyAndPairClient,
  verifyClientConnectionPolicy,
} from '@/lib/connection/client-connection';

const certificateFingerprint = 'a'.repeat(64);

function candidate() {
  return {
    apiBase: 'https://server.example.test/api',
    serverId: 'server-001',
    certificateFingerprint,
    enrollmentEvidence: 'e'.repeat(72),
  };
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(async () => {
  vi.unstubAllGlobals();
  credentialVault.ensureProtectedDesktopCredentialStore.mockReset();
  credentialVault.readProtectedDesktopCredentials.mockReset();
  credentialVault.writeProtectedDesktopCredentials.mockReset();
  localStorage.clear();
  await removeClientConnectionProfile();
});

describe('client connection pairing contract', () => {
  it('requires encrypted credential storage before contacting a server', async () => {
    credentialVault.ensureProtectedDesktopCredentialStore.mockRejectedValueOnce(
      new Error('credential store unavailable')
    );
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    await expect(verifyAndPairClient(candidate())).rejects.toMatchObject({
      code: 'credential_storage_failed',
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('accepts a normal HTTPS API base and rejects production HTTP endpoints', () => {
    expect(normalizeClientApiBase('https://server.example.test/api/')).toBe(
      'https://server.example.test/api'
    );

    expect(() => normalizeClientApiBase('http://server.example.test/api')).toThrowError(
      PairingError
    );
    expect(() =>
      normalizeClientApiBase('https://user:password@server.example.test/api')
    ).toThrowError(PairingError);
  });

  it('parses QR and pairing-file payloads through the same candidate contract', () => {
    const fileCandidate = parsePairingPayload(JSON.stringify(candidate()));
    const qrCandidate = parsePairingPayload(
      `accore:?api_base=https%3A%2F%2Fserver.example.test%2Fapi&server_id=server-001&certificate_fingerprint=${certificateFingerprint}&enrollment_evidence=${'e'.repeat(72)}`
    );

    expect(qrCandidate).toEqual(fileCandidate);
  });

  it('rejects malformed pairing payloads before performing network requests', () => {
    expect(() => parsePairingPayload('{"apiBase":"https://server.example.test/api"}')).toThrowError(
      PairingError
    );
    expect(() => parsePairingPayload('https://server.example.test/api')).toThrowError(PairingError);
  });

  it('verifies bootstrap identity, certificate binding, enrollment, and policy before persisting a public profile', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          desktop: {
            server: { id: 'server-001', name: 'Verified Accore Server' },
            api_contract: 'desktop-v1',
            health: { status: 'healthy' },
            certificate_binding: { server_certificate_fingerprint: certificateFingerprint },
            compatibility: { status: 'compatible' },
          },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: true,
            device: { id: '11111111-1111-4111-8111-111111111111', status: 'active' },
            device_access_token: 'temporary-device-access-token',
          },
          201
        )
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          desktop: {
            device: { status: 'active' },
            compatibility: { status: 'compatible' },
          },
        })
      );
    vi.stubGlobal('fetch', fetch);

    const profile = await verifyAndPairClient(candidate());
    const persisted = localStorage.getItem(CLIENT_CONNECTION_PROFILE_STORAGE_KEY);

    expect(profile.serverId).toBe('server-001');
    expect(profile.certificateFingerprint).toBe(certificateFingerprint);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(persisted).toContain('server-001');
    expect(persisted).not.toContain('temporary-device-access-token');
    expect(persisted).not.toContain(candidate().enrollmentEvidence);
  });

  it('blocks a previously paired Client when Server policy requires an update', async () => {
    const profile = {
      apiBase: candidate().apiBase,
      serverId: candidate().serverId,
      serverName: 'Verified Accore Server',
      certificateFingerprint,
      apiContract: 'desktop-v1',
      verifiedAt: '2026-08-18T00:00:00.000Z',
      deviceId: '11111111-1111-4111-8111-111111111111',
    };
    credentialVault.readProtectedDesktopCredentials.mockResolvedValue({
      schemaVersion: 1,
      deviceId: profile.deviceId,
      deviceAccessToken: 'vault-only-device-token',
      refreshToken: null,
      refreshExpiresAt: null,
    });
    const fetch = vi.fn().mockResolvedValue(
      jsonResponse({
        success: true,
        desktop: {
          device: { status: 'active' },
          compatibility: { status: 'update_required', minimum_client_version: '0.2.0' },
        },
      })
    );
    vi.stubGlobal('fetch', fetch);

    await expect(verifyClientConnectionPolicy(profile)).rejects.toMatchObject({
      code: 'update_required',
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://server.example.test/api/v1/desktop/policy',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Accore-Device-Id': profile.deviceId,
          'X-Accore-Device-Token': 'vault-only-device-token',
        }),
      })
    );
    expect(localStorage.getItem(CLIENT_CONNECTION_PROFILE_STORAGE_KEY) ?? '').not.toContain(
      'vault-only-device-token'
    );
  });

  it('rejects an endpoint whose bootstrap certificate binding differs from the pairing data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          success: true,
          desktop: {
            server: { id: 'server-001', name: 'Verified Accore Server' },
            api_contract: 'desktop-v1',
            health: { status: 'healthy' },
            certificate_binding: { server_certificate_fingerprint: 'b'.repeat(64) },
            compatibility: { status: 'compatible' },
          },
        })
      )
    );

    await expect(verifyAndPairClient(candidate())).rejects.toMatchObject({
      code: 'certificate_mismatch',
    });
    expect(localStorage.getItem(CLIENT_CONNECTION_PROFILE_STORAGE_KEY)).toBeNull();
  });
});
