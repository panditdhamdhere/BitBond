import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BitBond - Bitcoin Liquidity Bonds on Stacks',
  description: 'Lock sBTC for guaranteed yields. Trade bond NFTs on secondary marketplace.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased motion-safe:transition-opacity motion-safe:duration-700`}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              success: { duration: 3000 },
              error: { duration: 4000 },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}