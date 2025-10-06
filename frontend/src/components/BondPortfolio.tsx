'use client'

import { useState } from 'react'
import { 
  Grid, 
  List, 
  Filter, 
  RefreshCw, 
  TrendingUp,
  Clock,
  Shield,
  DollarSign
} from 'lucide-react'
import { BondCard } from './BondCard'
import { useBonds } from '../hooks/useBonds'
import { useAuth } from '../hooks/useAuth'
import { Bond } from '../utils/types'
import { formatSBTC } from '../utils/bondCalculations'

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'active' | 'matured' | 'withdrawn' | 'early-exit'

export function BondPortfolio() {
  const { address } = useAuth()
  const { 
    bonds, 
    portfolio, 
    loading, 
    currentBlockHeight, 
    refreshBonds,
    getActiveBonds,
    getMaturedBonds 
  } = useBonds(address)
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<'created' | 'maturity' | 'amount'>('created')

  const handleWithdraw = (bondId: number) => {
    console.log('Withdraw bond:', bondId)
    // Implement withdraw logic
  }

  const handleEarlyExit = (bondId: number) => {
    console.log('Early exit bond:', bondId)
    // Implement early exit logic
  }

  const handleList = (bondId: number) => {
    console.log('List bond:', bondId)
    // Implement list logic
  }

  const getFilteredBonds = (): Bond[] => {
    let filtered = bonds

    // Apply filter
    switch (filter) {
      case 'active':
        filtered = getActiveBonds()
        break
      case 'matured':
        filtered = getMaturedBonds()
        break
      case 'withdrawn':
        filtered = bonds.filter(bond => bond.status === 'withdrawn')
        break
      case 'early-exit':
        filtered = bonds.filter(bond => bond.status === 'early-exit')
        break
      default:
        filtered = bonds
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return b.createdAt - a.createdAt
        case 'maturity':
          return a.maturityDate - b.maturityDate
        case 'amount':
          return b.amount - a.amount
        default:
          return 0
      }
    })
  }

  const filteredBonds = getFilteredBonds()

  if (loading.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
            <span className="text-slate-600">Loading your bonds...</span>
          </div>
        </div>
      </div>
    )
  }

  if (loading.error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Shield className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error loading bonds</p>
          <p className="text-sm">{loading.error}</p>
        </div>
        <button
          onClick={refreshBonds}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      {portfolio && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bond-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Total Bonds</div>
                <div className="text-lg font-semibold text-slate-900">
                  {portfolio.bonds.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bond-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Total Value</div>
                <div className="text-lg font-semibold text-slate-900">
                  {formatSBTC(portfolio.totalValue)} sBTC
                </div>
              </div>
            </div>
          </div>

          <div className="bond-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Total Yield</div>
                <div className="text-lg font-semibold text-slate-900">
                  {formatSBTC(portfolio.totalYield)} sBTC
                </div>
              </div>
            </div>
          </div>

          <div className="bond-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Active Bonds</div>
                <div className="text-lg font-semibold text-slate-900">
                  {portfolio.activeBonds}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Bonds</option>
            <option value="active">Active</option>
            <option value="matured">Matured</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="early-exit">Early Exit</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="created">Sort by Created</option>
            <option value="maturity">Sort by Maturity</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>

        <button
          onClick={refreshBonds}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Bonds Grid/List */}
      {filteredBonds.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No bonds found</h3>
          <p className="text-slate-600">
            {filter === 'all' 
              ? "You haven't created any bonds yet. Create your first bond to start earning yields!"
              : `No bonds match the "${filter}" filter.`
            }
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredBonds.map((bond) => (
            <BondCard
              key={bond.id}
              bond={bond}
              currentBlockHeight={currentBlockHeight}
              onWithdraw={handleWithdraw}
              onEarlyExit={handleEarlyExit}
              onList={handleList}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
