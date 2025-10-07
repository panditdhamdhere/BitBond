'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

/**
 * Auth Context Type Definition
 */
interface AuthContextType {
  isConnected: boolean
  address: string | null
  btcAddress: string | null
  network: 'mainnet' | 'testnet' | null
  balance: {
    stx: number
    sbtc: number
  }
  isConnecting: boolean
  isLoadingBalance: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  getBalance: () => Promise<void>
  switchNetwork: (network: 'mainnet' | 'testnet') => void
  refreshBalances: () => Promise<void>
}

/**
 * Create Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Auth Provider Component
 * Wraps the entire app to provide wallet connection state
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use Auth Context
 * Ensures the hook is used within AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  
  return context
}

