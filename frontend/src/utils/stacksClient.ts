import { uintCV } from '@stacks/transactions'
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

type NetworkConfig = {
  name: Network
  url: string
  chainId: number
}

class StacksClient {
  private network: NetworkConfig
  private contracts: Record<string, string>

  constructor(network: Network = 'testnet') {
    this.network = this.getNetwork(network)
    this.contracts = CONTRACTS[network]
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
      
      return { success: true, address: result.address }
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
    try {
      // Placeholder: Replace with real read-only call
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
    try {
      // Placeholder: Replace with real read-only call
      return null
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
