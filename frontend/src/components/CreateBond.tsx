'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Plus, 
  TrendingUp, 
  Shield, 
  AlertCircle,
  Loader2,
  CheckCircle,
  Calendar,
  Bitcoin,
  Sparkles
} from 'lucide-react'
import { useContract } from '../hooks/useContract'
import { useAuth } from '../hooks/useAuth'
import { LockPeriod, CreateBondParams } from '../utils/types'
import { BOND_CONFIG, getAPY } from '../utils/constants'
import { 
  formatSBTC, 
  parseSBTC, 
  calculateYield, 
  validateBondParams,
  calculateMaturityDateFromNow,
  calculateTotalReturn
} from '../utils/bondCalculations'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const createBondSchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => {
      const num = parseFloat(val)
      return num >= 0.01
    }, 'Minimum amount is 0.01 sBTC')
    .refine((val) => {
      const num = parseFloat(val)
      return num <= 1000
    }, 'Maximum amount is 1000 sBTC'),
  lockPeriod: z.enum(['30', '90', '180'] as const),
})

type CreateBondForm = z.infer<typeof createBondSchema>

interface BondPreview {
  principal: number
  apy: number
  lockPeriod: number
  maturityDate: Date
  expectedYield: number
  totalReturn: number
}

export function CreateBond() {
  const { isConnected, balance } = useAuth()
  const { createBond, isLoading } = useContract()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [bondPreview, setBondPreview] = useState<BondPreview | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateBondForm>({
    resolver: zodResolver(createBondSchema),
    defaultValues: {
      amount: '0.01',
      lockPeriod: '30',
    },
  })

  const watchedAmount = watch('amount')
  const watchedLockPeriod = watch('lockPeriod')

  // Calculate bond preview when inputs change
  useEffect(() => {
    const amount = parseFloat(watchedAmount) || 0
    const lockPeriod = parseInt(watchedLockPeriod) as LockPeriod
    
    if (amount > 0 && lockPeriod) {
      const apy = getAPY(lockPeriod)
      const principal = parseSBTC(watchedAmount)
      const expectedYield = calculateYield(principal, lockPeriod)
      const totalReturn = calculateTotalReturn(principal, lockPeriod)
      const maturityDate = calculateMaturityDateFromNow(lockPeriod)
      
      setBondPreview({
        principal,
        apy,
        lockPeriod,
        maturityDate,
        expectedYield,
        totalReturn,
      })
    } else {
      setBondPreview(null)
    }
  }, [watchedAmount, watchedLockPeriod])

  const onSubmit = async (data: CreateBondForm) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    const amount = parseSBTC(data.amount)
    const lockPeriod = parseInt(data.lockPeriod) as LockPeriod

    // Check balance
    if (amount > balance.sbtc) {
      toast.error('Insufficient sBTC balance')
      return
    }

    // Validate parameters
    const validation = validateBondParams(amount, lockPeriod)
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid parameters')
      return
    }

    setIsSubmitting(true)
    try {
      const params: CreateBondParams = {
        amount,
        lockPeriod,
      }

      const result = await createBond(params)
      
      if (result.success) {
        setShowSuccess(true)
        toast.success('🎉 Bond created successfully!', {
          duration: 4000,
          icon: '🎉',
        })
        
        // Reset form after delay
        setTimeout(() => {
          reset()
          setShowSuccess(false)
        }, 3000)
      } else {
        toast.error(result.error || 'Failed to create bond')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Create bond error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickAmount = (amount: string) => {
    setValue('amount', amount)
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center hover:shadow-xl transition-all duration-300">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-slate-900">Connect Your Wallet</h3>
        <p className="text-slate-600 mb-4">
          Please connect your wallet to create bonds and start earning guaranteed yields.
        </p>
        <div className="text-sm text-slate-500">
          Available balances will be displayed once connected
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 relative overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 bg-green-50/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-700 mb-2">Bond Created!</h3>
            <p className="text-green-600">Your bond NFT has been minted successfully</p>
            <div className="flex justify-center mt-4">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create New Bond</h2>
          <p className="text-slate-600">Lock sBTC and earn guaranteed yields</p>
        </div>
      </div>

      {/* Balance Display */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bitcoin className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-slate-700">Available Balance:</span>
          </div>
          <span className="text-lg font-semibold text-slate-900">
            {formatSBTC(balance.sbtc)} sBTC
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Amount (sBTC)
          </label>
          <div className="relative">
            <input
              {...register('amount')}
              type="number"
              step="0.00000001"
              min="0.01"
              max="1000"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="0.01"
            />
            <div className="absolute right-3 top-3 text-slate-500 text-sm font-medium">
              sBTC
            </div>
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="flex space-x-2 mt-2">
            {['0.01', '0.1', '0.5', '1.0'].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuickAmount(amount)}
                className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                {amount} sBTC
              </button>
            ))}
          </div>
          
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.amount.message}</span>
            </p>
          )}
        </div>

        {/* Lock Period Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Lock Period
          </label>
          <div className="grid grid-cols-3 gap-3">
            {BOND_CONFIG.lockPeriods.map((period) => {
              const apy = getAPY(period)
              const isSelected = watchedLockPeriod === period.toString()
              
              return (
                <label
                  key={period}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <input
                    {...register('lockPeriod')}
                    type="radio"
                    value={period.toString()}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 mb-1">
                      {period} days
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      {apy}% APY
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Live Calculation Display */}
        {bondPreview && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 space-y-4">
            <h4 className="font-semibold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span>Bond Calculation</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Principal:</span>
                  <span className="font-semibold text-slate-900">
                    {formatSBTC(bondPreview.principal)} sBTC
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">APY:</span>
                  <span className="font-semibold text-orange-600">
                    {bondPreview.apy}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Expected Yield:</span>
                  <span className="font-semibold text-green-600">
                    +{formatSBTC(bondPreview.expectedYield)} sBTC
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Return:</span>
                  <span className="font-semibold text-slate-900">
                    {formatSBTC(bondPreview.totalReturn)} sBTC
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Maturity Date:</span>
                </span>
                <span className="font-semibold text-slate-900">
                  {format(bondPreview.maturityDate, 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bond Preview Card */}
        {bondPreview && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-orange-600" />
              <span>Bond Certificate Preview</span>
            </h4>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Bitcoin className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-lg font-bold text-slate-900">BitBond Certificate</h5>
                <p className="text-sm text-slate-600">Liquidity Bond NFT</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Bond ID:</span>
                  <span className="font-medium">#TBD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Principal:</span>
                  <span className="font-medium">{formatSBTC(bondPreview.principal)} sBTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Lock Period:</span>
                  <span className="font-medium">{bondPreview.lockPeriod} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">APY:</span>
                  <span className="font-medium text-orange-600">{bondPreview.apy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Maturity:</span>
                  <span className="font-medium">{format(bondPreview.maturityDate, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-600 font-medium">Total Return:</span>
                  <span className="font-bold text-green-600">{formatSBTC(bondPreview.totalReturn)} sBTC</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading || !bondPreview}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Bond...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Create Bond</span>
            </>
          )}
        </button>

        {/* Transaction Status */}
        {(isSubmitting || isLoading) && (
          <div className="text-center text-sm text-slate-600">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing transaction...</span>
            </div>
            <p className="mt-1">This may take a few moments</p>
          </div>
        )}
      </form>
    </div>
  )
}