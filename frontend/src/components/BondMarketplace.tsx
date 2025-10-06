'use client'

import { useMemo, useState } from 'react'
import { Grid, List, RefreshCw, TrendingUp } from 'lucide-react'
import { useMarketplace } from '../hooks/useMarketplace'
import { BondListing } from '../utils/types'
import { formatSBTC, formatSTX, getTimeRemaining, calculateTotalPayout } from '../utils/bondCalculations'
import BuyBondModal from './BuyBondModal'
import toast from 'react-hot-toast'

export default function BondMarketplace() {
  const { listings, loading, hasMore, loadMore, refreshListings } = useMarketplace()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterPeriod, setFilterPeriod] = useState<'all' | 30 | 90 | 180>('all')
  const [filterDiscount, setFilterDiscount] = useState<'all' | 'gt5' | 'gt10' | 'gt20'>('all')
  const [filterMaturity, setFilterMaturity] = useState<'all' | 'lt7' | 'lt30' | 'gt30'>('all')
  const [sortBy, setSortBy] = useState<'price' | 'discount' | 'maturity' | 'yield'>('discount')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedListing, setSelectedListing] = useState<BondListing | null>(null)
  const [isBuying, setIsBuying] = useState(false)

  const enriched = useMemo(() => {
    return listings.map((l) => {
      const daysTotal = l.bond.lockPeriod
      const time = getTimeRemaining(l.bond, l.currentBlockHeight || 0)
      const daysElapsed = Math.max(daysTotal - time.days - (time.hours > 0 ? 1 : 0), 0)
      const intrinsic = l.bond.amount + Math.floor(l.bond.amount * (l.bond.apy / 100) * (daysElapsed / daysTotal))
      const discount = intrinsic > 0 ? ((intrinsic - l.price) / intrinsic) * 100 : 0
      return { ...l, intrinsic, discount }
    })
  }, [listings])

  const filtered = useMemo(() => {
    return enriched
      .filter(l => filterPeriod === 'all' ? true : l.bond.lockPeriod === filterPeriod)
      .filter(l => {
        if (filterDiscount === 'all') return true
        if (filterDiscount === 'gt5') return l.discount >= 5
        if (filterDiscount === 'gt10') return l.discount >= 10
        return l.discount >= 20
      })
      .filter(l => {
        if (filterMaturity === 'all') return true
        const { days } = getTimeRemaining(l.bond, l.currentBlockHeight || 0)
        if (filterMaturity === 'lt7') return days < 7
        if (filterMaturity === 'lt30') return days < 30
        return days >= 30
      })
  }, [enriched, filterPeriod, filterDiscount, filterMaturity])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const dir = sortOrder === 'asc' ? 1 : -1
      if (sortBy === 'price') return dir * (a.price - b.price)
      if (sortBy === 'maturity') return dir * (a.bond.maturityDate - b.bond.maturityDate)
      if (sortBy === 'yield') return dir * ((calculateTotalPayout(a.bond) - a.bond.amount) - (calculateTotalPayout(b.bond) - b.bond.amount))
      return dir * (a.discount - b.discount)
    })
    return copy
  }, [filtered, sortBy, sortOrder])

  const totals = useMemo(() => {
    const totalListings = enriched.length
    const totalVolume = enriched.reduce((s, l) => s + l.price, 0)
    const avgDiscount = enriched.length ? enriched.reduce((s, l) => s + l.discount, 0) / enriched.length : 0
    return { totalListings, totalVolume, avgDiscount }
  }, [enriched])

  const onBuy = async (listingId: number) => {
    const listing = listings.find(l => l.id === listingId)
    if (!listing) {
      toast.error('Listing no longer available')
      refreshListings()
      return
    }
    try {
      setIsBuying(true)
      await new Promise(r => setTimeout(r, 1200))
      toast.success('Purchase successful! 🎉')
      refreshListings()
    } catch (_e) {
      toast.error('Purchase failed')
    } finally {
      setIsBuying(false)
      setSelectedListing(null)
    }
  }

  if (loading.isLoading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
          <span className="text-slate-600">Loading marketplace...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="text-sm text-slate-600">Total Bonds Listed</div>
          <div className="text-2xl font-bold text-slate-900">{totals.totalListings}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="text-sm text-slate-600">Total Trading Volume</div>
          <div className="text-2xl font-bold text-slate-900">{formatSTX(totals.totalVolume)} STX</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="text-sm text-slate-600">Average Discount</div>
          <div className="text-2xl font-bold text-green-600">{totals.avgDiscount.toFixed(1)}%</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}>
              <List className="w-4 h-4" />
            </button>
          </div>

          <select
            value={filterPeriod}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const v = e.target.value
              setFilterPeriod(v === 'all' ? 'all' : (Number(v) as 30 | 90 | 180))
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="all">All Periods</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="180">180 Days</option>
          </select>

          <select
            value={filterDiscount}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const v = e.target.value as 'all' | 'gt5' | 'gt10' | 'gt20'
              setFilterDiscount(v)
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="all">Any Discount</option>
            <option value="gt5">≥ 5%</option>
            <option value="gt10">≥ 10%</option>
            <option value="gt20">≥ 20%</option>
          </select>

          <select
            value={filterMaturity}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const v = e.target.value as 'all' | 'lt7' | 'lt30' | 'gt30'
              setFilterMaturity(v)
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="all">Any Maturity</option>
            <option value="lt7">&lt; 7 days</option>
            <option value="lt30">&lt; 30 days</option>
            <option value="gt30">≥ 30 days</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const [f, o] = e.target.value.split('-')
              setSortBy(f as 'price' | 'discount' | 'maturity' | 'yield')
              setSortOrder(o as 'asc' | 'desc')
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="discount-desc">Best Discount</option>
            <option value="discount-asc">Worst Discount</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="maturity-asc">Maturity: Soonest</option>
            <option value="maturity-desc">Maturity: Latest</option>
            <option value="yield-desc">Yield: High to Low</option>
            <option value="yield-asc">Yield: Low to High</option>
          </select>
        </div>

        <button onClick={refreshListings} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Listings */}
      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No bonds found</h3>
          <p className="text-slate-600">No bonds match your filters. Try adjusting them.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {sorted.map((l) => {
            const time = getTimeRemaining(l.bond, l.currentBlockHeight || 0)
            const goodDeal = l.discount > 10
            return (
              <div key={l.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 relative">
                {goodDeal && (
                  <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                    Good Deal
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-slate-600">Bond #{l.bond.id} • {l.bond.lockPeriod}d • {l.bond.apy}% APY</div>
                    <div className="text-lg font-bold text-slate-900">{formatSBTC(l.bond.amount)} sBTC</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">{formatSTX(l.price)} STX</div>
                    <div className="text-sm text-green-600">{l.discount.toFixed(1)}% discount</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="text-slate-600">Intrinsic Value</div>
                  <div className="font-medium">{formatSTX(l.intrinsic)} STX</div>
                  <div className="text-slate-600">Time Remaining</div>
                  <div className="font-medium">{time.days}d {time.hours}h</div>
                  <div className="text-slate-600">Seller</div>
                  <div className="font-medium">{l.seller.slice(0,6)}...{l.seller.slice(-4)}</div>
                </div>
                <button onClick={() => setSelectedListing(l)} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200">
                  Buy Now
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button onClick={loadMore} disabled={loading.isLoading} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-200 disabled:opacity-50">
            {loading.isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      <BuyBondModal
        isOpen={!!selectedListing}
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onConfirm={onBuy}
        isProcessing={isBuying}
      />
    </div>
  )
}


