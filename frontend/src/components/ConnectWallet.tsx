'use client'

import { useState, useRef, useEffect } from 'react'
import { useConnect } from '@stacks/connect-react'
import { 
  Wallet, 
  ChevronDown, 
  LogOut, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Coins,
  Bitcoin
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Network } from '../utils/types'
import { formatSBTC, formatSTX } from '../utils/bondCalculations'
import toast from 'react-hot-toast'

export default function ConnectWallet() {
  const { isConnected, address, network } = useConnect()
  const { 
    balance, 
    isLoading, 
    isLoadingBalance, 
    error, 
    disconnect, 
    switchNetwork, 
    refreshBalances 
  } = useAuth()
  
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNetworkSwitcher, setShowNetworkSwitcher] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setShowNetworkSwitcher(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleConnect = async () => {
    try {
      // The connection is handled by the Connect provider
      // This component just manages the UI state
      toast.success('Wallet connection initiated')
    } catch (err) {
      toast.error('Failed to connect wallet')
      console.error('Connection error:', err)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setShowDropdown(false)
    toast.success('Wallet disconnected')
  }

  const handleNetworkSwitch = (newNetwork: Network) => {
    switchNetwork(newNetwork)
    setShowNetworkSwitcher(false)
    toast.success(`Switched to ${newNetwork}`)
  }

  const handleRefreshBalances = () => {
    refreshBalances()
    toast.success('Balances refreshed')
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkColor = (networkName?: string) => {
    switch (networkName) {
      case 'mainnet':
        return 'text-green-500 bg-green-50'
      case 'testnet':
        return 'text-orange-500 bg-orange-50'
      case 'devnet':
        return 'text-purple-500 bg-purple-50'
      default:
        return 'text-gray-500 bg-gray-50'
    }
  }

  // If not connected, show connect button
  if (!isConnected || !address) {
    return (
      <div className="relative">
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {/* Glassmorphic effect */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Button content */}
          <div className="relative flex items-center space-x-2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wallet className="w-5 h-5" />
            )}
            <span className="font-semibold">
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </span>
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 -top-1 -left-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" />
        </button>

        {/* Error toast */}
        {error && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Connected state - show wallet info dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main wallet button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {/* Glassmorphic effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-sm" />
        
        {/* Button content */}
        <div className="relative flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">{truncateAddress(address)}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Connected</div>
                  <div className="text-sm text-slate-600">{truncateAddress(address)}</div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkColor(network?.name)}`}>
                {network?.name || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Balances */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Balances</h3>
              <button
                onClick={handleRefreshBalances}
                disabled={isLoadingBalance}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoadingBalance ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* STX Balance */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Coins className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">STX</div>
                    <div className="text-xs text-slate-600">Stacks Token</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">
                    {isLoadingBalance ? '...' : formatSTX(balance.stx)}
                  </div>
                  <div className="text-xs text-slate-600">STX</div>
                </div>
              </div>

              {/* sBTC Balance */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Bitcoin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">sBTC</div>
                    <div className="text-xs text-slate-600">Wrapped Bitcoin</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">
                    {isLoadingBalance ? '...' : formatSBTC(balance.sbtc)}
                  </div>
                  <div className="text-xs text-slate-600">sBTC</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 space-y-2">
            {/* Network Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowNetworkSwitcher(!showNetworkSwitcher)}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <span className="font-medium text-slate-900">Network</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showNetworkSwitcher ? 'rotate-180' : ''}`} />
              </button>
              
              {showNetworkSwitcher && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10">
                  {(['mainnet', 'testnet', 'devnet'] as Network[]).map((net) => (
                    <button
                      key={net}
                      onClick={() => handleNetworkSwitch(net)}
                      className={`w-full flex items-center justify-between p-3 hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl transition-colors ${
                        network?.name === net ? 'bg-orange-50 text-orange-700' : 'text-slate-700'
                      }`}
                    >
                      <span className="capitalize font-medium">{net}</span>
                      {network?.name === net && <CheckCircle className="w-4 h-4 text-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 text-red-600 rounded-xl transition-colors group"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}