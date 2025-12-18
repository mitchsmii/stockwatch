"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, X, Check, Wifi, WifiOff, TrendingUp, Activity, BarChart3 } from "lucide-react"
import { getColorForCustomRange, getColorForCustomRangeInverted } from "@/lib/utils/getColorForChange"
import stocksData from "@/data/stocks.json"
import { StockDetailDrawer } from "@/components/ui/stock-detail-drawer"
import { useStockDatabase } from "@/hooks/useStockDatabase"
import { usePolygonWebSocket } from "@/hooks/usePolygonWebSocket"


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("pricing")
  const [newTicker, setNewTicker] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Table-specific sorting states
  const [pricingTableSort, setPricingTableSort] = useState({ column: "", direction: "asc" as "asc" | "desc" })
  const [valuationTableSort, setValuationTableSort] = useState({ column: "", direction: "asc" as "asc" | "desc" })
  const [analysisTableSort, setAnalysisTableSort] = useState({ column: "", direction: "asc" as "asc" | "desc" })
  
  const [selectedStock, setSelectedStock] = useState<typeof stocksData[0] | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(new Set())

  // Use imported stock data
  const [stocks, setStocks] = useState(stocksData)

  // Fetch stock data from Supabase database
  const { stockData, error, refreshData } = useStockDatabase()
  
  // Real-time WebSocket price updates
  const { prices: livePrices, connected: wsConnected, error: wsError, subscribe, unsubscribe } = usePolygonWebSocket()
  
  // Load initial data from database when component mounts or stocks change
  useEffect(() => {
    if (stocks.length > 0) {
      const symbols = stocks.map(stock => stock.ticker)
      refreshData(symbols)
    }
    // Only depend on the stock tickers (as a string key), not the refreshData function
    // This prevents infinite loops when refreshData changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks.map(s => s.ticker).sort().join(',')])
  
  // Subscribe to WebSocket updates for all stocks
  useEffect(() => {
    if (stocks.length > 0) {
      const symbols = stocks.map(stock => stock.ticker)
      console.log('📡 Subscribing to real-time updates for:', symbols)
      subscribe(symbols)
      
      // Cleanup: unsubscribe when component unmounts or stocks change
      return () => {
        console.log('📡 Unsubscribing from:', symbols)
        unsubscribe(symbols)
      }
    }
  }, [stocks, subscribe, unsubscribe])
  
  // Store quotes by time period
  const [quotesByPeriod] = useState<Record<string, Array<{
    symbol: string
    open?: number
    close?: number
    timestamp: number
    change?: number
    changePercent?: number
    dataRange?: string
    frequency?: string
    cashAmount?: number
    high?: number
    low?: number
    highDate?: string
  } | null>>>({
    day: [],
    week: [],
    month: [],
    year: [],
    dividend: []
  })



  const addStock = () => {
    if (newTicker.trim()) {
      const newStock = {
        "ticker": newTicker.toUpperCase(),
        "held": Math.random() > 0.5,
        "marketCap": Math.random() * 3000 + 500,
        "price": Math.random() * 200 + 100,
        "oneDayChange": (Math.random() - 0.5) * 10,
        "oneWeekChange": (Math.random() - 0.5) * 15,
        "oneMonthChange": (Math.random() - 0.5) * 25,
        "oneYearChange": (Math.random() - 0.5) * 40,
        "intrinsicValue": Math.random() * 250 + 150,
        "upsidePercent": (Math.random() - 0.5) * 20,
        "tenYearEstReturn": Math.random() * 30 + 10,
        "buyPrice": Math.random() * 200 + 50,
        "buyUpsidePercent": (Math.random() - 0.5) * 20,
        "peRatio": Math.random() * 50 + 20,
        "fiftyTwoWeekHigh": Math.random() * 200 + 150,
        "fiftyTwoWeekLow": Math.random() * 100 + 50,
        "dividendYield": Math.random() * 3,
        "beta": Math.random() * 2 + 0.5,
        "volume": Math.random() * 1000000 + 100000,
        "overallRating": Math.random() * 10 + 5,
        "qualityRating": Math.random() * 10 + 5,
        "valueRating": Math.random() * 10 + 5,
        "tenYearPriceSameShares": Math.random() * 200 + 100,
        "busModel": Math.random() * 10 + 5,
        "profit": Math.random() * 10 + 5,
        "balSheet": Math.random() * 10 + 5,
        "moat": Math.random() * 10 + 5,
        "growth": Math.random() * 10 + 5,
        "management": Math.random() * 10 + 5,
        "histReturn": Math.random() * 10 + 5,
        "isGreenOver10Under6": Math.random() > 0.5 ? "Yes" : ""
      }
      setStocks([...stocks, newStock])
      setNewTicker("")
      setShowAddForm(false)
    }
  }



  const toggleEditMode = () => {
    setEditMode(!editMode)
    if (editMode) {
      setSelectedStocks(new Set())
    } else {
      setDrawerOpen(false)
      setSelectedStock(null)
    }
  }

  const toggleStockSelection = (ticker: string) => {
    const newSelected = new Set(selectedStocks)
    if (newSelected.has(ticker)) {
      newSelected.delete(ticker)
    } else {
      newSelected.add(ticker)
    }
    setSelectedStocks(newSelected)
  }

  const removeSelectedStocks = () => {
    setStocks(stocks.filter(stock => !selectedStocks.has(stock.ticker)))
    setSelectedStocks(new Set())
    setEditMode(false)
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addStock()
  }

  const handleSort = (column: string, tableType: 'pricing' | 'universe' | 'alerts') => {
    if (tableType === 'pricing') {
      if (pricingTableSort.column === column) {
        setPricingTableSort(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }))
      } else {
        setPricingTableSort({ column, direction: "asc" })
      }
    } else if (tableType === 'universe') {
      if (valuationTableSort.column === column) {
        setValuationTableSort(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }))
      } else {
        setValuationTableSort({ column, direction: "asc" })
      }
    } else if (tableType === 'alerts') {
      if (analysisTableSort.column === column) {
        setAnalysisTableSort(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }))
      } else {
        setAnalysisTableSort({ column, direction: "asc" })
      }
    }
  }

  const getSortedStocks = (tableType: 'pricing' | 'universe' | 'alerts') => {
    let sortState
    if (tableType === 'pricing') {
      sortState = pricingTableSort
    } else if (tableType === 'universe') {
      sortState = valuationTableSort
    } else {
      sortState = analysisTableSort
    }

    if (!sortState.column) return stocks

    return [...stocks].sort((a, b) => {
      const aVal = a[sortState.column as keyof typeof a]
      const bVal = b[sortState.column as keyof typeof b]

      // Handle numeric values
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortState.direction === "asc" ? aVal - bVal : bVal - aVal
      }

      // Handle string values
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortState.direction === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal)
      }

      // Handle boolean values
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortState.direction === "asc" 
          ? (aVal === bVal ? 0 : aVal ? 1 : -1)
          : (aVal === bVal ? 0 : aVal ? -1 : 1)
      }

      return 0
    })
  }

  // Helper function to get sort state for a specific table and column
  const getSortState = (tableType: 'pricing' | 'universe' | 'alerts', column: string) => {
    let sortState
    if (tableType === 'pricing') {
      sortState = pricingTableSort
    } else if (tableType === 'universe') {
      sortState = valuationTableSort
    } else {
      sortState = analysisTableSort
    }
    
    return {
      isSorted: sortState.column === column,
      direction: sortState.direction
    }
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toFixed(0)}`
  }



  const sortedStocks = getSortedStocks(activeTab as 'pricing' | 'universe' | 'alerts')

  // Calculate range statistics for the entire column
  const getRangeStatistics = () => {
    const rangeValues = stocks
      .map(stock => {
        if (stock.fiftyTwoWeekLow && stock.fiftyTwoWeekHigh) {
          return ((stock.fiftyTwoWeekHigh / stock.fiftyTwoWeekLow) - 1) * 100
        }
        return null
      })
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b)

    if (rangeValues.length === 0) return { min: 0, max: 0, median: 0 }

    const min = rangeValues[0]
    const max = rangeValues[rangeValues.length - 1]
    const median = rangeValues[Math.floor(rangeValues.length * 0.5)]

    return { min, max, median }
  }

  // Helper function to get real data from database + live WebSocket updates
  const getRealStockData = (stock: typeof stocksData[0]) => {
    // Try to get data from the database first
    const dbData = stockData[stock.ticker]
    
    // Check if we have live WebSocket price for this stock
    const livePrice = livePrices[stock.ticker]
    
    // If we have database data, use it immediately (don't wait for WebSocket)
    if (dbData) {
      // Use WebSocket price if available, otherwise use database price
      // This ensures we show data immediately from database, then update with live WebSocket price
      const currentPrice = livePrice?.price ?? dbData.current_price ?? 0
      const currentPriceNum = typeof currentPrice === 'number' ? currentPrice : 0
      
      // Calculate percentage changes from stored historical prices
      const oneDayChange = dbData.price_yesterday && currentPriceNum > 0 ? 
        ((currentPriceNum - dbData.price_yesterday) / dbData.price_yesterday) * 100 : 0
      
      const oneWeekChange = dbData.price_one_week_ago && currentPriceNum > 0 ? 
        ((currentPriceNum - dbData.price_one_week_ago) / dbData.price_one_week_ago) * 100 : 0
      
      const oneMonthChange = dbData.price_one_month_ago && currentPriceNum > 0 ? 
        ((currentPriceNum - dbData.price_one_month_ago) / dbData.price_one_month_ago) * 100 : 0
      
      const oneYearChange = dbData.price_one_year_ago && currentPriceNum > 0 ? 
        ((currentPriceNum - dbData.price_one_year_ago) / dbData.price_one_year_ago) * 100 : 0
      
      return {
        ...stock,
        price: currentPriceNum > 0 ? currentPriceNum : (wsConnected && !livePrice ? "Loading..." : dbData.current_price || 0),
        oneDayChange: oneDayChange,
        oneWeekChange: oneWeekChange,
        oneMonthChange: oneMonthChange,
        oneYearChange: oneYearChange,
        marketCap: dbData.market_cap || stock.marketCap,
        peRatio: dbData.pe_ratio || stock.peRatio,
        dividendYield: dbData.dividend_yield || stock.dividendYield,
        fiftyTwoWeekHigh: dbData.fifty_two_week_high || stock.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: dbData.fifty_two_week_low || stock.fiftyTwoWeekLow,
        tenYearEstReturn: dbData.ten_year_est_return || stock.tenYearEstReturn,
        // Keep other fields from original stock data
        volume: stock.volume,
        beta: stock.beta,
        intrinsicValue: stock.intrinsicValue,
        upsidePercent: stock.upsidePercent,
        buyPrice: stock.buyPrice,
        buyUpsidePercent: stock.buyUpsidePercent,
        overallRating: stock.overallRating,
        qualityRating: stock.qualityRating,
        valueRating: stock.valueRating,
      }
    }
    
    // If no database data but WebSocket has price, use it
    if (livePrice) {
      return {
        ...stock,
        price: livePrice.price
      }
    }
    
    // Fallback: no data available
    return {
      ...stock,
      price: wsConnected ? "Loading..." : "No Data"
    }
  }

  // Calculate summary stats
  const totalStocks = stocks.length
  const heldStocks = stocks.filter(s => s.held).length
  const avgOneDayChange = stocks.reduce((sum, stock) => {
    const data = getRealStockData(stock)
    return sum + (data.oneDayChange || 0)
  }, 0) / totalStocks || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time stock tracking and analysis</p>
            </div>
            <div className="flex items-center gap-3">
              {/* WebSocket Connection Status */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                wsConnected ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}>
                {wsConnected ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span>Live (15-min delayed)</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
              
              <Button variant="outline" onClick={toggleEditMode} className="gap-2">
                {editMode ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Manage
                  </>
                )}
              </Button>
              
              {!editMode && (
                <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  Add Stock
                </Button>
              )}
              
              {editMode && selectedStocks.size > 0 && (
                <Button variant="destructive" onClick={removeSelectedStocks} className="gap-2">
                  <X className="w-4 h-4" />
                  Remove ({selectedStocks.size})
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Stocks</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{totalStocks}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Held Positions</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{heldStocks}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-600/10 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Avg 1D Change</p>
                    <p className={`text-2xl font-bold mt-1 ${avgOneDayChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {avgOneDayChange >= 0 ? '+' : ''}{avgOneDayChange.toFixed(2)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-amber-600/10 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 max-w-[1920px] mx-auto">
        {/* Error Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg shadow-sm">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {wsError && (
          <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg shadow-sm">
            <p className="text-orange-800 text-sm font-medium">WebSocket: {wsError}</p>
          </div>
        )}

        {/* Add Stock Form */}
        {showAddForm && (
          <Card className="mb-6 border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add New Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="ticker" className="text-sm font-medium">Ticker Symbol</Label>
                  <Input
                    id="ticker"
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value)}
                    placeholder="e.g., AAPL, MSFT, GOOGL"
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Add Stock
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-gray-100 p-1.5 w-full">
              <TabsTrigger 
                value="pricing" 
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">Performance & Intrinsic Value</span>
              </TabsTrigger>
              <TabsTrigger 
                value="universe" 
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="font-medium">Market Valuation</span>
              </TabsTrigger>
              <TabsTrigger 
                value="alerts" 
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                <span className="font-medium">Research & Analysis</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pricing" className="w-full mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-transparent pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Performance & Intrinsic Value</CardTitle>
                      <p className="text-sm text-gray-500 mt-0.5">Live updates (15-min delayed)</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200">
                    <TableHead className="text-center w-14 sticky left-0 bg-white z-10">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                          onClick={() => handleSort("ticker", "pricing")}
                        >
                          Ticker
                          {getSortState("pricing", "ticker").isSorted && (
                            <span className="text-blue-600">
                              {getSortState("pricing", "ticker").direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("held", "pricing")}
                        >
                          Held
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("marketCap", "pricing")}
                        >
                          Mkt Cap
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("price", "pricing")}
                        >
                          Price
                          {getSortState("pricing", "price").isSorted && (
                            <span className="text-blue-600">
                              {getSortState("pricing", "price").direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("oneDayChange", "pricing")}
                        >
                          1D
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("oneWeekChange", "pricing")}
                        >
                          1WK
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("oneMonthChange", "pricing")}
                        >
                          1M
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("oneYearChange", "pricing")}
                        >
                          1Y
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("intrinsicValue", "pricing")}
                      >
                        Intrinsic Value
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-6">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("upsidePercent", "pricing")}
                        >
                          +/- %
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("tenYearEstReturn", "pricing")}
                      >
                        10Y Est. Ret %
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("buyPrice", "pricing")}
                      >
                        Buy Price
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("buyUpsidePercent", "pricing")}
                        >
                          +/- %
                        </button>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStocks.map((stock) => (
                    <TableRow 
                      key={stock.ticker} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        if (!editMode) {
                          setSelectedStock(stock)
                          setDrawerOpen(true)
                        }
                      }}
                    >
                      <TableCell className="font-medium py-3 sticky left-0 bg-white z-10">
                        {editMode ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedStocks.has(stock.ticker)}
                              onChange={() => toggleStockSelection(stock.ticker)}
                              className="w-4 h-4"
                            />
                            {stock.ticker}
                          </div>
                        ) : (
                          stock.ticker
                        )}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {stock.held ? (
                          <Check className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {formatMarketCap(getRealStockData(stock).marketCap)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {(() => {
                          const stockData = getRealStockData(stock)
                          return typeof stockData.price === 'string' 
                            ? stockData.price 
                            : `$${stockData.price.toFixed(2)}`
                        })()}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(getRealStockData(stock).oneDayChange, -2, 0, 2) }}
                      >
                        {getRealStockData(stock).oneDayChange >= 0 ? '+' : ''}{getRealStockData(stock).oneDayChange.toFixed(2)}%
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(getRealStockData(stock).oneWeekChange, -5, 0, 5) }}
                      >
                        {getRealStockData(stock).oneWeekChange >= 0 ? '+' : ''}{getRealStockData(stock).oneWeekChange.toFixed(2)}%
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(getRealStockData(stock).oneMonthChange, -5, 0, 5) }}
                      >
                        {getRealStockData(stock).oneMonthChange >= 0 ? '+' : ''}{getRealStockData(stock).oneMonthChange.toFixed(2)}%
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(getRealStockData(stock).oneYearChange, -15, 0, 15) }}
                      >
                        {getRealStockData(stock).oneYearChange >= 0 ? '+' : ''}{getRealStockData(stock).oneYearChange.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-center py-1">
                        ${stock.intrinsicValue.toFixed(2)}
                      </TableCell>
                      
                      {/* Intrinsic Value Percentage (+/- %) */}
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: (() => {
                          const stockData = getRealStockData(stock)
                          const currentPrice = typeof stockData.price === 'number' ? stockData.price : 0
                          return getColorForCustomRange(((stock.intrinsicValue / currentPrice) - 1) * 100, -10, -5, 15)
                        })() }}
                      >
                        {(() => {
                          const stockData = getRealStockData(stock)
                          const currentPrice = typeof stockData.price === 'number' ? stockData.price : 0
                          return currentPrice > 0 ? (((stock.intrinsicValue - currentPrice) / currentPrice) * 100).toFixed(2) : '0.00'
                        })()}%
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.tenYearEstReturn, 0, 10, 20) }}
                      >
                        {stock.tenYearEstReturn.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center py-1">
                        ${stock.buyPrice.toFixed(2)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: (() => {
                          const stockData = getRealStockData(stock)
                          const currentPrice = typeof stockData.price === 'number' ? stockData.price : 0
                          return currentPrice > 0 ? getColorForCustomRange(((currentPrice - stock.buyPrice) / stock.buyPrice) * 100, -10, 5, 15) : '#f3f4f6'
                        })() }}
                      >
                        {(() => {
                          const stockData = getRealStockData(stock)
                          const currentPrice = typeof stockData.price === 'number' ? stockData.price : 0
                          if (currentPrice <= 0) return '0.00'
                          const percentage = ((currentPrice - stock.buyPrice) / stock.buyPrice) * 100
                          return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}`
                        })()}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="universe" className="w-full mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-transparent pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Market Valuation</CardTitle>
                      <p className="text-sm text-gray-500 mt-0.5">Live updates (15-min delayed)</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200">
                    <TableHead className="text-center w-14 sticky left-0 bg-white z-10">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                          onClick={() => handleSort("ticker", "universe")}
                        >
                          Ticker
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("held", "universe")}
                        >
                          Held
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("price", "universe")}
                        >
                          Price
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("peRatio", "universe")}
                      >
                        5Y P/E
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("peRatio", "universe")}
                      >
                        P/E LTM
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("peRatio", "universe")}
                      >
                        P/E FWD
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("fiftyTwoWeekLow", "universe")}
                        >
                          52W Low
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("fiftyTwoWeekHigh", "universe")}
                        >
                          52W High
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("fiftyTwoWeekHigh", "universe")}
                        >
                          Range
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("fiftyTwoWeekHigh", "universe")}
                      >
                        52-Wk High Date
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("fiftyTwoWeekHigh", "universe")}
                      >
                        Days off 52wk Hi
                      </button>
                    </TableHead>
                      <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("isGreenOver10Under6", "universe")}
                      >
                        {'>10%, <60d'}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("fiftyTwoWeekHigh", "universe")}
                      >
                        % off 52-Wk Low
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("fiftyTwoWeekHigh", "universe")}
                      >
                        % off 52-Wk High
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStocks.map((stock) => (
                    <TableRow 
                      key={stock.ticker} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        if (!editMode) {
                          setSelectedStock(stock)
                          setDrawerOpen(true)
                        }
                      }}
                    >
                      <TableCell className="font-medium py-3 sticky left-0 bg-white z-10">
                        {editMode ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedStocks.has(stock.ticker)}
                              onChange={() => toggleStockSelection(stock.ticker)}
                              className="w-4 h-4"
                            />
                            {stock.ticker}
                          </div>
                        ) : (
                          stock.ticker
                        )}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {stock.held ? (
                          <Check className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {(() => {
                          const stockData = getRealStockData(stock)
                          return typeof stockData.price === 'string' 
                            ? stockData.price 
                            : `$${stockData.price.toFixed(2)}`
                        })()}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {stock.peRatio.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {(stock.peRatio * 0.8).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {(stock.peRatio * 1.2).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        ${getRealStockData(stock).fiftyTwoWeekLow?.toFixed(2) || 'N/A'}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        ${getRealStockData(stock).fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(
                          stock.fiftyTwoWeekLow && stock.fiftyTwoWeekHigh ? 
                            ((stock.fiftyTwoWeekHigh / stock.fiftyTwoWeekLow) - 1) * 100 : 0, 
                          getRangeStatistics().min, getRangeStatistics().median, getRangeStatistics().max
                        ) }}
                      >
                        {stock.fiftyTwoWeekLow && stock.fiftyTwoWeekHigh ? `${(((stock.fiftyTwoWeekHigh / stock.fiftyTwoWeekLow) - 1) * 100).toFixed(1)}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {Math.floor(Math.random() * 365)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {stock.isGreenOver10Under6}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: (() => {
                          const stockData = getRealStockData(stock)
                          const currentPrice = typeof stockData.price === 'number' ? stockData.price : 0
                          return getColorForCustomRange(
                            stock.fiftyTwoWeekLow && currentPrice > 0 ? ((currentPrice / stock.fiftyTwoWeekLow) - 1) * 100 : 0, 
                            10, 20, 30
                          )
                        })() }}
                      >
                        {(() => {
                          const stockData = getRealStockData(stock)
                          const currentPrice = typeof stockData.price === 'number' ? stockData.price : 0
                          return stock.fiftyTwoWeekLow && currentPrice > 0 ? `${(((currentPrice / stock.fiftyTwoWeekLow) - 1) * 100).toFixed(1)}%` : 'N/A'
                        })()}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: (() => {
                          const stockData = getRealStockData(stock)
                          const currentPrice = typeof stockData.price === 'number' ? stockData.price : 0
                          return getColorForCustomRangeInverted(
                            stock.fiftyTwoWeekHigh && currentPrice > 0 ? ((stock.fiftyTwoWeekHigh - currentPrice) / stock.fiftyTwoWeekHigh) * 100 : 0, 
                            -25, -15, 0
                          )
                        })() }}
                      >
                        {(() => {
                          const stockData = getRealStockData(stock)
                          const currentPrice = typeof stockData.price === 'number' ? stockData.price : 0
                          return stock.fiftyTwoWeekHigh && currentPrice > 0 ? `${(((stock.fiftyTwoWeekHigh - currentPrice) / stock.fiftyTwoWeekHigh) * 100).toFixed(1)}%` : 'N/A'
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="w-full mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-transparent pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Research & Analysis</CardTitle>
                      <p className="text-sm text-gray-500 mt-0.5">Live updates (15-min delayed)</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200">
                    <TableHead className="text-center w-14 sticky left-0 bg-white z-10">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                          onClick={() => handleSort("ticker", "alerts")}
                        >
                          Ticker
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("held", "alerts")}
                        >
                          Held
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("overallRating", "alerts")}
                      >
                        Overall Rating
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("qualityRating", "alerts")}
                      >
                        Quality Rating
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("valueRating", "alerts")}
                      >
                        Value Rating
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-20">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("tenYearPriceSameShares", "alerts")}
                      >
                        10Y Price Same Shares
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("busModel", "alerts")}
                      >
                        Bus Model
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("profit", "alerts")}
                      >
                        Profit
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("balSheet", "alerts")}
                      >
                        Bal Sheet
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("moat", "alerts")}
                      >
                        Moat
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("growth", "alerts")}
                      >
                        Growth
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("management", "alerts")}
                      >
                        Management
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("histReturn", "alerts")}
                      >
                        Hist Return
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600 text-xs mb-1">✓</span>
                        <button 
                          className="flex items-center justify-center gap-1 hover:text-blue-600"
                          onClick={() => handleSort("dividendYield", "alerts")}
                        >
                          Div Yield
                        </button>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStocks.map((stock) => (
                    <TableRow 
                      key={stock.ticker} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        if (!editMode) {
                          setSelectedStock(stock)
                          setDrawerOpen(true)
                        }
                      }}
                    >
                      <TableCell className="font-medium py-3 sticky left-0 bg-white z-10">
                        {editMode ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedStocks.has(stock.ticker)}
                              onChange={() => toggleStockSelection(stock.ticker)}
                              className="w-4 h-4"
                            />
                            {stock.ticker}
                          </div>
                        ) : (
                          stock.ticker
                        )}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {stock.held ? (
                          <Check className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.overallRating, 1, 5, 10) }}
                      >
                        {stock.overallRating.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.qualityRating, 1, 5, 10) }}
                      >
                        {stock.qualityRating.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.valueRating, 1, 5, 10) }}
                      >
                        {stock.valueRating.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.tenYearPriceSameShares, 100, 200, 300) }}
                      >
                        ${stock.tenYearPriceSameShares.toFixed(2)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.busModel, 1, 5, 10) }}
                      >
                        {stock.busModel.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.profit, 1, 5, 10) }}
                      >
                        {stock.profit.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.balSheet, 1, 5, 10) }}
                      >
                        {stock.balSheet.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.moat, 1, 5, 10) }}
                      >
                        {stock.moat.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.growth, 1, 5, 10) }}
                      >
                        {stock.growth.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.management, 1, 5, 10) }}
                      >
                        {stock.management.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.histReturn, 1, 5, 10) }}
                      >
                        {stock.histReturn.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {(() => {
                          const dividend = quotesByPeriod.dividend?.find(q => q?.symbol === stock.ticker)
                          if (dividend?.cashAmount && dividend?.frequency) {
                            const stockData = getRealStockData(stock)
                            const currentPrice = typeof stockData.price === 'number' ? stockData.price : 0
                            if (currentPrice > 0) {
                              const annualDividend = dividend.cashAmount * Number(dividend.frequency)
                              const yieldPercent = (annualDividend / currentPrice) * 100
                              return `${yieldPercent.toFixed(2)}%`
                            }
                          }
                          return '0.00%'
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <StockDetailDrawer
        stock={selectedStock}
        quotesByPeriod={quotesByPeriod}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}