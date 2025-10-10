
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const polygonApiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY!

// Creates the client
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

interface AllPriceData {
  priceYesterday: number | null
  priceFiveDaysAgo: number | null
  priceOneMonthAgo: number | null
  priceOneYearAgo: number | null
  fiftyTwoWeekHigh: number | null
  fiftyTwoWeekLow: number | null
}

// OPTIMIZED: Fetches ALL historical prices in ONE API call
// Gets a full year of data (~252 trading days) and extracts everything we need from it
// This replaces 5 separate API calls with just 1!
async function fetchAllHistoricalPrices(symbol: string): Promise<AllPriceData> {
  try {
    const today = new Date()
    const oneYearAgo = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000))
    
    const startDate = oneYearAgo.toISOString().split('T')[0]
    const endDate = today.toISOString().split('T')[0]
    
    console.log(`📅 Fetching year of data for ${symbol}: ${startDate} to ${endDate}`)
    
    // ONE API call gets 365 days of data (~252 trading days)
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&limit=1000&apiKey=${polygonApiKey}`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`❌ Failed to fetch historical data: ${response.status}`)
      return {
        priceYesterday: null,
        priceFiveDaysAgo: null,
        priceOneMonthAgo: null,
        priceOneYearAgo: null,
        fiftyTwoWeekHigh: null,
        fiftyTwoWeekLow: null
      }
    }
    
    const data = await response.json() as PolygonResponse
    if (!data.results || data.results.length === 0) {
      console.error(`❌ No results returned for ${symbol}`)
      return {
        priceYesterday: null,
        priceFiveDaysAgo: null,
        priceOneMonthAgo: null,
        priceOneYearAgo: null,
        fiftyTwoWeekHigh: null,
        fiftyTwoWeekLow: null
      }
    }
    
    const results = data.results
    const resultCount = results.length
    
    console.log(`✅ Fetched ${resultCount} trading days for ${symbol}`)
    
    // Extract all the prices we need from this single dataset
    const priceData = {
      priceYesterday: resultCount >= 2 ? results[resultCount - 2].c : null,
      priceFiveDaysAgo: resultCount >= 6 ? results[resultCount - 6].c : null,
      priceOneMonthAgo: findClosestPrice(results, 30),
      priceOneYearAgo: results[0].c, // First day in the dataset
      fiftyTwoWeekHigh: Math.max(...results.map(d => d.h)),
      fiftyTwoWeekLow: Math.min(...results.map(d => d.l))
    }
    
    console.log(`📊 ${symbol} prices:`, {
      yesterday: priceData.priceYesterday,
      fiveDaysAgo: priceData.priceFiveDaysAgo,
      oneMonthAgo: priceData.priceOneMonthAgo,
      oneYearAgo: priceData.priceOneYearAgo,
      high52w: priceData.fiftyTwoWeekHigh,
      low52w: priceData.fiftyTwoWeekLow
    })
    
    return priceData
    
  } catch (error) {
    console.error(`❌ Error fetching historical prices for ${symbol}:`, error)
    return {
      priceYesterday: null,
      priceFiveDaysAgo: null,
      priceOneMonthAgo: null,
      priceOneYearAgo: null,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null
    }
  }
}

// Helper function to find the price closest to X days ago
function findClosestPrice(results: PolygonResult[], daysAgo: number): number | null {
  if (results.length === 0) return null
  
  const targetTimestamp = Date.now() - (daysAgo * 24 * 60 * 60 * 1000)
  
  // Find the day closest to the target date
  const closest = results.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.t - targetTimestamp)
    const currDiff = Math.abs(curr.t - targetTimestamp)
    return currDiff < prevDiff ? curr : prev
  })
  
  return closest.c
}

// Fetches the market cap for a stock
async function fetchMarketCap(symbol: string) {
  try {
    const url = `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${polygonApiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      console.error(`❌ Failed to fetch market cap: ${response.status}`)
      return null
    }

    const data = await response.json() as { results: { market_cap?: number } }
    if (!data.results) {
      return null
    }

    console.log(`💰 ${symbol} market cap: ${data.results.market_cap}`)
    return data.results.market_cap || null
    
  } catch (error) {
    console.error(`❌ Error fetching market cap for ${symbol}:`, error)
    return null
  }
}

// Main function that populates stock data
async function populatePriceBased() {
  try {
    const symbol = 'AAPL'
    
    console.log(`🚀 Starting data fetch for ${symbol}...`)
    
    // Fetch current price from snapshot
    const currentUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${polygonApiKey}`
    
    const response = await fetch(currentUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch current data: ${response.status}`)
    }
    
    const data = await response.json() as SnapshotResponse
    const ticker = data.ticker
    
    // Get current price
    const currentPrice = ticker.min?.c || ticker.prevDay?.c || 0
    console.log(`💵 ${symbol} current price: $${currentPrice}`)
    
    // OPTIMIZED: Get ALL historical prices in just 2 API calls instead of 6!
    const historicalData = await fetchAllHistoricalPrices(symbol)
    const marketCap = await fetchMarketCap(symbol)
    
    // Prepare data for database (same structure as before - no breaking changes!)
    const stockData = {
      symbol: symbol,
      date: new Date().toISOString().split('T')[0],
      current_price: currentPrice,
      price_yesterday: historicalData.priceYesterday,
      price_one_week_ago: historicalData.priceFiveDaysAgo,
      price_one_month_ago: historicalData.priceOneMonthAgo,
      price_one_year_ago: historicalData.priceOneYearAgo,
      market_cap: marketCap,
      pe_ratio: 0,
      dividend_yield: 0,
      fifty_two_week_high: historicalData.fiftyTwoWeekHigh,
      fifty_two_week_low: historicalData.fiftyTwoWeekLow,
      ten_year_est_return: 0,
      updated_at: new Date().toISOString()
    }
    
    console.log(`💾 Saving to database...`)
    
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
    
    console.log(`✅ Successfully updated ${symbol} data`)
    return { success: true, message: `Stock data updated successfully for ${symbol}` }
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`❌ Failed to populate data:`, errorMessage)
    throw new Error(`Failed to populate data: ${errorMessage}`)
  }
}

// API endpoint called by Vercel Cron
export async function GET(request: NextRequest) {
  try {
    console.log(`⏰ Cron job triggered at ${new Date().toISOString()}`)
    
    // Verify this is a Vercel cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error(`❌ Unauthorized cron request`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const result = await populatePriceBased()
    return NextResponse.json(result)
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('❌ Cron job error:', errorMessage)
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    )
  }
} 
