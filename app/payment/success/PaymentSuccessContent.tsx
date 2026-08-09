'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [subscriptionUpdated, setSubscriptionUpdated] = useState(false)

  useEffect(() => {
    const updateSubscription = async () => {
      try {
        // Get URL parameters
        const sessionId = searchParams.get('session_id')
        const planName = searchParams.get('plan')
        
        if (!sessionId) {
          router.push('/payment')
          return
        }

        // Get user data
        const userStr = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        
        if (!userStr || !token) {
          router.push('/login')
          return
        }

        const user = JSON.parse(userStr)

        // Update user's subscription locally
        const updatedUser = {
          ...user,
          subscriptionStatus: planName === 'Starter' ? 'starter' :
                           planName === 'Professional' ? 'professional' : 'premium',
          planName
        }

        localStorage.setItem('user', JSON.stringify(updatedUser))
        setSubscriptionUpdated(true)
        setLoading(false)

      } catch (error) {
        console.error('Error updating subscription:', error)
        setLoading(false)
      }
    }

    updateSubscription()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Updating your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-white/10 rounded-2xl p-8 text-center shadow-xl">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4 gradient-text">Payment Successful!</h1>
          
          <p className="text-muted-foreground mb-6">
            {subscriptionUpdated 
              ? 'Your subscription has been activated successfully. You can now enjoy all the benefits of your plan.'
              : 'Your payment was processed successfully. Your subscription will be activated shortly.'
            }
          </p>

          <div className="space-y-3">
            <Link
              href="/signals"
              className="w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition block"
            >
              View Trading Signals
            </Link>
            
            <Link
              href="/chart-analyzer"
              className="w-full bg-secondary hover:bg-secondary/80 py-3 rounded-xl font-semibold transition block"
            >
              Analyze Charts
            </Link>
            
            <Link
              href="/settings"
              className="w-full text-primary hover:text-primary/80 py-3 rounded-xl font-semibold transition block text-sm"
            >
              Manage Subscription
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-muted-foreground">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}