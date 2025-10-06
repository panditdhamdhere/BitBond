import { Bond, LockPeriod } from './types'
import { BOND_CONFIG } from './constants'

/**
 * Calculate the yield.
 * Overloads:
 * - calculateYield(amount, lockPeriod) -> uses configured APY for the lock period
 * - calculateYield(principal, apy, lockPeriod) -> uses explicit APY percentage
 */
export function calculateYield(amount: number, lockPeriod: LockPeriod): number
export function calculateYield(principal: number, apy: number, lockPeriod: number): number
export function calculateYield(a: number, b: number, c?: number): number {
  // Two-arg form: (amount, lockPeriod)
  if (typeof c === 'undefined') {
    const lockPeriod = b as LockPeriod
    const apy = BOND_CONFIG.apy[lockPeriod]
    const days = lockPeriod
    return Math.floor((a * apy * days) / 36500)
  }
  // Three-arg form: (principal, apy, lockPeriod)
  const principal = a
  const apy = b
  const lockPeriod = c
  if (principal <= 0 || apy < 0 || lockPeriod <= 0) return 0
  return principal * (apy / 100) * (lockPeriod / 365)
}

/**
 * Calculate the maturity date in block height
 */
export function calculateMaturityDate(createdAt: number, lockPeriod: LockPeriod): number
export function calculateMaturityDate(createdAt: Date, lockPeriod: number): Date
export function calculateMaturityDate(createdAt: number | Date, lockPeriod: number): number | Date {
  if (createdAt instanceof Date) {
    const ms = createdAt.getTime() + lockPeriod * 24 * 60 * 60 * 1000
    return new Date(ms)
  }
  const blocksPerDay = BOND_CONFIG.burnBlocksPerDay
  return createdAt + (lockPeriod * blocksPerDay)
}

/**
 * Check if a bond has matured
 */
export function isBondMatured(bond: Bond, currentBlockHeight: number): boolean {
  return currentBlockHeight >= bond.maturityDate
}

/**
 * Returns days remaining until a JS Date maturity; 0 if matured
 */
export function calculateDaysRemaining(maturityDate: Date): number {
  const now = Date.now()
  const diffMs = maturityDate.getTime() - now
  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000))
}

/**
 * Calculate accrued yield pro-rata based on days elapsed
 */
export function calculateAccruedYield(principal: number, apy: number, lockPeriod: number, daysElapsed: number): number {
  if (principal <= 0 || apy < 0 || lockPeriod <= 0 || daysElapsed <= 0) return 0
  const cappedDays = Math.min(daysElapsed, lockPeriod)
  return principal * (apy / 100) * (cappedDays / 365)
}

/**
 * Calculate intrinsic value (principal + accrued yield) for pricing.
 * If bond has no wall-clock timestamps, this returns principal + full-period yield.
 */
export function calculateIntrinsicValue(bond: Bond): number {
  const fullYield = calculateYield(bond.amount, bond.lockPeriod as LockPeriod)
  // Without exact days elapsed in wall time, fall back to full yield if matured-like flag is set on status
  // Consumers may prefer calculateAccruedYield with explicit daysElapsed for more accuracy
  return bond.amount + fullYield
}

/**
 * Calculate discount percentage; can be negative for premiums
 */
export function calculateDiscountPercentage(intrinsicValue: number, askingPrice: number): number {
  if (intrinsicValue <= 0) return 0
  return ((intrinsicValue - askingPrice) / intrinsicValue) * 100
}

/**
 * Calculate time remaining until maturity
 */
export function getTimeRemaining(bond: Bond, currentBlockHeight: number): {
  blocks: number
  days: number
  hours: number
  isMatured: boolean
} {
  const blocksRemaining = bond.maturityDate - currentBlockHeight
  const isMatured = blocksRemaining <= 0
  
  if (isMatured) {
    return { blocks: 0, days: 0, hours: 0, isMatured: true }
  }
  
  const daysRemaining = Math.floor(blocksRemaining / BOND_CONFIG.burnBlocksPerDay)
  const hoursRemaining = Math.floor((blocksRemaining % BOND_CONFIG.burnBlocksPerDay) / 6) // ~6 blocks per hour
  
  return {
    blocks: blocksRemaining,
    days: daysRemaining,
    hours: hoursRemaining,
    isMatured: false
  }
}

/**
 * Calculate the total payout (principal + yield) for a matured bond
 */
export function calculateTotalPayout(bond: Bond): number {
  const yieldAmount = calculateYield(bond.amount, bond.lockPeriod as LockPeriod)
  return bond.amount + yieldAmount
}

/**
 * Calculate the early exit refund (90% of principal)
 */
export function calculateEarlyExitRefund(bond: Bond): number {
  const penalty = Math.floor(bond.amount * BOND_CONFIG.earlyExitPenalty / 100)
  return bond.amount - penalty
}

