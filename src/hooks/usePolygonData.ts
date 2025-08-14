import { useState, useEffect, useCallback } from 'react'
import { PolygonApi, StockQuote, CompanyOverview, FinancialData } from '@/lib/api/polygonApi'

interface UsePolygonDataReturn {
  quotes: StockQuote[]
  companyOverviews: Record<string, CompanyOverview>
  financialData: Record<string, FinancialData>
  loading: boolean
  error: string | null
  refreshData: (symbols: string[], dataRange?: string) => Promise<StockQuote[]>
  updateStock: (symbol: string, dataRange?: string) => Promise<void>
}

export function usePolygonData(): UsePolygonDataReturn {
  const [quotes, setQuotes] = useState<StockQuote[]>([])
  const [companyOverviews, setCompanyOverviews] = useState<Record<string, CompanyOverview>>({})
  const [financialData, setFinancialData] = useState<Record<string, FinancialData>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStock = useCallback(async (symbol: string, dataRange: string = 'day') => {
    try {
      setError(null)
      const quote = await PolygonApi.getQuote(symbol, dataRange)
      const overview = await PolygonApi.getCompanyOverview(symbol)
      const financial = await PolygonApi.getFinancialData(symbol)

      if (quote) {
        setQuotes(prev => {
          const existing = prev.find(q => q.symbol === symbol)
          if (existing) {
            return prev.map(q => q.symbol === symbol ? quote : q)
          }
          return [...prev, quote]
        })
      }

      if (overview) {
        setCompanyOverviews(prev => ({
          ...prev,
          [symbol]: overview
        }))
      }

      if (financial) {
        setFinancialData(prev => ({
          ...prev,
          [symbol]: financial
        }))
      }
    } catch (err) {
      setError(`Failed to update ${symbol}: ${err}`)
    }
  }, [])

  const refreshData = useCallback(async (symbols: string[], dataRange: string = 'day'): Promise<StockQuote[]> => {
    if (symbols.length === 0) return []

    setLoading(true)
    setError(null)

    try {
      // Get quotes for all symbols
      let newQuotes: StockQuote[]
      if (dataRange === 'week') {
        newQuotes = await PolygonApi.getMultipleWeeklyQuotes(symbols)
      } else if (dataRange === 'month') {
        newQuotes = await PolygonApi.getMultipleMonthlyQuotes(symbols)
      } else {
        newQuotes = await PolygonApi.getMultipleQuotes(symbols, dataRange)
      }
      setQuotes(newQuotes)

      // Get company overviews and financial data
      const newOverviews: Record<string, CompanyOverview> = {}
      const newFinancialData: Record<string, FinancialData> = {}

      for (const symbol of symbols) {
        try {
          const overview = await PolygonApi.getCompanyOverview(symbol)
          const financial = await PolygonApi.getFinancialData(symbol)

          if (overview) {
            newOverviews[symbol] = overview
          }
          if (financial) {
            newFinancialData[symbol] = financial
          }

          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (err) {
          console.error(`Failed to get data for ${symbol}:`, err)
        }
      }

      setCompanyOverviews(newOverviews)
      setFinancialData(newFinancialData)
      
      return newQuotes
    } catch (err) {
      setError(`Failed to refresh data: ${err}`)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    quotes, 
    companyOverviews, 
    financialData,
    loading, 
    error, 
    refreshData, 
    updateStock 
  }
} 