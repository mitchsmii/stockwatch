const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'demo'
const BASE_URL = 'https://api.polygon.io'

export interface StockQuote {
  symbol: string
  open: number
  close: number
  high?: number
  low?: number
  timestamp: number
  change: number
  changePercent: number
  dataRange?: string
}

export interface DailyBar {
  date: string
  open: number
  high?: number
  low: number
  close: number
  volume: number
  vwap?: number
  timestamp: number
}

export interface WeeklyBar {
  symbol: string
  open: number
  high?: number
  low: number
  close: number
  volume: number
  vwap?: number
  startDate: string
  endDate: string
  timestamp: number
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Get monthly stock quote with exact 1-month calculation
  static async getMonthlyQuoteExact(symbol: string): Promise<StockQuote | null> {
    const now = new Date()
    
    // Calculate exactly 1 month ago from today (by calendar date, not by 30 days)
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    
    // Calculate the exact number of days between the two dates
    const timeDiff = now.getTime() - oneMonthAgo.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    const fromDate = oneMonthAgo.toISOString().split('T')[0]
    const toDate = now.toISOString().split('T')[0]
    
    console.log(`📅 Monthly exact calculation: ${fromDate} to ${toDate} (${daysDiff} days)`)
    console.log(`📊 Today: ${now.toDateString()}, One month ago: ${oneMonthAgo.toDateString()}`)
    
    // Use the exact day span for the API request
    const endpoint = `/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=120&apiKey=${POLYGON_API_KEY}`
    const data = await this.makeRequest(endpoint)
    
    if (!data || !data.results || data.results.length === 0) {
      console.log(`❌ No monthly data returned for ${symbol}`)
      return null
    }

    const results = data.results
    const first = results[0]
    const last = results[results.length - 1]
    
    // Calculate change from exactly 1 month ago to today
    const change = last.c - first.c
    const changePercent = ((last.c - first.c) / first.c) * 100
    
    console.log(`${symbol} : 📊 Monthly exact: Close ${first.c} (${fromDate}), Close ${last.c} (${toDate})`)

    return {
      symbol: symbol.toUpperCase(),
      open: first.c || 0, // Using close price for "from" date
      close: last.c || 0,
      timestamp: last.t || Date.now(),
      change: change,
      changePercent: changePercent,
      dataRange: 'month'
    }
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
    const change = last.c - first.c
    const changePercent = ((last.c - first.c) / first.c) * 100
    
    console.log(`📊 Monthly: Close ${first.c}, Close ${last.c}`)

    return {
      symbol: symbol.toUpperCase(),
      open: first.c || 0, // Using close price for "from" date
      close: last.c || 0,
      timestamp: last.t || Date.now(),
      change: change,
      changePercent: changePercent,
      dataRange: 'month'
    }
  }

  // Get multiple monthly quotes
  static async getMultipleMonthlyQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotes: StockQuote[] = []
    
    try {
      const promises = symbols.map(async (symbol) => {
        const quote = await this.getMonthlyQuote(symbol)
        return quote
      })
      
      const results = await Promise.all(promises)
      quotes.push(...results.filter(Boolean) as StockQuote[])
    } catch (error) {
      console.error('Error fetching multiple monthly quotes:', error)
    }
    
