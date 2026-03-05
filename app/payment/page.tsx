'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PaymentPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const plans = [
    {
      name: 'Starter',
      price: '$7',
      period: 'one-time',
      features: ['1 Trading Setup', '15 Minutes Access', 'Basic Analysis', 'Email Support'],
    },
    {
      name: 'Professional',
      price: '$69',
      period: 'per year',
      features: ['Unlimited Signals', '27 Markets', 'AI Analysis', 'Priority Support', 'Real-time Updates'],
      popular: true,
    },
    {
      name: 'Premium',
      price: '$35',
      period: 'per month',
      features: ['Everything in Pro', 'Advanced AI', 'Chart Analysis', 'Custom Alerts', '24/7 Support'],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/ai-trading-logo.svg" alt="AI Trading Assistant" className="w-8 h-8" />
              <span className="text-xl font-bold gradient-text">AI Trading</span>
            </Link>
            
            <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition">
              ← Back to home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">Start trading with professional signals</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-card border rounded-xl p-8 relative ${
                plan.popular ? 'border-primary' : 'border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="gradient-primary px-4 py-1 rounded-full text-sm font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold gradient-text mb-1">{plan.price}</div>
                <div className="text-sm text-muted-foreground">{plan.period}</div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-lg font-semibold transition ${
                plan.popular
                  ? 'gradient-primary text-white hover:opacity-90'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}>
                Get Started
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>💳 Secure payment powered by Stripe</p>
          <p className="mt-2">30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  )
}
