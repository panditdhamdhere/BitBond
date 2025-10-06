export interface Bond {
  id: number
  owner: string
  amount: number
  lockPeriod: number // in days
  createdAt: number // block height
  maturityDate: number // block height
  apy: number // percentage
  status: BondStatus
  yield?: number // calculated yield amount
}

export interface BondListing {
  id: number
  seller: string
  price: number // in micro-STX
  listedAt: number // block height
  bond: Bond
}

export interface MarketplaceStats {
  totalVolume: number
  totalFees: number
  totalListings: number
  activeBonds: number
}

export interface UserPortfolio {
  bonds: Bond[]
  totalValue: number
  totalYield: number
  activeBonds: number
  maturedBonds: number
}

export interface ContractConfig {
  bondVault: string
  bondNft: string
  bondMarketplace: string
  sbtcToken: string
}

export type BondStatus = 'active' | 'withdrawn' | 'early-exit'
export type LockPeriod = 30 | 90 | 180
export type Network = 'mainnet' | 'testnet' | 'devnet'

export interface CreateBondParams {
  amount: number
  lockPeriod: LockPeriod
}

export interface ListBondParams {
  bondId: number
  price: number
}

export interface BuyBondParams {
  bondId: number
  price: number
}

export interface WalletState {
  isConnected: boolean
  address?: string
  balance?: number
  network?: Network
}

export interface ContractCallResult {
  success: boolean
  txId?: string
  error?: string
  data?: any
}

export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface BondMetadata {
  name: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string | number
  }[]
}
