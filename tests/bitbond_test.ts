// BitBond Comprehensive Test Suite
// Tests all contracts: bond-vault, bond-nft, bond-marketplace

import { Clarinet, Tx, types, chain, Account } from "clarinet-sdk";

// Test accounts
const deployer = { address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", name: "deployer" };
const user1 = { address: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", name: "user1" };
const user2 = { address: "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC", name: "user2" };
const user3 = { address: "ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND", name: "user3" };

// Contract principals (will be set during deployment)
let bondVault: string;
let bondNft: string;
let bondMarketplace: string;
let sbtcToken: string;

// Test constants
const AMOUNT_1000 = 1000;
const AMOUNT_5000 = 5000;
const PERIOD_30 = 30;
const PERIOD_90 = 90;
const PERIOD_180 = 180;
const PRICE_1000 = 1000;

Clarinet.test({
  name: "Setup: Initialize test environment",
  async fn() {
    // Initialize sBTC token with test balances
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("sbtc-token", "initialize-test-balances", [], deployer.address),
    ]);
    receipt.result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Setup: Configure contract relationships",
  async fn() {
    // Get contract principals from deployment
    bondVault = `${deployer.address}.bond-vault`;
    bondNft = `${deployer.address}.bond-nft`;
    bondMarketplace = `${deployer.address}.bond-marketplace`;
    sbtcToken = `${deployer.address}.sbtc-token`;

    // Configure bond-vault with external contracts
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "set-contracts", [
        types.principal(sbtcToken),
        types.principal(bondNft),
        types.principal(bondMarketplace)
      ], deployer.address),
    ]);
    receipt.result.expectOk().expectBool(true);

    // Configure bond-nft with vault and marketplace
    chain.mineBlock([
      Tx.contractCall("bond-nft", "set-bond-vault", [types.principal(bondVault)], deployer.address),
      Tx.contractCall("bond-nft", "set-marketplace", [types.principal(bondMarketplace)], deployer.address),
    ]);

    // Configure marketplace with nft and vault
    chain.mineBlock([
      Tx.contractCall("bond-marketplace", "set-contracts", [
        types.principal(bondNft),
        types.principal(bondVault)
      ], deployer.address),
    ]);
  },
});

// ============================================================================
// BOND VAULT TESTS
// ============================================================================

Clarinet.test({
  name: "Bond Vault: Create bond with valid 30-day period",
  async fn() {
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);
    
    receipt.result.expectOk().expectUint(1);
    
    // Verify bond was created
    const bondInfo = chain.callReadOnlyFn("bond-vault", "get-bond-info", [types.uint(1)], user1.address);
    bondInfo.result.expectOk().expectSome().expectTuple();
  },
});

Clarinet.test({
  name: "Bond Vault: Create bond with valid 90-day period",
  async fn() {
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_5000),
        types.uint(PERIOD_90)
      ], user2.address),
    ]);
    
    receipt.result.expectOk().expectUint(2);
  },
});

Clarinet.test({
  name: "Bond Vault: Create bond with valid 180-day period",
  async fn() {
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_180)
      ], user3.address),
    ]);
    
    receipt.result.expectOk().expectUint(3);
  },
});

Clarinet.test({
  name: "Bond Vault: Reject invalid lock period",
  async fn() {
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(60) // Invalid period
      ], user1.address),
    ]);
    
    receipt.result.expectErr().expectUint(101); // ERR-BAD-LOCK-PERIOD
  },
});

Clarinet.test({
  name: "Bond Vault: Reject zero amount",
  async fn() {
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(0),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);
    
    receipt.result.expectErr().expectUint(102); // ERR-TRANSFER-FAILED
  },
});

Clarinet.test({
  name: "Bond Vault: Calculate correct yield for 30-day period",
  async fn() {
    // Create a 30-day bond
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);

    // Calculate expected yield: 1000 * 5 * 30 / 36500 = 4.1... ≈ 4
    const yield = chain.callReadOnlyFn("bond-vault", "calculate-yield", [
      types.uint(AMOUNT_1000),
      types.uint(PERIOD_30)
    ], user1.address);
    
    yield.result.expectOk().expectUint(4);
  },
});

