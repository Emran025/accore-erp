import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { SessionExpiredModal } from "@/components/ui/SessionExpiredModal";

export const metadata: Metadata = {
  title: "نظام أكور",
  description: "نظام إدارة أكور والمحاسبة",
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
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <SessionExpiredModal />
      </body>
    </html>
  );
}
