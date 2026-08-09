import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Log the API key status (but not the actual key for security)
console.log('Gemini API Key configured:', !!process.env.GEMINI_API_KEY)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Fallback analysis for when Gemini is unavailable
const FALLBACK_ANALYSIS = {
  tradeDirection: 'WAIT',
  reasoning: 'Unable to analyze chart - AI service temporarily unavailable. Please try again later.',
  entryZone: 'N/A',
  stopLoss: 'N/A',
  takeProfit1: 'N/A',
  takeProfit2: 'N/A',
  takeProfit3: 'N/A',
  riskReward: 'N/A',
  confidence: 1
}

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

    // Try multiple Gemini models in order of preference
    let model
    let analysis
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
    
    for (const modelName of models) {
      try {
        console.log(`Trying model: ${modelName}`)
        model = genAI.getGenerativeModel({ model: modelName })
        
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
        analysis = response.text()
        console.log(`✅ Success with model: ${modelName}`)
        break
      } catch (modelError: any) {
        console.error(`Model ${modelName} failed:`, {
          message: modelError.message,
          stack: modelError.stack?.split('\n').slice(0, 5).join('\n')
        })
        if (modelName === models[models.length - 1]) {
          // All models failed - log detailed error info
          console.error('All Gemini models failed after 3 attempts. Error types tried:', models)
          // Create a custom error with additional context
          const errorWithContext: any = new Error(
            `All AI models unavailable. Tried: ${models.join(', ')}. ` +
            `First error was: ${modelError.message}`
          )
          errorWithContext.firstError = modelError
          errorWithContext.attemptedModels = models
          throw errorWithContext
        }
        continue
      }
    }

      // Parse the analysis to extract signal data
      const lines = analysis!.split('\n')
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
    } catch (error: any) {
      console.error('Chart analysis error:', {
        message: error.message,
        attemptedModels: error.attemptedModels,
        firstError: error.firstError?.message,
        stack: error.stack?.split('\n').slice(0, 10).join('\n')
      })
      
      let errorMessage = 'Analysis failed'
      let debugInfo = ''
      
      if (error.message?.includes('model') || error.message?.includes('unavailable')) {
        errorMessage = 'Model unavailable. Please try again in a moment.'
        debugInfo = `Tried models: ${error.attemptedModels?.join(', ') || 'unknown'}`
      } else if (error.message?.includes('API key') || error.message?.includes('api_key')) {
        errorMessage = 'API key error. Please check your configuration.'
        debugInfo = 'Gemini API key may be missing or invalid'
      } else if (error.message?.includes('fetch failed') || error.message?.includes('ECONN')) {
        errorMessage = 'Network error. Please check your connection.'
        debugInfo = 'Unable to reach Gemini API servers'
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        errorMessage = 'API quota exceeded. Please try again later.'
        debugInfo = 'You may have hit the Gemini API limit'
      }
      
      // Log debug info in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Debug info:', debugInfo)
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          error: error.message,
          debugInfo: process.env.NODE_ENV !== 'production' ? debugInfo : undefined
        },
        { status: 500 }
      )
    }
}