Clarinet.test({
  name: "Bond Vault: Calculate correct yield for 90-day period",
  async fn() {
    // Calculate expected yield: 1000 * 8 * 90 / 36500 = 19.7... ≈ 19
    const yield = chain.callReadOnlyFn("bond-vault", "calculate-yield", [
      types.uint(AMOUNT_1000),
      types.uint(PERIOD_90)
    ], user1.address);
    
    yield.result.expectOk().expectUint(19);
  },
});

Clarinet.test({
  name: "Bond Vault: Calculate correct yield for 180-day period",
  async fn() {
    // Calculate expected yield: 1000 * 12 * 180 / 36500 = 59.1... ≈ 59
    const yield = chain.callReadOnlyFn("bond-vault", "calculate-yield", [
      types.uint(AMOUNT_1000),
      types.uint(PERIOD_180)
    ], user1.address);
    
    yield.result.expectOk().expectUint(59);
  },
});

Clarinet.test({
  name: "Bond Vault: Early exit applies 10% penalty correctly",
  async fn() {
    // Create a bond
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);

    // Get initial insurance pool balance
    const initialPool = chain.callReadOnlyFn("bond-vault", "get-insurance-pool-balance", [], user1.address);
    const initialBalance = initialPool.result.expectOk().expectUint();

    // Early exit the bond
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "early-exit", [types.uint(1)], user1.address),
    ]);
    
    // Should return 90% of principal (900)
    receipt.result.expectOk().expectUint(900);
    
    // Insurance pool should increase by 10% penalty (100)
    const finalPool = chain.callReadOnlyFn("bond-vault", "get-insurance-pool-balance", [], user1.address);
    finalPool.result.expectOk().expectUint(initialBalance + 100);
  },
});

Clarinet.test({
  name: "Bond Vault: Reject early withdrawal before maturity",
  async fn() {
    // Create a bond
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);

    // Try to withdraw immediately (before maturity)
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "withdraw-bond", [types.uint(1)], user1.address),
    ]);
    
    receipt.result.expectErr().expectUint(105); // ERR-NOT-MATURED
  },
});

Clarinet.test({
  name: "Bond Vault: Multiple bonds per user work correctly",
  async fn() {
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_2000),
        types.uint(PERIOD_90)
      ], user1.address),
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_3000),
        types.uint(PERIOD_180)
      ], user1.address),
    ]);
    
    receipt.result.expectOk().expectUint(1);
    receipt.result.expectOk().expectUint(2);
    receipt.result.expectOk().expectUint(3);
  },
});

// ============================================================================
// BOND NFT TESTS
// ============================================================================

Clarinet.test({
  name: "Bond NFT: Mint NFT when bond created",
  async fn() {
    // Create a bond (this should mint an NFT)
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);
    
    const bondId = receipt.result.expectOk().expectUint();
    
    // Verify NFT was minted to user1
    const owner = chain.callReadOnlyFn("bond-nft", "get-owner", [types.uint(bondId)], user1.address);
    owner.result.expectOk().expectSome().expectPrincipal(user1.address);
  },
});

Clarinet.test({
  name: "Bond NFT: Only vault can mint",
  async fn() {
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-nft", "mint", [
        types.uint(999),
        types.principal(user1.address),
        types.utf8("test-metadata")
      ], user1.address), // Non-vault caller
    ]);
    
    receipt.result.expectErr().expectUint(100); // ERR-UNAUTHORIZED
  },
});

Clarinet.test({
  name: "Bond NFT: Transfer restrictions work - only owner can transfer",
  async fn() {
    // Create a bond for user1
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);

    // Try to transfer from user2 (not owner)
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-nft", "transfer", [
        types.uint(1),
        types.principal(user1.address),
        types.principal(user2.address)
      ], user2.address), // Wrong caller
    ]);
    
    receipt.result.expectErr().expectUint(100); // ERR-UNAUTHORIZED
  },
});

