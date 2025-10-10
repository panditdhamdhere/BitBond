import { ContractConfig, LockPeriod } from './types'

const ENV = {
  network: (process.env.NEXT_PUBLIC_NETWORK || 'testnet') as 'mainnet' | 'testnet' | 'devnet',
  bondVault: process.env.NEXT_PUBLIC_BOND_VAULT_CONTRACT,
  bondNft: process.env.NEXT_PUBLIC_BOND_NFT_CONTRACT,
  bondMarketplace: process.env.NEXT_PUBLIC_BOND_MARKETPLACE_CONTRACT,
  sbtcToken: process.env.NEXT_PUBLIC_SBTC_CONTRACT,
  apiUrl: process.env.NEXT_PUBLIC_STACKS_API || 'https://api.testnet.hiro.so',
}

// Contract addresses from environment variables
export const CONTRACTS: Record<string, ContractConfig> = {
  mainnet: {
    bondVault: ENV.bondVault || 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-vault',
    bondNft: ENV.bondNft || 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-nft',
    bondMarketplace: ENV.bondMarketplace || 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-marketplace',
    sbtcToken: ENV.sbtcToken || 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token',
  },
  testnet: {
    bondVault: ENV.bondVault || 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.bond-vault',
    bondNft: ENV.bondNft || 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.bond-nft',
    bondMarketplace: ENV.bondMarketplace || 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.bond-marketplace',
    sbtcToken: ENV.sbtcToken || 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.sbtc-token',
  },
  devnet: {
    bondVault: ENV.bondVault || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-vault',
    bondNft: ENV.bondNft || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-nft',
    bondMarketplace: ENV.bondMarketplace || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-marketplace',
    sbtcToken: ENV.sbtcToken || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token',
  },
}

// Bond configuration
export const BOND_CONFIG = {
  lockPeriods: [30, 90, 180] as LockPeriod[],
  apy: {
    30: 5,  // 5% APY for 30 days
    90: 8,  // 8% APY for 90 days
    180: 12, // 12% APY for 180 days
  },
  minAmount: 1000, // minimum sBTC amount in micro-sats
  maxAmount: 1000000000, // maximum sBTC amount in micro-sats
  earlyExitPenalty: 10, // 10% penalty for early exit
  protocolFee: 2, // 2% protocol fee on marketplace sales
  burnBlocksPerDay: 144, // approximate Bitcoin blocks per day
}

// Network configuration
export const NETWORK_CONFIG = {
  mainnet: {
    coreApiUrl: ENV.apiUrl,
    network: 'mainnet' as const,
    chainId: 1,
  },
  testnet: {
    coreApiUrl: ENV.apiUrl,
    network: 'testnet' as const,
    chainId: 2147483648,
  },
  devnet: {
    coreApiUrl: 'http://localhost:3999',
    network: 'devnet' as const,
    chainId: 2147483648,
  },
}

// UI Constants
export const UI_CONFIG = {
  itemsPerPage: 12,
  refreshInterval: 30000, // 30 seconds
  toastDuration: 5000,
  animationDuration: 300,
}

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INSUFFICIENT_BALANCE: 'Insufficient sBTC balance',
  INVALID_AMOUNT: 'Invalid amount specified',
  BOND_NOT_FOUND: 'Bond not found',
  LISTING_NOT_FOUND: 'Listing not found',
  TRANSACTION_FAILED: 'Transaction failed',
  NETWORK_ERROR: 'Network error occurred',
  CONTRACT_ERROR: 'Contract interaction failed',
}

// Success messages
export const SUCCESS_MESSAGES = {
  BOND_CREATED: 'Bond created successfully',
  BOND_WITHDRAWN: 'Bond withdrawn successfully',
  BOND_LISTED: 'Bond listed for sale',
  BOND_BOUGHT: 'Bond purchased successfully',
  LISTING_CANCELLED: 'Listing cancelled',
  PRICE_UPDATED: 'Price updated successfully',
}

// Default values
export const DEFAULTS = {
  network: ENV.network,
  lockPeriod: 30 as LockPeriod,
  amount: 10000, // 0.01 sBTC in micro-sats
  price: 10000, // 0.01 STX in micro-STX
}

// Helper function to get APY for a lock period
export function getAPY(lockPeriod: LockPeriod): number {
  return BOND_CONFIG.apy[lockPeriod]
}
