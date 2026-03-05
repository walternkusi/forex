import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json(
        { success: false, message: 'Google credential is required' },
        { status: 400 }
      )
    }

    // Decode the Google JWT token
    const decoded = jwt.decode(credential) as any
    
    if (!decoded || !decoded.email) {
      return NextResponse.json(
        { success: false, message: 'Invalid Google credential' },
        { status: 400 }
      )
    }

    let user = null
    let usingFallback = false

    // Try MongoDB first
    try {
      const { connectDB } = await import('@/lib/mongodb')
      const User = (await import('@/models/User')).default
      
      await connectDB()
      
      // Check if user exists
      user = await User.findOne({ email: decoded.email.toLowerCase() })
      
      if (!user) {
        // Create new user from Google data
        user = await User.create({
          name: decoded.name || decoded.email.split('@')[0],
          email: decoded.email.toLowerCase(),
          password: 'google-oauth', // Placeholder for OAuth users
          role: 'user',
          subscriptionStatus: 'free',
          setupAccess: true,
        })
      }
      
      console.log('✅ MongoDB connected successfully')
    } catch (dbError) {
      console.log('⚠️ MongoDB unavailable, using fallback storage')
      usingFallback = true
      
      // Create fallback user object
      user = {
        _id: Date.now().toString(),
        name: decoded.name || decoded.email.split('@')[0],
        email: decoded.email.toLowerCase(),
        subscriptionStatus: 'free',
        setupAccess: true,
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '30d' }
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus || 'free',
        setupAccess: user.setupAccess || false,
      },
      message: 'Google login successful',
      usingFallback
    })
  } catch (error: any) {
    console.error('Google login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Google login failed. Please try again.',
        error: error.message 
      },
      { status: 500 }
    )
  }
}