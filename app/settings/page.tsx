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

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const CreditCardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

const HelpIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!userData || !token) {
      router.push('/login')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setFormData({ name: parsedUser.name, email: parsedUser.email })
      setLoading(false)
    } catch (error) {
      console.error('Error parsing user data:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.email) {
      setMessage('Please fill in all fields')
      return
    }
    
    try {
      if (!user) return
      const updatedUser: User = { 
        id: user.id, 
        name: formData.name, 
        email: formData.email, 
        subscriptionStatus: user.subscriptionStatus, 
        setupAccess: user.setupAccess 
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setEditMode(false)
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error updating profile')
    }
  }

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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-gradient-to-r from-background/95 to-background/90 sticky top-0 z-50 shadow-xl">
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
                className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
              >
                Analyzer
              </Link>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <Link 
                href="/settings" 
                className="px-4 py-2 text-sm font-semibold bg-primary/20 text-primary border border-primary/40 rounded-lg hover:bg-primary/30 transition-all flex items-center gap-2"
              >
                <SettingsIcon />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
              <SettingsIcon />
            </div>
            <div>
              <h1 className="text-4xl font-black gradient-text">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your account, subscription, and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-card/80 to-card/60 border border-white/10 rounded-2xl p-6 sticky top-24 shadow-xl backdrop-blur-sm">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-primary/30 to-violet-500/20 text-primary border border-primary/40 shadow-lg'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <UserIcon />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'subscription'
                      ? 'bg-gradient-to-r from-primary/30 to-violet-500/20 text-primary border border-primary/40 shadow-lg'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <StarIcon />
                  Subscription
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'payment'
                      ? 'bg-gradient-to-r from-primary/30 to-violet-500/20 text-primary border border-primary/40 shadow-lg'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <CreditCardIcon />
                  Payment Methods
                </button>
                <button
                  onClick={() => setActiveTab('help')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'help'
                      ? 'bg-gradient-to-r from-primary/30 to-violet-500/20 text-primary border border-primary/40 shadow-lg'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <HelpIcon />
                  Help & Support
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-gradient-to-br from-card/80 to-card/60 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-violet-500 rounded-xl flex items-center justify-center text-white">
                    <UserIcon />
                  </div>
                  <h2 className="text-3xl font-black gradient-text">Profile Information</h2>
                </div>
                
                {message && (
                  <div className={`mb-6 p-4 rounded-xl border backdrop-blur-sm transition-all ${
                    message.includes('successfully')
                      ? 'bg-green-500/15 border-green-500/40 text-green-400 shadow-lg shadow-green-500/20'
                      : 'bg-red-500/15 border-red-500/40 text-red-400 shadow-lg shadow-red-500/20'
                  }`}>
                    {message}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-2xl border border-white/10">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-5xl">👤</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{user.name}</h3>
                      <p className="text-muted-foreground mt-1">{user.email}</p>
                      <div className="mt-3 inline-block px-3 py-1 bg-primary/20 border border-primary/40 rounded-full">
                        <p className="text-xs text-primary font-bold uppercase tracking-wide">
                          {user.subscriptionStatus} Plan
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    {editMode ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold mb-3 text-foreground/90">Full Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-secondary/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-foreground/40 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-3 text-foreground/90">Email Address</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-secondary/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-foreground/40 transition-all"
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleSaveProfile}
                            className="flex-1 gradient-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setEditMode(false)
                              setFormData({ name: user.name, email: user.email })
                            }}
                            className="flex-1 bg-secondary/50 text-foreground py-3 rounded-xl font-bold hover:bg-secondary/70 transition border border-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-secondary/30 rounded-xl border border-white/10">
                          <p className="text-xs text-muted-foreground mb-2 uppercase font-bold tracking-wide">Full Name</p>
                          <p className="text-lg font-semibold">{user.name}</p>
                        </div>
                        <div className="p-4 bg-secondary/30 rounded-xl border border-white/10">
                          <p className="text-xs text-muted-foreground mb-2 uppercase font-bold tracking-wide">Email Address</p>
                          <p className="text-lg font-semibold">{user.email}</p>
                        </div>
                        <div className="p-4 bg-secondary/30 rounded-xl border border-white/10">
                          <p className="text-xs text-muted-foreground mb-2 uppercase font-bold tracking-wide">Account Status</p>
                          <p className="text-lg font-semibold capitalize text-green-400">Active</p>
                        </div>
                        <button
                          onClick={() => setEditMode(true)}
                          className="w-full gradient-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition mt-6 shadow-lg"
                        >
                          Edit Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="bg-gradient-to-br from-card/80 to-card/60 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
                    <StarIcon />
                  </div>
                  <h2 className="text-3xl font-black">Subscription Plan</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-primary/20 to-violet-500/10 border-2 border-primary/40 rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-3xl font-black capitalize gradient-text">{user.subscriptionStatus} Plan</h3>
                        <p className="text-muted-foreground mt-2">Your current subscription</p>
                      </div>
                      <div className="text-6xl">
                        {user.subscriptionStatus === 'free' ? '🆓' : '⭐'}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-400/30 rounded-xl p-6">
                      <p className="text-xs text-muted-foreground mb-2 uppercase font-bold tracking-wide">Plan Type</p>
                      <p className="text-2xl font-bold capitalize text-blue-400">{user.subscriptionStatus}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-400/30 rounded-xl p-6">
                      <p className="text-xs text-muted-foreground mb-2 uppercase font-bold tracking-wide">Status</p>
                      <p className="text-2xl font-bold text-green-400">Active</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h4 className="font-bold text-lg mb-4">✨ Plan Features</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-white/10">
                        <span className="text-green-400 text-xl">✓</span>
                        <span className="font-semibold">AI Chart Analysis</span>
                      </li>
                      <li className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-white/10">
                        <span className="text-green-400 text-xl">✓</span>
                        <span className="font-semibold">Trading Signals</span>
                      </li>
                      <li className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-white/10">
                        <span className="text-green-400 text-xl">✓</span>
                        <span className="font-semibold">Signal History</span>
                      </li>
                      {user.subscriptionStatus === 'premium' && (
                        <>
                          <li className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-white/10">
                            <span className="text-green-400 text-xl">✓</span>
                            <span className="font-semibold">Priority Support</span>
                          </li>
                          <li className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-white/10">
                            <span className="text-green-400 text-xl">✓</span>
                            <span className="font-semibold">Advanced Analytics</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {user.subscriptionStatus === 'free' && (
                    <Link
                      href="/payment"
                      className="w-full gradient-primary text-white py-4 rounded-xl font-bold hover:opacity-90 transition text-center block shadow-lg text-lg"
                    >
                      🚀 Upgrade to Premium
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div className="bg-gradient-to-br from-card/80 to-card/60 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                    <CreditCardIcon />
                  </div>
                  <h2 className="text-3xl font-black">Payment Methods</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border-2 border-blue-400/40 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-1">💳 Credit Card</h3>
                        <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                      </div>
                      <span className="text-green-400 font-bold px-3 py-1 bg-green-500/20 border border-green-400/40 rounded-full text-sm">Default</span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h4 className="font-bold text-lg mb-4">📊 Billing History</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl border border-white/10 hover:border-primary/30 transition">
                        <div>
                          <p className="font-semibold">Monthly Subscription</p>
                          <p className="text-sm text-muted-foreground">Charged on Dec 1, 2024</p>
                        </div>
                        <p className="font-bold text-lg text-green-400">$9.99</p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl border border-white/10 hover:border-primary/30 transition">
                        <div>
                          <p className="font-semibold">Monthly Subscription</p>
                          <p className="text-sm text-muted-foreground">Charged on Nov 1, 2024</p>
                        </div>
                        <p className="font-bold text-lg text-green-400">$9.99</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/payment"
                    className="w-full gradient-primary text-white py-4 rounded-xl font-bold hover:opacity-90 transition text-center block shadow-lg text-lg"
                  >
                    💳 Manage Payment Methods
                  </Link>
                </div>
              </div>
            )}

            {/* Help & Support Tab */}
            {activeTab === 'help' && (
              <div className="bg-gradient-to-br from-card/80 to-card/60 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                    <HelpIcon />
                  </div>
                  <h2 className="text-3xl font-black">Help & Support</h2>
                </div>
                
                <div className="space-y-6">
                  {/* FAQ Section */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">❓ Frequently Asked Questions</h3>
                    <div className="space-y-3">
                      <details className="bg-secondary/50 border border-white/10 rounded-xl p-4 cursor-pointer group hover:border-primary/30 transition">
                        <summary className="font-semibold flex items-center justify-between">
                          How do I analyze a chart?
                          <span className="group-open:rotate-180 transition-transform text-primary">▼</span>
                        </summary>
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                          Go to the Analyzer page, upload your trading chart image, select the timeframe, and click "Analyze Chart". Our AI will provide professional trading signals.
                        </p>
                      </details>

                      <details className="bg-secondary/50 border border-white/10 rounded-xl p-4 cursor-pointer group hover:border-primary/30 transition">
                        <summary className="font-semibold flex items-center justify-between">
                          What trading strategies are used?
                          <span className="group-open:rotate-180 transition-transform text-primary">▼</span>
                        </summary>
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                          We use advanced ICT (Inner Circle Trading) and SMC (Smart Money Concepts) strategies to analyze market structure, order blocks, FVG, and supply/demand zones.
                        </p>
                      </details>

                      <details className="bg-secondary/50 border border-white/10 rounded-xl p-4 cursor-pointer group hover:border-primary/30 transition">
                        <summary className="font-semibold flex items-center justify-between">
                          How accurate are the signals?
                          <span className="group-open:rotate-180 transition-transform text-primary">▼</span>
                        </summary>
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                          Our AI provides professional analysis with confidence scores. Accuracy depends on chart quality and market conditions. Always use proper risk management.
                        </p>
                      </details>

                      <details className="bg-secondary/50 border border-white/10 rounded-xl p-4 cursor-pointer group hover:border-primary/30 transition">
                        <summary className="font-semibold flex items-center justify-between">
                          Can I export my signals?
                          <span className="group-open:rotate-180 transition-transform text-primary">▼</span>
                        </summary>
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                          Yes, you can view all your signals in the Signals History page. Premium users can export data in multiple formats.
                        </p>
                      </details>
                    </div>
                  </div>

                  {/* Contact Support */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-bold mb-4">📞 Contact Support</h3>
                    <div className="space-y-3">
                      <a
                        href="mailto:support@aitrading.com"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-400/30 rounded-xl hover:border-blue-400/60 transition shadow-lg"
                      >
                        <span className="text-3xl">📧</span>
                        <div>
                          <p className="font-semibold">Email Support</p>
                          <p className="text-sm text-muted-foreground">support@aitrading.com</p>
                        </div>
                      </a>

                      <a
                        href="https://discord.gg/aitrading"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-500/10 to-indigo-600/5 border border-indigo-400/30 rounded-xl hover:border-indigo-400/60 transition shadow-lg"
                      >
                        <span className="text-3xl">💬</span>
                        <div>
                          <p className="font-semibold">Discord Community</p>
                          <p className="text-sm text-muted-foreground">Join our community for help</p>
                        </div>
                      </a>

                      <a
                        href="https://docs.aitrading.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-400/30 rounded-xl hover:border-green-400/60 transition shadow-lg"
                      >
                        <span className="text-3xl">📚</span>
                        <div>
                          <p className="font-semibold">Documentation</p>
                          <p className="text-sm text-muted-foreground">Read our guides and tutorials</p>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-bold mb-4 text-red-400">⚠️ Danger Zone</h3>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-red-500/20 to-red-600/10 border-2 border-red-500/50 text-red-400 py-4 rounded-xl font-bold hover:bg-red-500/30 transition shadow-lg flex items-center justify-center gap-3"
                    >
                      <LogoutIcon />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
