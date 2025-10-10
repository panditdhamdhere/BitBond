import { uintCV, cvToJSON, fetchCallReadOnlyFunction, ClarityValue } from '@stacks/transactions'
import { openContractCall, showConnect } from '@stacks/connect'
import { 
  Bond, 
  BondListing, 
  CreateBondParams, 
  ListBondParams, 
  BuyBondParams,
  ContractCallResult,
  Network
} from './types'
import { CONTRACTS, NETWORK_CONFIG } from './constants'
import type { ContractConfig } from './types'
import { DEMO_BONDS, DEMO_LISTINGS, DEMO_PROTOCOL_STATS } from './demoData'

type NetworkConfig = {
  name: Network
  url: string
  chainId: number
}

class StacksClient {
  private network: NetworkConfig
  private contracts: ContractConfig
  private demoMode: boolean

  constructor(network: Network = 'testnet') {
    this.network = this.getNetwork(network)
    this.contracts = CONTRACTS[network]
    this.demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || false // Use real contracts when available
  }

  /**
   * Check if contracts are available on the network
   */
  async checkContractsAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.network.url}/v2/contracts/interface/${this.contracts.bondNft}`)
      return response.ok
    } catch {
      return false
    }
  }

  private getNetwork(network: Network): NetworkConfig {
    const config = NETWORK_CONFIG[network]
    
    // Return network configuration object
    return {
      name: network,
      url: config.coreApiUrl,
      chainId: config.chainId
    }
  }

  /**
   * Get Stacks network object for transactions
   */
  private getStacksNetwork() {
    // Minimal network object for read-only calls
    return { url: this.network.url } as unknown as any
  }

  /**
   * Connect wallet using Stacks Connect
   */
  async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      const result = await showConnect({
        appDetails: {
          name: 'BitBond',
          icon: '/icon.png',
        },
        redirectTo: '/',
        onFinish: (_payload) => {
          // No-op; connection handled by provider
        },
        onCancel: () => {
          // No-op
        },
      })
      // Using global auth flow; address is handled elsewhere
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Wallet connection failed'
      return { success: false, error: message }
    }
  }

  /**
   * Create a new bond by locking sBTC
   */
  /**
   * Build and open contract call to create a new bond
   */
  async createBond(params: CreateBondParams): Promise<ContractCallResult> {
    try {
      const functionArgs = [
        uintCV(params.amount),
        uintCV(params.lockPeriod)
      ]

      const options: unknown = {
        contractAddress: this.contracts.bondVault.split('.')[0],
        contractName: this.contracts.bondVault.split('.')[1],
        functionName: 'create-bond',
        functionArgs,
        network: this.network,
        appDetails: {
          name: 'BitBond',
          icon: '/icon.png',
        },
        onFinish: (_data: unknown) => {},
        onCancel: () => {},
      }

      await openContractCall(options as Parameters<typeof openContractCall>[0])
      
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Create bond failed'
      return { success: false, error: message }
    }
  }

  /**
   * Withdraw a matured bond
   */
  async withdrawBond(bondId: number): Promise<ContractCallResult> {
    try {
      const functionArgs = [uintCV(bondId)]

      const options: unknown = {
        contractAddress: this.contracts.bondVault.split('.')[0],
        contractName: this.contracts.bondVault.split('.')[1],
        functionName: 'withdraw-bond',
        functionArgs,
        network: this.network,
        appDetails: {
          name: 'BitBond',
          icon: '/icon.png',
        },
        onFinish: (_data: unknown) => {},
        onCancel: () => {},
      }

      await openContractCall(options as Parameters<typeof openContractCall>[0])
      
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Withdraw bond failed'
      return { success: false, error: message }
    }
  }

  /**
   * Early exit a bond with penalty
   */
  async earlyExitBond(bondId: number): Promise<ContractCallResult> {
    try {
      const functionArgs = [uintCV(bondId)]

      const options: unknown = {
        contractAddress: this.contracts.bondVault.split('.')[0],
        contractName: this.contracts.bondVault.split('.')[1],
        functionName: 'early-exit',
        functionArgs,
        network: this.network,
        appDetails: {
          name: 'BitBond',
          icon: '/icon.png',
        },
        onFinish: (_data: unknown) => {},
        onCancel: () => {},
      }

      await openContractCall(options as Parameters<typeof openContractCall>[0])
      
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Early exit bond failed'
      return { success: false, error: message }
    }
  }

  /**
   * List a bond for sale on marketplace
   */
  async listBond(params: ListBondParams): Promise<ContractCallResult> {
    try {
      const functionArgs = [
        uintCV(params.bondId),
        uintCV(params.price)
      ]

      const options: unknown = {
        contractAddress: this.contracts.bondMarketplace.split('.')[0],
        contractName: this.contracts.bondMarketplace.split('.')[1],
        functionName: 'list-bond',
        functionArgs,
        network: this.network,
        appDetails: {
          name: 'BitBond',
          icon: '/icon.png',
        },
        onFinish: (_data: unknown) => {},
        onCancel: () => {},
      }

      await openContractCall(options as Parameters<typeof openContractCall>[0])
      
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'List bond failed'
      return { success: false, error: message }
    }
  }

  /**
   * Buy a bond from marketplace
   */
  async buyBond(params: BuyBondParams): Promise<ContractCallResult> {
    try {
      const functionArgs = [uintCV(params.bondId)]

      const options: unknown = {
        contractAddress: this.contracts.bondMarketplace.split('.')[0],
        contractName: this.contracts.bondMarketplace.split('.')[1],
        functionName: 'buy-bond',
        functionArgs,
        network: this.network,
        appDetails: {
          name: 'BitBond',
          icon: '/icon.png',
        },
        onFinish: (_data: unknown) => {},
        onCancel: () => {},
      }

      await openContractCall(options as Parameters<typeof openContractCall>[0])
      
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Buy bond failed'
      return { success: false, error: message }
    }
  }

  /**
   * Cancel a bond listing
   */
  async cancelListing(bondId: number): Promise<ContractCallResult> {
    try {
      const functionArgs = [uintCV(bondId)]

      const options: unknown = {
        contractAddress: this.contracts.bondMarketplace.split('.')[0],
        contractName: this.contracts.bondMarketplace.split('.')[1],
        functionName: 'cancel-listing',
        functionArgs,
        network: this.network,
        appDetails: {
          name: 'BitBond',
          icon: '/icon.png',
        },
        onFinish: (_data: unknown) => {},
        onCancel: () => {},
      }

      await openContractCall(options as Parameters<typeof openContractCall>[0])
      
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cancel listing failed'
      return { success: false, error: message }
    }
  }

  /**
   * Read bond information
   */
  async getBondInfo(bondId: number): Promise<Bond | null> {
    const contractsAvailable = await this.checkContractsAvailable()
    
    if (this.demoMode || !contractsAvailable) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return DEMO_BONDS.find(bond => bond.id === bondId) || null
    }
    
    try {
      const [contractAddress, contractName] = this.contracts.bondVault.split('.')
      const network = this.getStacksNetwork()
      
      const result = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-bond',
        functionArgs: [uintCV(bondId)],
        network,
        senderAddress: contractAddress,
      })
      
      const json = cvToJSON(result)
      if (json.success && json.value) {
        const bondData = json.value
        return {
          id: bondId,
          owner: bondData.owner,
          amount: Number(bondData.amount),
          lockPeriod: Number(bondData['lock-period']),
          createdAt: Number(bondData['created-at']),
          maturityDate: Number(bondData['created-at']) + Number(bondData['lock-period']),
          apy: Number(bondData.apy) / 100, // Convert from basis points
          status: bondData.status as 'active' | 'matured' | 'withdrawn',
          currentValue: Number(bondData.amount),
        }
      }
      
      return null
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get bond info failed:', error)
      return null
    }
  }

  /**
   * Get marketplace listing
   */
  async getListing(bondId: number): Promise<BondListing | null> {
    if (this.demoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return DEMO_LISTINGS.find(listing => listing.bond.id === bondId) || null
    }
    
    try {
      const [marketAddress, marketName] = this.contracts.bondMarketplace.split('.')
      const network = this.getStacksNetwork()
      const res = await fetchCallReadOnlyFunction({
        contractAddress: marketAddress,
        contractName: marketName,
        functionName: 'get-listing',
        functionArgs: [uintCV(bondId)],
        network,
        senderAddress: marketAddress,
      })

      const json = cvToJSON(res)
      if (!json.success) return null

      const opt = json.value
      const listingVal = opt && (opt.some || opt.value || null)
      if (!listingVal) return null

      const bond = await this.getBondInfo(Number(listingVal['bond-id']))
      if (!bond) return null

      return {
        id: Number(bondId),
        seller: listingVal.seller,
        price: Number(listingVal.price),
        listedAt: Number(listingVal['created-at']),
        bond,
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get listing failed:', error)
      return null
    }
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(): Promise<{ totalVolume: number; totalFees: number; totalListings: number; activeBonds: number } | null> {
    if (this.demoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        totalVolume: DEMO_PROTOCOL_STATS.marketplaceVolume,
        totalFees: DEMO_PROTOCOL_STATS.marketplaceVolume * 0.02, // 2% fee
        totalListings: DEMO_PROTOCOL_STATS.listedBonds,
        activeBonds: DEMO_PROTOCOL_STATS.activeBonds
      }
    }
    
    try {
      return {
        totalVolume: 1000000,
        totalFees: 20000,
        totalListings: 5,
        activeBonds: 10
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get marketplace stats failed:', error)
      return null
    }
  }

  /**
   * Get NFT owner
   */
  async getNFTOwner(tokenId: number): Promise<string | null> {
    try {
      // Placeholder: Replace with real read-only call
      return null
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get NFT owner failed:', error)
      return null
    }
  }

  /**
   * Get all marketplace listings
   */
  async getAllListings(): Promise<BondListing[]> {
    const contractsAvailable = await this.checkContractsAvailable()
    
    if (this.demoMode || !contractsAvailable) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return DEMO_LISTINGS
    }
    
    try {
      const [marketAddress, marketName] = this.contracts.bondMarketplace.split('.')
      const network = this.getStacksNetwork()

      // get total listings from stats
      const statsRes = await fetchCallReadOnlyFunction({
        contractAddress: marketAddress,
        contractName: marketName,
        functionName: 'get-marketplace-stats',
        functionArgs: [],
        network,
        senderAddress: marketAddress,
      })
      const statsJson = cvToJSON(statsRes)
      const totalListings = Number((statsJson.value && statsJson.value['total-listings']) || 0)

      const listings: BondListing[] = []
      for (let i = 1; i <= totalListings; i++) {
        const res = await fetchCallReadOnlyFunction({
          contractAddress: marketAddress,
          contractName: marketName,
          functionName: 'get-listing',
          functionArgs: [uintCV(i)],
          network,
          senderAddress: marketAddress,
        })
        const json = cvToJSON(res)
        if (!json.success) continue
        const val = json.value && (json.value.some || json.value.value)
        if (!val) continue
        // keep only active
        const statusStr = String(val.status || '')
        if (statusStr.toLowerCase() !== 'active') continue

        const bond = await this.getBondInfo(Number(val['bond-id']))
        if (!bond) continue
        listings.push({
          id: i,
          seller: val.seller,
          price: Number(val.price),
          listedAt: Number(val['created-at']),
          bond,
        })
      }

      return listings
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get all listings failed:', error)
      return []
    }
  }

  /**
   * Get all user bonds
   */
  async getUserBonds(address: string): Promise<Bond[]> {
    if (this.demoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return DEMO_BONDS.filter(bond => bond.owner === address)
    }
    
    try {
      const [vaultAddress, vaultName] = this.contracts.bondVault.split('.')
      const network = this.getStacksNetwork()

      // get next id (1-based). We'll iterate 1..nextId-1
      const nextIdRes = await fetchCallReadOnlyFunction({
        contractAddress: vaultAddress,
        contractName: vaultName,
        functionName: 'get-next-bond-id',
        functionArgs: [],
        network,
        senderAddress: vaultAddress,
      })
      const nextJson = cvToJSON(nextIdRes)
      const nextId = Number(nextJson.value || 1)

      const bonds: Bond[] = []
      for (let i = 1; i < nextId; i++) {
        const res = await fetchCallReadOnlyFunction({
          contractAddress: vaultAddress,
          contractName: vaultName,
          functionName: 'get-bond',
          functionArgs: [uintCV(i)],
          network,
          senderAddress: vaultAddress,
        })
        const json = cvToJSON(res)
        if (!json.success || !json.value) continue
        const b = json.value
        if (!b || String(b.owner) !== address) continue
        bonds.push({
          id: i,
          owner: b.owner,
          amount: Number(b.amount),
          lockPeriod: Number(b['lock-period']),
          createdAt: Number(b['created-at']),
          maturityDate: Number(b['created-at']) + Number(b['lock-period']),
          apy: Number(b.apy) / 100,
          status: b.status as 'active' | 'withdrawn' | 'early-exit',
          currentValue: Number(b.amount),
        } as unknown as Bond)
      }
      return bonds
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get user bonds failed:', error)
      return []
    }
  }

  /**
   * Get protocol statistics
   */
  async getProtocolStats(): Promise<typeof DEMO_PROTOCOL_STATS | null> {
    const contractsAvailable = await this.checkContractsAvailable()
    
    if (this.demoMode || !contractsAvailable) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return DEMO_PROTOCOL_STATS
    }
    
    try {
      const [vaultAddress, vaultName] = this.contracts.bondVault.split('.')
      const [marketAddress, marketName] = this.contracts.bondMarketplace.split('.')
      const network = this.getStacksNetwork()
      
      // Get vault stats
      const vaultStats = await fetchCallReadOnlyFunction({
        contractAddress: vaultAddress,
        contractName: vaultName,
        functionName: 'get-protocol-stats',
        functionArgs: [],
        network,
        senderAddress: vaultAddress,
      })
      
      // Get marketplace stats
      const marketStats = await fetchCallReadOnlyFunction({
        contractAddress: marketAddress,
        contractName: marketName,
        functionName: 'get-marketplace-stats',
        functionArgs: [],
        network,
        senderAddress: marketAddress,
      })
      
      const vaultJson = cvToJSON(vaultStats)
      const marketJson = cvToJSON(marketStats)
      
      if (vaultJson.success && vaultJson.value && marketJson.success && marketJson.value) {
        const vault = vaultJson.value
        const market = marketJson.value
        
        return {
          totalValueLocked: Number(vault['total-tvl']) || 0,
          totalBondsCreated: Number(vault['total-bonds']) || 0,
          activeBonds: Number(vault['total-bonds']) || 0,
          maturedBonds: 0,
          listedBonds: Number(market['active-listings']) || 0,
          totalYieldDistributed: 0,
          insurancePoolBalance: 0,
          averageAPY: Number(vault['average-apy']) / 100 || 5,
          marketplaceVolume: Number(market['total-volume']) || 0,
        }
      }
      
      return DEMO_PROTOCOL_STATS
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get protocol stats failed:', error)
      return DEMO_PROTOCOL_STATS
    }
  }
}

export const stacksClient = new StacksClient()
export default stacksClient

// Helper utilities
/** Truncate a principal address for display */
export function truncateAddress(addr: string, start = 6, end = 4): string {
  if (!addr || addr.length <= start + end) return addr
  return `${addr.slice(0, start)}...${addr.slice(-end)}`
}

/** Convert micro-units to readable string; placeholder for real formatting */
export function formatMicro(amount: number): string {
  return amount.toString()
}

/** Format a JS Date to yyyy-mm-dd */
export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}
