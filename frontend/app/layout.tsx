import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { SessionExpiredModal } from '@/components/ui/SessionExpiredModal';
import { LocaleProvider, catalogMessage, DEFAULT_LOCALE, getLocaleMetadata } from '@/lib/i18n';
import { ClientConnectionGate } from '@/components/platform/ClientConnectionGate';
import { ServerRuntimeGate } from '@/components/platform/ServerRuntimeGate';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <LocaleProvider>
          <ClientConnectionGate>
            <ServerRuntimeGate>{children}</ServerRuntimeGate>
          </ClientConnectionGate>
          <SessionExpiredModal />
        </LocaleProvider>
      </body>
    </html>
  );
}
