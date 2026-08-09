'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-white/10 rounded-2xl p-8 text-center shadow-xl">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
          
          <p className="text-muted-foreground mb-6">
            Your payment was cancelled. No charges were made to your account. 
            You can try again anytime if you change your mind.
          </p>

          <div className="space-y-3">
            <Link
              href="/payment"
              className="w-full gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition block"
            >
              Try Again
            </Link>
            
            <Link
              href="/"
              className="w-full bg-secondary hover:bg-secondary/80 py-3 rounded-xl font-semibold transition block"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-muted-foreground">
              Need help? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
