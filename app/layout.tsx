import React from 'react';

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
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
