// Script to fetch real AAPL data from Polygon.io and populate Supabase
// Run this with: node src/scripts/populate-from-polygon.js

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const polygonApiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

if (!polygonApiKey) {
  console.error('❌ Missing Polygon API key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Polygon.io API functions
async function fetchPolygonData(symbol, endpoint) {
  const url = `https://api.polygon.io${endpoint}?apiKey=${polygonApiKey}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

async function getQuote(symbol) {
  const endpoint = `/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}`
  const data = await fetchPolygonData(symbol, endpoint)
  
  if (!data || !data.ticker) return null
  
  const ticker = data.ticker
  return {
    current_price: ticker.min?.c || ticker.prevDay?.c || 0,
    open: ticker.day?.o || 0,
    high: ticker.day?.h || 0,
    low: ticker.day?.l || 0,
    volume: ticker.day?.v || 0,
    one_day_change: ticker.min?.c && ticker.prevDay?.c ? 
      ((ticker.min.c - ticker.prevDay.c) / ticker.prevDay.c) * 100 : 0
  }
}

async function getCompanyOverview(symbol) {
  const endpoint = `/v3/reference/tickers/${symbol}`
  const data = await fetchPolygonData(symbol, endpoint)
  
  if (!data || !data.results) return null
  
  const result = data.results
  return {
    market_cap: result.market_cap || 0,
    pe_ratio: result.pe_ratio || 0,
    dividend_yield: result.dividend_yield || 0,
    beta: result.beta || 0,
    fifty_two_week_high: result.high_52_weeks || 0,
    fifty_two_week_low: result.low_52_weeks || 0
  }
}

async function getHistoricalData(symbol, timespan = 'day', multiplier = 1) {
  const today = new Date()
  const from = new Date(today.getTime() - (multiplier * 24 * 60 * 60 * 1000))
  
  const fromDate = from.toISOString().split('T')[0]
  const toDate = today.toISOString().split('T')[0]
  
  const endpoint = `/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=desc&limit=2`
  const data = await fetchPolygonData(symbol, endpoint)
  
  if (!data || !data.results || data.results.length < 2) return null
  
  const [current, previous] = data.results
  const change = ((current.c - previous.c) / previous.c) * 100
  
  return { change, current: current.c, previous: previous.c }
}

async function populateAAPLFromPolygon() {
  try {
    console.log('🚀 Fetching real AAPL data from Polygon.io...')
    
    const symbol = 'AAPL'
    
    // Fetch current quote
    console.log('📊 Fetching current quote...')
    const quote = await getQuote(symbol)
    if (!quote) {
      throw new Error('Failed to fetch quote data')
    }
    
    // Fetch company overview
    console.log('🏢 Fetching company overview...')
    const overview = await getCompanyOverview(symbol)
    if (!overview) {
      throw new Error('Failed to fetch company overview')
    }
    
    // Fetch historical data for different time periods
    console.log('📈 Fetching historical data...')
    const weekData = await getHistoricalData(symbol, 'day', 7)
    const monthData = await getHistoricalData(symbol, 'day', 30)
    const yearData = await getHistoricalData(symbol, 'day', 365)
    
    // Prepare data for database
    const aaplData = {
      symbol: symbol,
      date: new Date().toISOString().split('T')[0],
      
      // Current prices from quote
      current_price: quote.current_price,
      open: quote.open,
      high: quote.high,
      low: quote.low,
      volume: quote.volume,
      one_day_change: quote.one_day_change,
      
      // Historical changes
      one_week_change: weekData?.change || 0,
      one_month_change: monthData?.change || 0,
      one_year_change: yearData?.change || 0,
      
      // Company metrics
      market_cap: overview.market_cap,
      pe_ratio: overview.pe_ratio,
      dividend_yield: overview.dividend_yield,
      beta: overview.beta,
      fifty_two_week_high: overview.fifty_two_week_high,
      fifty_two_week_low: overview.fifty_two_week_low,
      
      // Placeholder values for now (you can calculate these later)
      intrinsic_value: 0,
      upside_percent: 0,
      ten_year_est_return: 0,
      buy_price: 0,
      buy_upside_percent: 0,
      overall_rating: 0,
      quality_rating: 0,
      value_rating: 0,
      
      updated_at: new Date().toISOString()
    }
    
    console.log('📊 Data to insert:', aaplData)
    
    // Insert into Supabase
    const { error } = await supabase
      .from('stocks_complete_data')
      .upsert(aaplData, { 
        onConflict: 'symbol,date',
        ignoreDuplicates: false 
      })
    
    if (error) {
      console.error('❌ Error inserting data:', error)
      return
    }
    
    console.log('✅ Successfully inserted AAPL data from Polygon.io!')
    console.log('📈 You can now refresh your dashboard to see the real data')
    
  } catch (err) {
    console.error('❌ Failed to populate data:', err)
  }
}

// Run the function
populateAAPLFromPolygon() 