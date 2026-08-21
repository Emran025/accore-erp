import { PRODUCT_FLAVOR } from '@/lib/product-flavor';

export const DESKTOP_UPDATE_REQUEST_TIMEOUT_MS = 30_000;

export type DesktopUpdatePhase =
  | 'checking'
  | 'available'
  | 'downloading'
  | 'preparing'
  | 'installing'
  | 'relaunching'
  | 'recovering'
  | 'up-to-date';

export interface DesktopUpdateProgress {
  phase: DesktopUpdatePhase;
  version?: string;
  downloadedBytes?: number;
  totalBytes?: number;
}

export interface SignedDesktopUpdate {
  version: string;
  body: string | null;
  date: string | null;
}

export type SignedDesktopUpdateResult =
  | { kind: 'not-desktop' }
  | { kind: 'up-to-date' }
  | { kind: 'installed'; update: SignedDesktopUpdate };

export interface InstallSignedDesktopUpdateOptions {
  beforeInstall?: () => Promise<void>;
  onInstallHandoff?: () => void;
  onProgress?: (progress: DesktopUpdateProgress) => void;
}

function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function publish(
  onProgress: InstallSignedDesktopUpdateOptions['onProgress'],
  progress: DesktopUpdateProgress
): void {
  onProgress?.(progress);
}

/**
 * Retrieves only a signed update accepted by the Tauri updater plugin. The plugin
 * validates the release metadata and artifact signature before installation.
 */
export async function installSignedDesktopUpdate(
  options: InstallSignedDesktopUpdateOptions = {}
): Promise<SignedDesktopUpdateResult> {
  if (!isTauriRuntime()) return { kind: 'not-desktop' };

  publish(options.onProgress, { phase: 'checking' });
  const { check } = await import('@tauri-apps/plugin-updater');
  const update = await check({ timeout: DESKTOP_UPDATE_REQUEST_TIMEOUT_MS });
  if (!update) {
    publish(options.onProgress, { phase: 'up-to-date' });
    return { kind: 'up-to-date' };
  }

  const release = {
    version: update.version,
    body: update.body ?? null,
    date: update.date ?? null,
  };
  publish(options.onProgress, { phase: 'available', version: release.version });

  let downloadedBytes = 0;
  let totalBytes: number | undefined;
  await update.download((event) => {
    if (event.event === 'Started') {
      totalBytes = event.data.contentLength;
      publish(options.onProgress, {
        phase: 'downloading',
        version: release.version,
        downloadedBytes,
        totalBytes,
      });
      return;
    }

    if (event.event === 'Progress') {
      downloadedBytes += event.data.chunkLength;
      publish(options.onProgress, {
        phase: 'downloading',
        version: release.version,
        downloadedBytes,
        totalBytes,
      });
    }
  });

  await options.beforeInstall?.();
  publish(options.onProgress, { phase: 'installing', version: release.version });
  await update.install();
  options.onInstallHandoff?.();
  publish(options.onProgress, { phase: 'relaunching', version: release.version });

  // Windows exits the current application when its installer takes over. On the
  // other supported platforms, relaunch completes the activation of the update.
  const { relaunch } = await import('@tauri-apps/plugin-process');
  await relaunch();
  return { kind: 'installed', update: release };
}

/**
 * Client Desktop has no managed local service, so a verified update can activate
 * immediately after its package has been downloaded.
 */
export async function installSignedClientDesktopUpdate(
  options: Omit<InstallSignedDesktopUpdateOptions, 'beforeInstall' | 'onInstallHandoff'> = {}
): Promise<SignedDesktopUpdateResult> {
  if (PRODUCT_FLAVOR !== 'client') return { kind: 'not-desktop' };
  return installSignedDesktopUpdate(options);
}
