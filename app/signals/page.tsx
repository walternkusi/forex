'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  subscriptionStatus: string
  setupAccess: boolean
}

interface SignalHistory {
  id: string
  symbol: string
  direction: 'BUY' | 'SELL'
  entryZone: string
  stopLoss: string
  tp1: string
  tp2?: string
  tp3?: string
  timeframe: string
  confidence: number
  riskReward: string
  reasoning: string
  timestamp: string
  status: 'Active' | 'Hit TP1' | 'Hit TP2' | 'Hit TP3' | 'Hit SL' | 'Closed'
  result?: string
}

export default function SignalsHistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [signals, setSignals] = useState<SignalHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!userData || !token) {
      // Redirect to login if not authenticated
      router.push('/login')
      return
    }
    
    try {
      setUser(JSON.parse(userData))
      fetchSignals()
    } catch (error) {
      console.error('Error parsing user data:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      router.push('/login')
    }
  }, [router])

  const fetchSignals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/signals?userId=demo-user&limit=50')
      const data = await response.json()
      
      if (data.success) {
        setSignals(data.signals)
      } else {
        console.error('Failed to fetch signals:', data.message)
      }
    } catch (error) {
      console.error('Error fetching signals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const filteredSignals = signals.filter(signal => {
    const symbolMatch = filter === 'All' || signal.symbol.includes(filter.replace('/', ''))
    const statusMatch = statusFilter === 'All' || signal.status === statusFilter
    return symbolMatch && statusMatch
  })

  const categories = ['All', 'EUR', 'GBP', 'USD', 'BTC', 'ETH', 'XAU']
  const statusCategories = ['All', 'Active', 'Hit TP1', 'Hit TP2', 'Hit TP3', 'Hit SL', 'Closed']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-500/20 border-blue-400/50 text-blue-400'
      case 'Hit TP1': case 'Hit TP2': case 'Hit TP3': return 'bg-green-500/20 border-green-400/50 text-green-400'
      case 'Hit SL': return 'bg-red-500/20 border-red-400/50 text-red-400'
      case 'Closed': return 'bg-gray-500/20 border-gray-400/50 text-gray-400'
      default: return 'bg-gray-500/20 border-gray-400/50 text-gray-400'
    }
  }

  const getResultColor = (result: string) => {
    if (result.includes('+')) return 'text-green-400'
    if (result.includes('-')) return 'text-red-400'
    return 'text-blue-400'
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Logged In User */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-background/90 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/ai-trading-logo.svg" alt="AI Trading Assistant" className="w-10 h-10 transform group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-2xl font-black gradient-text tracking-tight">AI Trading</span>
                <p className="text-xs text-primary/60 -mt-1">Professional Analysis</p>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-2">
              <Link 
                href="/" 
                className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
              >
                Home
              </Link>
              <Link 
                href="/signals" 
                className="px-4 py-2 text-sm font-semibold bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-all"
              >
                Signals History
              </Link>
              <Link 
                href="/chart-analyzer" 
                className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
              >
                Analyzer
              </Link>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <Link 
                href="/settings" 
                className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2 gradient-text">Signals History</h1>
          <p className="text-muted-foreground">Track performance of AI-generated trading signals</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-2 border-green-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-xl">📈</span>
              </div>
              <h3 className="font-bold text-green-400">Win Rate</h3>
            </div>
            <p className="text-3xl font-black text-green-400">
              {signals.length > 0 ? Math.round((signals.filter(s => s.result && s.result.includes('+')).length / signals.length) * 100) : 0}%
            </p>
            <p className="text-sm text-green-400/70">
              {signals.filter(s => s.result && s.result.includes('+')).length}/{signals.length} signals profitable
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-blue-400 text-xl">💰</span>
              </div>
              <h3 className="font-bold text-blue-400">Total Signals</h3>
            </div>
            <p className="text-3xl font-black text-blue-400">{signals.length}</p>
            <p className="text-sm text-blue-400/70">Generated by AI</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-2 border-violet-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                <span className="text-violet-400 text-xl">⚡</span>
              </div>
              <h3 className="font-bold text-violet-400">Active Signals</h3>
            </div>
            <p className="text-3xl font-black text-violet-400">
              {signals.filter(s => s.status === 'Active').length}
            </p>
            <p className="text-sm text-violet-400/70">Currently running</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <span className="text-amber-400 text-xl">🎯</span>
              </div>
              <h3 className="font-bold text-amber-400">Avg Confidence</h3>
            </div>
            <p className="text-3xl font-black text-amber-400">
              {signals.length > 0 ? Math.round(signals.reduce((acc, s) => acc + (s.confidence || 7), 0) / signals.length) : 0}/10
            </p>
            <p className="text-sm text-amber-400/70">AI confidence</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold mb-2">Symbol Filter</label>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 py-1 rounded-lg font-medium transition text-sm ${
                      filter === cat
                        ? 'gradient-primary text-white'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Status Filter</label>
              <div className="flex gap-2 flex-wrap">
                {statusCategories.map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg font-medium transition text-sm ${
                      statusFilter === status
                        ? 'gradient-primary text-white'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Signals List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading signals...</p>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">No Signals Found</h3>
            <p className="text-muted-foreground mb-6">
              {signals.length === 0 
                ? "Start analyzing charts to generate your first trading signals!" 
                : "No signals match your current filters."
              }
            </p>
            <Link 
              href="/chart-analyzer"
              className="gradient-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg inline-block"
            >
              🎯 Analyze Chart
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSignals.map((signal) => (
              <div 
                key={signal.id}
                className="bg-gradient-to-br from-card/90 to-card/70 border-2 border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl"
              >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-violet-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {signal.symbol.slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{signal.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{signal.timestamp}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Direction Badge */}
                  <div className={`px-4 py-2 rounded-xl font-bold border-2 ${
                    signal.direction === 'BUY' 
                      ? 'bg-green-500/20 border-green-400/50 text-green-400' 
                      : 'bg-red-500/20 border-red-400/50 text-red-400'
                  }`}>
                    {signal.direction === 'BUY' ? '📈' : '📉'} {signal.direction}
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(signal.status)}`}>
                    {signal.status}
                  </div>
                </div>
              </div>

              {/* Trading Levels */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                  <p className="text-sm font-bold text-blue-400 uppercase mb-1">Entry Zone</p>
                  <p className="text-lg font-black text-blue-400 font-mono">{signal.entryZone}</p>
                </div>
                
                <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
                  <p className="text-sm font-bold text-green-400 uppercase mb-1">TP 1</p>
                  <p className="text-lg font-black text-green-400 font-mono">{signal.tp1}</p>
                </div>
                
                {signal.tp2 && (
                  <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
                    <p className="text-sm font-bold text-green-400 uppercase mb-1">TP 2</p>
                    <p className="text-lg font-black text-green-400 font-mono">{signal.tp2}</p>
                  </div>
                )}
                
                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                  <p className="text-sm font-bold text-red-400 uppercase mb-1">Stop Loss</p>
                  <p className="text-lg font-black text-red-400 font-mono">{signal.stopLoss}</p>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/5 border-2 border-blue-400/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-400">💡</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-400 mb-2 uppercase">Analysis Reasoning</h4>
                    <p className="text-foreground/90 text-sm leading-relaxed">{signal.reasoning}</p>
                  </div>
                </div>
              </div>

              {/* Footer Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Timeframe</p>
                    <p className="text-sm font-bold text-primary">{signal.timeframe}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase mb-1">R:R</p>
                    <p className="text-sm font-bold text-violet-400">{signal.riskReward}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Confidence</p>
                    <p className="text-sm font-bold text-amber-400">{signal.confidence}/10</p>
                  </div>
                </div>
                
                {signal.result && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Result</p>
                    <p className={`text-lg font-black ${getResultColor(signal.result)}`}>
                      {signal.result}
                    </p>
                  </div>
                )}
              </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-6">Want to generate your own trading signals?</p>
          <Link 
            href="/chart-analyzer"
            className="gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg inline-block transform hover:scale-105"
          >
            🎯 Try AI Analyzer
          </Link>
        </div>
      </div>
    </div>
  )
}