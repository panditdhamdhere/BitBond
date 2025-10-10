/**
 * Transaction status tracking utilities
 */

import toast from 'react-hot-toast'

export type TxStatus = 'pending' | 'success' | 'failed' | 'abort_by_response' | 'abort_by_post_condition'

export interface TransactionResult {
  txId: string
  status: TxStatus
  error?: string
}

/**
 * Poll transaction status on the Stacks blockchain
 */
export async function pollTransactionStatus(
  txId: string,
  network: 'testnet' | 'mainnet' = 'testnet',
  maxAttempts = 30
): Promise<TransactionResult> {
  const apiUrl = network === 'testnet' 
    ? 'https://api.testnet.hiro.so'
    : 'https://api.hiro.so'
  
  let attempts = 0
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`)
      
      if (!response.ok) {
        // Transaction not found yet, continue polling
        await new Promise(resolve => setTimeout(resolve, 3000))
        attempts++
        continue
      }
      
      const data = await response.json()
      const status = data.tx_status as TxStatus
      
      if (status === 'pending') {
        // Still pending, continue polling
        await new Promise(resolve => setTimeout(resolve, 3000))
        attempts++
        continue
      }
      
      // Transaction completed (success or failure)
      return {
        txId,
        status,
        error: data.tx_result?.repr || undefined
      }
    } catch (error) {
      // Network error, continue polling
      await new Promise(resolve => setTimeout(resolve, 3000))
      attempts++
    }
  }
  
  // Timeout
  return {
    txId,
    status: 'pending',
    error: 'Transaction status check timed out'
  }
}

/**
 * Track transaction with toast notifications
 */
export async function trackTransaction(
  txId: string,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> {
  const toastId = toast.loading(`Transaction submitted: ${txId.substring(0, 10)}...`, {
    duration: Infinity
  })
  
  try {
    const result = await pollTransactionStatus(txId)
    
    toast.dismiss(toastId)
    
    if (result.status === 'success') {
      toast.success('Transaction confirmed! ✅', { duration: 5000 })
      onSuccess?.()
    } else {
      const errorMsg = result.error || 'Transaction failed'
      toast.error(`Transaction failed: ${errorMsg}`, { duration: 5000 })
      onError?.(errorMsg)
    }
  } catch (error) {
    toast.dismiss(toastId)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    toast.error(`Error tracking transaction: ${errorMsg}`, { duration: 5000 })
    onError?.(errorMsg)
  }
}

/**
 * Get transaction details from explorer
 */
export function getExplorerLink(txId: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
  const baseUrl = network === 'testnet'
    ? 'https://explorer.hiro.so/txid'
    : 'https://explorer.hiro.so/txid'
  
  return `${baseUrl}/${txId}?chain=${network}`
}

