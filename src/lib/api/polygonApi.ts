const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'demo'
const BASE_URL = 'https://api.polygon.io'

export interface StockQuote {
  symbol: string
  open: number
  close: number
  timestamp: number
  change: number
  changePercent: number
  dataRange?: string
}

export interface CompanyOverview {
  symbol: string
  name: string
  description: string
  exchange: string
  currency: string
  country: string
  sector: string
  industry: string
  marketCap: number
  peRatio: number
  dividendYield: number
  eps: number
  beta: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
}

export interface FinancialData {
  symbol: string
  marketCap: number
  peRatio: number
  dividendYield: number
  beta: number
  volume: number
  price: number
}

export class PolygonApi {
  private static async makeRequest(endpoint: string): Promise<any> {
    const url = `${BASE_URL}${endpoint}`
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Polygon API request failed:', error)
      return null
    }
  }

  // Get current stock quote
  static async getQuote(symbol: string, dataRange: string = 'day'): Promise<StockQuote | null> {
    // Use snapshot endpoint for current day data
    const endpoint = `/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
    const data = await this.makeRequest(endpoint)
    
    if (!data || !data.ticker) {
      return null
    }

    const result = data.ticker

    console.log(`📊 Daily: Open ${result.day?.o}, Close ${result.min?.c}`)

    return {
      symbol: symbol.toUpperCase(),
      open: result.day?.o || 0,
      close: result.day?.c || 0,
      timestamp: result.updated || Date.now(),
      change: result.todaysChange,
      changePercent: result.todaysChangePerc,
      dataRange: dataRange
    }
  }

  // Get weekly stock quote
  static async getWeeklyQuote(symbol: string): Promise<StockQuote | null> {
    // Calculate date range for exactly 6 days ago
    const now = new Date()
    const from = new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000))
    
    const fromDate = from.toISOString().split('T')[0]
    const toDate = now.toISOString().split('T')[0]
    
    const endpoint = `/v2/aggs/ticker/${symbol}/range/5/day/${fromDate}/${toDate}?adjusted=true&apiKey=${POLYGON_API_KEY}`
    console.log(`📅 Weekly date range: ${fromDate} to ${toDate}`)
    const data = await this.makeRequest(endpoint)
    
    if (!data || !data.results || data.results.length === 0) {
      return null
    }

    const results = data.results
    const first = results[0]
    const last = results[results.length - 1]
    
    // Calculate change from first week to last week
    const change = last.c - first.o
    const changePercent = ((last.c - first.o) / first.o) * 100
    console.log(`📊 Weekly: Open ${first.o}, Close ${last.c}`)


    return {
      symbol: symbol.toUpperCase(),
      open: first.o || 0,
      close: last.c || 0,
      timestamp: last.t || Date.now(),
      change: change,
      changePercent: changePercent,
      dataRange: 'week'
    }
  }

  // Get company overview/fundamentals
  static async getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
    const endpoint = `/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
    const data = await this.makeRequest(endpoint)
    
    if (!data || !data.results) {
      return null
    }

    const result = data.results

    return {
      symbol: result.ticker,
      name: result.name,
      description: result.description || '',
      exchange: result.primary_exchange,
      currency: result.currency_name,
      country: result.locale,
      sector: result.sic_description || '',
      industry: result.sic_description || '',
      marketCap: result.market_cap || 0,
      peRatio: 0, // Would need separate API call for P/E ratio
      dividendYield: 0, // Would need separate API call
      eps: 0, // Would need separate API call
      beta: 0, // Would need separate API call
      fiftyTwoWeekHigh: 0, // Would need separate API call
      fiftyTwoWeekLow: 0 // Would need separate API call
    }
  }

  // Get multiple quotes at once (parallel processing)
  static async getMultipleQuotes(symbols: string[], dataRange: string = 'day'): Promise<StockQuote[]> {
    const quotePromises = symbols.map(async (symbol) => {
      try {
        const quote = await this.getQuote(symbol, dataRange)
        return quote
      } catch (error) {
        console.error(`Failed to get quote for ${symbol}:`, error)
        return null
      }
    })
    
    const results = await Promise.all(quotePromises)
    return results.filter(quote => quote !== null) as StockQuote[]
  }

  // Get multiple weekly quotes at once (parallel processing)
  static async getMultipleWeeklyQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotePromises = symbols.map(async (symbol) => {
      try {
        const quote = await this.getWeeklyQuote(symbol)
        return quote
      } catch (error) {
        console.error(`Failed to get weekly quote for ${symbol}:`, error)
        return null
      }
    })
    
    const results = await Promise.all(quotePromises)
    return results.filter(quote => quote !== null) as StockQuote[]
  }

  // Get monthly stock quote
  static async getMonthlyQuote(symbol: string): Promise<StockQuote | null> {
    // Calculate date range for exactly 30 days ago
    const now = new Date()
    const from = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    
    const fromDate = from.toISOString().split('T')[0]
    const toDate = now.toISOString().split('T')[0]
    
    const endpoint = `/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=120&apiKey=${POLYGON_API_KEY}`
    console.log(`📅 Monthly date range: ${fromDate} to ${toDate}`)
    const data = await this.makeRequest(endpoint)
    
    if (!data || !data.results || data.results.length === 0) {
      return null
    }

    const results = data.results
    const first = results[0]
    const last = results[results.length - 1]
    
    // Calculate change from 30 days ago to today
    const change = last.c - first.o
    const changePercent = ((last.c - first.o) / first.o) * 100
    
    console.log(`📊 Monthly: Open ${first.c}, Close ${last.c}`)

    return {
      symbol: symbol.toUpperCase(),
      open: first.o || 0,
      close: last.c || 0,
      timestamp: last.t || Date.now(),
      change: change,
      changePercent: changePercent,
      dataRange: 'month'
    }
  }

  // Get multiple monthly quotes at once (parallel processing)
  static async getMultipleMonthlyQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotePromises = symbols.map(async (symbol) => {
      try {
        const quote = await this.getMonthlyQuote(symbol)
        return quote
      } catch (error) {
        console.error(`Failed to get monthly quote for ${symbol}:`, error)
        return null
      }
    })
    
    const results = await Promise.all(quotePromises)
    return results.filter(quote => quote !== null) as StockQuote[]
  }

  // Get financial data (market cap, P/E, etc.)
  static async getFinancialData(symbol: string): Promise<FinancialData | null> {
    const endpoint = `/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
    const data = await this.makeRequest(endpoint)
    
    if (!data || !data.results) {
      return null
    }

    const result = data.results

    return {
      symbol: result.ticker,
      marketCap: result.market_cap || 0,
      peRatio: result.market_cap && result.weighted_shares_outstanding ? 
        (result.market_cap / (result.weighted_shares_outstanding * (result.last_updated_utc ? 1 : 0))) : 0,
      dividendYield: 0,
      beta: 0,
      volume: 0,
      price: 0
    }
  }

  // Get historical data for calculating returns
  static async getHistoricalData(symbol: string, days: number = 365): Promise<any> {
    const endpoint = `/v2/aggs/ticker/${symbol}/range/1/day/${new Date().toISOString().split('T')[0]}/${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}?adjusted=true&apiKey=${POLYGON_API_KEY}`
    return await this.makeRequest(endpoint)
  }
} 