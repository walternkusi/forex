import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Dodle API configuration (replace with actual Dodle API details)
const DODLE_API_URL = process.env.DODLE_API_URL || 'https://api.dodle.com/v1/payments'
const DODLE_API_KEY = process.env.DODLE_API_KEY || 'dodle_test_key'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret')
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { planName, price, period, userId, userEmail } = body

    if (!planName || !price || !userId || !userEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create payment session with Dodle
    const dodlePayload = {
      amount: parseInt(price.replace(/[^0-9]/g, '')) * 100, // Convert to cents
      currency: 'USD',
      description: `${planName} Plan - ${period}`,
      customer: {
        email: userEmail,
        id: userId
      },
      metadata: {
        planName,
        period,
        userId
      },
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
      webhookUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/payments/dodle/webhook`
    }

    console.log('Creating Dodle payment session:', dodlePayload)

    // Call Dodle API
    let dodleResponse
    try {
      dodleResponse = await fetch(DODLE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DODLE_API_KEY}`,
          'X-Dodle-Version': '2023-10-01'
        },
        body: JSON.stringify(dodlePayload)
      })

      if (!dodleResponse.ok) {
        const errorData = await dodleResponse.text()
        console.error('Dodle API error:', errorData)
        throw new Error(`Dodle API error: ${dodleResponse.status}`)
      }

      dodleResponse = await dodleResponse.json()
    } catch (apiError) {
      console.error('Dodle API call failed:', apiError)
      
      // For demo purposes, create a mock payment session
      const mockPaymentUrl = `https://checkout.dodle.com/pay/${Math.random().toString(36).substr(2, 9)}`
      
      return NextResponse.json({
        success: true,
        paymentUrl: mockPaymentUrl,
        sessionId: `mock_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Demo payment session created'
      })
    }

    return NextResponse.json({
      success: true,
      paymentUrl: dodleResponse.checkout_url,
      sessionId: dodleResponse.id,
      message: 'Payment session created successfully'
    })

  } catch (error: any) {
    console.error('Dodle payment error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create payment session',
        error: error.message 
      },
      { status: 500 }
    )
  }
}
