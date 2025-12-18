import { useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/supabase'

interface StockData {
  symbol: string
  date: string
  current_price: number
  
  // Historical prices (for calculating changes)
  price_yesterday: number
  price_one_week_ago: number
  price_one_month_ago: number
  price_one_year_ago: number
  
  // Company metrics
  market_cap: number
  pe_ratio: number
  dividend_yield: number
  fifty_two_week_high: number
  fifty_two_week_low: number
  
  // Your custom calculations
  ten_year_est_return: number
  
  updated_at: string
}

interface UseStockDatabaseReturn {
  stockData: Record<string, StockData>
  loading: boolean
  error: string | null
  refreshData: (symbols: string[]) => Promise<void>
  updateStock: (symbol: string) => Promise<void>
}

export function useStockDatabase(): UseStockDatabaseReturn {
  const [stockData, setStockData] = useState<Record<string, StockData>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchingRef = useRef<string>('') // Track what we're currently fetching to prevent duplicates

  // Helper function to get date string X days ago
  const getDateDaysAgo = (days: number): string => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().split('T')[0]
  }

  const fetchStockData = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) return

    // Create a key to track this fetch request
    const fetchKey = symbols.sort().join(',')
    
    // Prevent duplicate concurrent fetches for the same symbols
    if (fetchingRef.current === fetchKey) {
      console.log('⏭️ Already fetching data for these symbols, skipping duplicate request')
      return
    }
    
    fetchingRef.current = fetchKey
    setLoading(true)
    setError(null)

    try {
      // Step 1: Fetch company data from stocks table (super fast - one row per symbol)
      const { data: companyData, error: companyError } = await supabase
        .from('stocks')
        .select('*')
        .in('symbol', symbols)

      if (companyError) throw companyError

      // Step 2: Fetch prices more efficiently - only fetch recent prices needed for calculations
      // For each symbol, we need: current price + ~5 historical prices
      // Fetch last 400 days to cover holidays/weekends (should be ~300 trading days max)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 400)
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0]
      
      console.log('📊 Fetching price data for symbols:', symbols)
      const startTime = performance.now()
      
      const { data: priceData, error: priceError } = await supabase
        .from('stock_prices')
        .select('symbol, date, price')
        .in('symbol', symbols)
        .gte('date', cutoffDateStr) // Only fetch prices from last 400 days
        .order('symbol')
        .order('date', { ascending: false })
        .limit(symbols.length * 100) // Limit: ~100 rows per symbol (covers all historical needs)
      
      const queryTime = performance.now() - startTime
      console.log(`⏱️ Price query took ${queryTime.toFixed(2)}ms, fetched ${priceData?.length || 0} rows`)

      if (priceError) throw priceError

      // Step 3: Organize prices by symbol (sorted by date descending)
      const pricesBySymbol = new Map<string, Array<{ date: string; price: number }>>()
      
      priceData?.forEach(price => {
        if (!pricesBySymbol.has(price.symbol)) {
          pricesBySymbol.set(price.symbol, [])
        }
        pricesBySymbol.get(price.symbol)!.push({ date: price.date, price: price.price })
      })

      // Step 4: Combine company data with prices (get latest and historical)
      const today = new Date().toISOString().split('T')[0]
      const latestData: Record<string, StockData> = {}
      
      companyData?.forEach(company => {
        const symbol = company.symbol
        const symbolPrices = pricesBySymbol.get(symbol) || []
        
        if (symbolPrices.length === 0) {
          // No price data available
          latestData[symbol] = {
            symbol: symbol,
            date: today,
            current_price: 0,
            price_yesterday: 0,
            price_one_week_ago: 0,
            price_one_month_ago: 0,
            price_one_year_ago: 0,
            market_cap: company.market_cap || 0,
            pe_ratio: company.pe_ratio || 0,
            dividend_yield: company.dividend_yield || 0,
            fifty_two_week_high: company.fifty_two_week_high || 0,
            fifty_two_week_low: company.fifty_two_week_low || 0,
            ten_year_est_return: company.ten_year_est_return || 0,
            updated_at: company.updated_at || new Date().toISOString()
          }
          return
        }
        
        // Prices are already sorted by date descending
        // Get the most recent price (current)
        const currentPrice = symbolPrices[0]?.price || 0
        
        // Find historical prices by looking back in the sorted array
        // Find prices closest to 1, 5, 30, and 365 days ago
        const todayTimestamp = new Date(today).getTime()
        const oneDayAgo = todayTimestamp - (1 * 24 * 60 * 60 * 1000)
        const fiveDaysAgo = todayTimestamp - (5 * 24 * 60 * 60 * 1000)
        const thirtyDaysAgo = todayTimestamp - (30 * 24 * 60 * 60 * 1000)
        const oneYearAgo = todayTimestamp - (365 * 24 * 60 * 60 * 1000)
        
        // Find closest prices to target dates
        const findClosestPrice = (targetTimestamp: number): number | null => {
          let closest = symbolPrices[0]
          let minDiff = Math.abs(new Date(closest.date).getTime() - targetTimestamp)
          
          for (const price of symbolPrices) {
            const diff = Math.abs(new Date(price.date).getTime() - targetTimestamp)
            if (diff < minDiff) {
              minDiff = diff
              closest = price
            }
          }
          
          // Only return if within reasonable range (e.g., within 7 days for "yesterday")
          const maxAllowedDiff = targetTimestamp === oneDayAgo ? 7 * 24 * 60 * 60 * 1000 : 
                                 targetTimestamp === fiveDaysAgo ? 10 * 24 * 60 * 60 * 1000 :
                                 targetTimestamp === thirtyDaysAgo ? 45 * 24 * 60 * 60 * 1000 :
                                 400 * 24 * 60 * 60 * 1000 // 400 days for 1 year
          
          return minDiff <= maxAllowedDiff ? closest.price : null
        }
        
        const priceYesterday = findClosestPrice(oneDayAgo)
        const priceOneWeekAgo = findClosestPrice(fiveDaysAgo)
        const priceOneMonthAgo = findClosestPrice(thirtyDaysAgo)
        const priceOneYearAgo = findClosestPrice(oneYearAgo)

        latestData[symbol] = {
          symbol: symbol,
          date: today,
          current_price: currentPrice,
          price_yesterday: priceYesterday || 0,
          price_one_week_ago: priceOneWeekAgo || 0,
          price_one_month_ago: priceOneMonthAgo || 0,
          price_one_year_ago: priceOneYearAgo || 0,
          market_cap: company.market_cap || 0,
          pe_ratio: company.pe_ratio || 0,
          dividend_yield: company.dividend_yield || 0,
          fifty_two_week_high: company.fifty_two_week_high || 0,
          fifty_two_week_low: company.fifty_two_week_low || 0,
          ten_year_est_return: company.ten_year_est_return || 0,
          updated_at: company.updated_at || new Date().toISOString()
        }
      })

      setStockData(latestData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Database fetch error: ${errorMessage}`)
      console.error('Database fetch error:', {
        message: errorMessage,
        error: err,
        symbols: symbols
      })
    } finally {
      setLoading(false)
      fetchingRef.current = '' // Clear the fetching ref
    }
  }, [])

  const refreshData = useCallback(async (symbols: string[]) => {
    await fetchStockData(symbols)
  }, [fetchStockData])

  const updateStock = useCallback(async (symbol: string) => {
    await fetchStockData([symbol])
  }, [fetchStockData])

  return {
    stockData,
    loading,
    error,
    refreshData,
    updateStock
  }
} 