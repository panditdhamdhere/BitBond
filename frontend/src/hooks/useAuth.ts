'use client'

import { useState, useEffect, useCallback } from 'react'
import { useConnect } from '@stacks/connect-react'
import { WalletState, Network } from '../utils/types'

interface Balance {
  stx: number
  sbtc: number
}

export function useAuth() {
  const { isConnected, address, network, disconnect } = useConnect()
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
  })
  const [balance, setBalance] = useState<Balance>({ stx: 0, sbtc: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setWalletState({
      isConnected,
      address: address || undefined,
      network: network?.name as any,
    })
  }, [isConnected, address, network])

  // Fetch balances when connected
  const fetchBalances = useCallback(async () => {
    if (!address || !isConnected) return

    setIsLoadingBalance(true)
    try {
      // Mock balance fetching - in real implementation, you would:
      // 1. Fetch STX balance from Stacks API
      // 2. Fetch sBTC balance from the sBTC contract
      
      const mockBalances = {
        stx: Math.random() * 1000, // Mock STX balance
        sbtc: Math.random() * 10,  // Mock sBTC balance
      }
      
      setBalance(mockBalances)
    } catch (err) {
      console.error('Failed to fetch balances:', err)
    } finally {
      setIsLoadingBalance(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    if (isConnected && address) {
      fetchBalances()
    } else {
      setBalance({ stx: 0, sbtc: 0 })
    }
  }, [isConnected, address, fetchBalances])

  const connect = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // The connection is handled by the Connect component
      // This hook just manages the state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDisconnect = useCallback(() => {
    disconnect()
    setWalletState({
      isConnected: false,
    })
    setBalance({ stx: 0, sbtc: 0 })
    setError(null)
  }, [disconnect])

  const switchNetwork = useCallback((newNetwork: Network) => {
    // In a real implementation, you would switch the network
    // This is handled by the Stacks Connect library
    console.log('Switching to network:', newNetwork)
  }, [])

  return {
    ...walletState,
    balance,
    isLoading,
    isLoadingBalance,
    error,
    connect,
    disconnect: handleDisconnect,
    switchNetwork,
    refreshBalances: fetchBalances,
  }
}
