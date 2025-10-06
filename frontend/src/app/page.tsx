'use client'

import { useState } from 'react'
import ConnectWallet from '@/components/ConnectWallet'
import { Dashboard } from '@/components/Dashboard'
import { Marketplace } from '@/components/Marketplace'
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  ShoppingCart,
  Wallet
} from 'lucide-react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'marketplace'>('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bitcoin-gradient rounded-lg flex items-center justify-center">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Bitcoin Liquidity Bonds on{' '}
            <span className="stacks-gradient bg-clip-text text-transparent">Stacks</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Lock sBTC for 30, 90, or 180 days and earn guaranteed yields. 
            Trade your bond NFTs on our secondary marketplace.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bond-card p-6">
              <div className="w-12 h-12 bitcoin-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Guaranteed Yields</h3>
              <p className="text-slate-600">5% APY (30d), 8% APY (90d), 12% APY (180d)</p>
            </div>
            
            <div className="bond-card p-6">
              <div className="w-12 h-12 stacks-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tradeable NFTs</h3>
              <p className="text-slate-600">Each bond is represented by a unique NFT</p>
            </div>
            
            <div className="bond-card p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
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
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-8 max-w-md mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'dashboard' | 'marketplace')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'marketplace' && <Marketplace />}
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