'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { stacksClient } from '@/utils/stacksClient'
import { Shield, TrendingUp, CheckCircle, XCircle, Loader } from 'lucide-react'
import Link from 'next/link'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  data?: unknown
  error?: string
}

export default function TestContractsPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Get Protocol Stats', status: 'pending' },
    { name: 'Get Marketplace Stats', status: 'pending' },
    { name: 'Get All Listings', status: 'pending' },
    { name: 'Get Bond Info (ID: 1)', status: 'pending' },
  ])

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    const results: TestResult[] = []

    // Test 1: Get Protocol Stats
    try {
      const stats = await stacksClient.getProtocolStats()
      results.push({
        name: 'Get Protocol Stats',
        status: stats ? 'success' : 'error',
        data: stats,
        error: stats ? undefined : 'No data returned'
      })
    } catch (error) {
      results.push({
        name: 'Get Protocol Stats',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Get Marketplace Stats
    try {
      const stats = await stacksClient.getMarketplaceStats()
      results.push({
        name: 'Get Marketplace Stats',
        status: stats ? 'success' : 'error',
        data: stats,
        error: stats ? undefined : 'No data returned'
      })
    } catch (error) {
      results.push({
        name: 'Get Marketplace Stats',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 3: Get All Listings
    try {
      const listings = await stacksClient.getAllListings()
      results.push({
        name: 'Get All Listings',
        status: 'success',
        data: { count: listings.length, listings },
      })
    } catch (error) {
      results.push({
        name: 'Get All Listings',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: Get Bond Info
    try {
      const bond = await stacksClient.getBondInfo(1)
      results.push({
        name: 'Get Bond Info (ID: 1)',
        status: bond ? 'success' : 'error',
        data: bond,
        error: bond ? undefined : 'No bond found'
      })
    } catch (error) {
      results.push({
        name: 'Get Bond Info (ID: 1)',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    setTests(results)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-bitcoin-gradient rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  BitBond
                </h1>
                <p className="text-xs text-slate-500 -mt-1">Contract Test Page</p>
              </div>
            </Link>
            
            <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-8 h-8 text-orange-600" />
            <h2 className="text-2xl font-bold text-slate-900">Smart Contract Test Suite</h2>
          </div>
          
          <p className="text-slate-600 mb-8">
            Testing connectivity to deployed smart contracts on Stacks testnet
          </p>

          <div className="space-y-4">
            {tests.map((test, index) => (
              <div 
                key={index}
                className="border border-slate-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{test.name}</h3>
                  <div className="flex items-center space-x-2">
                    {test.status === 'pending' && (
                      <>
                        <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                        <span className="text-sm text-blue-600">Testing...</span>
                      </>
                    )}
                    {test.status === 'success' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Success</span>
                      </>
                    )}
                    {test.status === 'error' && (
                      <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-600 font-medium">Failed</span>
                      </>
                    )}
                  </div>
                </div>

                {test.error && (
                  <div className="text-sm text-red-600 bg-red-50 rounded p-2 mt-2">
                    Error: {test.error}
                  </div>
                )}

                {test.data && (
                  <details className="mt-2">
                    <summary className="text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                      View Response Data
                    </summary>
                    <pre className="mt-2 text-xs bg-slate-100 rounded p-3 overflow-x-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📝 Test Results Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.status === 'success').length}
                </div>
                <div className="text-sm text-slate-600">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {tests.filter(t => t.status === 'error').length}
                </div>
                <div className="text-sm text-slate-600">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {tests.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-sm text-slate-600">Pending</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={runTests}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🔄 Run Tests Again
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Contract Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Network:</span>
              <span className="font-mono text-slate-900">testnet</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Contract Address:</span>
              <span className="font-mono text-slate-900 text-xs">ST12K3B03KFQNFSXSBWEBZG2CE0R75M4GRRJ73S72</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Bond Vault:</span>
              <span className="font-mono text-slate-900 text-xs">bond-vault</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Marketplace:</span>
              <span className="font-mono text-slate-900 text-xs">bond-marketplace</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

