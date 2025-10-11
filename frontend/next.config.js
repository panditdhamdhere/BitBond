/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is now default in Next.js 15
  experimental: {
    // appDir is now stable in Next.js 15
  },
  env: {
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK || 'testnet',
    NEXT_PUBLIC_STACKS_API_URL: process.env.NEXT_PUBLIC_STACKS_API_URL || 'https://api.testnet.hiro.so',
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72',
    NEXT_PUBLIC_SBTC_CONTRACT: process.env.NEXT_PUBLIC_SBTC_CONTRACT || 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.sbtc-token',
    NEXT_PUBLIC_BOND_VAULT_CONTRACT: process.env.NEXT_PUBLIC_BOND_VAULT_CONTRACT || 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.bond-vault',
    NEXT_PUBLIC_BOND_MARKETPLACE_CONTRACT: process.env.NEXT_PUBLIC_BOND_MARKETPLACE_CONTRACT || 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.bond-marketplace',
    NEXT_PUBLIC_BOND_NFT_CONTRACT: process.env.NEXT_PUBLIC_BOND_NFT_CONTRACT || 'ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72.bond-nft',
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || 'false',
  },
  images: {
    domains: ['localhost', 'vercel.app'],
    unoptimized: true,
  },
  output: 'standalone',
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
