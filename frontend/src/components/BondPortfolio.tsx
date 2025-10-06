'use client'

import { useState, useEffect } from 'react'
import { 
  Grid, 
  List, 
  Filter, 
  RefreshCw, 
  TrendingUp,
  Clock,
  Shield,
  DollarSign,
  Plus,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Calendar,
  Coins,
  BarChart3
} from 'lucide-react'
import { BondCard } from './BondCard'
import { useBonds } from '../hooks/useBonds'
import { useAuth } from '../hooks/useAuth'
import { useContract } from '../hooks/useContract'
import { Bond } from '../utils/types'
import { formatSBTC, calculateTotalPayout, calculateEarlyExitRefund } from '../utils/bondCalculations'
import toast from 'react-hot-toast'

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'active' | 'matured' | 'withdrawn' | 'early-exit'
type SortType = 'created' | 'maturity' | 'amount' | 'yield'

interface PortfolioStats {
  totalLocked: number
  totalEarned: number
  activeBonds: number
  maturedBonds: number
  totalValue: number
  totalYield: number
}

interface EarlyExitModal {
  isOpen: boolean
  bond: Bond | null
}

export function BondPortfolio() {
  const { address, isConnected } = useAuth()
  const { 
    bonds, 
    portfolio, 
    loading, 
    currentBlockHeight, 
    refreshBonds,
    getActiveBonds,
    getMaturedBonds 
  } = useBonds(address)
  
  const { withdrawBond, earlyExitBond } = useContract()
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('created')
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [earlyExitModal, setEarlyExitModal] = useState<EarlyExitModal>({
    isOpen: false,
    bond: null
  })

  // Calculate portfolio stats
  const portfolioStats: PortfolioStats = {
    totalLocked: bonds.reduce((sum, bond) => sum + bond.amount, 0),
    totalEarned: bonds.reduce((sum, bond) => {
      if (bond.status === 'matured' || bond.status === 'withdrawn') {
        return sum + (calculateTotalPayout(bond) - bond.amount)
      }
      return sum
    }, 0),
    activeBonds: getActiveBonds().length,
    maturedBonds: getMaturedBonds().length,
    totalValue: bonds.reduce((sum, bond) => sum + calculateTotalPayout(bond), 0),
    totalYield: bonds.reduce((sum, bond) => sum + (calculateTotalPayout(bond) - bond.amount), 0)
  }

  const handleWithdraw = async (bondId: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsProcessing(bondId)
    try {
      const result = await withdrawBond(bondId)
      
      if (result.success) {
        toast.success('Bond withdrawn successfully!')
        await refreshBonds()
      } else {
        toast.error(result.error || 'Failed to withdraw bond')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Withdraw error:', error)
    } finally {
      setIsProcessing(null)
    }
  }

  const handleEarlyExit = async (bondId: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    const bond = bonds.find(b => b.id === bondId)
    if (!bond) return

    setEarlyExitModal({ isOpen: true, bond })
  }

  const confirmEarlyExit = async () => {
    if (!earlyExitModal.bond) return

    const bondId = earlyExitModal.bond.id
    setIsProcessing(bondId)
    setEarlyExitModal({ isOpen: false, bond: null })

    try {
      const result = await earlyExitBond(bondId)
      
      if (result.success) {
        toast.success('Early exit completed successfully!')
        await refreshBonds()
      } else {
        toast.error(result.error || 'Failed to exit early')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Early exit error:', error)
    } finally {
      setIsProcessing(null)
    }
  }

  const handleList = (bondId: number) => {
    console.log('List bond:', bondId)
    // This would open a modal to list the bond on marketplace
    toast.info('Marketplace listing feature coming soon!')
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
        case 'yield':
          return (calculateTotalPayout(b) - b.amount) - (calculateTotalPayout(a) - a.amount)
        default:
          return 0
      }
    })
  }

  const filteredBonds = getFilteredBonds()

  // Loading skeleton
  if (loading.isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        {/* Portfolio Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                  <div className="h-6 bg-slate-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bonds Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (loading.error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Bonds</h3>
        <p className="text-slate-600 mb-4">{loading.error}</p>
        <button
          onClick={refreshBonds}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    )
  }

  // Empty state
  if (bonds.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">No Bonds Yet</h3>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Start your Bitcoin liquidity bond journey by creating your first bond. 
          Lock sBTC and earn guaranteed yields!
        </p>
        <button
          onClick={() => {
            // This would scroll to the CreateBond component or switch tabs
            toast.info('Navigate to Create Bond section')
          }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>Create Your First Bond</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-600 font-medium">Total Locked</div>
              <div className="text-xl font-bold text-slate-900">
                {formatSBTC(portfolioStats.totalLocked)} sBTC
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-600 font-medium">Total Earned</div>
              <div className="text-xl font-bold text-green-600">
                +{formatSBTC(portfolioStats.totalEarned)} sBTC
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-600 font-medium">Active Bonds</div>
              <div className="text-xl font-bold text-slate-900">
                {portfolioStats.activeBonds}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-600 font-medium">Matured Bonds</div>
              <div className="text-xl font-bold text-slate-900">
                {portfolioStats.maturedBonds}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 bg-white rounded-xl shadow-lg border border-slate-200 p-4">
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
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
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
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          >
            <option value="created">Sort by Created</option>
            <option value="maturity">Sort by Maturity</option>
            <option value="amount">Sort by Amount</option>
            <option value="yield">Sort by Yield</option>
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
        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-slate-200">
          <Filter className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No bonds found</h3>
          <p className="text-slate-600">
            {filter === 'all' 
              ? "You haven't created any bonds yet."
              : `No bonds match the "${filter}" filter.`
            }
          </p>
        </div>
      ) : (
        <div role={viewMode === 'grid' ? 'grid' : 'list'} className={
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
              isProcessing={isProcessing === bond.id}
            />
          ))}
        </div>
      )}

      {/* Early Exit Confirmation Modal */}
      {earlyExitModal.isOpen && earlyExitModal.bond && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Early Exit Warning</h3>
                <p className="text-sm text-slate-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-600 mb-2">Bond Details:</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Principal:</span>
                    <span className="font-medium">{formatSBTC(earlyExitModal.bond.amount)} sBTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refund Amount:</span>
                    <span className="font-medium text-green-600">
                      {formatSBTC(calculateEarlyExitRefund(earlyExitModal.bond))} sBTC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penalty (10%):</span>
                    <span className="font-medium text-red-600">
                      -{formatSBTC(earlyExitModal.bond.amount * 0.1)} sBTC
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> You will lose 10% of your principal and forfeit all potential yield.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setEarlyExitModal({ isOpen: false, bond: null })}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEarlyExit}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Confirm Early Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}