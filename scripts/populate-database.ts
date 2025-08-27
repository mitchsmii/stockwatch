import { supabase } from '@/lib/supabase'
import { PolygonApi } from '@/lib/api/polygonApi'

export async function populateDatabase() {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']
  
  for (const symbol of symbols) {
    try {
      console.log(`Fetching data for ${symbol}...`)
      
      // Get current data from Polygon API
      const quote = await PolygonApi.getQuote(symbol, 'day')
      const overview = await PolygonApi.getCompanyOverview(symbol)

      
      if (quote && overview) {
        // Calculate your metrics
        const oneDayChange = ((quote.close - quote.open) / quote.open) * 100
        
        // Insert into database
        const { error } = await supabase
          .from('stocks_complete_data')
          .upsert({
            symbol: symbol.toUpperCase(),
            date: new Date().toISOString().split('T')[0],
            current_price: quote.close,
            open: quote.open,
            high: quote.high || 0,
            low: quote.low || 0,
            volume: 0, // You'll need to get this from your data
            one_day_change: oneDayChange,
            one_week_change: 0, // Calculate this
            one_month_change: 0, // Calculate this
            one_year_change: 0, // Calculate this
            market_cap: overview.marketCap,
            pe_ratio: overview.peRatio,
            dividend_yield: overview.dividendYield,
            beta: overview.beta,
            fifty_two_week_high: overview.fiftyTwoWeekHigh,
            fifty_two_week_low: overview.fiftyTwoWeekLow,
            intrinsic_value: 0, // Calculate this
            upside_percent: 0, // Calculate this
            ten_year_est_return: 0, // Calculate this
            buy_price: 0, // Set this
            buy_upside_percent: 0, // Calculate this
            overall_rating: 0, // Calculate this
            quality_rating: 0, // Calculate this
            value_rating: 0, // Calculate this
            updated_at: new Date().toISOString()
          })
        
        if (error) {
          console.error(`Error inserting ${symbol}:`, error)
        } else {
          console.log(`✅ Successfully inserted ${symbol}`)
        }
      }
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (err) {
      console.error(`Failed to process ${symbol}:`, err)
    }
  }
} 