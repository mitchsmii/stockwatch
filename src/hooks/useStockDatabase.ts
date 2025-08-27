import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

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

  const fetchStockData = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) return

    setLoading(true)
    setError(null)

    try {
      // Get the most recent data for each symbol
      const { data, error: dbError } = await supabase
        .from('stocks_complete_data')
        .select('*')
        .in('symbol', symbols)
        .order('date', { ascending: false })

      if (dbError) throw dbError

      // Group by symbol and take the most recent entry
      const latestData: Record<string, StockData> = {}
      data?.forEach(row => {
        if (!latestData[row.symbol] || new Date(row.date) > new Date(latestData[row.symbol].date)) {
          latestData[row.symbol] = row
        }
      })

      setStockData(latestData)
    } catch (err) {
      setError(`Failed to fetch data: ${err}`)
      console.error('Database fetch error:', err)
    } finally {
      setLoading(false)
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