/**
 * Calculate the early exit penalty amount
 */
export function calculateEarlyExitPenalty(bond: Bond): number {
  return Math.floor(bond.amount * BOND_CONFIG.earlyExitPenalty / 100)
}

/**
 * Calculate suggested marketplace price based on remaining time and yield
 */
export function calculateSuggestedPrice(bond: Bond, currentBlockHeight: number): number {
  const timeRemaining = getTimeRemaining(bond, currentBlockHeight)
  
  if (timeRemaining.isMatured) {
    // If matured, price should be at least the total payout
    return calculateTotalPayout(bond)
  }
  
  // Calculate remaining yield based on time left
  const totalYield = calculateYield(bond.amount, bond.lockPeriod as LockPeriod)
  const timeRatio = timeRemaining.blocks / (bond.lockPeriod * BOND_CONFIG.burnBlocksPerDay)
  const remainingYield = Math.floor(totalYield * timeRatio)
  
  // Suggested price = principal + remaining yield
  return bond.amount + remainingYield
}

/**
 * Calculate protocol fee for marketplace transactions
 */
export function calculateProtocolFee(price: number): number {
  return Math.floor(price * BOND_CONFIG.protocolFee / 100)
}

/**
 * Calculate seller amount after protocol fee
 */
export function calculateSellerAmount(price: number): number {
  const fee = calculateProtocolFee(price)
  return price - fee
}

/**
 * True if maturity date is past now
 */
export function isMatured(maturityDate: Date): boolean {
  return maturityDate.getTime() <= Date.now()
}

/**
 * Format micro-sats to sBTC with proper decimals
 */
export function formatSBTC(microSats: number): string {
  const sats = microSats / 1000000 // Convert micro-sats to sats
  const btc = sats / 100000000 // Convert sats to BTC
  return btc.toFixed(8)
}

/**
 * Format BTC amount (in BTC units) to 8 decimals with suffix
 */
export function formatBTC(amount: number): string {
  return `${amount.toFixed(8)} BTC`
}

/**
 * Format micro-STX to STX with proper decimals
 */
export function formatSTX(microStx: number): string {
  const stx = microStx / 1000000 // Convert micro-STX to STX
  return stx.toFixed(6)
}

/**
 * Parse sBTC string to micro-sats
 */
export function parseSBTC(sbtcString: string): number {
  const btc = parseFloat(sbtcString)
  const sats = btc * 100000000 // Convert BTC to sats
  return Math.floor(sats * 1000000) // Convert sats to micro-sats
}

/**
 * Parse STX string to micro-STX
 */
export function parseSTX(stxString: string): number {
  const stx = parseFloat(stxString)
  return Math.floor(stx * 1000000) // Convert STX to micro-STX
}

/**
 * Get APY percentage for a lock period
 */
export function getAPY(lockPeriod: LockPeriod): number {
  return BOND_CONFIG.apy[lockPeriod]
}

/**
 * Get APY for a numeric lock period (supports non-typed inputs)
 */
export function getAPYForLockPeriod(lockPeriod: number): number {
  if (lockPeriod === 30) return BOND_CONFIG.apy[30]
  if (lockPeriod === 90) return BOND_CONFIG.apy[90]
  if (lockPeriod === 180) return BOND_CONFIG.apy[180]
  return 0
}

/**
 * Validate bond creation parameters
 */
export function validateBondParams(amount: number, lockPeriod: LockPeriod): {
  isValid: boolean
  error?: string
} {
  if (amount < BOND_CONFIG.minAmount) {
    return {
      isValid: false,
      error: `Minimum amount is ${formatSBTC(BOND_CONFIG.minAmount)} sBTC`
    }
  }
  
  if (amount > BOND_CONFIG.maxAmount) {
    return {
      isValid: false,
      error: `Maximum amount is ${formatSBTC(BOND_CONFIG.maxAmount)} sBTC`
    }
  }
  
  if (!BOND_CONFIG.lockPeriods.includes(lockPeriod)) {
    return {
      isValid: false,
      error: 'Invalid lock period. Must be 30, 90, or 180 days'
    }
  }
  
  return { isValid: true }
}

/**
 * Calculate maturity date based on lock period (returns Date object)
 */
export function calculateMaturityDateFromNow(lockPeriod: LockPeriod): Date {
  const now = new Date()
  const maturityDate = new Date(now.getTime() + lockPeriod * 24 * 60 * 60 * 1000)
  return maturityDate
}

/**
 * Calculate total return (principal + yield)
 */
export function calculateTotalReturn(amount: number, lockPeriod: LockPeriod): number {
  const yieldAmount = calculateYield(amount, lockPeriod)
  return amount + yieldAmount
}
