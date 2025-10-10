'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Download } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts'
import { stacksClient } from '../utils/stacksClient'
import { truncateAddress } from '../utils/stacksClient'
import { DEMO_RECENT_ACTIVITY, DEMO_LEADERBOARD } from '../utils/demoData'

type TimeRange = '24h' | '7d' | '30d' | 'all'

interface ProtocolStats {
  tvlBtc: number
  totalBonds: number
  totalYieldBtc: number
  insuranceBtc: number
  avgApy: number
  marketVolumeStx: number
}

interface ActivityItem {
  id: string
  type: 'create' | 'withdraw' | 'sale'
  address: string
  amount: number
  timestamp: number
}

interface LeaderboardItem {
  address: string
  amount: number
}

const COLORS = ['#22c55e', '#f97316', '#64748b']

export default function Analytics() {
  const [range, setRange] = useState<TimeRange>('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ProtocolStats | null>(null)
  const [tvlSeries, setTvlSeries] = useState<{ date: string; tvl: number }[]>([])
  const [bondsByPeriod, setBondsByPeriod] = useState<{ name: string; count: number }[]>([])
  const [statusSplit, setStatusSplit] = useState<{ name: string; value: number }[]>([])
  const [yieldSeries, setYieldSeries] = useState<{ date: string; yield: number }[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [holders, setHolders] = useState<LeaderboardItem[]>([])
  const [traders, setTraders] = useState<LeaderboardItem[]>([])

  // Mock time-series/data generation (replace with API when ready)
  const generateData = (points = 30) => {
    const now = Date.now()
    const days = points
    const tvl: { date: string; tvl: number }[] = []
    const ys: { date: string; yield: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * 86400000)
      tvl.push({ date: date.toLocaleDateString(), tvl: 100 + Math.round(Math.random() * 50) })
      ys.push({ date: date.toLocaleDateString(), yield: Math.round(Math.random() * 5) })
    }
    setTvlSeries(tvl)
    setYieldSeries(ys)
    setBondsByPeriod([
      { name: '30d', count: 10 + Math.floor(Math.random() * 10) },
      { name: '90d', count: 7 + Math.floor(Math.random() * 7) },
      { name: '180d', count: 4 + Math.floor(Math.random() * 5) },
    ])
    setStatusSplit([
      { name: 'Active', value: 18 },
      { name: 'Matured', value: 6 },
      { name: 'Listed', value: 4 },
    ])
    setActivity(
      Array.from({ length: 10 }).map((_, i) => ({
        id: `${i}`,
        type: (['create', 'withdraw', 'sale'] as const)[i % 3],
        address: `SP${Math.random().toString(36).slice(2, 10)}`,
        amount: Math.round(Math.random() * 1000_0000) / 100, // display unit
        timestamp: now - i * 3600_000,
      }))
    )
    setHolders(
      Array.from({ length: 5 }).map((_, i) => ({
        address: `SP${Math.random().toString(36).slice(2, 10)}`,
        amount: 5 - i + Math.random(),
      }))
    )
    setTraders(
      Array.from({ length: 5 }).map((_, i) => ({
        address: `SP${Math.random().toString(36).slice(2, 10)}`,
        amount: 1000 - i * 100 + Math.random() * 100,
      }))
    )
  }

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use demo data for showcase
      const protocolStats = await stacksClient.getProtocolStats()
      setStats({
        tvlBtc: protocolStats ? protocolStats.totalValueLocked / 100000000 : 0.15,
        totalBonds: protocolStats ? protocolStats.totalBonds : 1250,
        totalYieldBtc: protocolStats ? protocolStats.totalYield / 100000000 : 0.025,
        insuranceBtc: protocolStats ? protocolStats.insurancePool / 100000000 : 0.005,
        avgApy: protocolStats ? protocolStats.averageApy : 8.5,
        marketVolumeStx: protocolStats ? protocolStats.marketplaceVolume / 1000000 : 5.0,
      })
      
      // Use demo activity and leaderboard data
      setActivity(DEMO_RECENT_ACTIVITY.map(item => ({
        id: item.id.toString(),
        type: item.type as 'create' | 'withdraw' | 'sale',
        address: item.user,
        amount: item.amount,
        timestamp: item.timestamp.getTime()
      })))
      
      setHolders(DEMO_LEADERBOARD.map(item => ({
        address: item.address,
        amount: item.amount / 100000000 // Convert to BTC
      })))
      
      setTraders(DEMO_LEADERBOARD.map(item => ({
        address: item.address,
        amount: item.amount / 1000000 // Convert to STX equivalent
      })))
      
      generateData(range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 60)
    } catch (e) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 30000)
    return () => clearInterval(id)
  }, [range])

  const exportCsv = () => {
    const rows = [['date', 'tvl'], ...tvlSeries.map(p => [p.date, p.tvl])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bitbond_tvl.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-pulse h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 h-80 animate-pulse" />
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 h-80 animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button onClick={refresh} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
          {(['24h','7d','30d','all'] as TimeRange[]).map(r => (
            <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-md text-sm ${range === r ? 'bg-orange-500 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={refresh} className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="TVL (BTC)" value={`${stats?.tvlBtc.toFixed(2)} BTC`} accent="from-green-500 to-emerald-600" />
        <StatCard label="Bonds Created" value={`${stats?.totalBonds ?? 0}`} accent="from-orange-500 to-orange-600" />
        <StatCard label="Yield Distributed" value={`${stats?.totalYieldBtc.toFixed(2)} BTC`} accent="from-blue-500 to-indigo-600" />
        <StatCard label="Insurance Pool" value={`${stats?.insuranceBtc.toFixed(2)} BTC`} accent="from-purple-500 to-fuchsia-600" />
        <StatCard label="Average APY" value={`${stats?.avgApy.toFixed(1)}%`} accent="from-teal-500 to-cyan-600" />
        <StatCard label="Market Volume" value={`${(stats?.marketVolumeStx ?? 0).toLocaleString()} STX`} accent="from-slate-600 to-slate-800" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="font-semibold mb-4">TVL Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tvlSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tvl" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="font-semibold mb-4">Bonds by Lock Period</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bondsByPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="font-semibold mb-4">Status Split</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusSplit} dataKey="value" nameKey="name" outerRadius={100} label>
                  {statusSplit.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="font-semibold mb-4">Cumulative Yield</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldSeries}>
                <defs>
                  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="yield" stroke="#22c55e" fillOpacity={1} fill="url(#yieldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activity.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-white ${a.type === 'create' ? 'bg-orange-500' : a.type === 'sale' ? 'bg-green-600' : 'bg-slate-600'}`}>{a.type}</span>
                  <span className="text-slate-700">{truncateAddress(a.address)}</span>
                </div>
                <div className="text-slate-700">{a.amount.toLocaleString()}</div>
                <div className="text-slate-500">{new Date(a.timestamp).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="font-semibold mb-4">Leaderboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Top Holders (BTC)</h4>
              <div className="space-y-2">
                {holders.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">#{i + 1} {truncateAddress(h.address)}</span>
                    <span className="font-medium">{h.amount.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Top Traders (STX)</h4>
              <div className="space-y-2">
                {traders.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">#{i + 1} {truncateAddress(h.address)}</span>
                    <span className="font-medium">{h.amount.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="text-sm text-slate-600">{label}</div>
      <div className={`text-2xl font-bold bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>{value}</div>
    </div>
  )
}


