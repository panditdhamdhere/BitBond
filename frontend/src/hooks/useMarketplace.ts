'use client'

import { useState, useEffect, useCallback } from 'react'
import { BondListing, MarketplaceStats, LoadingState } from '../utils/types'
import { stacksClient } from '../utils/stacksClient'
import { UI_CONFIG } from '../utils/constants'

export function useMarketplace() {
  const [listings, setListings] = useState<BondListing[]>([])
  const [stats, setStats] = useState<MarketplaceStats | null>(null)
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Fetch marketplace listings
  const fetchListings = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setLoading({ isLoading: true })
    try {
      // In a real implementation, you would:
      // 1. Query the contract for all active listings
      // 2. Fetch bond details for each listing
      // 3. Apply pagination

      const mockListings: BondListing[] = [
        {
          id: 1,
          seller: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          price: 1000000, // 1 STX
          listedAt: 1000000,
          bond: {
            id: 1,
            owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            amount: 1000000,
            lockPeriod: 30,
            createdAt: 999000,
            maturityDate: 1000320,
            apy: 5,
            status: 'active',
          }
        },
        {
          id: 2,
          seller: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
          price: 5000000, // 5 STX
          listedAt: 1000001,
          bond: {
            id: 2,
            owner: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
            amount: 5000000,
            lockPeriod: 90,
            createdAt: 998000,
            maturityDate: 1001360,
            apy: 8,
            status: 'active',
          }
        },
      ]

      if (append) {
        setListings(prev => [...prev, ...mockListings])
      } else {
        setListings(mockListings)
      }

      setHasMore(mockListings.length === UI_CONFIG.itemsPerPage)
      setLoading({ isLoading: false })
    } catch (error) {
      setLoading({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch listings' 
      })
    }
  }, [])

  // Fetch marketplace statistics
  const fetchStats = useCallback(async () => {
    try {
      const result = await stacksClient.getMarketplaceStats()
      
      if (result) {
        setStats({
          totalVolume: result.totalVolume || 0,
          totalFees: result.totalFees || 0,
          totalListings: result.totalListings || 0,
          activeBonds: result.activeBonds || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch marketplace stats:', error)
    }
  }, [])

  // Load more listings
  const loadMore = useCallback(() => {
    if (!loading.isLoading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchListings(nextPage, true)
    }
  }, [page, hasMore, loading.isLoading, fetchListings])

  // Refresh listings
  const refreshListings = useCallback(() => {
    setPage(1)
    setListings([])
    fetchListings(1, false)
    fetchStats()
  }, [fetchListings, fetchStats])

  // Get listing by bond ID
  const getListing = useCallback((bondId: number): BondListing | undefined => {
    return listings.find(listing => listing.id === bondId)
  }, [listings])

  // Filter listings by lock period
  const getListingsByPeriod = useCallback((lockPeriod: number): BondListing[] => {
    return listings.filter(listing => listing.bond.lockPeriod === lockPeriod)
  }, [listings])

  // Filter listings by price range
  const getListingsByPriceRange = useCallback((minPrice: number, maxPrice: number): BondListing[] => {
    return listings.filter(listing => 
      listing.price >= minPrice && listing.price <= maxPrice
    )
  }, [listings])

  // Sort listings
  const sortListings = useCallback((sortBy: 'price' | 'maturity' | 'yield' | 'discount', order: 'asc' | 'desc' = 'asc') => {
    const sorted = [...listings].sort((a, b) => {
      let aValue: number, bValue: number

      switch (sortBy) {
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'maturity':
          aValue = a.bond.maturityDate
          bValue = b.bond.maturityDate
          break
        case 'yield':
          aValue = a.bond.apy
          bValue = b.bond.apy
          break
        case 'discount':
          // Calculate discount percentage for sorting
          aValue = ((a.bond.currentValue || a.bond.amount) - a.price) / (a.bond.currentValue || a.bond.amount) * 100
          bValue = ((b.bond.currentValue || b.bond.amount) - b.price) / (b.bond.currentValue || b.bond.amount) * 100
          break
        default:
          return 0
      }

      return order === 'asc' ? aValue - bValue : bValue - aValue
    })

    setListings(sorted)
  }, [listings])

  // Initial load
  useEffect(() => {
    fetchListings(1, false)
    fetchStats()
  }, [fetchListings, fetchStats])

  return {
    listings,
    stats,
    loading,
    page,
    hasMore,
    loadMore,
    refreshListings,
    getListing,
    getListingsByPeriod,
    getListingsByPriceRange,
    sortListings,
  }
}
