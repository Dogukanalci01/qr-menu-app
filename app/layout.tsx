import './globals.css'
import type { Metadata, Viewport } from 'next'

// BÜTÜN MOBİL (SAFARİ, CHROME) UYUMUNU SAĞLAYAN SİHİRLİ KOD BURASI
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Kullanıcının ekranı yakınlaştırmasını engeller, tam bir App hissi verir
}

export const metadata: Metadata = {
  title: 'QR Menü',
  description: 'Yeni nesil dijital restoran menüsü.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="overflow-x-hidden bg-slate-50">{children}</body>
    </html>
  )
}
