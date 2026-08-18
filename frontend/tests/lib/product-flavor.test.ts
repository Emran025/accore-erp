import { describe, expect, it } from 'vitest';
import {
  resolveApiBase,
  resolveClientConnectionState,
  resolveProductFlavor,
  type ProductBuildEnvironment,
} from '@/lib/product-flavor';

function environment(overrides: ProductBuildEnvironment): ProductBuildEnvironment {
  return { NODE_ENV: 'production', ...overrides };
}

describe('product flavor contract', () => {
  it('requires a verified HTTPS profile for a Client API base', () => {
    const client = environment({ NEXT_PUBLIC_ACCORE_PRODUCT_FLAVOR: 'client' });

    expect(resolveProductFlavor(client)).toBe('client');
    expect(resolveApiBase(client)).toBeUndefined();
    expect(resolveClientConnectionState(client)).toEqual({ kind: 'profile-required' });
  });

  it('rejects unverified or non-HTTPS Client API values', () => {
    const unverified = environment({
      NEXT_PUBLIC_ACCORE_PRODUCT_FLAVOR: 'client',
      NEXT_PUBLIC_ACCORE_CLIENT_API_BASE: 'https://erp.example.test/api',
    });
    const insecure = environment({
      NEXT_PUBLIC_ACCORE_PRODUCT_FLAVOR: 'client',
      NEXT_PUBLIC_ACCORE_CLIENT_PROFILE_VERIFIED: 'true',
      NEXT_PUBLIC_ACCORE_CLIENT_API_BASE: 'http://192.168.1.5/api',
    });

    expect(resolveApiBase(unverified)).toBeUndefined();
    expect(resolveApiBase(insecure)).toBeUndefined();
  });

  it('accepts a verified Client API profile without a localhost fallback', () => {
    const client = environment({
      NEXT_PUBLIC_ACCORE_PRODUCT_FLAVOR: 'client',
      NEXT_PUBLIC_ACCORE_CLIENT_PROFILE_VERIFIED: 'true',
      NEXT_PUBLIC_ACCORE_CLIENT_API_BASE: 'https://erp.example.test/api',
    });

    expect(resolveApiBase(client)).toBe('https://erp.example.test/api');
    expect(resolveClientConnectionState(client)).toEqual({
      kind: 'ready',
      apiBase: 'https://erp.example.test/api',
    });
  });

  it('reserves loopback API access for the Server build', () => {
    const server = environment({ NEXT_PUBLIC_ACCORE_PRODUCT_FLAVOR: 'server' });

    expect(resolveProductFlavor(server)).toBe('server');
    expect(resolveApiBase(server)).toBe('http://127.0.0.1:8765/api');
    expect(resolveClientConnectionState(server)).toEqual({ kind: 'not-client' });
  });

  it('keeps the developer fallback out of production', () => {
    expect(resolveApiBase({ NODE_ENV: 'development' })).toBe('http://127.0.0.1:8000/api');
    expect(resolveApiBase({ NODE_ENV: 'production' })).toBeUndefined();
  });
});
