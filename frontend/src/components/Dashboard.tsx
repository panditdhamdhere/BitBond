'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Plus, 
  ShoppingCart,
  Activity,
  DollarSign,
  Clock,
  Shield
} from 'lucide-react'
import { BondPortfolio } from './BondPortfolio'
import { CreateBond } from './CreateBond'
import { useAuth } from '../hooks/useAuth'
import { useBonds } from '../hooks/useBonds'
import { formatSBTC } from '../utils/bondCalculations'
import { stacksClient } from '../utils/stacksClient'

export function Dashboard() {
  const { address } = useAuth()
  const { portfolio, currentBlockHeight } = useBonds(address)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'create'>('portfolio')

  const tabs = [
    { id: 'portfolio', label: 'My Portfolio', icon: BarChart3 },
    { id: 'create', label: 'Create Bond', icon: Plus },
  ]

  if (!address) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Wallet</h2>
        <p className="text-slate-600">
          Please connect your wallet to view your bond portfolio and create new bonds.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome to BitBond
        </h1>
        <p className="text-slate-600">
          Manage your Bitcoin liquidity bonds and earn guaranteed yields
        </p>
      </div>

      {/* Quick Stats */}
      {portfolio && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bond-card p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Total Portfolio Value</div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatSBTC(portfolio.totalValue)} sBTC
                </div>
              </div>
            </div>
          </div>

          <div className="bond-card p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Total Yield Earned</div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatSBTC(portfolio.totalYield)} sBTC
                </div>
              </div>
            </div>
          </div>

          <div className="bond-card p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Active Bonds</div>
                <div className="text-2xl font-bold text-slate-900">
                  {portfolio.activeBonds}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
        {activeTab === 'portfolio' && <BondPortfolio />}
        {activeTab === 'create' && <CreateBond />}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bond-card p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Marketplace</h3>
              <p className="text-sm text-slate-600">Buy and sell bonds</p>
            </div>
          </div>
          <p className="text-slate-600 mb-4">
            Trade your bonds on the secondary marketplace or buy bonds from other users.
          </p>
          <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
            Go to Marketplace
          </button>
        </div>

        <div className="bond-card p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Analytics</h3>
              <p className="text-sm text-slate-600">View protocol statistics</p>
            </div>
          </div>
          <p className="text-slate-600 mb-4">
            Track protocol performance, total volume, and market trends.
          </p>
          <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
