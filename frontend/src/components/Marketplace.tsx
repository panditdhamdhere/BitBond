'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  RefreshCw,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react'
import { useMarketplace } from '../hooks/useMarketplace'
import { BondListing } from '../utils/types'
import { formatSBTC, formatSTX } from '../utils/bondCalculations'

export function Marketplace() {
  const { 
    listings, 
    stats, 
    loading, 
    hasMore, 
    loadMore,
    refreshListings,
    getListingsByPeriod,
    getListingsByPriceRange,
    sortListings 
  } = useMarketplace()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeriod, setFilterPeriod] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'price' | 'maturity' | 'yield'>('price')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleBuyBond = (listing: BondListing) => {
    console.log('Buy bond:', listing)
    // Implement buy logic
  }

  const getFilteredListings = (): BondListing[] => {
    let filtered = listings

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.bond.id.toString().includes(searchTerm) ||
        listing.seller.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply period filter
    if (filterPeriod !== 'all') {
      const period = parseInt(filterPeriod)
      filtered = getListingsByPeriod(period)
    }

    // Apply sorting
    sortListings(sortBy, sortOrder)

    return filtered
  }

  const filteredListings = getFilteredListings()

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
      {/* Marketplace Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bond-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Total Volume</div>
                <div className="text-lg font-semibold text-slate-900">
                  {formatSTX(stats.totalVolume)} STX
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
                <div className="text-sm text-slate-600">Total Fees</div>
                <div className="text-lg font-semibold text-slate-900">
                  {formatSTX(stats.totalFees)} STX
                </div>
              </div>
            </div>
          </div>

          <div className="bond-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Active Listings</div>
                <div className="text-lg font-semibold text-slate-900">
                  {stats.totalListings}
                </div>
              </div>
            </div>
          </div>

          <div className="bond-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Active Bonds</div>
                <div className="text-lg font-semibold text-slate-900">
                  {stats.activeBonds}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search bonds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
            />
          </div>

          {/* Period Filter */}
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Periods</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="180">180 Days</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field as any)
              setSortOrder(order as any)
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="maturity-asc">Maturity: Soonest</option>
            <option value="maturity-desc">Maturity: Latest</option>
            <option value="yield-asc">Yield: Low to High</option>
            <option value="yield-desc">Yield: High to Low</option>
          </select>
        </div>

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

          <button
            onClick={refreshListings}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Listings Grid/List */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No bonds found</h3>
          <p className="text-slate-600">
            {searchTerm || filterPeriod !== 'all'
              ? 'No bonds match your current filters. Try adjusting your search criteria.'
              : 'No bonds are currently listed for sale. Check back later!'
            }
          </p>
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bond-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Bond #{listing.bond.id}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {listing.bond.lockPeriod} days • {listing.bond.apy}% APY
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">
                      {formatSTX(listing.price)} STX
                    </div>
                    <div className="text-sm text-slate-600">
                      {formatSBTC(listing.bond.amount)} sBTC
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Principal:</span>
                    <span className="font-medium">{formatSBTC(listing.bond.amount)} sBTC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Expected Yield:</span>
                    <span className="font-medium text-green-600">
                      {formatSBTC(listing.bond.yield || 0)} sBTC
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Seller:</span>
                    <span className="font-medium">
                      {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyBond(listing)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                >
                  Buy Bond
                </button>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading.isLoading}
                className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {loading.isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
