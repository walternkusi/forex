import { NextRequest, NextResponse } from 'next/server'

// Webhook handler for Dodle payment notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-dodle-signature')

    // Verify webhook signature (implement Dodle's signature verification)
    if (!signature) {
      console.error('Missing Dodle webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Parse webhook data
    let webhookData
    try {
      webhookData = JSON.parse(body)
    } catch (parseError) {
      console.error('Failed to parse webhook data:', parseError)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('Dodle webhook received:', webhookData)

    // Handle payment success
    if (webhookData.type === 'payment.completed' && webhookData.data.status === 'paid') {
      const { userId, planName, period } = webhookData.data.metadata

      try {
        // Update user's subscription in database
        const { connectDB } = await import('@/lib/mongodb')
        const User = (await import('@/models/User')).default
        
        await connectDB()
        
        await User.findByIdAndUpdate(userId, {
          subscriptionStatus: period === 'one-time' ? 'starter' : 
                           period === 'per year' ? 'professional' : 'premium',
          subscriptionExpires: period === 'per year' ? 
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) :
            period === 'per month' ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) :
            null,
          lastPayment: new Date(),
          planName
        })

        console.log(`✅ User ${userId} subscription updated to ${planName}`)
      } catch (dbError) {
        console.error('Failed to update user subscription:', dbError)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Dodle webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
