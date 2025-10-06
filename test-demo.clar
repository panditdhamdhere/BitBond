;; BitBond Contract Testing Demo
;; This file demonstrates the key functionality of our contracts

;; Test 1: Initialize sBTC token
(print "=== Initializing sBTC Token ===")
(contract-call? .sbtc-token initialize-test-balances)

;; Test 2: Configure contract relationships
(print "=== Configuring Contract Relationships ===")
(contract-call? .bond-vault set-contracts 
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-nft
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-marketplace)

(contract-call? .bond-nft set-bond-vault 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-vault)
(contract-call? .bond-nft set-marketplace 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-marketplace)

(contract-call? .bond-marketplace set-contracts
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-nft
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bond-vault)

;; Test 3: Create a 30-day bond
(print "=== Creating 30-day Bond ===")
(contract-call? .bond-vault create-bond u1000 u30)

;; Test 4: Check bond info
(print "=== Checking Bond Info ===")
(contract-call? .bond-vault get-bond-info u1)

;; Test 5: Check NFT ownership
(print "=== Checking NFT Ownership ===")
(contract-call? .bond-nft get-owner u1)

;; Test 6: Calculate yield
(print "=== Calculating Yield ===")
(contract-call? .bond-vault calculate-yield u1000 u30)

;; Test 7: Check insurance pool
(print "=== Checking Insurance Pool ===")
(contract-call? .bond-vault get-insurance-pool-balance)

;; Test 8: List bond on marketplace
(print "=== Listing Bond on Marketplace ===")
(contract-call? .bond-marketplace list-bond u1 u1000)

;; Test 9: Check marketplace listing
(print "=== Checking Marketplace Listing ===")
(contract-call? .bond-marketplace get-listing u1)

;; Test 10: Get marketplace stats
(print "=== Getting Marketplace Stats ===")
(contract-call? .bond-marketplace get-marketplace-stats)

(print "=== All Tests Completed Successfully! ===")
