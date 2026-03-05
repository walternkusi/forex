'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    google: any
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error' | null>(null)

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      router.push('/')
      return
    }

    // Load Google Sign-In script with proper configuration
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    // Disable FedCM before loading the script
    if (window.navigator && 'credentials' in window.navigator) {
      // @ts-ignore
      window.navigator.credentials.preventSilentAccess = () => Promise.resolve()
    }
    
    document.body.appendChild(script)

    script.onload = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: '881325028943-gbrqmvcm2ogdab1tmph4qq786o4l2rjf.apps.googleusercontent.com',
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
            itp_support: false,
          })
          
          // Render the button after a short delay to ensure DOM is ready
          setTimeout(() => {
            const buttonDiv = document.getElementById('google-signin-button')
            if (buttonDiv && window.google) {
              window.google.accounts.id.renderButton(buttonDiv, {
                theme: 'outline',
                size: 'large',
                width: buttonDiv.offsetWidth,
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                locale: 'en',
              })
            }
          }, 100)
        } catch (error) {
          console.error('Google Sign-In initialization failed:', error)
          setError('Google Sign-In setup failed. Please try email login.')
        }
      }
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleGoogleSignIn = async (response: any) => {
    setGoogleLoading(true)
    setError('')
    setDbStatus('checking')

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })

      const data = await res.json()

      if (data.success) {
        setDbStatus('connected')
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        setTimeout(() => {
          router.push('/signals')
        }, 500)
      } else {
        setDbStatus('error')
        setError(data.message || 'Google login failed')
      }
    } catch (err: any) {
      setDbStatus('error')
      setError('Google login failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleButtonClick = () => {
    if (window.google) {
      try {
        // Render Google's native button
        const buttonDiv = document.getElementById('google-signin-button')
        if (buttonDiv && buttonDiv.children.length === 0) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: 'outline',
            size: 'large',
            width: buttonDiv.offsetWidth,
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            locale: 'en',
          })
        }
        // Also trigger the prompt as fallback
        window.google.accounts.id.prompt()
      } catch (error) {
        console.error('Google prompt failed:', error)
        setError('Google Sign-In failed. Please try email login.')
      }
    } else {
      setError('Google Sign-In not loaded. Please try email login.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setDbStatus('checking')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        setDbStatus('connected')
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Show success message briefly before redirect
        setTimeout(() => {
          router.push('/signals')
        }, 500)
      } else {
        setDbStatus('error')
        setError(data.message || 'Login failed')
      }
    } catch (err: any) {
      setDbStatus('error')
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://cdn.pixabay.com/video/2023/04/21/159049-820264030_large.mp4" type="video/mp4" />
          {/* Fallback to another trading video */}
          <source src="https://cdn.pixabay.com/video/2022/11/09/138619-769965893_large.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6 group">
            <img src="/ai-trading-logo.svg" alt="AI Trading Assistant" className="w-16 h-16 transform group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-3xl font-black gradient-text">AI Trading</span>
              <p className="text-xs text-primary/60 -mt-1">Professional Analysis</p>
            </div>
          </Link>
          <h1 className="text-4xl font-black mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue trading</p>
        </div>

        <div className="bg-card/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/50 text-red-400 rounded-xl p-4 text-sm flex items-start gap-3 mb-6">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold">Login Failed</p>
                <p className="text-red-400/80">{error}</p>
                <p className="text-red-400/60 text-xs mt-2">Test credentials: walternkusi@gmail.com / password</p>
              </div>
            </div>
          )}

          {dbStatus === 'connected' && (
            <div className="bg-green-500/10 border-2 border-green-500/50 text-green-400 rounded-xl p-4 text-sm flex items-center gap-3 mb-6">
              <span className="text-xl">✅</span>
              <p className="font-semibold">Connected! Redirecting...</p>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="mb-6">
            <div id="google-signin-button" className="w-full"></div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-secondary border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition text-foreground"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-foreground">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-secondary border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition text-foreground"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {dbStatus === 'checking' ? 'Connecting to database...' : 'Signing in...'}
                </span>
              ) : (
                '🚀 Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-primary hover:underline font-bold">
              Sign up free
            </Link>
          </div>

          {/* Test Credentials Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4 text-xs">
              <p className="text-blue-400 font-semibold mb-2">🧪 Test Credentials:</p>
              <p className="text-blue-400/80">Email: <span className="font-mono">walternkusi@gmail.com</span></p>
              <p className="text-blue-400/80">Password: <span className="font-mono">password</span></p>
            </div>
          </div>

          {/* Database Status Indicator */}
          {dbStatus && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-xs">
                {dbStatus === 'checking' && (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-500">Checking database...</span>
                  </>
                )}
                {dbStatus === 'connected' && (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-500">Database connected</span>
                  </>
                )}
                {dbStatus === 'error' && (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-500">Connection issue</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition flex items-center justify-center gap-2">
            <span>←</span> Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}