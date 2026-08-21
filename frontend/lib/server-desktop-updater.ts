import { PRODUCT_FLAVOR } from '@/lib/product-flavor';
import { catalogMessage } from '@/lib/i18n';
import {
  prepareServerDesktopUpdate,
  startServerRuntime,
} from '@/lib/server-runtime';

export interface SignedServerDesktopUpdate {
  version: string;
  body: string | null;
  date: string | null;
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
 * The updater plugin validates Tauri's signed release metadata and artifact before
 * installation. The Agent is stopped first and restarted if download or handoff fails.
 */
export async function installSignedServerDesktopUpdate(): Promise<void> {
  if (PRODUCT_FLAVOR !== 'server') {
    throw new Error(catalogMessage('platform.product.serverUpdateServerOnly'));
  }
  const { check } = await import('@tauri-apps/plugin-updater');
  const update = await check();
  if (!update) {
    throw new Error(catalogMessage('platform.product.serverUpdateUnavailable'));
  }

  const stopped = await prepareServerDesktopUpdate();
  if (stopped?.state !== 'stopped') {
    throw new Error(catalogMessage('platform.product.serverUpdateShutdown'));
  }

  try {
    await update.downloadAndInstall();
    const { relaunch } = await import('@tauri-apps/plugin-process');
    await relaunch();
  } catch (error) {
    await startServerRuntime();
    throw error;
  }
}
