import { Bond, LockPeriod } from './types'
import { BOND_CONFIG } from './constants'

/**
 * Calculate the yield for a given amount and lock period
 */
export function calculateYield(amount: number, lockPeriod: LockPeriod): number {
  const apy = BOND_CONFIG.apy[lockPeriod]
  const days = lockPeriod
  // Formula: amount * apy * days / 36500 (where apy is percentage)
  return Math.floor((amount * apy * days) / 36500)
}

/**
 * Calculate the maturity date in block height
 */
export function calculateMaturityDate(createdAt: number, lockPeriod: LockPeriod): number {
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
 * Format micro-sats to sBTC with proper decimals
 */
export function formatSBTC(microSats: number): string {
  const sats = microSats / 1000000 // Convert micro-sats to sats
  const btc = sats / 100000000 // Convert sats to BTC
  return btc.toFixed(8)
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
