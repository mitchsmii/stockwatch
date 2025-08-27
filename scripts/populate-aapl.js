// Simple script to populate Supabase with AAPL data
// Run this with: node src/scripts/populate-aapl.js

const { createClient } = require('@supabase/supabase-js')

// You'll need to add these to your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function populateAAPL() {
  try {
    console.log('🚀 Starting to populate AAPL data...')
    
    // Sample AAPL data (you can replace these with real values later)
    const aaplData = {
      symbol: 'AAPL',
      date: new Date().toISOString().split('T')[0], // Today's date
      current_price: 175.43,
      open: 174.20,
      high: 176.80,
      low: 173.50,
      volume: 45678900,
      one_day_change: 2.34,
      one_week_change: 5.67,
      one_month_change: 12.45,
      one_year_change: 25.80,
      market_cap: 2800000000000,
      pe_ratio: 28.5,
      dividend_yield: 0.5,
      beta: 1.2,
      fifty_two_week_high: 198.23,
      fifty_two_week_low: 124.17,
      intrinsic_value: 185.00,
      upside_percent: 5.45,
      ten_year_est_return: 8.5,
      buy_price: 165.00,
      buy_upside_percent: 6.32,
      overall_rating: 8.5,
      quality_rating: 9.2,
      value_rating: 7.8,
      updated_at: new Date().toISOString()
    }
    
    console.log('📊 Inserting AAPL data:', aaplData)
    
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
    
    console.log('✅ Successfully inserted AAPL data!')
    console.log('📈 You can now refresh your dashboard to see the data')
    
  } catch (err) {
    console.error('❌ Failed to populate data:', err)
  }
}

// Run the function
populateAAPL() 