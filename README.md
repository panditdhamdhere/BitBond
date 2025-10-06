# BitBond - Bitcoin Liquidity Bonds on Stacks

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stacks](https://img.shields.io/badge/Stacks-2.0-blue)](https://stacks.co)
[![Clarity](https://img.shields.io/badge/Clarity-Smart%20Contracts-orange)](https://clarity-lang.org)

BitBond is a decentralized finance (DeFi) protocol built on the Stacks blockchain that enables users to lock sBTC (wrapped Bitcoin) for fixed periods and earn guaranteed yields through tradeable bond NFTs.

## 🚀 Features

### Core Protocol
- **Liquidity Bonds**: Lock sBTC for 30, 90, or 180 days
- **Guaranteed Yields**: Earn 5%, 8%, or 12% APY respectively
- **Tradeable NFTs**: Each bond is represented as a unique NFT
- **Early Exit**: Exit early with a 10% penalty (funds insurance pool)
- **Insurance Pool**: Community-funded protection against defaults

### Marketplace
- **Peer-to-Peer Trading**: Buy and sell bond NFTs
- **Atomic Swaps**: Secure, trustless transactions
- **Protocol Fees**: 2% fee on all trades (goes to insurance pool)
- **Price Discovery**: Dynamic pricing based on time remaining and yield

### Frontend
- **Modern UI**: Built with Next.js 14 and TypeScript
- **Wallet Integration**: Support for Hiro and Leather wallets
- **Real-time Updates**: Live balance and portfolio tracking
- **Responsive Design**: Mobile-first approach

## 🏗️ Architecture

```
BitBond/
├── contracts/           # Clarity smart contracts
│   ├── bond-vault.clar     # Main bond management contract
│   ├── bond-nft.clar       # SIP-009 NFT contract
│   ├── bond-marketplace.clar # P2P marketplace
│   └── sbtc-token.clar     # Mock sBTC token for testing
├── frontend/           # Next.js TypeScript application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── app/          # Next.js app router
├── tests/              # Clarinet test suite
└── clarinet.toml      # Clarinet configuration
```

## 🛠️ Smart Contracts

### Bond Vault (`bond-vault.clar`)
- Manages bond creation, withdrawal, and early exit
- Handles sBTC deposits and yield calculations
- Maintains insurance pool for risk management
- Integrates with NFT contract for bond representation

### Bond NFT (`bond-nft.clar`)
- SIP-009 compliant NFT standard
- Immutable metadata (bond details, APY, maturity)
- Transfer restrictions (owner or marketplace only)
- Data URL metadata for off-chain storage

### Bond Marketplace (`bond-marketplace.clar`)
- Peer-to-peer bond trading
- Atomic swaps with escrow mechanics
- Protocol fee collection (2%)
- Listing management and price updates

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Clarinet](https://github.com/hirosystems/clarinet) (v1.0+)
- [Hiro Wallet](https://wallet.hiro.so/) or [Leather Wallet](https://leather.io/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/panditdhamdhere/BitBond
   cd bitbond
   ```

2. **Install dependencies**
   ```bash
   # Install Clarinet (if not already installed)
   curl -L https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-installer.sh | bash
   
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. **Configure Clarinet**
   ```bash
   # From project root
   clarinet check
   ```

4. **Start development**
   ```bash
   # Start frontend development server
   cd frontend
   npm run dev
   
   # In another terminal, start Clarinet console
   clarinet console
   ```

## 🧪 Testing

### Smart Contract Tests
```bash
# Run Clarinet tests
clarinet test

# Run specific test file
clarinet test tests/bitbond_test.ts
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Contract Functions

### Bond Vault
- `create-bond(amount uint, lock-period uint)` - Create a new bond
- `withdraw-bond(bond-id uint)` - Withdraw matured bond with yield
- `early-exit(bond-id uint)` - Exit early with penalty
- `get-bond-info(bond-id uint)` - Get bond details
- `calculate-yield(amount uint, lock-period uint)` - Calculate yield

### Bond NFT
- `mint(bond-id uint, owner principal, metadata string)` - Mint bond NFT
- `burn(bond-id uint)` - Burn bond NFT
- `transfer(bond-id uint, sender principal, recipient principal)` - Transfer NFT
- `get-token-uri(bond-id uint)` - Get NFT metadata URI

### Marketplace
- `list-bond(bond-id uint, price uint)` - List bond for sale
- `buy-bond(bond-id uint)` - Buy listed bond
- `cancel-listing(bond-id uint)` - Cancel listing
- `update-price(bond-id uint, new-price uint)` - Update listing price

## 🔧 Configuration

### Network Configuration
Update `frontend/src/utils/constants.ts` with your contract addresses:

```typescript
export const CONTRACTS = {
  mainnet: {
    bondVault: 'SP...',
    bondNft: 'SP...',
    bondMarketplace: 'SP...',
    sbtcToken: 'SP...'
  },
  testnet: {
    // Your testnet addresses
  }
}
```

### Clarinet Configuration
Update `clarinet.toml` with your deployment settings:

```toml
[project]
name = "bitbond"
description = "Bitcoin liquidity bonds protocol on Stacks"

[contracts.bond-vault]
path = "contracts/bond-vault.clar"
depends_on = ["bond-nft"]
```

## 🚀 Deployment

### Smart Contracts
```bash
# Deploy to testnet
clarinet integrate --no-dashboard

# Deploy to mainnet (after testing)
clarinet deploy --mainnet
```

### Frontend
```bash
cd frontend
npm run build
npm run start
```

## 📈 Yield Calculations

| Lock Period | APY | Example (1 sBTC) |
|-------------|-----|------------------|
| 30 days     | 5%  | 0.0041 sBTC     |
| 90 days     | 8%  | 0.0197 sBTC     |
| 180 days    | 12% | 0.0592 sBTC     |

## 🛡️ Security

- **Audited Contracts**: All smart contracts follow best practices
- **Reentrancy Protection**: Atomic operations prevent reentrancy attacks
- **Access Controls**: Proper authorization for all state changes
- **Insurance Pool**: Community-funded protection against defaults
- **Early Exit Penalty**: 10% penalty discourages early withdrawals

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stacks Foundation](https://stacks.org/) for the blockchain infrastructure
- [Hiro Systems](https://hiro.so/) for development tools
- [Clarity Language](https://clarity-lang.org/) for secure smart contracts


---

**Built with ❤️ on Stacks**