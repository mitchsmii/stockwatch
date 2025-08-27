// Simplified script using only basic Polygon endpoints
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const polygonApiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY

if (!supabaseUrl || !supabaseAnonKey || !polygonApiKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fetchBasicData(symbol) {
  try {
    // Use only the most basic endpoint that should work with Stocks Starter
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${polygonApiKey}`
    console.log('🌐 Fetching from:', url)
    
    const response = await fetch(url)
    console.log('📊 Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API error:', errorText)
      return null
    }
    
    const data = await response.json()
    console.log('✅ Data received successfully')
    
    if (!data || !data.ticker) {
      console.error('❌ No ticker data in response')
      return null
    }
    
    const ticker = data.ticker
    console.log('📈 Ticker data:', JSON.stringify(ticker, null, 2))
    
    return {
      current_price: ticker.min?.c || ticker.prevDay?.c || 0,
      open: ticker.day?.o || 0,
      high: ticker.day?.h || 0,
      low: ticker.day?.l || 0,
      volume: ticker.day?.v || 0,
      one_day_change: ticker.min?.c && ticker.prevDay?.c ? 
        ((ticker.min.c - ticker.prevDay.c) / ticker.prevDay.c) * 100 : 0
    }
    
  } catch (err) {
    console.error('❌ Error fetching data:', err.message)
    return null
  }
}

async function populateSimple() {
  try {
    console.log('🚀 Starting simple AAPL data population...')
    
    const symbol = 'AAPL'
    
    // Fetch basic data
    const basicData = await fetchBasicData(symbol)
    if (!basicData) {
      throw new Error('Failed to fetch basic data')
    }
    
    // Prepare data for database (with placeholder values for missing data)
    const aaplData = {
      symbol: symbol,
      date: new Date().toISOString().split('T')[0],
      
      // Real data from Polygon
      current_price: basicData.current_price,
      open: basicData.open,
      high: basicData.high,
      low: basicData.low,
      volume: basicData.volume,
      one_day_change: basicData.one_day_change,
      
      // Placeholder values (we'll populate these later)
      one_week_change: 0,
      one_month_change: 0,
      one_year_change: 0,
      market_cap: 0,
      pe_ratio: 0,
      dividend_yield: 0,
      beta: 0,
      fifty_two_week_high: 0,
      fifty_two_week_low: 0,
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
    
    console.log('✅ Successfully inserted basic AAPL data!')
    console.log('📈 You can now refresh your dashboard to see the price data')
    
  } catch (err) {
    console.error('❌ Failed to populate data:', err)
  }
}

populateSimple() 