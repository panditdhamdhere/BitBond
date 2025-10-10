# 🚀 BitBond - Quick Start Guide

## ⚡ Get Started in 3 Minutes

### Prerequisites
- ✅ Leather or Hiro Wallet installed
- ✅ Testnet STX (get from [faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet))
- ✅ Web browser

### Step 1: Start the App
```bash
cd /Users/panditdhamdhere/Desktop/stacks/Stackbonds/frontend
npm run dev
```

Open: **http://localhost:3000**

### Step 2: Connect Your Wallet
1. Click "Connect Wallet" button
2. Choose Leather or Hiro Wallet
3. Approve the connection
4. ✅ You'll see your address & balance

### Step 3: Explore Features

#### 🏠 Dashboard
- View your bond portfolio
- Create new bonds
- Withdraw matured bonds
- List bonds for sale

#### 🏪 Marketplace  
- Browse bonds listed for sale
- Filter by lock period / discount
- Buy bonds at a discount
- See "Good Deal" badges

#### 📊 Analytics
- Protocol statistics
- Interactive charts
- Recent activity
- Top holders leaderboard

---

## 🎮 Try These Actions

### Create a Bond
```
1. Go to Dashboard
2. Click "Create Bond"
3. Enter amount: 0.5 sBTC
4. Select lock period: 90 days (8% APY)
5. Approve transaction
6. See your beautiful NFT certificate!
```

### List Bond for Sale
```
1. Hover over your bond
2. Click "List for Sale"
3. Set price: 0.6 STX
4. Confirm
5. Bond appears in Marketplace
```

### Buy a Bond
```
1. Go to Marketplace
2. Find a bond with good discount
3. Click "Buy Now"
4. Confirm purchase
5. Bond transferred to your wallet
```

### Withdraw at Maturity
```
1. Wait for bond to mature (or use demo mode)
2. Click "Withdraw"
3. Receive principal + yield
4. 🎉 Success animation plays
```

---

## 🎯 Demo Mode

For testing without real transactions:

1. Edit `frontend/.env.local`:
```bash
NEXT_PUBLIC_DEMO_MODE=true
```

2. Restart server:
```bash
npm run dev
```

3. Now you'll see demo data without needing real transactions!

---

## 🔗 Important Links

### Live Contracts (Testnet)
- [Explorer](https://explorer.hiro.so/address/ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72?chain=testnet)
- [sbtc-token](https://explorer.hiro.so/txid/0xb438d728a84c023d33b9762fac838b5ccd3acc69ce20aa31b650837b77451501?chain=testnet)
- [bond-vault](https://explorer.hiro.so/txid/0xb3de0683f18ecd93484039f3a893be4ba853211b8e8303002c99af9ede7f3dae?chain=testnet)
- [bond-marketplace](https://explorer.hiro.so/txid/0xaf45e654064e9da959e4cbbf02987505d6c2e1f232abb5772e7db4701e2fab29?chain=testnet)

### Documentation
- `README.md` - Full project overview
- `DEPLOYMENT.md` - Contract deployment details
- `PRODUCTION_READY.md` - Hackathon checklist
- `SECURITY.md` - Security considerations
- `CONTRIBUTING.md` - Development guidelines

---

## 🐛 Troubleshooting

### Wallet Won't Connect
- ✅ Make sure wallet extension is installed
- ✅ Try refreshing the page
- ✅ Check if you're on testnet

### Transaction Fails
- ✅ Ensure you have enough STX for gas
- ✅ Check wallet is connected
- ✅ Try again in a few seconds

### Data Not Loading
- ✅ Check network connection
- ✅ Verify contracts are deployed (see DEPLOYMENT.md)
- ✅ Enable demo mode as fallback

### Dev Server Issues
```bash
# Clear Next.js cache
rm -rf .next

# Restart server
npm run dev
```

---

## 📞 Need Help?

Check the documentation files or review the code:
- `frontend/src/utils/stacksClient.ts` - Contract integration
- `frontend/src/hooks/useAuth.ts` - Wallet connection
- `contracts/` - Smart contracts

---

## 🎉 You're Ready!

Start exploring BitBond and see how liquid bonds transform Bitcoin DeFi!

**Happy Bonding! 🚀**

