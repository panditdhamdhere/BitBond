'use client'

import { useState } from 'react'
import { Connect } from '@stacks/connect'
import { Wallet } from 'lucide-react'

interface ConnectButtonProps {
  onConnect: (connected: boolean) => void
}

export function ConnectButton({ onConnect }: ConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Initialize Stacks Connect
      const connect = new Connect({
        appDetails: {
          name: 'BitBond',
          icon: '/icon.png',
        },
        redirectTo: '/',
        onFinish: () => {
          onConnect(true)
          setIsConnecting(false)
        },
        onCancel: () => {
          setIsConnecting(false)
        },
      })

      await connect.showConnect()
    } catch (error) {
      console.error('Connection failed:', error)
      setIsConnecting(false)
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Wallet className="w-4 h-4" />
      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  )
}
