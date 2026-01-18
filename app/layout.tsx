import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { WalletProvider } from '@/components/WalletProvider'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Reclaim - Verify Content Beyond Boundaries',
  description: 'Simplified Image Authentication with Unrivaled Content Verification via Reclaim',
  generator: 'v0.app',
  icons: {
    icon: '/reclaim_icon.png',
    apple: '/reclaim_icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0B0F1A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <WalletProvider>
          {children}
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
