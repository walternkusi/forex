'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  subscriptionStatus: string
  setupAccess: boolean
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (userData && token) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show dashboard for logged-in users
  if (user) {
    return <LoggedInDashboard user={user} />
  }

  // Show marketing page for non-logged-in users
  return <MarketingHomePage />
}

// Dashboard for logged-in users
function LoggedInDashboard({ user }: { user: User }) {
  const [recentSignals, setRecentSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentSignals()
  }, [])

  const fetchRecentSignals = async () => {
    try {
      const response = await fetch('/api/signals?userId=deuser&limit=5')
      const data = await response.json()
      
      if (data.success) {
        setRecentSignals(data.signals)
      }
    } catch (error) {
      console.error('Error fetching recent signals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation for logged-in users */}
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
                className="px-4 py-2 text-sm font-semibold bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-all"
              >
                Dashboard
              </Link>
              <Link 
                href="/signals" 
                className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
              >
                Signals History
              </Link>
              <Link 
                href="/chart-analyzer" 
                className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
              >
                Analyzer
              </Link>
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

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">
            Welcome back, <span className="gradient-text">{user.name.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-muted-foreground">Ready to analyze some charts and make profitable trades?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-2 border-green-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-xl">📈</span>
              </div>
              <h3 className="font-bold text-green-400">Today's Profit</h3>
            </div>
            <p className="text-3xl font-black text-green-400">+$1,250</p>
            <p className="text-sm text-green-400/70">3 winning trades</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-blue-400 text-xl">🎯</span>
              </div>
              <h3 className="font-bold text-blue-400">Active Signals</h3>
            </div>
            <p className="text-3xl font-black text-blue-400">2</p>
            <p className="text-sm text-blue-400/70">Currently running</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-2 border-violet-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                <span className="text-violet-400 text-xl">📊</span>
              </div>
              <h3 className="font-bold text-violet-400">Charts Analyzed</h3>
            </div>
            <p className="text-3xl font-black text-violet-400">12</p>
            <p className="text-sm text-violet-400/70">This week</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <span className="text-amber-400 text-xl">⭐</span>
              </div>
              <h3 className="font-bold text-amber-400">Win Rate</h3>
            </div>
            <p className="text-3xl font-black text-amber-400">87%</p>
            <p className="text-sm text-amber-400/70">Last 30 days</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-card/90 to-card/70 border-2 border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-violet-500 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">AI Chart Analyzer</h3>
                <p className="text-muted-foreground">Upload and analyze your trading charts</p>
              </div>
            </div>
            <Link 
              href="/chart-analyzer"
              className="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg inline-block text-center transform hover:scale-105"
            >
              🎯 Analyze New Chart
            </Link>
          </div>

          <div className="bg-gradient-to-br from-card/90 to-card/70 border-2 border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📈</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">Signals History</h3>
                <p className="text-muted-foreground">Track your trading performance</p>
              </div>
            </div>
            <Link 
              href="/signals"
              className="w-full bg-gradient-to-r from-green-500/20 to-emerald-600/20 border-2 border-green-400/30 text-green-400 hover:bg-green-500/30 transition-all py-4 rounded-xl font-bold text-lg text-center inline-block transform hover:scale-105"
            >
              📊 View History
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-card/90 to-card/70 border-2 border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
          <h3 className="text-2xl font-bold gradient-text mb-6">Recent Analyzer Results</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-3 text-muted-foreground">Loading recent signals...</p>
            </div>
          ) : recentSignals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-muted-foreground mb-4">No signals generated yet</p>
              <Link 
                href="/chart-analyzer"
                className="gradient-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg inline-block"
              >
                🎯 Analyze Your First Chart
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSignals.map((signal, index) => (
                <div key={signal.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                  signal.result && signal.result.includes('+') 
                    ? 'bg-green-500/10 border-green-400/30' 
                    : signal.result && signal.result.includes('-')
                    ? 'bg-red-500/10 border-red-400/30'
                    : 'bg-blue-500/10 border-blue-400/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      signal.result && signal.result.includes('+') 
                        ? 'bg-green-500/20' 
                        : signal.result && signal.result.includes('-')
                        ? 'bg-red-500/20'
                        : 'bg-blue-500/20'
                    }`}>
                      <span className={
                        signal.result && signal.result.includes('+') 
                          ? 'text-green-400' 
                          : signal.result && signal.result.includes('-')
                          ? 'text-red-400'
                          : 'text-blue-400'
                      }>
                        {signal.direction === 'BUY' ? '📈' : signal.direction === 'SELL' ? '📉' : '📊'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {signal.symbol} {signal.direction} - Entry: {signal.entryZone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {signal.status} • {new Date(signal.timestamp).toLocaleString()}
                      </p>
                      {signal.reasoning && (
                        <p className="text-xs text-muted-foreground/80 mt-1 max-w-md truncate">
                          {signal.reasoning}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {signal.result ? (
                      <>
                        <span className={`font-bold text-lg ${
                          signal.result.includes('+') ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {signal.result}
                        </span>
                        <p className="text-xs text-muted-foreground">Result</p>
                      </>
                    ) : (
                      <>
                        <span className="text-blue-400 font-bold">{signal.status}</span>
                        <p className="text-xs text-blue-400/70">
                          {signal.confidence ? `${signal.confidence}/10 confidence` : 'Active'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Link */}
          <div className="mt-6 text-center">
            <Link 
              href="/signals"
              className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
            >
              View All Signals History →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Marketing page for non-logged-in users
function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
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
                className="px-4 py-2 text-sm font-semibold bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-all"
              >
                Home
              </Link>
              <Link 
                href="/signals" 
                className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
              >
                Signals
              </Link>
              <Link 
                href="/chart-analyzer" 
                className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
              >
                Analyzer
              </Link>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <Link 
                href="/login" 
                className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="gradient-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Chart */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-violet-600/20"></div>
        
        {/* Trading Image Background */}
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&h=1080&fit=crop" 
            alt="Trading charts"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Animated Chart Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
            <path 
              d="M0,200 Q250,100 500,150 T1000,100" 
              fill="none" 
              stroke="url(#gradient)" 
              strokeWidth="3"
              className="animate-pulse"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm animate-bounce">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-primary font-medium">🚀 AI-Powered Trading Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight">
              <span className="block text-foreground">Trade Smarter,</span>
              <span className="block gradient-text">Win Bigger</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
              Join <span className="text-primary font-bold">10,000+ traders</span> making profitable decisions with 
              <span className="text-primary font-bold"> AI-powered signals</span> across 27+ markets
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register" className="gradient-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-2xl transform hover:scale-105">
                🎯 Start Trading Now
              </Link>
              <Link href="/chart-analyzer" className="bg-secondary text-foreground px-10 py-4 rounded-xl font-bold text-lg hover:bg-secondary/80 transition border-2 border-white/10">
                📊 Try AI Analyzer
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-8 pt-8 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">No Credit Card</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Free Trial</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Analysis Showcase */}
      <section className="py-16 bg-gradient-to-br from-slate-900/95 to-slate-800/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-violet-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black gradient-text mb-4">AI Analysis Results</h2>
            <p className="text-muted-foreground">Real trading signals generated by our AI analyzer</p>
          </div>

          {/* Analysis Results Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Chart Analysis Image 1 */}
            <div className="bg-gradient-to-br from-card/90 to-card/70 border-2 border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl transform hover:scale-105 transition-all">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-bold gradient-text text-center">FVG Analysis</h3>
              </div>
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <img 
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjcwIiB5PSIxNDAiIHdpZHRoPSIyNjAiIGhlaWdodD0iMjAwIiBmaWxsPSIjQTBEOUVGIiBmaWxsLW9wYWNpdHk9IjAuNSIvPgo8dGV4dCB4PSIyMDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RlZHPC90ZXh0Pgo8dGV4dCB4PSIyMDAiIHk9IjMyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEFSR0VUPC90ZXh0Pgo8IS0tIENhbmRsZXN0aWNrIGNoYXJ0IC0tPgo8cmVjdCB4PSI5MCIgeT0iMTAwIiB3aWR0aD0iMTAiIGhlaWdodD0iNDAiIGZpbGw9IiMxMEI5ODEiLz4KPHJlY3QgeD0iMTEwIiB5PSI4MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMTA5OTY5Ii8+CjxyZWN0IHg9IjEzMCIgeT0iMTIwIiB3aWR0aD0iMTAiIGhlaWdodD0iNDAiIGZpbGw9IiNFRjQ0NDQiLz4KPHJlY3QgeD0iMTUwIiB5PSIxODAiIHdpZHRoPSIxMCIgaGVpZ2h0PSI4MCIgZmlsbD0iI0VGNDQ0NCIvPgo8cmVjdCB4PSIxNzAiIHk9IjIwMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTA5OTY5Ii8+CjxyZWN0IHg9IjE5MCIgeT0iMjIwIiB3aWR0aD0iMTAiIGhlaWdodD0iNDAiIGZpbGw9IiMxMEI5ODEiLz4KPC9zdmc+"
                  alt="FVG Chart Analysis"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="p-4">
                <Link 
                  href="/chart-analyzer"
                  className="w-full bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all py-2 px-4 rounded-lg text-sm font-bold text-center block"
                >
                  📊 Analyze Similar Chart
                </Link>
              </div>
            </div>

            {/* Chart Analysis Image 2 - AI Analyzer Interface */}
            <div className="bg-gradient-to-br from-card/90 to-card/70 border-2 border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl transform hover:scale-105 transition-all">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-bold gradient-text text-center">AI Chart Analyzer</h3>
              </div>
              <div className="aspect-square bg-slate-900 flex items-center justify-center p-4">
                <div className="w-full h-full bg-slate-800 rounded-lg p-4 text-white text-xs">
                  <div className="mb-4">
                    <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">📈</span>
                        <span className="font-bold text-green-400">BUY</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-blue-500/20 border border-blue-400/30 rounded p-2">
                        <div className="flex justify-between">
                          <span className="text-blue-400">ENTRY ZONE</span>
                          <span className="font-mono">5,365.000-5,375.000</span>
                        </div>
                      </div>
                      <div className="bg-green-500/20 border border-green-400/30 rounded p-2">
                        <div className="flex justify-between">
                          <span className="text-green-400">TP 1</span>
                          <span className="font-mono">5,440.000</span>
                        </div>
                      </div>
                      <div className="bg-red-500/20 border border-red-400/30 rounded p-2">
                        <div className="flex justify-between">
                          <span className="text-red-400">STOP LOSS</span>
                          <span className="font-mono">5,345.000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <Link 
                  href="/chart-analyzer"
                  className="w-full bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all py-2 px-4 rounded-lg text-sm font-bold text-center block"
                >
                  🎯 Try AI Analyzer
                </Link>
              </div>
            </div>

            {/* Chart Analysis Image 3 - Trading AI Description */}
            <div className="bg-gradient-to-br from-card/90 to-card/70 border-2 border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl transform hover:scale-105 transition-all">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-bold gradient-text text-center">Trading AI Platform</h3>
              </div>
              <div className="aspect-square bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-6">
                <div className="text-center text-white">
                  <h4 className="text-2xl font-bold mb-4 text-blue-400">Trading AI</h4>
                  <p className="text-sm leading-relaxed mb-4">
                    Trading AI uses artificial intelligence to analyze financial data, 
                    predict market trends, and automate trading decisions 
                    to help maximize profits and reduce risks.
                  </p>
                  <div className="w-full h-20 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <div className="flex space-x-1">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={`chart-bar-${i}`}
                          className="w-1 bg-blue-400 rounded-full animate-pulse"
                          style={{ 
                            height: `${Math.random() * 30 + 10}px`,
                            animationDelay: `${i * 100}ms`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <Link 
                  href="/register"
                  className="w-full bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all py-2 px-4 rounded-lg text-sm font-bold text-center block"
                >
                  🚀 Get Started
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">Experience professional AI-powered trading analysis</p>
            <Link 
              href="/chart-analyzer"
              className="gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg inline-block transform hover:scale-105"
            >
              🎯 Try AI Analyzer Now
            </Link>
          </div>
        </div>
      </section>

      {/* Winner Testimonials */}
      <section className="py-16 bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">🏆 Today's Winners</h2>
            <p className="text-muted-foreground">Real traders, real profits</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Winner Card 1 */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/30 rounded-2xl p-6 transform hover:scale-105 transition-all shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-2xl font-black text-white">
                  JD
                </div>
                <div>
                  <h3 className="font-bold text-lg">John D.</h3>
                  <p className="text-sm text-muted-foreground">Pro Trader</p>
                </div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4 mb-4">
                <p className="text-3xl font-black text-green-400">+$12,450</p>
                <p className="text-sm text-green-400/70">Today's Profit</p>
              </div>
              <p className="text-sm text-foreground/80 italic">"The AI signals are incredibly accurate. Made 5 winning trades in a row!"</p>
            </div>

            {/* Winner Card 2 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/30 rounded-2xl p-6 transform hover:scale-105 transition-all shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl font-black text-white">
                  SM
                </div>
                <div>
                  <h3 className="font-bold text-lg">Sarah M.</h3>
                  <p className="text-sm text-muted-foreground">Day Trader</p>
                </div>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-4 mb-4">
                <p className="text-3xl font-black text-blue-400">+$8,920</p>
                <p className="text-sm text-blue-400/70">Today's Profit</p>
              </div>
              <p className="text-sm text-foreground/80 italic">"Best trading platform I've used. The chart analyzer is a game-changer!"</p>
            </div>

            {/* Winner Card 3 */}
            <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-2 border-violet-500/30 rounded-2xl p-6 transform hover:scale-105 transition-all shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-2xl font-black text-white">
                  MK
                </div>
                <div>
                  <h3 className="font-bold text-lg">Mike K.</h3>
                  <p className="text-sm text-muted-foreground">Swing Trader</p>
                </div>
              </div>
              <div className="bg-violet-500/10 rounded-xl p-4 mb-4">
                <p className="text-3xl font-black text-violet-400">+$15,780</p>
                <p className="text-sm text-violet-400/70">Today's Profit</p>
              </div>
              <p className="text-sm text-foreground/80 italic">"Finally found a platform that actually works. Highly recommended!"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Why Traders Choose Us</h2>
            <p className="text-xl text-muted-foreground">Professional tools that give you the edge</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=600&fit=crop" 
                alt="Trading dashboard"
                className="rounded-2xl shadow-2xl border-2 border-white/10"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">27+ Markets</h3>
                  <p className="text-muted-foreground">Trade Forex, Crypto, Commodities, and Indices with real-time data and instant execution</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">AI-Powered Analysis</h3>
                  <p className="text-muted-foreground">Advanced algorithms using ICT, SMC, and machine learning for precise market predictions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Real-Time Signals</h3>
                  <p className="text-muted-foreground">Live price feeds, instant notifications, and lightning-fast signal delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Feature Images */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border-2 border-white/10 rounded-2xl overflow-hidden card-hover transform hover:scale-105 transition-all">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop" 
                alt="Analytics dashboard"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">📊 Advanced Analytics</h3>
                <p className="text-muted-foreground">Deep market insights with professional-grade charts and indicators</p>
              </div>
            </div>

            <div className="bg-card border-2 border-white/10 rounded-2xl overflow-hidden card-hover transform hover:scale-105 transition-all">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" 
                alt="Market data"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">💹 Live Market Data</h3>
                <p className="text-muted-foreground">Real-time price feeds from global exchanges and liquidity providers</p>
              </div>
            </div>

            <div className="bg-card border-2 border-white/10 rounded-2xl overflow-hidden card-hover transform hover:scale-105 transition-all">
              <img 
                src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=400&fit=crop" 
                alt="Trading signals"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">🎯 Smart Signals</h3>
                <p className="text-muted-foreground">AI-generated trading signals with entry, stop loss, and take profit levels</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-600/20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl font-black mb-4">Ready to Transform Your Trading?</h2>
          <p className="text-xl text-muted-foreground mb-8">Join thousands of successful traders today</p>
          <Link href="/register" className="gradient-primary text-white px-12 py-5 rounded-xl font-black text-xl hover:opacity-90 transition shadow-2xl inline-block transform hover:scale-105">
            🚀 Start Free Trial Now
          </Link>
          <p className="text-sm text-muted-foreground mt-6">No credit card required • Cancel anytime • 24/7 Support</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p className="font-semibold">© 2026 TradingAI. All rights reserved.</p>
            <p className="mt-2 text-sm">Professional trading signals powered by AI • Trade responsibly</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
