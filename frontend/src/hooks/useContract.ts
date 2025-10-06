'use client'

import { useState, useCallback } from 'react'
import { ContractCallResult, CreateBondParams, ListBondParams, BuyBondParams } from '../utils/types'
import { stacksClient } from '../utils/stacksClient'

export function useContract() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeContractCall = useCallback(async <T>(
    contractCall: () => Promise<ContractCallResult>,
    successMessage?: string
  ): Promise<ContractCallResult> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await contractCall()
      
      if (result.success) {
        if (successMessage) {
          console.log(successMessage)
        }
      } else {
        setError(result.error || 'Contract call failed')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Bond operations
  const createBond = useCallback(async (params: CreateBondParams): Promise<ContractCallResult> => {
    return executeContractCall(
      () => stacksClient.createBond(params),
      'Bond created successfully'
    )
  }, [executeContractCall])

  const withdrawBond = useCallback(async (bondId: number): Promise<ContractCallResult> => {
    return executeContractCall(
      () => stacksClient.withdrawBond(bondId),
      'Bond withdrawn successfully'
    )
  }, [executeContractCall])

  const earlyExitBond = useCallback(async (bondId: number): Promise<ContractCallResult> => {
    return executeContractCall(
      () => stacksClient.earlyExitBond(bondId),
      'Bond early exit completed'
    )
  }, [executeContractCall])

  // Marketplace operations
  const listBond = useCallback(async (params: ListBondParams): Promise<ContractCallResult> => {
    return executeContractCall(
      () => stacksClient.listBond(params),
      'Bond listed for sale'
    )
  }, [executeContractCall])

  const buyBond = useCallback(async (params: BuyBondParams): Promise<ContractCallResult> => {
    return executeContractCall(
      () => stacksClient.buyBond(params),
      'Bond purchased successfully'
    )
  }, [executeContractCall])

  const cancelListing = useCallback(async (bondId: number): Promise<ContractCallResult> => {
    return executeContractCall(
      () => stacksClient.cancelListing(bondId),
      'Listing cancelled'
    )
  }, [executeContractCall])

  // Read operations
  const getBondInfo = useCallback(async (bondId: number) => {
    try {
      return await stacksClient.getBondInfo(bondId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bond info')
      return null
    }
  }, [])

  const getListing = useCallback(async (bondId: number) => {
    try {
      return await stacksClient.getListing(bondId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listing')
      return null
    }
  }, [])

  const getMarketplaceStats = useCallback(async () => {
    try {
      return await stacksClient.getMarketplaceStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch marketplace stats')
      return null
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    clearError,
    createBond,
    withdrawBond,
    earlyExitBond,
    listBond,
    buyBond,
    cancelListing,
    getBondInfo,
    getListing,
    getMarketplaceStats,
  }
}
