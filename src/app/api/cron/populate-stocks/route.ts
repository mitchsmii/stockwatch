import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const polygonApiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface PolygonResult {
  c: number
  h: number
  l: number
  t: number
}

interface PolygonResponse {
  results: PolygonResult[]
}

interface TickerData {
  min?: { c: number }
  prevDay?: { c: number }
}

interface SnapshotResponse {
  ticker: TickerData
}

async function fetchHistoricalPrice(symbol: string, daysAgo: number) {
  try {
    const today = new Date()
    const targetDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
    const dateStr = targetDate.toISOString().split('T')[0]
    
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${dateStr}/${dateStr}?adjusted=true&sort=desc&limit=1&apiKey=${polygonApiKey}`
    
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }
    
    const data = await response.json() as PolygonResponse
    if (!data.results || data.results.length === 0) {
      return null
    }
    
    return data.results[0].c // Close price
    
  } catch {
    return null
  }
}

async function fetchMarketCap(symbol: string) {
  try {
    const url = `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${polygonApiKey}`
    
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }

    const data = await response.json() as { results: { market_cap?: number } }
    if (!data.results) {
      return null
    }
    
    return data.results.market_cap || null
    
  } catch {
    return null
  }
}

async function fetch52WeekHighLow(symbol: string) {
  try {
    const today = new Date()
    const oneYearAgo = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000))
    
    const startDate = oneYearAgo.toISOString().split('T')[0]
    const endDate = today.toISOString().split('T')[0]
    
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&limit=1000&apiKey=${polygonApiKey}`
    
    const response = await fetch(url)
    if (!response.ok) {
      return { high: null, low: null }
    }
    
    const data = await response.json() as PolygonResponse
    if (!data.results || data.results.length === 0) {
      return { high: null, low: null }
    }
    
    const highs = data.results.map((day: PolygonResult) => day.h)
    const lows = data.results.map((day: PolygonResult) => day.l)
    
    const maxHigh = Math.max(...highs)
    const minLow = Math.min(...lows)
    
    return { high: maxHigh, low: minLow }
    
  } catch {
    return { high: null, low: null }
  }
}

async function fetchFiveBusinessDaysAgoClosePrice(symbol: string) {
  try {
    const today = new Date()
    
    let businessDaysCount = 0
    const targetDate = new Date(today)
    
    while (businessDaysCount < 5) {
      targetDate.setDate(targetDate.getDate() - 1)
      
      const dayOfWeek = targetDate.getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        businessDaysCount++
      }
    }
    
    const targetDateStr = targetDate.toISOString().split('T')[0]
    
    let url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${targetDateStr}/${targetDateStr}?adjusted=true&sort=desc&limit=1&apiKey=${polygonApiKey}`
    
    let response = await fetch(url)
    if (response.ok) {
      const data = await response.json() as PolygonResponse
      if (data.results && data.results.length > 0) {
        return data.results[0].c
      }
    }
    
    // Search backwards to find most recent available data
    const startDate = new Date(targetDate.getTime() - (5 * 24 * 60 * 60 * 1000))
    const endDate = targetDate
    
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]
    
    url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startStr}/${endStr}?adjusted=true&sort=desc&limit=10&apiKey=${polygonApiKey}`
    response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json() as PolygonResponse
      if (data.results && data.results.length > 0) {
        return data.results[0].c
      }
    }
    
    return null
    
  } catch {
    return null
  }
}

async function fetchOneMonthAgoClosePrice(symbol: string) {
  try {
    const today = new Date()
    const oneMonthAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))
    const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0]
    
    let url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${oneMonthAgoStr}/${oneMonthAgoStr}?adjusted=true&sort=desc&limit=1&apiKey=${polygonApiKey}`
    
    let response = await fetch(url)
    if (response.ok) {
      const data = await response.json() as PolygonResponse
      if (data.results && data.results.length > 0) {
        return data.results[0].c
      }
    }
    
    // Search backwards
    const startDate = new Date(oneMonthAgo.getTime() - (10 * 24 * 60 * 60 * 1000))
    const endDate = oneMonthAgo
    
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]
    
    url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startStr}/${endStr}?adjusted=true&sort=desc&limit=10&apiKey=${polygonApiKey}`
    response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json() as PolygonResponse
      if (data.results && data.results.length > 0) {
        return data.results[0].c
      }
    }
    
    return null
    
  } catch {
    return null
  }
}

async function fetchOneYearAgoClosePrice(symbol: string) {
  try {
    const today = new Date()
    const oneYearAgo = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000))
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0]
    
    let url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${oneYearAgoStr}/${oneYearAgoStr}?adjusted=true&sort=desc&limit=1&apiKey=${polygonApiKey}`
    
    let response = await fetch(url)
    if (response.ok) {
      const data = await response.json() as PolygonResponse
      if (data.results && data.results.length > 0) {
        return data.results[0].c
      }
    }
    
    // Search backwards
    const startDate = new Date(oneYearAgo.getTime() - (30 * 24 * 60 * 60 * 1000))
    const endDate = oneYearAgo
    
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]
    
    url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startStr}/${endStr}?adjusted=true&sort=desc&limit=20&apiKey=${polygonApiKey}`
    response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json() as PolygonResponse
      if (data.results && data.results.length > 0) {
        return data.results[0].c
      }
    }
    
    return null
    
  } catch {
    return null
  }
}

async function populatePriceBased() {
  try {
    const symbol = 'AAPL'
    
    // Fetch current data
    const currentUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${polygonApiKey}`
    
    const response = await fetch(currentUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch current data: ${response.status}`)
    }
    
    const data = await response.json() as SnapshotResponse
    const ticker = data.ticker
    
    // Get current price
    const currentPrice = ticker.min?.c || ticker.prevDay?.c || 0
    
    // Fetch historical prices
    const priceYesterday = await fetchHistoricalPrice(symbol, 1)
    const fiveBusinessDaysAgoClosePrice = await fetchFiveBusinessDaysAgoClosePrice(symbol)
    const oneMonthAgoClosePrice = await fetchOneMonthAgoClosePrice(symbol)
    const oneYearAgoClosePrice = await fetchOneYearAgoClosePrice(symbol)
    const marketCap = await fetchMarketCap(symbol)
    const { high: maxHigh, low: minLow } = await fetch52WeekHighLow(symbol)
    
    // Prepare data for database
    const stockData = {
      symbol: symbol,
      date: new Date().toISOString().split('T')[0],
      current_price: currentPrice,
      price_yesterday: priceYesterday,
      price_one_week_ago: fiveBusinessDaysAgoClosePrice,
      price_one_month_ago: oneMonthAgoClosePrice,
      price_one_year_ago: oneYearAgoClosePrice,
      market_cap: marketCap,
      pe_ratio: 0,
      dividend_yield: 0,
      fifty_two_week_high: maxHigh,
      fifty_two_week_low: minLow,
      ten_year_est_return: 0,
      updated_at: new Date().toISOString()
    }
    
    // Insert into Supabase
    const { error } = await supabase
      .from('stocks_complete_data')
      .upsert(stockData, { 
        onConflict: 'symbol,date',
        ignoreDuplicates: false 
      })
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return { success: true, message: 'Stock data updated successfully' }
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to populate data: ${errorMessage}`)
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const result = await populatePriceBased()
    return NextResponse.json(result)
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Cron job error:', errorMessage)
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    )
  }
} 