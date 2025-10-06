'use client'

import { useEffect, useRef, useState } from 'react'
import { 
  Clock, 
  TrendingUp, 
  Shield, 
  Calendar,
  MoreVertical,
  ExternalLink,
  AlertCircle,
  Loader2,
  Download
} from 'lucide-react'
import { Bond } from '../utils/types'
import { 
  formatSBTC, 
  getTimeRemaining, 
  calculateTotalPayout,
  calculateEarlyExitRefund,
  calculateEarlyExitPenalty,
  isBondMatured 
} from '../utils/bondCalculations'
import { BOND_CONFIG } from '../utils/constants'

interface BondCardProps {
  bond: Bond
  currentBlockHeight: number
  onWithdraw?: (bondId: number) => void
  onEarlyExit?: (bondId: number) => void
  onList?: (bondId: number) => void
  showActions?: boolean
  isProcessing?: boolean
}

export function BondCard({ 
  bond, 
  currentBlockHeight, 
  onWithdraw, 
  onEarlyExit, 
  onList,
  showActions = true,
  isProcessing = false
}: BondCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [_, setTick] = useState(0)
  const certRef = useRef<SVGSVGElement | null>(null)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  
  const timeRemaining = getTimeRemaining(bond, currentBlockHeight)
  const isMatured = isBondMatured(bond, currentBlockHeight)
  const totalPayout = calculateTotalPayout(bond)
  const earlyExitRefund = calculateEarlyExitRefund(bond)
  const earlyExitPenalty = calculateEarlyExitPenalty(bond)

  const getStatusColor = () => {
    switch (bond.status) {
      case 'active':
        return isMatured ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
      case 'withdrawn':
        return 'text-gray-600 bg-gray-50'
      case 'early-exit':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = () => {
    switch (bond.status) {
      case 'active':
        return isMatured ? 'Matured' : 'Active'
      case 'withdrawn':
        return 'Withdrawn'
      case 'early-exit':
        return 'Early Exit'
      default:
        return 'Unknown'
    }
  }

  // Gradient and badges by lock period
  const gradientForPeriod = bond.lockPeriod === 30
    ? { from: '#3b82f6', to: '#1d4ed8', badge: 'bg-blue-100 text-blue-700' }
    : bond.lockPeriod === 90
    ? { from: '#f97316', to: '#ea580c', badge: 'bg-orange-100 text-orange-700' }
    : { from: '#8b5cf6', to: '#6d28d9', badge: 'bg-purple-100 text-purple-700' }

  // Progress calc using burn blocks/day
  const totalBlocks = bond.lockPeriod * BOND_CONFIG.burnBlocksPerDay
  const elapsedBlocks = Math.max(Math.min(currentBlockHeight - bond.createdAt, totalBlocks), 0)
  const progressPercent = Math.round((elapsedBlocks / totalBlocks) * 100)

  const downloadCertificate = async () => {
    const svg = certRef.current
    if (!svg) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svg)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const png = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = png
      a.download = `bitbond-certificate-${bond.id}.png`
      a.click()
    }
    img.src = url
  }

  return (
    <div className="bond-card p-6 relative overflow-hidden">
      {/* Bond Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Bond #{bond.id}
            </h3>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                {bond.status === 'active' && isMatured && onWithdraw && (
                  <button
                    onClick={() => {
                      onWithdraw(bond.id)
                      setShowMenu(false)
                    }}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Withdraw</span>
                    )}
                  </button>
                )}
                {bond.status === 'active' && !isMatured && onEarlyExit && (
                  <button
                    onClick={() => {
                      onEarlyExit(bond.id)
                      setShowMenu(false)
                    }}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Early Exit</span>
                    )}
                  </button>
                )}
                {bond.status === 'active' && onList && (
                  <button
                    onClick={() => {
                      onList(bond.id)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                  >
                    List for Sale
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certificate Visual */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 mb-4">
        <svg ref={certRef} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" className="w-full h-auto">
          <defs>
            <linearGradient id={`grad-${bond.id}`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={gradientForPeriod.from} />
              <stop offset="100%" stopColor={gradientForPeriod.to} />
            </linearGradient>
            <pattern id={`pattern-${bond.id}`} patternUnits="userSpaceOnUse" width="20" height="20">
              <path d="M0 10H20" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <path d="M10 0V20" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="800" height="360" fill={`url(#grad-${bond.id})`} rx="16" />
          <rect x="16" y="16" width="768" height="328" fill={`url(#pattern-${bond.id})`} rx="12" />
          <text x="32" y="64" fill="white" opacity="0.9" fontSize="24" fontWeight="bold">BITBOND</text>
          <text x="32" y="100" fill="white" opacity="0.8" fontSize="16">Liquidity Bond Certificate</text>
          <text x="32" y="150" fill="white" opacity="0.95" fontSize="42" fontWeight="bold">#{bond.id}</text>
          <text x="32" y="200" fill="white" opacity="0.95" fontSize="28" fontWeight="bold">{formatSBTC(bond.amount)} BTC</text>
          <text x="32" y="240" fill="white" opacity="0.9" fontSize="18">APY: {bond.apy}%</text>
          <text x="32" y="268" fill="white" opacity="0.9" fontSize="18">Lock: {bond.lockPeriod} Days</text>
          <text x="32" y="300" fill="white" opacity="0.85" fontSize="14">Owner: {bond.owner.slice(0,6)}...{bond.owner.slice(-4)}</text>
          <rect x="8" y="8" width="784" height="344" fill="none" rx="14" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
        </svg>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded ${gradientForPeriod.badge}`}>{bond.lockPeriod} Days</span>
          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">{bond.apy}% APY</span>
          <span className={`px-2 py-1 text-xs rounded ${isMatured ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{isMatured ? 'MATURED' : 'ACTIVE'}</span>
        </div>
        <button onClick={downloadCertificate} className="absolute bottom-3 right-3 px-2 py-1 rounded bg-white/80 text-slate-700 hover:bg-white transition-colors flex items-center gap-1 text-xs">
          <Download className="w-3 h-3" /> PNG
        </button>
      </div>

      {/* Bond Details */}
      <div className="space-y-4">
        {/* Principal and APY */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-sm text-slate-600 mb-1">Principal</div>
            <div className="text-lg font-semibold text-slate-900">
              {formatSBTC(bond.amount)} sBTC
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-sm text-slate-600 mb-1">APY</div>
            <div className="text-lg font-semibold text-green-600">
              {bond.apy}%
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Progress</span>
            <span>{isMatured ? '100' : progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div className={`h-2 rounded-full transition-all duration-500 ${isMatured ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${isMatured ? 100 : progressPercent}%` }} />
          </div>
          {!isMatured && (
            <div className="text-xs text-slate-600 mt-1">{timeRemaining.days}d {timeRemaining.hours}h remaining</div>
          )}
        </div>

        {/* Lock Period and Maturity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">Lock Period:</span>
            <span className="font-medium">{bond.lockPeriod} days</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">Maturity:</span>
            <span className="font-medium">
              {isMatured ? 'Matured' : `${timeRemaining.days}d ${timeRemaining.hours}h`}
            </span>
          </div>
        </div>

        {/* Yield Information */}
        {bond.status === 'active' && (
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Yield Information</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Expected Yield:</span>
                <span className="font-medium text-green-800">
                  {formatSBTC(bond.yield || 0)} sBTC
                </span>
              </div>
              {isMatured ? (
                <div className="flex justify-between">
                  <span className="text-green-700">Total Payout:</span>
                  <span className="font-medium text-green-800">
                    {formatSBTC(totalPayout)} sBTC
                  </span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-orange-700">Early Exit Refund:</span>
                  <span className="font-medium text-orange-800">
                    {formatSBTC(earlyExitRefund)} sBTC
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Early Exit Warning */}
        {bond.status === 'active' && !isMatured && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-orange-800 mb-1">Early Exit Penalty</div>
                <div className="text-orange-700">
                  Early exit will incur a {formatSBTC(earlyExitPenalty)} sBTC penalty (10%)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NFT Link */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <button className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          <ExternalLink className="w-4 h-4" />
          <span>View NFT</span>
        </button>
      </div>
    </div>
  )
}
