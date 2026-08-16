import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { SessionExpiredModal } from '@/components/ui/SessionExpiredModal';
import { LocaleProvider, catalogMessage } from '@/lib/i18n';

export const metadata: Metadata = {
  title: catalogMessage('shared.layout.acorSystem'),
  description: catalogMessage('shared.layout.akorManagementAccountingSystem'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <LocaleProvider>
          {children}
          <SessionExpiredModal />
        </LocaleProvider>
      </body>
    </html>
  );
}
