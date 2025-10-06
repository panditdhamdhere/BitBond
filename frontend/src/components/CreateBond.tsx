'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Plus, 
  Clock, 
  TrendingUp, 
  Shield, 
  AlertCircle,
  Loader2 
} from 'lucide-react'
import { useContract } from '../hooks/useContract'
import { useAuth } from '../hooks/useAuth'
import { LockPeriod, CreateBondParams } from '../utils/types'
import { BOND_CONFIG, getAPY } from '../utils/constants'
import { 
  formatSBTC, 
  parseSBTC, 
  calculateYield, 
  validateBondParams 
} from '../utils/bondCalculations'
import toast from 'react-hot-toast'

const createBondSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  lockPeriod: z.enum(['30', '90', '180'] as const),
})

type CreateBondForm = z.infer<typeof createBondSchema>

export function CreateBond() {
  const { isConnected } = useAuth()
  const { createBond, isLoading } = useContract()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateBondForm>({
    resolver: zodResolver(createBondSchema),
    defaultValues: {
      amount: '0.01',
      lockPeriod: '30',
    },
  })

  const watchedAmount = watch('amount')
  const watchedLockPeriod = watch('lockPeriod')

  const onSubmit = async (data: CreateBondForm) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    const amount = parseSBTC(data.amount)
    const lockPeriod = parseInt(data.lockPeriod) as LockPeriod

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
        toast.success('Bond created successfully!')
        reset()
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

  const amount = parseFloat(watchedAmount) || 0
  const lockPeriod = parseInt(watchedLockPeriod) as LockPeriod
  const apy = getAPY(lockPeriod)
  const yieldAmount = amount > 0 ? calculateYield(parseSBTC(watchedAmount), lockPeriod) : 0

  if (!isConnected) {
    return (
      <div className="bond-card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-slate-600">
          Please connect your wallet to create bonds and start earning yields.
        </p>
      </div>
    )
  }

  return (
    <div className="bond-card p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create New Bond</h2>
          <p className="text-slate-600">Lock sBTC and earn guaranteed yields</p>
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
              min="0.00000001"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.01"
            />
            <div className="absolute right-3 top-3 text-slate-500 text-sm">
              sBTC
            </div>
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        {/* Lock Period Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Lock Period
          </label>
          <div className="grid grid-cols-3 gap-3">
            {BOND_CONFIG.lockPeriods.map((period) => (
              <label
                key={period}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  watchedLockPeriod === period.toString()
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  {...register('lockPeriod')}
                  type="radio"
                  value={period.toString()}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">
                    {period} days
                  </div>
                  <div className="text-sm text-slate-600">
                    {getAPY(period)}% APY
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Bond Preview */}
        {amount > 0 && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-slate-900">Bond Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Principal:</span>
                <span className="font-medium">{formatSBTC(parseSBTC(watchedAmount))} sBTC</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">APY:</span>
                <span className="font-medium">{apy}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Lock Period:</span>
                <span className="font-medium">{lockPeriod} days</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-slate-600">Expected Yield:</span>
                <span className="font-medium text-green-600">
                  {formatSBTC(yieldAmount)} sBTC
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting || isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          <span>
            {isSubmitting || isLoading ? 'Creating Bond...' : 'Create Bond'}
          </span>
        </button>
      </form>
    </div>
  )
}
