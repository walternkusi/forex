'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TIMEFRAMES = [
  { value: '1M', label: '1 Minute' },
  { value: '5M', label: '5 Minutes' },
  { value: '15M', label: '15 Minutes' },
  { value: '30M', label: '30 Minutes' },
  { value: '1H', label: '1 Hour' },
  { value: '4H', label: '4 Hours' },
  { value: '1D', label: '1 Day' },
  { value: '1W', label: '1 Week' },
]

export default function ChartAnalyzerPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)
  const [timeframe, setTimeframe] = useState('1H')
  const [analysis, setAnalysis] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      router.push('/login')
      return
    }
    
    setIsAuthenticated(true)
    setLoading(false)
  }, [router])

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

  if (!isAuthenticated) {
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
      setAnalysis('')
      setError('')
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    
    setAnalyzing(true)
    setError('')
    setAnalysis('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('timeframe', timeframe)

      const response = await fetch('/api/analyze-chart', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setAnalysis(data.analysis)
      } else {
        setError(data.message || 'Analysis failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze chart')
    } finally {
      setAnalyzing(false)
    }
  }

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
                className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
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
                className="px-4 py-2 text-sm font-semibold bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-all"
              >
                Analyzer
              </Link>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <Link 
                href="/settings" 
                className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
              >
                ⚙️ Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Chart Analyzer</h1>
          <p className="text-muted-foreground">Upload your chart for instant AI analysis</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload */}
          <div className="bg-card border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Chart</h2>
            
            <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-primary/50 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg font-medium mb-2">Drop chart here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </label>
            </div>

            {preview && (
              <div className="mt-4">
                <img src={preview} alt="Preview" className="w-full rounded-lg border border-white/10" />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {TIMEFRAMES.map((tf) => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || analyzing}
              className="w-full mt-4 gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Chart'}
            </button>
          </div>

          {/* Result */}
          <div className="bg-card border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Result</h2>
            
            {!analysis && !error && !analyzing && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-muted-foreground">Upload a chart to get started</p>
              </div>
            )}

            {analyzing && (
              <div className="text-center py-16">
                <div className="animate-spin text-6xl mb-4">⚙️</div>
                <p className="text-muted-foreground">Analyzing chart with AI...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm font-medium mb-3">{error}</p>
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || analyzing}
                  className="text-sm px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                >
                  Retry Analysis
                </button>
              </div>
            )}

            {analysis && (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Parse and display as trading signal card */}
                {(() => {
                  const lines = analysis.split('\n')
                  let tradeDirection = ''
                  let reasoning = ''
                  let entryZone = ''
                  let stopLoss = ''
                  let tp1 = '', tp2 = '', tp3 = ''
                  let confidence = ''
                  let riskReward = ''
                  
                  // Extract key trading info with better parsing
                  lines.forEach(line => {
                    const lower = line.toLowerCase()
                    
                    if (lower.includes('trade direction')) {
                      if (lower.includes('buy')) tradeDirection = 'BUY'
                      else if (lower.includes('sell')) tradeDirection = 'SELL'
                      else if (lower.includes('wait')) tradeDirection = 'WAIT'
                    }
                    if (lower.includes('reasoning')) {
                      const parts = line.split(':')
                      if (parts.length > 1) reasoning = parts.slice(1).join(':').trim()
                    }
                    if (lower.includes('entry zone')) {
                      const parts = line.split(':')
                      if (parts.length > 1) entryZone = parts[1].trim()
                    }
                    if (lower.includes('stop loss')) {
                      const parts = line.split(':')
                      if (parts.length > 1) stopLoss = parts[1].trim()
                    }
                    if (lower.includes('take profit 1')) {
                      const parts = line.split(':')
                      if (parts.length > 1) tp1 = parts[1].trim()
                    }
                    if (lower.includes('take profit 2')) {
                      const parts = line.split(':')
                      if (parts.length > 1) tp2 = parts[1].trim()
                    }
                    if (lower.includes('take profit 3')) {
                      const parts = line.split(':')
                      if (parts.length > 1) tp3 = parts[1].trim()
                    }
                    if (lower.includes('risk-reward')) {
                      const parts = line.split(':')
                      if (parts.length > 1) riskReward = parts[1].trim()
                    }
                    if (lower.includes('confidence')) {
                      const parts = line.split(':')
                      if (parts.length > 1) confidence = parts[1].trim()
                    }
                  })
                  
                  return (
                    <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 border-2 border-primary/30 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
                      {/* Header */}
                      <div className="flex items-center justify-center gap-4 mb-8 pb-6 border-b border-white/10">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-violet-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🎯</span>
                        </div>
                        <h3 className="text-3xl font-black gradient-text uppercase tracking-wider">Analysis Result</h3>
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-primary rounded-full flex items-center justify-center">
                          <span className="text-2xl">📊</span>
                        </div>
                      </div>
                      
                      {/* Direction Badge */}
                      {tradeDirection && (
                        <div className={`relative overflow-hidden text-center py-8 px-10 rounded-2xl mb-8 border-2 shadow-lg ${
                          tradeDirection === 'BUY' ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/10 border-green-400/50' :
                          tradeDirection === 'SELL' ? 'bg-gradient-to-br from-red-500/20 to-rose-600/10 border-red-400/50' :
                          'bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border-yellow-400/50'
                        }`}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                          <div className="relative flex items-center justify-center gap-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                              tradeDirection === 'BUY' ? 'bg-green-500/30' :
                              tradeDirection === 'SELL' ? 'bg-red-500/30' :
                              'bg-yellow-500/30'
                            }`}>
                              <span className="text-4xl">
                                {tradeDirection === 'BUY' ? '📈' : tradeDirection === 'SELL' ? '📉' : '⏸️'}
                              </span>
                            </div>
                            <span className={`text-5xl font-black tracking-wider ${
                              tradeDirection === 'BUY' ? 'text-green-400' :
                              tradeDirection === 'SELL' ? 'text-red-400' :
                              'text-yellow-400'
                            }`}>
                              {tradeDirection}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Entry Zone */}
                      {entryZone && (
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/5 border-2 border-blue-400/40 rounded-2xl p-6 mb-6 shadow-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🎯</span>
                              </div>
                              <span className="text-lg font-bold text-blue-400 uppercase tracking-wide">Entry Zone</span>
                            </div>
                            <span className="text-3xl font-black text-blue-400 font-mono tracking-tight bg-blue-500/10 px-4 py-2 rounded-xl">{entryZone}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Take Profits */}
                      <div className="space-y-4 mb-6">
                        {tp1 && (
                          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-2 border-green-400/40 rounded-2xl p-5 shadow-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-xl">✅</span>
                                </div>
                                <span className="text-lg font-bold text-green-400 uppercase tracking-wide">TP 1</span>
                              </div>
                              <span className="text-2xl font-black text-green-400 font-mono bg-green-500/10 px-4 py-2 rounded-xl">{tp1}</span>
                            </div>
                          </div>
                        )}
                        {tp2 && (
                          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-2 border-green-400/40 rounded-2xl p-5 shadow-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-xl">✅</span>
                                </div>
                                <span className="text-lg font-bold text-green-400 uppercase tracking-wide">TP 2</span>
                              </div>
                              <span className="text-2xl font-black text-green-400 font-mono bg-green-500/10 px-4 py-2 rounded-xl">{tp2}</span>
                            </div>
                          </div>
                        )}
                        {tp3 && (
                          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-2 border-green-400/40 rounded-2xl p-5 shadow-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-xl">✅</span>
                                </div>
                                <span className="text-lg font-bold text-green-400 uppercase tracking-wide">TP 3</span>
                              </div>
                              <span className="text-2xl font-black text-green-400 font-mono bg-green-500/10 px-4 py-2 rounded-xl">{tp3}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Stop Loss */}
                      {stopLoss && (
                        <div className="bg-gradient-to-br from-red-500/10 to-rose-600/5 border-2 border-red-400/40 rounded-2xl p-6 mb-8 shadow-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">❌</span>
                              </div>
                              <span className="text-lg font-bold text-red-400 uppercase tracking-wide">Stop Loss</span>
                            </div>
                            <span className="text-3xl font-black text-red-400 font-mono tracking-tight bg-red-500/10 px-4 py-2 rounded-xl">{stopLoss}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Footer Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 mb-6">
                        <div className="text-center bg-primary/5 rounded-xl p-4 border border-primary/20">
                          <p className="text-xs text-primary/70 uppercase mb-2 font-bold tracking-wider">Timeframe</p>
                          <p className="text-2xl font-black text-primary">{timeframe}</p>
                        </div>
                        {riskReward && (
                          <div className="text-center bg-violet-500/5 rounded-xl p-4 border border-violet-500/20">
                            <p className="text-xs text-violet-400/70 uppercase mb-2 font-bold tracking-wider">R:R</p>
                            <p className="text-2xl font-black text-violet-400">{riskReward}</p>
                          </div>
                        )}
                        {confidence && (
                          <div className="text-center bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
                            <p className="text-xs text-amber-400/70 uppercase mb-2 font-bold tracking-wider">Confidence</p>
                            <p className="text-2xl font-black text-amber-400">{confidence}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Reasoning Section - Under Timeframe */}
                      {reasoning && (
                        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/5 border-2 border-blue-400/30 rounded-2xl p-6 shadow-inner">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-xl">💡</span>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-blue-400 mb-3 uppercase tracking-wide">Analysis Reasoning</h4>
                              <p className="text-foreground/90 leading-relaxed text-base font-medium">{reasoning}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