    return quotes
  }

  // Get multiple monthly quotes with exact 1-month calculation
  static async getMultipleMonthlyQuotesExact(symbols: string[]): Promise<StockQuote[]> {
    const quotes: StockQuote[] = []
    
    try {
      const promises = symbols.map(async (symbol) => {
        const quote = await this.getMonthlyQuoteExact(symbol)
        return quote
      })
      
      const results = await Promise.all(promises)
      quotes.push(...results.filter(Boolean) as StockQuote[])
    } catch (error) {
      console.error('Error fetching multiple monthly quotes with exact calculation:', error)
    }
    
    return quotes
  }

  // Get the most recent 5 consecutive U.S. market trading days
  static async getLastFiveTradingDays(symbol: string): Promise<DailyBar[]> {
    const now = new Date()
    // Request a broad date window (last 30 calendar days) to ensure we get 5 trading days
    const from = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    
    const fromDate = from.toISOString().split('T')[0]
    const toDate = now.toISOString().split('T')[0]
    
    // First, let's get more data to ensure we have enough trading days
    const endpoint = `/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=desc&limit=10&apiKey=${POLYGON_API_KEY}`
    
    console.log(`📅 Fetching trading days for ${symbol}: ${fromDate} to ${toDate}`)
    
    const data = await this.makeRequest(endpoint)
    
    if (!data || !data.results || data.results.length === 0) {
      console.log(`❌ No data returned for ${symbol}`)
      return []
    }

    // The results are already sorted by desc (newest first), so we take the first 5
    // This ensures we get the most recent 5 trading days including today if it's a trading day
    const mostRecentFive = data.results.slice(0, 5)
    
    // Sort them in ascending order (oldest to newest) for chronological order
    const sortedResults = mostRecentFive.sort((a: { t: number }, b: { t: number }) => a.t - b.t)
    
    console.log(`✅ Found ${sortedResults.length} trading days for ${symbol}`)
    console.log(`📅 Date range: ${new Date(sortedResults[0].t).toISOString().split('T')[0]} to ${new Date(sortedResults[sortedResults.length-1].t).toISOString().split('T')[0]}`)
    
    return sortedResults.map((bar: { t: number; o: number; h: number; l: number; c: number; v: number; vw?: number }) => ({
      date: new Date(bar.t).toISOString().split('T')[0],
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
      vwap: bar.vw,
      timestamp: bar.t
    }))
  }

  // Compute a weekly bar from 5 consecutive trading days
  static computeWeeklyBar(symbol: string, dailyBars: DailyBar[]): WeeklyBar | null {
    if (dailyBars.length !== 5) {
      console.log(`❌ Expected 5 daily bars, got ${dailyBars.length}`)
      return null
    }

    // Sort by date to ensure chronological order
    const sortedBars = dailyBars.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    const firstDay = sortedBars[0]
    const lastDay = sortedBars[4]
    
    // Calculate weekly bar
    const weeklyBar: WeeklyBar = {
      symbol: symbol.toUpperCase(),
      open: firstDay.open,
      close: lastDay.close,
      high: Math.max(...sortedBars.map(bar => bar.high || 0)),
      low: Math.min(...sortedBars.map(bar => bar.low || 0)),
      volume: sortedBars.reduce((sum, bar) => sum + bar.volume, 0),
      startDate: firstDay.date,
      endDate: lastDay.date,
      timestamp: lastDay.timestamp
    }

    // Calculate VWAP if all days have it
    const allHaveVwap = sortedBars.every(bar => bar.vwap !== undefined)
    if (allHaveVwap) {
      const volumeWeightedSum = sortedBars.reduce((sum, bar) => sum + (bar.vwap! * bar.volume), 0)
      const totalVolume = weeklyBar.volume
      weeklyBar.vwap = volumeWeightedSum / totalVolume
    }

    console.log(`📊 Weekly bar for ${symbol}: Open ${weeklyBar.open}, Close ${weeklyBar.close}, High ${weeklyBar.high}, Low ${weeklyBar.low}, Volume ${weeklyBar.volume}`)
    
    return weeklyBar
  }

  // Get weekly bar directly (combines fetching and computing)
  static async getWeeklyBar(symbol: string): Promise<WeeklyBar | null> {
    const dailyBars = await this.getLastFiveTradingDays(symbol)
    if (dailyBars.length === 0) {
      return null
    }
    
    return this.computeWeeklyBar(symbol, dailyBars)
  }

  // Get multiple weekly bars
  static async getMultipleWeeklyBars(symbols: string[]): Promise<WeeklyBar[]> {
    const weeklyBars: WeeklyBar[] = []
    
    try {
      const promises = symbols.map(async (symbol) => {
        const weeklyBar = await this.getWeeklyBar(symbol)
        return weeklyBar
      })
      
      const results = await Promise.all(promises)
      weeklyBars.push(...results.filter(Boolean) as WeeklyBar[])
    } catch (error) {
      console.error('Error fetching multiple weekly bars:', error)
    }
    
    return weeklyBars
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

  // Get yearly stock quote with exact 1-year calculation
  static async getYearlyQuote(symbol: string): Promise<StockQuote | null> {
    const now = new Date()
    
    // Calculate exactly 1 year ago from today (by calendar date, not by 365 days)
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    
    // Calculate the exact number of days between the two dates
    const timeDiff = now.getTime() - oneYearAgo.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    const fromDate = oneYearAgo.toISOString().split('T')[0]
    const toDate = now.toISOString().split('T')[0]
    
    console.log(`📅 Yearly exact calculation: ${fromDate} to ${toDate} (${daysDiff} days)`)
    console.log(`📊 Today: ${now.toDateString()}, One year ago: ${oneYearAgo.toDateString()}`)
    
    // Use the exact day span for the API request
    const endpoint = `/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=500&apiKey=${POLYGON_API_KEY}`
    const data = await this.makeRequest(endpoint)
    
    if (!data || !data.results || data.results.length === 0) {
      console.log(`❌ No yearly data returned for ${symbol}`)
      return null
    }

    const results = data.results
    const first = results[0]
    const last = results[results.length - 1]
    
    // Calculate change from exactly 1 year ago to today
    const change = last.c - first.c
    const changePercent = ((last.c - first.c) / first.c) * 100
    
    // Find the highest high value from all daily bars in the year
    const yearlyHigh = Math.max(...results.map((bar: {h?: number}) => bar.h || 0))
    const yearlyLow = Math.min(...results.map((bar: {l?: number}) => bar.l || 0))
    
    console.log(`${symbol} : 📊 Yearly exact: Close ${first.c} (${fromDate}), Close ${last.c} (${toDate}), Yearly High: ${yearlyHigh}, Yearly Low: ${yearlyLow}`)

    return {
      symbol: symbol.toUpperCase(),
      open: first.c || 0, // Using close price for "from" date
      close: last.c || 0,
      high: yearlyHigh,
      low: yearlyLow,
      timestamp: last.t || Date.now(),
      change: change,
      changePercent: changePercent,
      dataRange: 'year'
    }
  }

  // Get multiple yearly quotes
  static async getMultipleYearlyQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotes: StockQuote[] = []
    
    try {
      const promises = symbols.map(async (symbol) => {
        const quote = await this.getYearlyQuote(symbol)
        return quote
      })
      
      const results = await Promise.all(promises)
      quotes.push(...results.filter(Boolean) as StockQuote[])
    } catch (error) {
      console.error('Error fetching multiple yearly quotes:', error)
    }
    
    return quotes
  }

  // Get dividend yield
  static async getDividendYield(symbol: string): Promise<{ frequency: string, cashAmount: number } | null> {
    const endpoint = `/v3/reference/dividends?ticker=${symbol}&order=desc&limit=1&sort=ex_dividend_date&apiKey=${POLYGON_API_KEY}`
    const data = await this.makeRequest(endpoint)
    
    // Check if we have data and results
    if (!data || !data.results || data.results.length === 0) {
      return null
    }
    
    // Check if the first result has the required properties
    const firstResult = data.results[0]
    if (!firstResult || !firstResult.frequency || !firstResult.cash_amount) {
      return null
    }
    
    return {
      frequency: firstResult.frequency,
      cashAmount: firstResult.cash_amount,
    }
  }

  // Get historical data for calculating returns
  static async getHistoricalData(symbol: string, days: number = 365): Promise<{
    results?: Array<{
      t: number
      o: number
      h: number
      l: number
      c: number
      v: number
    }>
  } | null> {
    const endpoint = `/v2/aggs/ticker/${symbol}/range/1/day/${new Date().toISOString().split('T')[0]}/${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}?adjusted=true&apiKey=${POLYGON_API_KEY}`
    return await this.makeRequest(endpoint)
  }
} 