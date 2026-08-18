import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CLIENT_CONNECTION_PROFILE_STORAGE_KEY,
  PairingError,
  normalizeClientApiBase,
  parsePairingPayload,
  removeClientConnectionProfile,
  verifyAndPairClient,
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
  localStorage.clear();
  await removeClientConnectionProfile();
});

describe('client connection pairing contract', () => {
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
