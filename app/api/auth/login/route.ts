import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Fallback in-memory users (when MongoDB is unavailable)
const fallbackUsers = [
  {
    _id: '1',
    name: 'Walter Nkusi',
    email: 'walternkusi@gmail.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    subscriptionStatus: 'active',
    setupAccess: true,
  },
  {
    _id: '2', 
    name: 'Demo User',
    email: 'demo@tradingai.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    subscriptionStatus: 'free',
    setupAccess: true,
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
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
      user = await User.findOne({ email: email.toLowerCase() })
      console.log('✅ MongoDB connected successfully')
    } catch (dbError) {
      console.log('⚠️ MongoDB unavailable, using fallback storage')
      usingFallback = true
      
      // Use fallback in-memory storage
      user = fallbackUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    let isValidPassword = false
    
    if (usingFallback) {
      // For fallback users, accept common passwords
      isValidPassword = password === 'password' || password === 'walter123' || password === 'demo'
    } else {
      isValidPassword = await bcrypt.compare(password, user.password)
    }
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
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
      message: 'Login successful',
      usingFallback
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Login failed. Please try again.',
        error: error.message 
      },
      { status: 500 }
    )
  }
}