Clarinet.test({
  name: "Bond NFT: Valid transfer works",
  async fn() {
    // Create a bond for user1
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);

    // Transfer from user1 to user2
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-nft", "transfer", [
        types.uint(1),
        types.principal(user1.address),
        types.principal(user2.address)
      ], user1.address), // Correct caller
    ]);
    
    receipt.result.expectOk().expectBool(true);
    
    // Verify ownership changed
    const owner = chain.callReadOnlyFn("bond-nft", "get-owner", [types.uint(1)], user2.address);
    owner.result.expectOk().expectSome().expectPrincipal(user2.address);
  },
});

Clarinet.test({
  name: "Bond NFT: Token URI returns valid data",
  async fn() {
    // Create a bond
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);

    // Get token URI
    const tokenUri = chain.callReadOnlyFn("bond-nft", "get-token-uri", [types.uint(1)], user1.address);
    tokenUri.result.expectOk().expectSome().expectUtf8();
  },
});

// ============================================================================
// MARKETPLACE TESTS
// ============================================================================

Clarinet.test({
  name: "Marketplace: List bond successfully",
  async fn() {
    // Create a bond for user1
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);

    // List the bond
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-marketplace", "list-bond", [
        types.uint(1),
        types.uint(PRICE_1000)
      ], user1.address),
    ]);
    
    receipt.result.expectOk().expectUint(1);
    
    // Verify listing exists
    const listing = chain.callReadOnlyFn("bond-marketplace", "get-listing", [types.uint(1)], user1.address);
    listing.result.expectOk().expectSome().expectTuple();
  },
});

Clarinet.test({
  name: "Marketplace: Can't list bond you don't own",
  async fn() {
    // Create a bond for user1
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);

    // Try to list from user2 (not owner)
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-marketplace", "list-bond", [
        types.uint(1),
        types.uint(PRICE_1000)
      ], user2.address),
    ]);
    
    receipt.result.expectErr().expectUint(100); // ERR-UNAUTHORIZED
  },
});

Clarinet.test({
  name: "Marketplace: Can't list already listed bond",
  async fn() {
    // Create and list a bond
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
      Tx.contractCall("bond-marketplace", "list-bond", [
        types.uint(1),
        types.uint(PRICE_1000)
      ], user1.address),
    ]);

    // Try to list again
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-marketplace", "list-bond", [
        types.uint(1),
        types.uint(PRICE_1000)
      ], user1.address),
    ]);
    
    receipt.result.expectErr().expectUint(102); // ERR-ALREADY-LISTED
  },
});

Clarinet.test({
  name: "Marketplace: Cancel listing returns NFT",
  async fn() {
    // Create and list a bond
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
      Tx.contractCall("bond-marketplace", "list-bond", [
        types.uint(1),
        types.uint(PRICE_1000)
      ], user1.address),
    ]);

    // Cancel listing
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-marketplace", "cancel-listing", [types.uint(1)], user1.address),
    ]);
    
    receipt.result.expectOk().expectBool(true);
    
    // Verify NFT is back with user1
    const owner = chain.callReadOnlyFn("bond-nft", "get-owner", [types.uint(1)], user1.address);
    owner.result.expectOk().expectSome().expectPrincipal(user1.address);
    
    // Verify listing is removed
    const listing = chain.callReadOnlyFn("bond-marketplace", "get-listing", [types.uint(1)], user1.address);
    listing.result.expectOk().expectNone();
  },
});

Clarinet.test({
  name: "Marketplace: Update price works",
  async fn() {
    // Create and list a bond
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
      Tx.contractCall("bond-marketplace", "list-bond", [
        types.uint(1),
        types.uint(PRICE_1000)
      ], user1.address),
    ]);

    // Update price
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-marketplace", "update-price", [
        types.uint(1),
        types.uint(1500)
      ], user1.address),
    ]);
    
    receipt.result.expectOk().expectBool(true);
    
    // Verify price updated
    const listing = chain.callReadOnlyFn("bond-marketplace", "get-listing", [types.uint(1)], user1.address);
    const price = listing.result.expectOk().expectSome().expectTuple()["price"];
    price.expectUint(1500);
  },
});

Clarinet.test({
  name: "Marketplace: Protocol fee calculated correctly (2%)",
  async fn() {
    const price = 1000;
    const expectedFee = 20; // 2% of 1000
    
    const fee = chain.callReadOnlyFn("bond-marketplace", "calculate-protocol-fee", [
      types.uint(price)
    ], user1.address);
    
    fee.result.expectOk().expectUint(expectedFee);
  },
});

