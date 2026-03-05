import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const symbolMap: Record<string, string> = {
  'EURUSD': 'EUR/USD',
  'GBPUSD': 'GBP/USD',
  'USDJPY': 'USD/JPY',
  'AUDUSD': 'AUD/USD',
  'USDCAD': 'USD/CAD',
  'NZDUSD': 'NZD/USD',
  'USDCHF': 'USD/CHF',
  'EURGBP': 'EUR/GBP',
  'EURJPY': 'EUR/JPY',
  'GBPJPY': 'GBP/JPY',
  'BTCUSD': 'BTC/USD',
  'ETHUSD': 'ETH/USD',
  'XRPUSD': 'XRP/USD',
  'LTCUSD': 'LTC/USD',
  'ADAUSD': 'ADA/USD',
  'XAUUSD': 'XAU/USD',
  'XAGUSD': 'XAG/USD',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const twelveDataSymbol = symbolMap[symbol] || symbol

  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY

    if (!apiKey || apiKey === 'demo') {
      return NextResponse.json({
        success: true,
        symbol,
        price: Math.random() * 100 + 50,
        timestamp: new Date(),
        source: 'Mock Data',
        realtime: false,
      })
    }

    const response = await axios.get('https://api.twelvedata.com/quote', {
      params: {
        symbol: twelveDataSymbol,
        apikey: apiKey,
      },
      timeout: 5000,
    })

    const data = response.data

    if (data.status === 'error' || data.code === 400 || data.code === 404) {
      return NextResponse.json({
        success: true,
        symbol,
        price: Math.random() * 100 + 50,
        timestamp: new Date(),
        source: 'Mock Data (API Error)',
        realtime: false,
      })
    }

    return NextResponse.json({
      success: true,
      symbol,
      price: parseFloat(data.close),
      timestamp: new Date(data.timestamp * 1000),
      source: 'Twelve Data',
      realtime: true,
      open: parseFloat(data.open),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      close: parseFloat(data.close),
      change: parseFloat(data.change || 0),
      percent_change: parseFloat(data.percent_change || 0),
    })
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return NextResponse.json({
      success: true,
      symbol,
      price: Math.random() * 100 + 50,
      timestamp: new Date(),
      source: 'Mock Data (Error)',
      realtime: false,
    })
  }
}
