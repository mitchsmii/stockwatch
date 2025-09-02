// Script to populate database with actual prices (not calculated changes)
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

async function fetchHistoricalPrice(symbol, daysAgo) {
  try {
    const today = new Date()
    const targetDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
    const dateStr = targetDate.toISOString().split('T')[0]
    
    console.log(`📅 Fetching price from ${daysAgo} days ago (${dateStr})...`)
    
    // First attempt: try exact date
    let url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${dateStr}/${dateStr}?adjusted=true&sort=desc&limit=1&apiKey=${polygonApiKey}`
    
    let response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const price = data.results[0].c
        console.log(`✅ Exact date found: $${price} on ${dateStr}`)
        return price
      }
    }
    
    // Second attempt: search backwards to find most recent available data
    console.log(`🔍 No exact date found, searching backwards to find most recent data...`)
    
    // Search in a 5-day window around the target date
    const startDate = new Date(targetDate.getTime() - (5 * 24 * 60 * 60 * 1000))
    const endDate = targetDate
    
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]
    
    url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startStr}/${endStr}?adjusted=true&sort=desc&limit=10&apiKey=${polygonApiKey}`
    response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        // Get the most recent available data (closest to target date but earlier)
        const closestResult = data.results[0]
        const price = closestResult.c
        const resultDate = new Date(closestResult.t).toISOString().split('T')[0]
        console.log(`✅ Found most recent available data: $${price} on ${resultDate}`)
        return price
      }
    }
    
    console.log(`⚠️  No data found around ${daysAgo} days ago`)
    return null
    
  } catch (error) {
    console.log(`⚠️  Error fetching ${daysAgo} days ago: ${error.message}`)
    return null
  }
}

//Market Cap Function
async function fetchMarketCap(symbol) {
  try {
    const url = `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${polygonApiKey}`
    console.log(`📅 Fetching market cap...`)

    const response = await fetch(url)
    if (!response.ok) {
      console.log(`⚠️  Failed to fetch market cap for ${symbol}`)
    }

    const data = await response.json()
    if (!data.results) {
      console.log(`⚠️  No results found for ${symbol}`)
    }
    const marketCap = data.results.market_cap
    if (marketCap) {
      console.log(`✅ Market Cap: $${marketCap}`)
      return marketCap
    } else {
      console.log(`⚠️  No market cap found for ${symbol}`)
      return null
    }
  } catch (error) {
    console.log(`⚠️  Error fetching market cap: ${error.message}`)
    return null
  }
}

