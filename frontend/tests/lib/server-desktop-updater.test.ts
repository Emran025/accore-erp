import { beforeEach, describe, expect, it, vi } from 'vitest';

const updaterMocks = vi.hoisted(() => ({
  check: vi.fn(),
  relaunch: vi.fn(),
  prepareServerDesktopUpdate: vi.fn(),
  startServerRuntime: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-updater', () => ({ check: updaterMocks.check }));
vi.mock('@tauri-apps/plugin-process', () => ({ relaunch: updaterMocks.relaunch }));
vi.mock('@/lib/product-flavor', () => ({ PRODUCT_FLAVOR: 'server' }));
vi.mock('@/lib/server-runtime', () => ({
  prepareServerDesktopUpdate: updaterMocks.prepareServerDesktopUpdate,
  startServerRuntime: updaterMocks.startServerRuntime,
}));

import { installSignedServerDesktopUpdate } from '@/lib/server-desktop-updater';

describe('automatic Server Desktop updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      configurable: true,
      value: {},
    });
  });

  it('downloads before the ordered service shutdown and leaves the service stopped only after installer handoff', async () => {
    const download = vi.fn();
    const install = vi.fn();
    updaterMocks.check.mockResolvedValue({
      version: '1.1.6',
      body: null,
      date: null,
      download,
      install,
    });
    updaterMocks.prepareServerDesktopUpdate.mockResolvedValue({ state: 'stopped' });

    await installSignedServerDesktopUpdate();

    expect(download).toHaveBeenCalledBefore(updaterMocks.prepareServerDesktopUpdate);
    expect(updaterMocks.prepareServerDesktopUpdate).toHaveBeenCalledBefore(install);
    expect(updaterMocks.startServerRuntime).not.toHaveBeenCalled();
  });

  it('restarts the managed local service when installer handoff fails after an ordered shutdown', async () => {
    updaterMocks.check.mockResolvedValue({
      version: '1.1.6',
      body: null,
      date: null,
      download: vi.fn(),
      install: vi.fn().mockRejectedValue(new Error('installer handoff failed')),
    });
    updaterMocks.prepareServerDesktopUpdate.mockResolvedValue({ state: 'stopped' });

    await expect(installSignedServerDesktopUpdate()).rejects.toThrow('installer handoff failed');

    expect(updaterMocks.startServerRuntime).toHaveBeenCalledOnce();
  });
});
