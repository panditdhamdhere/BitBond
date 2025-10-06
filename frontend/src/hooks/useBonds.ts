'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bond, UserPortfolio, LoadingState } from '../utils/types'
import { stacksClient } from '../utils/stacksClient'
import { calculateYield, calculateTotalPayout, isBondMatured } from '../utils/bondCalculations'

export function useBonds(userAddress?: string) {
  const [bonds, setBonds] = useState<Bond[]>([])
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null)
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false })
  const [currentBlockHeight, setCurrentBlockHeight] = useState(0)

  // Fetch current block height
  const fetchBlockHeight = useCallback(async () => {
    try {
      // This would typically come from a blockchain API
      // For now, we'll use a mock value
      setCurrentBlockHeight(1000000)
    } catch (error) {
      console.error('Failed to fetch block height:', error)
    }
  }, [])

  // Fetch user's bonds
  const fetchBonds = useCallback(async () => {
    if (!userAddress) return

    setLoading({ isLoading: true })
    try {
      // In a real implementation, you would:
      // 1. Query the contract for all bonds owned by the user
      // 2. Fetch bond details for each bond ID
      // 3. Calculate additional data like yield, maturity status, etc.

      const mockBonds: Bond[] = [
        {
          id: 1,
          owner: userAddress,
          amount: 1000000, // 0.01 sBTC
          lockPeriod: 30,
          createdAt: 999000,
          maturityDate: 1000320,
          apy: 5,
          status: 'active',
          yield: calculateYield(1000000, 30),
        },
        {
          id: 2,
          owner: userAddress,
          amount: 5000000, // 0.05 sBTC
          lockPeriod: 90,
          createdAt: 998000,
          maturityDate: 1001360,
          apy: 8,
          status: 'active',
          yield: calculateYield(5000000, 90),
        },
      ]

      setBonds(mockBonds)
      setLoading({ isLoading: false })
    } catch (error) {
      setLoading({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch bonds' 
      })
    }
  }, [userAddress])

  // Calculate portfolio summary
  const calculatePortfolio = useCallback((bonds: Bond[]): UserPortfolio => {
    const activeBonds = bonds.filter(bond => bond.status === 'active')
    const maturedBonds = bonds.filter(bond => 
      bond.status === 'active' && isBondMatured(bond, currentBlockHeight)
    )

    const totalValue = bonds.reduce((sum, bond) => {
      if (bond.status === 'active') {
        return sum + (isBondMatured(bond, currentBlockHeight) 
          ? calculateTotalPayout(bond) 
          : bond.amount)
      }
      return sum
    }, 0)

    const totalYield = bonds.reduce((sum, bond) => {
      if (bond.status === 'active' && isBondMatured(bond, currentBlockHeight)) {
        return sum + calculateYield(bond.amount, bond.lockPeriod as any)
      }
      return sum
    }, 0)

    return {
      bonds,
      totalValue,
      totalYield,
      activeBonds: activeBonds.length,
      maturedBonds: maturedBonds.length,
    }
  }, [currentBlockHeight])

  // Update portfolio when bonds change
  useEffect(() => {
    if (bonds.length > 0) {
      setPortfolio(calculatePortfolio(bonds))
    }
  }, [bonds, calculatePortfolio])

  // Fetch bonds when user address changes
  useEffect(() => {
    if (userAddress) {
      fetchBonds()
      fetchBlockHeight()
    }
  }, [userAddress, fetchBonds, fetchBlockHeight])

  // Refresh bonds
  const refreshBonds = useCallback(() => {
    fetchBonds()
    fetchBlockHeight()
  }, [fetchBonds, fetchBlockHeight])

  // Get bond by ID
  const getBond = useCallback((bondId: number): Bond | undefined => {
    return bonds.find(bond => bond.id === bondId)
  }, [bonds])

  // Get active bonds
  const getActiveBonds = useCallback((): Bond[] => {
    return bonds.filter(bond => bond.status === 'active')
  }, [bonds])

  // Get matured bonds
  const getMaturedBonds = useCallback((): Bond[] => {
    return bonds.filter(bond => 
      bond.status === 'active' && isBondMatured(bond, currentBlockHeight)
    )
  }, [bonds, currentBlockHeight])

  return {
    bonds,
    portfolio,
    loading,
    currentBlockHeight,
    refreshBonds,
    getBond,
    getActiveBonds,
    getMaturedBonds,
  }
}
