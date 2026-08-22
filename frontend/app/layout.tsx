import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { SessionExpiredModal } from '@/components/ui/SessionExpiredModal';
import { catalogMessage, DEFAULT_LOCALE, getLocaleMetadata } from '@/lib/i18n';
import { LocaleProvider } from '@/lib/i18n/LocaleProvider';
import { ClientConnectionGate } from '@/components/platform/ClientConnectionGate';
import { ClientDesktopAutoUpdater } from '@/components/platform/ClientDesktopAutoUpdater';
import { DesktopInteractionPolicy } from '@/components/platform/DesktopInteractionPolicy';
import { ServerOperationsProvider } from '@/components/platform/ServerOperationsNotificationCenter';
import { ServerRuntimeGate } from '@/components/platform/ServerRuntimeGate';
import { StatusNotificationBar } from '@/components/navigation';

export const metadata: Metadata = {
  title: catalogMessage('shared.layout.acorSystem'),
  description: catalogMessage('shared.layout.akorManagementAccountingSystem'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localeMeta = getLocaleMetadata(DEFAULT_LOCALE);
  return (
    <html lang={localeMeta.languageTag} dir={localeMeta.direction}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <LocaleProvider>
          <DesktopInteractionPolicy />
          <ClientDesktopAutoUpdater />
          <ServerOperationsProvider>
            <ClientConnectionGate>
              <ServerRuntimeGate>{children}</ServerRuntimeGate>
            </ClientConnectionGate>
            <SessionExpiredModal />
            <StatusNotificationBar />
          </ServerOperationsProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
