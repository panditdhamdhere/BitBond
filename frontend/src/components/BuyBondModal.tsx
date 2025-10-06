'use client'

import { useMemo } from 'react'
import { X, Sparkles, Loader2, BadgeCheck } from 'lucide-react'
import { BondListing } from '../utils/types'
import { formatSBTC, formatSTX } from '../utils/bondCalculations'

interface BuyBondModalProps {
  isOpen: boolean
  listing: BondListing | null
  onClose: () => void
  onConfirm: (listingId: number) => Promise<void>
  isProcessing?: boolean
}

export default function BuyBondModal({ isOpen, listing, onClose, onConfirm, isProcessing = false }: BuyBondModalProps) {
  const protocolFee = useMemo(() => {
    if (!listing) return 0
    return Math.floor(listing.price * 0.02)
  }, [listing])

  if (!isOpen || !listing) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Confirm Purchase</h3>
              <p className="text-sm text-slate-600">Bond #{listing.bond.id} • {listing.bond.lockPeriod}d • {listing.bond.apy}% APY</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Price:</span>
            <span className="font-medium">{formatSTX(listing.price)} STX</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Protocol Fee (2%):</span>
            <span className="font-medium text-slate-900">{formatSTX(protocolFee)} STX</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Seller:</span>
            <span className="font-medium">{listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 mb-4">
          You are buying a bond representing {formatSBTC(listing.bond.amount)} sBTC principal.
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(listing.id)}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
            <span>{isProcessing ? 'Processing...' : 'Confirm Purchase'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}


