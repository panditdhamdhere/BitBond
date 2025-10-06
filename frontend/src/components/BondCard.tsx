'use client'

import { useState } from 'react'
import { 
  Clock, 
  TrendingUp, 
  Shield, 
  Calendar,
  MoreVertical,
  ExternalLink,
  AlertCircle,
  Loader2
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

  return (
    <div className="bond-card p-6 relative">
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
