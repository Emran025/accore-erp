'use client';

import { useEffect } from 'react';

function isTauriDesktop(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * ACCORE Desktop is an application shell, not a browser tab. This policy is
 * deliberately limited to the native WebView so normal browser accessibility
 * and debugging behavior remain available for the web deployment.
 */
export function DesktopInteractionPolicy() {
  useEffect(() => {
    if (!isTauriDesktop()) return;

    const preventBrowserContextMenu = (event: MouseEvent) => event.preventDefault();
    const preventBrowserShortcut = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const browserAction =
        key === 'f5' ||
        ((event.ctrlKey || event.metaKey) && ['p', 'r', 's'].includes(key)) ||
        (event.altKey && ['arrowleft', 'arrowright'].includes(key));
      if (browserAction) event.preventDefault();
    };

    document.addEventListener('contextmenu', preventBrowserContextMenu, true);
    window.addEventListener('keydown', preventBrowserShortcut, true);
    return () => {
      document.removeEventListener('contextmenu', preventBrowserContextMenu, true);
      window.removeEventListener('keydown', preventBrowserShortcut, true);
    };
  }, []);

  return null;
}
