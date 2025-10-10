// Demo data for BitBond showcase
import { Bond, BondListing, ProtocolStats } from './types'

export const DEMO_BONDS: Bond[] = [
  {
    id: 1,
    owner: 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72',
    amount: 1000000, // 0.01 sBTC
    lockPeriod: 30,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    maturityDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    apy: 5,
    status: 'active',
    currentBlockHeight: 100000
  },
  {
    id: 2,
    owner: 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72',
    amount: 2500000, // 0.025 sBTC
    lockPeriod: 90,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    maturityDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    apy: 8,
    status: 'active',
    currentBlockHeight: 100000
  },
  {
    id: 3,
    owner: 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72',
    amount: 5000000, // 0.05 sBTC
    lockPeriod: 180,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    maturityDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
    apy: 12,
    status: 'matured',
    currentBlockHeight: 100000
  }
]

export const DEMO_LISTINGS: BondListing[] = [
  {
    id: 1,
    bondId: 1,
    seller: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    price: 45000, // 0.045 STX
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'active',
    bond: DEMO_BONDS[0]
  },
  {
    id: 2,
    bondId: 2,
    seller: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    price: 120000, // 0.12 STX
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'active',
    bond: DEMO_BONDS[1]
  }
]

export const DEMO_PROTOCOL_STATS: ProtocolStats = {
  totalValueLocked: 15000000, // 0.15 sBTC
  totalBonds: 1250,
  totalYield: 2500000, // 0.025 sBTC
  insurancePool: 500000, // 0.005 sBTC
  averageApy: 8.5,
  marketplaceVolume: 5000000, // 5 STX
  activeBonds: 850,
  maturedBonds: 400,
  listedBonds: 45
}

export const DEMO_RECENT_ACTIVITY = [
  {
    id: 1,
    type: 'bond_created',
    user: 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72',
    amount: 1000000,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    description: 'Created 30-day bond'
  },
  {
    id: 2,
    type: 'bond_sold',
    user: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    amount: 45000,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    description: 'Sold bond on marketplace'
  },
  {
    id: 3,
    type: 'bond_withdrawn',
    user: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    amount: 5000000,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    description: 'Withdrew matured bond'
  }
]

export const DEMO_LEADERBOARD = [
  {
    rank: 1,
    address: 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72',
    amount: 15000000,
    bonds: 12
  },
  {
    rank: 2,
    address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    amount: 8500000,
    bonds: 8
  },
  {
    rank: 3,
    address: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    amount: 6200000,
    bonds: 6
  }
]
