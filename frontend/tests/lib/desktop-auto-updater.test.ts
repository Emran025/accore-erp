import { beforeEach, describe, expect, it, vi } from 'vitest';

const updaterMocks = vi.hoisted(() => ({
  check: vi.fn(),
  relaunch: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-updater', () => ({ check: updaterMocks.check }));
vi.mock('@tauri-apps/plugin-process', () => ({ relaunch: updaterMocks.relaunch }));
vi.mock('@/lib/product-flavor', () => ({ PRODUCT_FLAVOR: 'client' }));

import {
  DESKTOP_UPDATE_REQUEST_TIMEOUT_MS,
  installSignedClientDesktopUpdate,
} from '@/lib/desktop-auto-updater';

describe('automatic Client Desktop updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      configurable: true,
      value: {},
    });
  });

  it('checks, downloads, verifies through the plugin, installs, and relaunches a signed update', async () => {
    const download = vi.fn(async (onEvent) => {
      onEvent({ event: 'Started', data: { contentLength: 100 } });
      onEvent({ event: 'Progress', data: { chunkLength: 40 } });
      onEvent({ event: 'Progress', data: { chunkLength: 60 } });
      onEvent({ event: 'Finished', data: {} });
    });
    const install = vi.fn();
    updaterMocks.check.mockResolvedValue({
      version: '1.1.6',
      body: 'Signed maintenance release',
      date: '2026-08-21T12:00:00Z',
      download,
      install,
    });
    const phases: string[] = [];

    await expect(
      installSignedClientDesktopUpdate({ onProgress: (progress) => phases.push(progress.phase) })
    ).resolves.toEqual({
      kind: 'installed',
      update: {
        version: '1.1.6',
        body: 'Signed maintenance release',
        date: '2026-08-21T12:00:00Z',
      },
    });

    expect(updaterMocks.check).toHaveBeenCalledWith({ timeout: DESKTOP_UPDATE_REQUEST_TIMEOUT_MS });
    expect(download).toHaveBeenCalledOnce();
    expect(install).toHaveBeenCalledOnce();
    expect(updaterMocks.relaunch).toHaveBeenCalledOnce();
    expect(phases).toEqual([
      'checking',
      'available',
      'downloading',
      'downloading',
      'downloading',
      'installing',
      'relaunching',
    ]);
  });

  it('does not download or install when the signed endpoint has no newer version', async () => {
    updaterMocks.check.mockResolvedValue(null);
    const phases: string[] = [];

    await expect(
      installSignedClientDesktopUpdate({ onProgress: (progress) => phases.push(progress.phase) })
    ).resolves.toEqual({ kind: 'up-to-date' });

    expect(updaterMocks.relaunch).not.toHaveBeenCalled();
    expect(phases).toEqual(['checking', 'up-to-date']);
  });
});
