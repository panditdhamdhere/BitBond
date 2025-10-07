'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const ConnectWallet = dynamic(() => import('@/components/ConnectWallet'), { ssr: false })
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  ShoppingCart,
  Wallet,
  Bitcoin,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  // Mock protocol stats; in production, fetch from analytics/stacksClient
  const [tvlBtc, setTvlBtc] = useState(152.34)
  const [btcUsd, setBtcUsd] = useState(65000) // mock price
  const [bondsCreated, setBondsCreated] = useState(245)
  const [activeBonds, setActiveBonds] = useState(172)
  const [avgApy, setAvgApy] = useState(8.4)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Header */}
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
                <p className="text-xs text-slate-500">Liquid Bonds for Bitcoin</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-orange-600 font-semibold border-b-2 border-orange-600">
                Home
              </Link>
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/marketplace" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
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

      {/* Hero Section */}
      <section
        className={`relative py-20 px-4 sm:px-6 lg:px-8 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage:
            'radial-gradient(1200px 600px at 50% -10%, rgba(247,147,26,0.10), rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.98) 70%)'
        }}
      >
        {/* Floating subtle Bitcoin icons */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 opacity-10">
            <Bitcoin className="w-40 h-40 text-orange-400 animate-[spin_60s_linear_infinite]" />
          </div>
          <div className="absolute top-1/3 -right-10 opacity-10">
            <Bitcoin className="w-24 h-24 text-orange-300 animate-[spin_75s_linear_infinite]" />
          </div>
          <div className="absolute bottom-0 left-1/3 opacity-10">
            <Bitcoin className="w-28 h-28 text-orange-200 animate-[spin_90s_linear_infinite]" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Bitcoin Liquidity Bonds on{' '}
            <span className="bg-stacks-gradient bg-clip-text text-transparent">Stacks</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Lock sBTC for 30, 90, or 180 days and earn guaranteed yields. 
            Trade your bond NFTs on our secondary marketplace.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="group bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-orange-200 hover:bg-white/70 hover:ring-1 hover:ring-orange-200/50">
              <div className="w-14 h-14 bg-bitcoin-gradient rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-105">
                <Shield className="w-7 h-7 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Guaranteed Yields</h3>
              <p className="text-slate-600">5% APY (30d), 8% APY (90d), 12% APY (180d)</p>
            </div>
            
            <div className="group bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-orange-200 hover:bg-white/70 hover:ring-1 hover:ring-orange-200/50">
              <div className="w-14 h-14 bg-stacks-gradient rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-105">
                <Wallet className="w-7 h-7 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tradeable NFTs</h3>
              <p className="text-slate-600">Each bond is represented by a unique NFT</p>
            </div>
            
            <div className="group bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-orange-200 hover:bg-white/70 hover:ring-1 hover:ring-orange-200/50">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-105">
                <TrendingUp className="w-7 h-7 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secondary Market</h3>
              <p className="text-slate-600">Buy and sell bonds before maturity</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4" role="region" aria-label="Protocol stats">
            <Stat
              label="TVL"
              valuePrefix=""
              value={tvlBtc}
              suffix=" BTC"
              sub={`$${(tvlBtc * btcUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD`}
            />
            <Stat label="Total Bonds" value={bondsCreated} integer />
            <Stat label="Active Bonds" value={activeBonds} integer />
            <Stat label="Average APY" value={avgApy} suffix="%" />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Start Earning?
          </h3>
          <p className="text-lg text-slate-600 mb-10">
            Connect your wallet and create your first bond in minutes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/dashboard"
              className="group flex flex-col items-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-orange-200 hover:border-orange-400"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">My Dashboard</h4>
              <p className="text-slate-600 text-sm mb-4">View and manage your bonds</p>
              <div className="flex items-center text-orange-600 font-medium group-hover:gap-2 transition-all">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/marketplace"
              className="group flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-200 hover:border-blue-400"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Marketplace</h4>
              <p className="text-slate-600 text-sm mb-4">Buy and sell bond NFTs</p>
              <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                <span>Browse Bonds</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/analytics"
              className="group flex flex-col items-center p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-emerald-200 hover:border-emerald-400"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Analytics</h4>
              <p className="text-slate-600 text-sm mb-4">View protocol statistics</p>
              <div className="flex items-center text-emerald-600 font-medium group-hover:gap-2 transition-all">
                <span>See Analytics</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            Built on Stacks • Powered by Bitcoin • Secured by Smart Contracts
          </p>
        </div>
      </footer>
    </div>
  )
}

function Stat({ label, value, valuePrefix = '', suffix = '', sub, integer = false }: { label: string; value: number; valuePrefix?: string; suffix?: string; sub?: string; integer?: boolean }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame: number
    const duration = 800
    const start = performance.now()
    const from = 0
    const to = value
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value])

  const formatted = integer ? Math.round(display).toLocaleString() : display.toFixed(2)

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 p-5 text-left">
      <div className="text-sm text-slate-600 mb-1">{label}</div>
      <div className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
        {valuePrefix}{formatted}{suffix}
      </div>
      {sub && <div className="text-slate-500 text-sm mt-1">{sub}</div>}
    </div>
  )
}