// 52-week high/low function
async function fetch52WeekHighLow(symbol) {
  try {
    const today = new Date()
    const oneYearAgo = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000))
    
    const startDate = oneYearAgo.toISOString().split('T')[0]
    const endDate = today.toISOString().split('T')[0]
    
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&limit=1000&apiKey=${polygonApiKey}`
    
    console.log(`📊 Fetching 52-week high/low for ${symbol} from ${startDate} to ${endDate}...`)
    
    const response = await fetch(url)
    if (!response.ok) {
      console.log(`⚠️  Failed to fetch 52-week data for ${symbol}: ${response.status}`)
      return { high: null, low: null }
    }
    
    const data = await response.json()
    if (!data.results || data.results.length === 0) {
      console.log(`⚠️  No 52-week data found for ${symbol}`)
      return { high: null, low: null }
    }
    
    // Extract all high and low values
    const highs = data.results.map(day => day.h)
    const lows = data.results.map(day => day.l)
    
    // Find max high and min low
    const maxHigh = Math.max(...highs)
    const minLow = Math.min(...lows)
    
    console.log(`✅ 52-week high for ${symbol}: $${maxHigh}`)
    console.log(`✅ 52-week low for ${symbol}: $${minLow}`)
    
    return { high: maxHigh, low: minLow }
    
  } catch (error) {
    console.log(`⚠️  Error fetching 52-week data for ${symbol}: ${error.message}`)
    return { high: null, low: null }
  }
}

// Google Finance style: Get close price from exactly 5 business days ago
async function fetchFiveBusinessDaysAgoClosePrice(symbol) {
  try {
    const today = new Date()
    
    // Calculate 5 business days ago
    let businessDaysCount = 0
    const targetDate = new Date(today)
    
    // Go back until we find 5 business days
    while (businessDaysCount < 5) {
      targetDate.setDate(targetDate.getDate() - 1)
      
      // Check if it's a business day (Monday = 1, Tuesday = 2, ..., Friday = 5)
      const dayOfWeek = targetDate.getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
        businessDaysCount++
      }
    }
    
    const targetDateStr = targetDate.toISOString().split('T')[0]
    console.log(`📅 Finding 5 business days ago: ${targetDateStr} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][targetDate.getDay()]})`)
    
    // Get the close price for that day
    let url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${targetDateStr}/${targetDateStr}?adjusted=true&sort=desc&limit=1&apiKey=${polygonApiKey}`
    
    let response = await fetch(url)
    if (!response.ok) {
      console.log(`⚠️  No data found for 5 business days ago`)
      return null
    }
    
    const data = await response.json()
    if (data.results && data.results.length > 0) {
      const closePrice = data.results[0].c // Close price
      console.log(`✅ 5 business days ago close price: $${closePrice}`)
      return closePrice
    }
    
    // Second attempt: search backwards to find the most recent available data
    console.log(`🔍 No exact date found, searching backwards to find most recent data...`)
    
    // Search backwards from the target date (going earlier in time)
    const startDate = new Date(targetDate.getTime() - (5 * 24 * 60 * 60 * 1000)) // 5 days earlier
    const endDate = targetDate // End at the target date
    
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]
    
    url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startStr}/${endStr}?adjusted=true&sort=desc&limit=10&apiKey=${polygonApiKey}`
    response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        // Get the most recent available data (closest to target date but earlier)
        const closestResult = data.results[0]
        const closePrice = closestResult.c
        const resultDate = new Date(closestResult.t).toISOString().split('T')[0]
        console.log(`✅ Found most recent available data: $${closePrice} on ${resultDate}`)
        return closePrice
      }
    }
    
    console.log(`⚠️  No data found around 5 business days ago`)
    return null
    
  } catch (error) {
    console.log(`⚠️  Error fetching 5 business days ago close price: ${error.message}`)
    return null
  }
}

// Google Finance style: Get close price from exactly 1 month ago (30 days ago)
async function fetchOneMonthAgoClosePrice(symbol) {
  try {
    const today = new Date()
    
    // Find exactly 30 days ago
    const oneMonthAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))
    const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0]
    
    console.log(`📅 Finding 1 month ago (30 days): ${oneMonthAgoStr}`)
    
    // First attempt: try exact date
    let url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${oneMonthAgoStr}/${oneMonthAgoStr}?adjusted=true&sort=desc&limit=1&apiKey=${polygonApiKey}`
    
    let response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const closePrice = data.results[0].c // Close price
        console.log(`✅ 1 month ago close price: $${closePrice}`)
        return closePrice
      }
    }
    
    // Second attempt: search backwards to find the most recent available data
    console.log(`🔍 No exact date found, searching backwards to find most recent data...`)
    
    // Search backwards from the target date (going earlier in time)
    const startDate = new Date(oneMonthAgo.getTime() - (10 * 24 * 60 * 60 * 1000)) // 10 days earlier
    const endDate = oneMonthAgo // End at the target date
    
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]
    
    url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startStr}/${endStr}?adjusted=true&sort=desc&limit=10&apiKey=${polygonApiKey}`
    response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        // Get the most recent available data (closest to target date but earlier)
        const closestResult = data.results[0]
        const closePrice = closestResult.c
        const resultDate = new Date(closestResult.t).toISOString().split('T')[0]
        console.log(`✅ Found most recent available data: $${closePrice} on ${resultDate}`)
        return closePrice
      }
    }
    
    console.log(`⚠️  No data found around 1 month ago`)
    return null
    
  } catch (error) {
    console.log(`⚠️  Error fetching 1 month ago close price: ${error.message}`)
    return null
  }
}

// Google Finance style: Get close price from exactly 1 year ago (365 days ago)
async function fetchOneYearAgoClosePrice(symbol) {
  try {
    const today = new Date()
    
    // Find exactly 365 days ago
    const oneYearAgo = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000))
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0]
    
    console.log(`📅 Finding 1 year ago (365 days): ${oneYearAgoStr}`)
    
    // First attempt: try exact date
    let url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${oneYearAgoStr}/${oneYearAgoStr}?adjusted=true&sort=desc&limit=1&apiKey=${polygonApiKey}`
    
    let response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const closePrice = data.results[0].c // Close price
        console.log(`✅ 1 year ago close price: $${closePrice}`)
        return closePrice
      }
    }
    
    // Second attempt: search backwards to find the most recent available data
    console.log(`🔍 No exact date found, searching backwards to find most recent data...`)
    
    // Search backwards from the target date (going earlier in time)
    const startDate = new Date(oneYearAgo.getTime() - (30 * 24 * 60 * 60 * 1000)) // 30 days earlier
    const endDate = oneYearAgo // End at the target date
    
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]
    
    url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startStr}/${endStr}?adjusted=true&sort=desc&limit=20&apiKey=${polygonApiKey}`
    response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        // Get the most recent available data (closest to target date but earlier)
        const closestResult = data.results[0]
        const closePrice = closestResult.c
        const resultDate = new Date(closestResult.t).toISOString().split('T')[0]
        console.log(`✅ Found most recent available data: $${closePrice} on ${resultDate}`)
        return closePrice
      }
    }
    
    console.log(`⚠️  No data found around 1 year ago`)
    return null
    
  } catch (error) {
    console.log(`⚠️  Error fetching 1 year ago close price: ${error.message}`)
    return null
  }
}

async function populatePriceBased() {
  try {
    console.log('🚀 Starting price-based AAPL data population...')
    
    const symbol = 'AAPL'
    
    // Fetch current data
    const currentUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${polygonApiKey}`
    console.log('📊 Fetching current data...')
    
    const response = await fetch(currentUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch current data: ${response.status}`)
    }
    
    const data = await response.json()
    const ticker = data.ticker
    
    // Get current price
    const currentPrice = ticker.min?.c || ticker.prevDay?.c || 0
    
    console.log(`📈 Current price: $${currentPrice}`)
    
    // Fetch historical prices with detailed logging (Google Finance style)
    console.log('\n📅 === GOOGLE FINANCE STYLE PRICE FETCHING ===')
    
    console.log('\n🕐 1 Day Change Calculation:')
    const yesterdayDate = new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    console.log(`  - Getting yesterday's close price: ${yesterdayDate}`)
    const priceYesterday = await fetchHistoricalPrice(symbol, 1)
    console.log(`  - Yesterday close: ${priceYesterday ? `$${priceYesterday}` : 'null'}`)
    console.log(`  - Will calculate: (current_close - yesterday_close) / yesterday_close * 100`)
    
    console.log('\n🕐 5 Business Days Change Calculation:')
    const fiveBusinessDaysAgoClosePrice = await fetchFiveBusinessDaysAgoClosePrice(symbol)
    console.log(`  - Getting close price from 5 business days ago`)
    console.log(`  - 5 business days ago close: ${fiveBusinessDaysAgoClosePrice ? `$${fiveBusinessDaysAgoClosePrice}` : 'null'}`)
    console.log(`  - Will calculate: (current_close - five_business_days_ago_close) / five_business_days_ago_close * 100`)
    
    console.log('\n🕐 1 Month Change Calculation:')
    const oneMonthAgoClosePrice = await fetchOneMonthAgoClosePrice(symbol)
    console.log(`  - Getting close price from 1 month ago (30 days)`)
    console.log(`  - 1 month ago close: ${oneMonthAgoClosePrice ? `$${oneMonthAgoClosePrice}` : 'null'}`)
    console.log(`  - Will calculate: (current_close - month_ago_close) / month_ago_close * 100`)
    
    console.log('\n🕐 1 Year Change Calculation:')
    const oneYearAgoClosePrice = await fetchOneYearAgoClosePrice(symbol)
    console.log(`  - Getting close price from 1 year ago (365 days)`)
    console.log(`  - 1 year ago close: ${oneYearAgoClosePrice ? `$${oneYearAgoClosePrice}` : 'null'}`)
    console.log(`  - Will calculate: (current_close - year_ago_close) / year_ago_close * 100`)
    
    console.log('\n🕐 Market Cap Calculation:')
    const marketCap = await fetchMarketCap(symbol)
    console.log(`  - Getting market cap...`)
    console.log(`  - Market Cap: ${marketCap ? `$${marketCap}` : 'null'}`)

    console.log('\n🕐 52-Week High/Low Calculation:')
    const { high: maxHigh, low: minLow } = await fetch52WeekHighLow(symbol)
    console.log(`  - Getting 52-week high/low...`)
    console.log(`  - 52-week high: ${maxHigh ? `$${maxHigh}` : 'null'}`)
    console.log(`  - 52-week low: ${minLow ? `$${minLow}` : 'null'}`)

    console.log('\n📊 === FETCHING COMPLETE ===\n')
    
    // Prepare data for database (Google Finance style)
    const stockData = {
      symbol: symbol,
      date: new Date().toISOString().split('T')[0],
      
      // Current price
      current_price: currentPrice,
      
      // Historical prices (Google Finance style)
      price_yesterday: priceYesterday, // Close price from yesterday
      price_one_week_ago: fiveBusinessDaysAgoClosePrice, // Close price from 5 business days ago
      price_one_month_ago: oneMonthAgoClosePrice, // Close price from 1 month ago (30 days)
      price_one_year_ago: oneYearAgoClosePrice, // Close price from 1 year ago (365 days)
      
      // Placeholder values for now
      market_cap: marketCap,
      pe_ratio: 0,
      dividend_yield: 0,
      fifty_two_week_high: maxHigh,
      fifty_two_week_low: minLow,
      ten_year_est_return: 0,
      
      updated_at: new Date().toISOString()
    }
    
    console.log('📊 Data to insert:', stockData)
    
    // Insert into Supabase
    const { error } = await supabase
      .from('stocks_complete_data')
      .upsert(stockData, { 
        onConflict: 'symbol,date',
        ignoreDuplicates: false 
      })
    
    if (error) {
      console.error('❌ Error inserting data:', error)
      return
    }
    
    console.log('✅ Successfully inserted price-based AAPL data!')
    console.log('📈 Now you can calculate changes in your app using simple math!')
    
  } catch (error) {
    console.error('❌ Failed to populate data:', error)
  }
}

populatePriceBased() 