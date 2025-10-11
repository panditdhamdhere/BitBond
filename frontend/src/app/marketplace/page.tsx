'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import BondMarketplace from '@/components/BondMarketplace'
import ConnectWallet from '@/components/ConnectWallet'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

/**
 * Marketplace Page - Public
 * Shows all listed bonds for sale
 * Does not require wallet connection to view
 */
export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-bitcoin-gradient rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  BitBond
                </h1>
                <p className="text-xs text-slate-500 -mt-1">Liquid Bonds for Bitcoin</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Home
              </Link>
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/marketplace" className="text-orange-600 font-semibold border-b-2 border-orange-600">
                Marketplace
              </Link>
              <Link href="/analytics" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Analytics
              </Link>
            </nav>
            
            <ConnectWallet />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Bond Marketplace</h1>
          <p className="text-slate-600">Browse and buy bonds listed for sale by other users</p>
        </div>
        <BondMarketplace />
      </main>
    </div>
  )
}

