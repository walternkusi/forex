import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for signals (in production, use a real database)
let signalsStorage: any[] = [
  // Some initial demo data
  {
    id: '1',
    symbol: 'EURUSD',
    direction: 'BUY',
    entryZone: '1.0850-1.0865',
    stopLoss: '1.0820',
    tp1: '1.0920',
    tp2: '1.0950',
    tp3: '1.0980',
    timeframe: '15M',
    confidence: 8,
    riskReward: '2.5',
    reasoning: 'Strong bullish order block at 1.0850 level with FVG confluence. Price showing rejection from demand zone with institutional buying pressure.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'Hit TP1',
    result: '+70 pips',
    userId: 'demo-user'
  }
]

// GET - Fetch all signals for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Filter signals by user and sort by timestamp (newest first)
    const userSignals = signalsStorage
      .filter(signal => signal.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      signals: userSignals,
      total: userSignals.length
    })
  } catch (error: any) {
    console.error('Error fetching signals:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch signals' },
      { status: 500 }
    )
  }
}

// POST - Save new signal from analyzer
export async function POST(request: NextRequest) {
  try {
    const signalData = await request.json()
    
    // Generate unique ID
    const newSignal = {
      id: Date.now().toString(),
      ...signalData,
      timestamp: new Date().toISOString(),
      status: 'Active',
      result: null,
      userId: signalData.userId || 'demo-user'
    }

    // Add to storage
    signalsStorage.unshift(newSignal) // Add to beginning (newest first)

    // Keep only last 100 signals to prevent memory issues
    if (signalsStorage.length > 100) {
      signalsStorage = signalsStorage.slice(0, 100)
    }

    return NextResponse.json({
      success: true,
      signal: newSignal,
      message: 'Signal saved successfully'
    })
  } catch (error: any) {
    console.error('Error saving signal:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to save signal' },
      { status: 500 }
    )
  }
}

// PUT - Update signal status/result
export async function PUT(request: NextRequest) {
  try {
    const { id, status, result } = await request.json()
    
    const signalIndex = signalsStorage.findIndex(signal => signal.id === id)
    if (signalIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Signal not found' },
        { status: 404 }
      )
    }

    // Update signal
    signalsStorage[signalIndex] = {
      ...signalsStorage[signalIndex],
      status,
      result,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      signal: signalsStorage[signalIndex],
      message: 'Signal updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating signal:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update signal' },
      { status: 500 }
    )
  }
}