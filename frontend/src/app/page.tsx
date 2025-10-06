'use client'

import { Suspense, lazy, useEffect, useState } from 'react'
import ConnectWallet from '@/components/ConnectWallet'
const Dashboard = lazy(() => import('@/components/Dashboard').then(m => ({ default: m.Dashboard })))
const Marketplace = lazy(() => import('@/components/Marketplace').then(m => ({ default: m.Marketplace })))
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  ShoppingCart,
  Wallet,
  Bitcoin
} from 'lucide-react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'marketplace'>('dashboard')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-bitcoin-gradient rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                BitBond
              </h1>
            </div>
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
              <div className="w-12 h-12 bg-bitcoin-gradient rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-105">
                <Shield className="w-6 h-6 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Guaranteed Yields</h3>
              <p className="text-slate-600">5% APY (30d), 8% APY (90d), 12% APY (180d)</p>
            </div>
            
            <div className="group bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-orange-200 hover:bg-white/70 hover:ring-1 hover:ring-orange-200/50">
              <div className="w-12 h-12 bg-stacks-gradient rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-105">
                <Wallet className="w-6 h-6 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tradeable NFTs</h3>
              <p className="text-slate-600">Each bond is represented by a unique NFT</p>
            </div>
            
            <div className="group bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-orange-200 hover:bg-white/70 hover:ring-1 hover:ring-orange-200/50">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-105">
                <TrendingUp className="w-6 h-6 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secondary Market</h3>
              <p className="text-slate-600">Buy and sell bonds before maturity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-8 max-w-md mx-auto" role="tablist" aria-label="Primary navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'dashboard' | 'marketplace')}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  style={{ minHeight: 44 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            <Suspense fallback={<div className="grid gap-6 animate-pulse" aria-busy="true" aria-live="polite">
              <div className="h-40 bg-slate-200 rounded-xl" />
              <div className="h-40 bg-slate-200 rounded-xl" />
              <div className="h-40 bg-slate-200 rounded-xl" />
            </div>}>
              {activeTab === 'dashboard' && (
                <div id="panel-dashboard" role="tabpanel" aria-labelledby="dashboard">
                  <Dashboard />
                </div>
              )}
              {activeTab === 'marketplace' && (
                <div id="panel-marketplace" role="tabpanel" aria-labelledby="marketplace">
                  <Marketplace />
                </div>
              )}
            </Suspense>
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