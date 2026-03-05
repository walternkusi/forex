import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const timeframe = formData.get('timeframe') as string || '1H'

    if (!image) {
      return NextResponse.json(
        { success: false, message: 'No image provided' },
        { status: 400 }
      )
    }

    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      )
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Use Gemini 2.5 Flash for image analysis (supports vision)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    })

    const prompt = `You are an expert ICT/SMC trading analyst. Analyze this ${timeframe} chart image with EXTREME PRECISION.

CRITICAL ANALYSIS STEPS:
1. CAREFULLY examine the chart image
2. READ the exact price levels from the Y-axis (price axis on the right/left)
3. IDENTIFY the current price location on the chart
4. FIND the most recent price action and candles
5. LOCATE key structures: order blocks, FVG, supply/demand zones
6. CALCULATE entry zones CLOSE to current price action (not far away)

ENTRY ZONE RULES:
- Entry must be NEAR the current price (within 50-200 points/pips)
- For BUY: Entry should be at a demand zone, order block, or FVG BELOW current price
- For SELL: Entry should be at a supply zone, order block, or FVG ABOVE current price
- Look for the NEAREST valid structure to current price
- DO NOT suggest entries that are too far from current price action

ANALYSIS PROCESS:
1. What is the current price? (Read from chart)
2. What is the trend? (Bullish/Bearish)
3. Where is the nearest order block or FVG?
4. Where is the optimal entry zone based on structure?
5. Where should SL be placed? (Beyond invalidation point)
6. Where are the TP levels? (At key resistance/support)

OUTPUT ONLY THIS FORMAT (with accurate numbers):

Trade Direction: [BUY/SELL/WAIT]
Reasoning: [2-3 sentences explaining WHY this direction based on market structure, trend, key levels, order blocks, FVG, or supply/demand zones you identified]
Entry Zone: [price-price] (must be close to current price)
Stop Loss: [price]
Take Profit 1: [price]
Take Profit 2: [price]
Take Profit 3: [price]
Risk-Reward: [ratio]
Confidence: [number]/10

EXAMPLE FOR REFERENCE:
If current price is 25,200:
- For SELL: Entry could be 25,180-25,220 (near current price)
- For BUY: Entry could be 25,150-25,180 (near current price)

DO NOT suggest entries like 23,000 when current price is 25,000!
Analyze the chart carefully and provide REALISTIC entry zones with clear reasoning.`

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: image.type,
            data: base64Image,
          },
        },
      ])

      const response = await result.response
      const analysis = response.text()

      // Parse the analysis to extract signal data
      const lines = analysis.split('\n')
      let signalData: any = {
        symbol: 'UNKNOWN',
        timeframe
      }

      lines.forEach(line => {
        const lower = line.toLowerCase()
        
        if (lower.includes('trade direction')) {
          if (lower.includes('buy')) signalData.direction = 'BUY'
          else if (lower.includes('sell')) signalData.direction = 'SELL'
          else if (lower.includes('wait')) signalData.direction = 'WAIT'
        }
        if (lower.includes('reasoning')) {
          const parts = line.split(':')
          if (parts.length > 1) signalData.reasoning = parts.slice(1).join(':').trim()
        }
        if (lower.includes('entry zone')) {
          const parts = line.split(':')
          if (parts.length > 1) signalData.entryZone = parts[1].trim()
        }
        if (lower.includes('stop loss')) {
          const parts = line.split(':')
          if (parts.length > 1) signalData.stopLoss = parts[1].trim()
        }
        if (lower.includes('take profit 1')) {
          const parts = line.split(':')
          if (parts.length > 1) signalData.tp1 = parts[1].trim()
        }
        if (lower.includes('take profit 2')) {
          const parts = line.split(':')
          if (parts.length > 1) signalData.tp2 = parts[1].trim()
        }
        if (lower.includes('take profit 3')) {
          const parts = line.split(':')
          if (parts.length > 1) signalData.tp3 = parts[1].trim()
        }
        if (lower.includes('risk-reward')) {
          const parts = line.split(':')
          if (parts.length > 1) signalData.riskReward = parts[1].trim()
        }
        if (lower.includes('confidence')) {
          const parts = line.split(':')
          if (parts.length > 1) {
            const confidenceStr = parts[1].trim()
            signalData.confidence = parseInt(confidenceStr.split('/')[0]) || 7
          }
        }
      })

      // Save signal to database if it's a valid trading signal
      if (signalData.direction && signalData.direction !== 'WAIT' && signalData.entryZone) {
        try {
          await fetch(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/signals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...signalData,
              userId: 'demo-user'
            })
          })
          console.log('✅ Signal saved to database')
        } catch (saveError) {
          console.error('❌ Failed to save signal:', saveError)
        }
      }

      return NextResponse.json({
        success: true,
        analysis,
        timeframe,
        timestamp: new Date().toISOString(),
      })
    } catch (geminiError: any) {
      console.error('Gemini API error:', geminiError)
      
      let errorMessage = 'Analysis failed'
      
      if (geminiError.message?.includes('model') || geminiError.message?.includes('unavailable')) {
        errorMessage = 'Model unavailable. Please try again in a moment.'
      } else if (geminiError.message?.includes('API key')) {
        errorMessage = 'API key error. Please check your configuration.'
      } else if (geminiError.message?.includes('fetch failed')) {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          error: geminiError.message
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Chart analysis error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Analysis failed. Please try again.',
        error: error.toString()
      },
      { status: 500 }
    )
  }
}
