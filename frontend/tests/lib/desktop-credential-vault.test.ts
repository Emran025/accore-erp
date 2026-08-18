import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const tauriCore = vi.hoisted(() => ({
  invoke: vi.fn(),
}));

const productFlavor = vi.hoisted(() => ({
  isClientRelease: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => tauriCore);
vi.mock('@tauri-apps/api/path', () => ({
  appLocalDataDir: vi.fn(),
}));
vi.mock('@tauri-apps/plugin-stronghold', () => ({
  Client: class {},
  Stronghold: class {},
}));
vi.mock('@/lib/product-flavor', () => productFlavor);

import {
  clearProtectedDesktopCredentials,
  ensureProtectedDesktopCredentialStore,
  readProtectedDesktopCredentials,
  writeProtectedDesktopCredentials,
} from '@/lib/connection/desktop-credential-vault';

describe('desktop credential vault product isolation', () => {
  beforeEach(() => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      configurable: true,
      value: {},
    });
    productFlavor.isClientRelease.mockReturnValue(false);
    tauriCore.invoke.mockReset();
  });

  afterEach(async () => {
    await clearProtectedDesktopCredentials();
    productFlavor.isClientRelease.mockReset();
    tauriCore.invoke.mockReset();
    delete (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  });

  it('never opens the Client-only vault during Server Desktop login lifecycle', async () => {
    await expect(ensureProtectedDesktopCredentialStore()).resolves.toBeUndefined();
    await expect(readProtectedDesktopCredentials()).resolves.toBeNull();

    await writeProtectedDesktopCredentials({
      refreshToken: 'test-refresh-token',
      refreshExpiresAt: null,
    });
    await clearProtectedDesktopCredentials();

    expect(tauriCore.invoke).not.toHaveBeenCalled();
  });
});
