'use client'

import { useState, useEffect, useCallback } from 'react'
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect'
import toast from 'react-hot-toast'

/**
 * Custom hook for BitBond wallet connection using @stacks/connect v8
 * 
 * CRITICAL: This hook uses browser APIs and must be used in Client Components only.
 * 
 * @returns Wallet state and connection functions
 */
export function useAuth() {
  // State management
  const [address, setAddress] = useState<string | null>(null)
  const [btcAddress, setBtcAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet')
  const [connected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState({ stx: 0, sbtc: 0 })
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Check if already connected on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (isConnected()) {
          const data = getLocalStorage()
          console.log('Cached wallet data:', data)
          
          // Try different formats for cached data
          let stxAddr = null
          let btcAddr = null
          
          // Format 1: Array format (Leather wallet)
          if (data?.addresses && Array.isArray(data.addresses)) {
            const stxAddress = data.addresses.find((addr: { type: string; address: string }) => addr.type === 'stx')
            const btcAddress = data.addresses.find((addr: { type: string; address: string }) => addr.type === 'btc')
            stxAddr = stxAddress?.address
            btcAddr = btcAddress?.address || null
          }
          // Format 2: Nested format (Hiro wallet)
          else if (data?.addresses?.stx?.[0]?.address) {
            stxAddr = data.addresses.stx[0].address
            btcAddr = data.addresses.btc?.[0]?.address || null
          }
          
          const net = 'testnet' // Default to testnet for development
          
          if (stxAddr) {
            
            setAddress(stxAddr)
            setBtcAddress(btcAddr)
            setNetwork(net)
            setIsConnected(true)
            console.log('Restored connection:', { stxAddr, btcAddr, net })
          }
        }
      } catch (err) {
        console.error('Error checking connection:', err)
      }
    }
  }, [])

  /**
   * Fetch STX and sBTC balances from Hiro API
   */
  const getBalance = useCallback(async () => {
    if (!address || !connected) return

    setIsLoadingBalance(true)
    try {
      const baseUrl = network === 'mainnet' 
        ? 'https://api.hiro.so' 
        : 'https://api.testnet.hiro.so'
      
      const response = await fetch(
        `${baseUrl}/extended/v1/address/${address}/balances`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch balances')
      }

      const data = await response.json()
      
      // Extract STX balance (in microSTX, convert to STX)
      const stxBalance = Number(data?.stx?.balance || 0) / 1_000_000
      
      // Extract sBTC balance from fungible tokens
      const tokens = data?.fungible_tokens || {}
      const sbtcKey = Object.keys(tokens).find(k => 
        k.toLowerCase().includes('sbtc')
      )
      const sbtcBalance = sbtcKey 
        ? Number(tokens[sbtcKey]?.balance || 0) / 100_000_000 
        : 0

      setBalance({ stx: stxBalance, sbtc: sbtcBalance })
      console.log('Balances fetched:', { stx: stxBalance, sbtc: sbtcBalance })
    } catch (err) {
      console.error('Error fetching balances:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch balances')
    } finally {
      setIsLoadingBalance(false)
    }
  }, [address, network, connected])

  /**
   * Auto-fetch balances when connected
   */
  useEffect(() => {
    if (connected && address) {
      getBalance()
    } else {
      setBalance({ stx: 0, sbtc: 0 })
    }
  }, [connected, address, getBalance])

  /**
   * Connect wallet using @stacks/connect v8
   */
  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      console.log('Initiating wallet connection...')
      
      const response = await connect()
      
      console.log('Connection successful:', response)
      
      // Extract addresses from response
      const responseData = response as { address?: string; addresses?: { stx?: Array<{ address: string }>; btc?: Array<{ address: string }> } | Array<{ address?: string }> }
      console.log('Full response data:', responseData)
      console.log('Addresses structure:', responseData.addresses)
      
      // Try different response formats for different wallets
      let stxAddr = null
      let btcAddr = null
      
      // Format 1: Direct addresses array (Leather wallet)
      if (responseData.addresses && Array.isArray(responseData.addresses)) {
        console.log('Detected array format (Leather wallet)')
        // Some wallets return an array of address objects with varying keys.
        // We'll pick the first entry whose address looks like a Stacks address (SP... for mainnet, ST... for testnet).
        try {
          const addressesArray = responseData.addresses as Array<{ address?: string }>
          const stacksCandidate = addressesArray.find((entry: { address?: string }) => {
            const addr = entry?.address as string | undefined
            return typeof addr === 'string' && /^(SP|ST)[A-Z0-9]/i.test(addr)
          })
          const btcCandidate = addressesArray.find((entry: { address?: string }) => {
            const addr = entry?.address as string | undefined
            return typeof addr === 'string' && /^(bc1|1|3)[a-zA-HJ-NP-Z0-9]/i.test(addr)
          })

          stxAddr = stacksCandidate?.address || null
          btcAddr = btcCandidate?.address || null
        } catch (e) {
          console.warn('Failed to parse array format addresses:', e)
        }
      }
      // Format 2: Nested structure (Hiro wallet)
      else if (responseData.addresses?.stx?.[0]?.address) {
        console.log('Detected nested format (Hiro wallet)')
        stxAddr = responseData.addresses.stx[0].address
        btcAddr = responseData.addresses.btc?.[0]?.address || null
      }
      // Format 3: Direct address property
      else if (responseData.address) {
        console.log('Detected direct address format')
        stxAddr = responseData.address
      }
      
      const net = 'testnet' // Default to testnet for development
      
      console.log('Extracted addresses:', { stxAddr, btcAddr, net })
      
      if (stxAddr) {
        console.log('Setting connected state with address:', stxAddr)
        setAddress(stxAddr)
        setBtcAddress(btcAddr)
        setNetwork(net)
        setIsConnected(true)
        
        // Trigger balance fetch
        setTimeout(() => {
          getBalance()
        }, 500)
        
        toast.success('Wallet connected successfully!', { id: 'wallet-connected', duration: 3000 })
      } else {
        console.error('No STX address found in response')
        console.error('Available response keys:', Object.keys(responseData))
        setError('No STX address found in wallet response')
      }
      
      console.log('Connect response:', response)
    } catch (error) {
      console.error('Connection failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to connect wallet')
      toast.error('Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  /**
   * Disconnect wallet and clear state
   */
  const disconnectWallet = () => {
    try {
      console.log('Disconnecting wallet...')
      
      disconnect()
      
      // Clear local state
      setAddress(null)
      setBtcAddress(null)
      setIsConnected(false)
      setBalance({ stx: 0, sbtc: 0 })
      setError(null)
      
      console.log('Wallet disconnected')
      toast.success('Wallet disconnected')
    } catch (err) {
      console.error('Error disconnecting:', err)
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    }
  }

  /**
   * Switch network (for testing purposes)
   */
  const switchNetwork = useCallback((newNetwork: 'mainnet' | 'testnet') => {
    setNetwork(newNetwork)
    // Trigger balance refresh after network switch
    setTimeout(() => {
      getBalance()
    }, 100)
  }, [getBalance])

  return {
    // State
    isConnected: connected,
    address,
    btcAddress,
    network,
    balance,
    isConnecting,
    isLoadingBalance,
    error,
    
    // Functions
    connect: connectWallet,
    disconnect: disconnectWallet,
    getBalance,
    switchNetwork,
    refreshBalances: getBalance,
  }
}