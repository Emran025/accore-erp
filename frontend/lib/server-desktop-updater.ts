import { PRODUCT_FLAVOR } from '@/lib/product-flavor';
import { catalogMessage } from '@/lib/i18n';
import {
  prepareServerDesktopUpdate,
  startServerRuntime,
} from '@/lib/server-runtime';
import {
  installSignedDesktopUpdate,
  type DesktopUpdateProgress,
  type SignedDesktopUpdateResult,
} from '@/lib/desktop-auto-updater';

export interface SignedServerDesktopUpdate {
  version: string;
  body: string | null;
  date: string | null;
}

export interface InstallSignedServerDesktopUpdateOptions {
  onProgress?: (progress: DesktopUpdateProgress) => void;
}

export async function checkSignedServerDesktopUpdate(): Promise<SignedServerDesktopUpdate | null> {
  if (PRODUCT_FLAVOR !== 'server') return null;
  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    const update = await check();
    if (!update) return null;
    return {
      version: update.version,
      body: update.body ?? null,
      date: update.date ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Downloads and verifies a signed update before the managed local service is
 * stopped. The service restarts if the installer cannot take ownership after the
 * ordered shutdown, avoiding downtime from a failed update handoff.
 */
export async function installSignedServerDesktopUpdate(
  options: InstallSignedServerDesktopUpdateOptions = {}
): Promise<SignedDesktopUpdateResult> {
  if (PRODUCT_FLAVOR !== 'server') {
    throw new Error(catalogMessage('platform.product.serverUpdateServerOnly'));
  }

  let serviceStopped = false;
  try {
    return await installSignedDesktopUpdate({
      onProgress: options.onProgress,
      beforeInstall: async () => {
        options.onProgress?.({ phase: 'preparing' });
        const stopped = await prepareServerDesktopUpdate();
        if (stopped?.state !== 'stopped') {
          throw new Error(catalogMessage('platform.product.serverUpdateShutdown'));
        }
        serviceStopped = true;
      },
      onInstallHandoff: () => {
        serviceStopped = false;
      },
    });
  } catch (error) {
    if (serviceStopped) {
      options.onProgress?.({ phase: 'recovering' });
      await startServerRuntime();
    }
    throw error;
  }
}
