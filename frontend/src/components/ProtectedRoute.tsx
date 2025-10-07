'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '../contexts/AuthContext'
import { Wallet, Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Protected Route Component
 * Redirects to home if user is not connected
 * Shows a connect wallet message while checking auth state
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isConnected, isConnecting, connect } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    // If not connecting and not connected, redirect to home
    if (!isConnecting && !isConnected) {
      router.push('/')
    }
  }, [isConnected, isConnecting, router])

  // Show loading state while checking connection
  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Connecting wallet...</p>
        </div>
      </div>
    )
  }

  // Show connect wallet prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-slate-600 mb-8">
            You need to connect your wallet to access this page. Please connect your Hiro or Leather wallet to continue.
          </p>
          <button
            onClick={() => connect()}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <Wallet className="w-5 h-5" />
            <span>Connect Wallet</span>
          </button>
        </div>
      </div>
    )
  }

  // Render children if connected
  return <>{children}</>
}

