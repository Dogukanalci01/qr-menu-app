import React from 'react';
import './globals.css';

export const metadata = {
  title: 'QR Menü Yönetim Paneli',
  description: 'Ücretsiz QR Menü SaaS Sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
