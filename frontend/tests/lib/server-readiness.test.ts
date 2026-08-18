import {
  blocksProtectedServerRoutes,
  initialServerReadiness,
  resolveServerHealthUrl,
  resolveServerReadiness,
} from '@/lib/server-readiness';

describe('server readiness contract', () => {
  const server = { NODE_ENV: 'production', NEXT_PUBLIC_ACCORE_PRODUCT_FLAVOR: 'server' } as const;

  it('derives the health probe from the Server loopback API only', () => {
    expect(resolveServerHealthUrl(server)).toBe('http://127.0.0.1:8765/up');
    expect(
      resolveServerHealthUrl({
        NODE_ENV: 'production',
        NEXT_PUBLIC_ACCORE_PRODUCT_FLAVOR: 'client',
      })
    ).toBeUndefined();
  });

  it('blocks protected Server routes while the service is checking or unavailable', () => {
    expect(initialServerReadiness(server)).toEqual({
      kind: 'checking',
      healthUrl: 'http://127.0.0.1:8765/up',
    });
    expect(blocksProtectedServerRoutes(resolveServerReadiness(false, server))).toBe(true);
    expect(blocksProtectedServerRoutes(resolveServerReadiness(true, server))).toBe(false);
  });
});
