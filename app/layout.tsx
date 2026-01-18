import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { WalletProvider } from '@/components/WalletProvider'
import { PageTransition } from '@/components/PageTransition'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Reclaim - Verify Content Beyond Boundaries',
  description: 'Simplified Image Authentication with Unrivaled Content Verification via Reclaim',
  generator: 'v0.app',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
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
          <PageTransition>
            {children}
          </PageTransition>
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
