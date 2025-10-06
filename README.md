# BitBond - Liquid Bonds for Bitcoin Holders

## 🎯 Overview
BitBond is a DeFi protocol on Stacks that turns fixed-term Bitcoin deposits (sBTC) into liquid, tradeable bond NFTs. Users lock sBTC for 30/90/180 days, earn guaranteed APY, and can sell the bond NFT before maturity on a secondary marketplace.

This makes the Bitcoin economy more capital efficient: idle BTC can earn predictable yield without fully sacrificing liquidity.

## 💡 Problem Statement
Bitcoin often sits idle, generating no return. When users do seek yield, they usually give up liquidity (funds locked) or face complex risk profiles. Users want predictable returns and the freedom to exit or reallocate at any time.

## ✨ Solution
BitBond issues fixed-term, fixed-yield bond NFTs backed by sBTC. Each bond accrues a guaranteed APY and can be transferred or sold on a marketplace at any time. At maturity, holders redeem principal + yield. Early exits are possible (10% penalty) and feed an insurance pool that strengthens protocol resilience.

## 🏗️ Architecture

### Smart Contracts
- `bond-vault.clar`: Core vault for creating bonds, tracking lock periods, calculating yields, handling withdrawals at maturity, and early-exit with penalty. Mints/burns bond NFTs and manages the insurance pool.
- `bond-nft.clar`: SIP-009-style NFT contract representing each bond with immutable metadata (amount, APY, lock period, maturity). Restricts transfers to owner or marketplace and provides `get-token-uri` (JSON metadata).
- `bond-marketplace.clar`: Peer-to-peer marketplace for bond NFTs with escrow and atomic swaps. Charges 2% protocol fee on sales (sent to insurance/treasury). Provides read-only price/stats helpers.

### Frontend
- React (Next.js TypeScript) + Tailwind CSS
- Stacks.js integration (`@stacks/connect`, `@stacks/transactions`)
- Wallet connection, bond creation, portfolio, marketplace, analytics

```
                        +-----------------------+
                        |      BitBond UI       |
                        |  Next.js + Tailwind   |
                        |  Wallet, NFTs, Charts |
                        +-----------+-----------+
                                    |
                                    | Stacks.js (Connect, Tx)
                                    v
     +--------------+    +-----------------+     +---------------------+
     |  bond-vault  |<-->|   bond-nft      |<--> | bond-marketplace    |
     |  sBTC escrow |    | SIP-009 bond ID |     |   escrow + swaps    |
     +--------------+    +-----------------+     +---------------------+
                 ^                ^                         |
                 |                |                         v
                 +--------- Insurance Pool <----------------+
```

## 🚀 Features
- ✅ Create bonds (30/90/180 days)
- ✅ Guaranteed APY (5% / 8% / 12%)
- ✅ Tradeable bond NFTs
- ✅ Secondary marketplace with atomic swaps
- ✅ Early exit option (10% penalty)
- ✅ Insurance pool accumulation
- ✅ Real-time analytics (TVL, volume, splits)

## 🛠️ Tech Stack
- Clarity (Stacks), Clarinet
- SIP-009 NFT, SIP-010 (sBTC mock/testing)
- Next.js (TypeScript), Tailwind CSS
- Stacks SDK: `@stacks/connect`, `@stacks/transactions`, `@stacks/network`
- UI/UX: `lucide-react`, `recharts`, `date-fns`, `react-hot-toast`
- GitHub Actions (CI), ESLint/TS

## 📦 Installation

### Prerequisites
- Node.js 18+
- Clarinet
- Stacks wallet (Hiro/Leather)

### Setup
```bash
# Clone
git clone https://github.com/panditdhamdhere/BitBond.git
cd BitBond

# Contracts (optional for local dev)
clarinet check

# Frontend
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000 (or next available port)
```

## 🧪 Testing
```bash
# Clarinet validation
clarinet check

# (Optional) Clarinet console
clarinet console
```

## 🔧 Configuration
Update `frontend/src/utils/constants.ts` with your contract addresses (mainnet/testnet) and network settings.

## 📈 Yield (Examples)
| Lock Period | APY | Example (1 sBTC) |
|-------------|-----|------------------|
| 30 days     | 5%  | ~0.0041 sBTC     |
| 90 days     | 8%  | ~0.0197 sBTC     |
| 180 days    | 12% | ~0.0592 sBTC     |

## 🔐 Security
- Escrow + atomic swaps on marketplace
- Reentrancy-safe operations
- Early-exit penalties fund insurance pool
- Follow Clarity and protocol best practices; audit recommended before mainnet

## 🧭 Project Structure
```
contracts/           # bond-vault, bond-nft, bond-marketplace (+ sbtc-token mock)
frontend/            # Next.js app (components, hooks, utils, app/)
tests/               # Clarinet tests
clarinet.toml        # Clarinet configuration
```

## 🤝 Contributing & License
Contributions welcome! See `CONTRIBUTING.md`. For security disclosures, see `SECURITY.md`.

MIT License © BitBond contributors