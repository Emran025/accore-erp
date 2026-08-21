'use client';

import { useEffect } from 'react';
import { installSignedClientDesktopUpdate } from '@/lib/desktop-auto-updater';
import { PRODUCT_FLAVOR } from '@/lib/product-flavor';

/**
 * Starts signed Client Desktop updates during application startup. Browser and
 * development sessions are ignored by the updater adapter, so this remains safe
 * to mount in the shared application layout.
 */
export function ClientDesktopAutoUpdater() {
  useEffect(() => {
    if (PRODUCT_FLAVOR !== 'client') return;
    void installSignedClientDesktopUpdate().catch(() => undefined);
  }, []);

  return null;
}
