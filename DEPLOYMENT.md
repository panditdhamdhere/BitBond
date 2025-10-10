# 🚀 BitBond Deployment - Testnet

## ✅ Successfully Deployed Contracts

All contracts are live on **Stacks Testnet** at address: `ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72`

### Contract Addresses

| Contract | Address | Status |
|----------|---------|--------|
| **sbtc-token** | `ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.sbtc-token` | ✅ Live |
| **bond-nft** | `ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.bond-nft` | ✅ Live |
| **bond-vault** | `ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.bond-vault` | ✅ Live |
| **bond-marketplace** | `ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.bond-marketplace` | ✅ Live |

## 🔗 Explorer Links

- [sbtc-token](https://explorer.hiro.so/txid/0xb438d728a84c023d33b9762fac838b5ccd3acc69ce20aa31b650837b77451501?chain=testnet)
- [bond-nft](https://explorer.hiro.so/address/ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72?chain=testnet)
- [bond-vault](https://explorer.hiro.so/txid/0xb3de0683f18ecd93484039f3a893be4ba853211b8e8303002c99af9ede7f3dae?chain=testnet)
- [bond-marketplace](https://explorer.hiro.so/txid/0xaf45e654064e9da959e4cbbf02987505d6c2e1f232abb5772e7db4701e2fab29?chain=testnet)

## 📋 Deployment Details

### Transaction IDs
- **sbtc-token**: `0xb438d728a84c023d33b9762fac838b5ccd3acc69ce20aa31b650837b77451501`
- **bond-vault**: `0xb3de0683f18ecd93484039f3a893be4ba853211b8e8303002c99af9ede7f3dae`
- **bond-marketplace**: `0xaf45e654064e9da959e4cbbf02987505d6c2e1f232abb5772e7db4701e2fab29`

### Deployment Cost
- Total STX spent: ~0.4 STX
- Per contract: 0.1 STX

## 🔧 Frontend Configuration

The frontend is configured to use these deployed contracts. Environment variables are set in:
- `frontend/.env.local` (active)
- `frontend/.env.production` (template)

```bash
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72
NEXT_PUBLIC_DEMO_MODE=false
```

## 🎯 Contract Functions

### sbtc-token (8 functions)
- `mint(amount, recipient)` - Mint test tokens
- `transfer(amount, sender, recipient, memo)` - Transfer tokens
- `get-balance(account)` - Get balance
- `get-name()`, `get-symbol()`, `get-decimals()`, `get-total-supply()`, `get-token-uri()`

### bond-vault (6 functions)
- `create-bond(amount, lock-period)` - Create new bond
- `withdraw-bond(bond-id)` - Withdraw matured bond
- `get-bond(bond-id)` - Get bond details
- `get-user-bonds(owner)` - Get user's bonds
- `get-protocol-stats()` - Get protocol statistics
- `get-next-bond-id()` - Get next bond ID

### bond-marketplace (6 functions)
- `list-bond(bond-id, price)` - List bond for sale
- `buy-bond(listing-id)` - Purchase listed bond
- `cancel-listing(listing-id)` - Cancel listing
- `get-listing(listing-id)` - Get listing details
- `get-all-listings()` - Get all listings
- `get-marketplace-stats()` - Get marketplace stats

### bond-nft (15 functions)
- SIP-009 compliant NFT functions
- Metadata management
- Transfer functionality

## 🧪 Testing

Verify contracts are working:

```bash
# Check sbtc-token
curl https://api.testnet.hiro.so/v2/contracts/interface/ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72/sbtc-token

# Check bond-vault
curl https://api.testnet.hiro.so/v2/contracts/interface/ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72/bond-vault

# Check bond-marketplace
curl https://api.testnet.hiro.so/v2/contracts/interface/ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72/bond-marketplace

# Check bond-nft
curl https://api.testnet.hiro.so/v2/contracts/interface/ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72/bond-nft
```

## 🎉 Status

**🟢 ALL SYSTEMS OPERATIONAL**

The BitBond protocol is fully deployed and ready for production use on Stacks Testnet!

---

*Deployed: October 10, 2025*
*Network: Stacks Testnet*
*Clarity Version: 1*