Clarinet.test({
  name: "Marketplace: Multiple listings work correctly",
  async fn() {
    // Create multiple bonds and list them
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_2000),
        types.uint(PERIOD_90)
      ], user2.address),
      Tx.contractCall("bond-marketplace", "list-bond", [
        types.uint(1),
        types.uint(1000)
      ], user1.address),
      Tx.contractCall("bond-marketplace", "list-bond", [
        types.uint(2),
        types.uint(2000)
      ], user2.address),
    ]);
    
    // Verify both listings exist
    const listing1 = chain.callReadOnlyFn("bond-marketplace", "get-listing", [types.uint(1)], user1.address);
    const listing2 = chain.callReadOnlyFn("bond-marketplace", "get-listing", [types.uint(2)], user2.address);
    
    listing1.result.expectOk().expectSome();
    listing2.result.expectOk().expectSome();
  },
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

Clarinet.test({
  name: "Integration: Full flow - create -> list -> buy -> withdraw",
  async fn() {
    // Step 1: Create bond
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);

    // Step 2: List bond
    chain.mineBlock([
      Tx.contractCall("bond-marketplace", "list-bond", [
        types.uint(1),
        types.uint(PRICE_1000)
      ], user1.address),
    ]);

    // Step 3: Buy bond (user2 buys from user1)
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-marketplace", "buy-bond", [types.uint(1)], user2.address),
    ]);
    
    receipt.result.expectOk().expectUint(PRICE_1000);
    
    // Verify user2 now owns the NFT
    const owner = chain.callReadOnlyFn("bond-nft", "get-owner", [types.uint(1)], user2.address);
    owner.result.expectOk().expectSome().expectPrincipal(user2.address);
    
    // Verify listing is removed
    const listing = chain.callReadOnlyFn("bond-marketplace", "get-listing", [types.uint(1)], user2.address);
    listing.result.expectOk().expectNone();
  },
});

Clarinet.test({
  name: "Integration: Create -> early exit -> insurance pool",
  async fn() {
    // Create bond
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);

    // Get initial insurance pool
    const initialPool = chain.callReadOnlyFn("bond-vault", "get-insurance-pool-balance", [], user1.address);
    const initialBalance = initialPool.result.expectOk().expectUint();

    // Early exit
    const { block, receipt } = chain.mineBlock([
      Tx.contractCall("bond-vault", "early-exit", [types.uint(1)], user1.address),
    ]);
    
    receipt.result.expectOk().expectUint(900); // 90% of 1000
    
    // Verify insurance pool increased by 100 (10% penalty)
    const finalPool = chain.callReadOnlyFn("bond-vault", "get-insurance-pool-balance", [], user1.address);
    finalPool.result.expectOk().expectUint(initialBalance + 100);
  },
});

Clarinet.test({
  name: "Integration: Price suggestions are reasonable",
  async fn() {
    // Create a 30-day bond
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
    ]);

    // Get suggested price
    const suggestedPrice = chain.callReadOnlyFn("bond-marketplace", "calculate-suggested-price", [
      types.uint(1)
    ], user1.address);
    
    // Should be at least the principal amount
    const price = suggestedPrice.result.expectOk().expectUint();
    price.expectUintGreaterThanOrEqual(AMOUNT_1000);
  },
});

Clarinet.test({
  name: "Integration: Marketplace stats track correctly",
  async fn() {
    // Create and list a bond
    chain.mineBlock([
      Tx.contractCall("bond-vault", "create-bond", [
        types.uint(AMOUNT_1000),
        types.uint(PERIOD_30)
      ], user1.address),
      Tx.contractCall("bond-marketplace", "list-bond", [
        types.uint(1),
        types.uint(PRICE_1000)
      ], user1.address),
    ]);

    // Get marketplace stats
    const stats = chain.callReadOnlyFn("bond-marketplace", "get-marketplace-stats", [], user1.address);
    const statsTuple = stats.result.expectOk().expectTuple();
    
    // Should have 1 listing
    statsTuple["total-listings"].expectUint(1);
  },
});