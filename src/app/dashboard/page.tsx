"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, X, Check } from "lucide-react"
import { getColorForCustomRange, getColorForCustomRangeInverted } from "@/lib/utils/getColorForChange"
import stocksData from "@/data/stocks.json"
import { StockDetailDrawer } from "@/components/ui/stock-detail-drawer"
import { useStockDatabase } from "@/hooks/useStockDatabase"
import { PolygonRefreshButton } from "@/components/ui/polygon-refresh-button"


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

  // Replace usePolygonData with useStockDatabase
  const { stockData, loading, error, refreshData } = useStockDatabase()
  
  // Load initial data from database when component mounts
  useEffect(() => {
    if (stocks.length > 0) {
      const symbols = stocks.map(stock => stock.ticker)
      refreshData(symbols)
    }
  }, [stocks, refreshData])
  
  // Store quotes by time period
  const [quotesByPeriod, setQuotesByPeriod] = useState<Record<string, Array<{
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

  const handleRefreshData = async () => {
    const symbols = stocks.map(stock => stock.ticker)
    console.log('🔄 Refreshing data for symbols:', symbols)
    
    // Use the new database hook - this will fetch all data at once
    await refreshData(symbols)
    
    console.log('📊 Data refreshed from database')
    
    // TODO: When database is fully populated, we can remove the quotesByPeriod logic
    // For now, keep the existing structure but it will be empty
    setQuotesByPeriod(prev => ({
      ...prev,
      day: [],
      week: [],
      month: [],
      year: [],
      dividend: []
    }))
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

  // Helper function to get real data from database
  const getRealStockData = (stock: typeof stocksData[0]) => {
    // Try to get data from the new database first
    const dbData = stockData[stock.ticker]
    
    if (dbData) {
      // Calculate percentage changes from stored prices
      const oneDayChange = dbData.price_yesterday && dbData.current_price ? 
        ((dbData.current_price - dbData.price_yesterday) / dbData.price_yesterday) * 100 : 0
      
      const oneWeekChange = dbData.price_one_week_ago && dbData.current_price ? 
        ((dbData.current_price - dbData.price_one_week_ago) / dbData.price_one_week_ago) * 100 : 0
      
      const oneMonthChange = dbData.price_one_month_ago && dbData.current_price ? 
        ((dbData.current_price - dbData.price_one_month_ago) / dbData.price_one_month_ago) * 100 : 0
      
      const oneYearChange = dbData.price_one_year_ago && dbData.current_price ? 
        ((dbData.current_price - dbData.price_one_year_ago) / dbData.price_one_year_ago) * 100 : 0
      
      // Debug logging for 52-week data
      console.log(`🔍 Debug for ${stock.ticker}:`, {
        dbData: dbData,
        fifty_two_week_high: dbData.fifty_two_week_high,
        fifty_two_week_low: dbData.fifty_two_week_low,
        originalHigh: stock.fiftyTwoWeekHigh,
        originalLow: stock.fiftyTwoWeekLow
      })
      
      return {
        ...stock,
        price: dbData.current_price || stock.price,
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
        // Keep other fields from original stock data since we don't store them
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
    
    // Fallback to original stock data if no database data
    return stock
  }

  return (
    <div className="w-full p-6 space-y-6 max-w-none">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
        </div>
        <div className="flex gap-2">
          <PolygonRefreshButton 
            onRefresh={handleRefreshData}
            loading={loading}
            disabled={stocks.length === 0}
          />
          <Button variant="outline" onClick={toggleEditMode}>
            {editMode ? "Cancel" : "Edit / Remove"}
          </Button>
          {editMode && selectedStocks.size > 0 && (
            <Button variant="destructive" onClick={removeSelectedStocks}>
              Remove Selected ({selectedStocks.size})
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="ticker">Ticker Symbol</Label>
                <Input
                  id="ticker"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  placeholder="Enter ticker symbol"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit">Add</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            Performance & Intrinsic Value
          </TabsTrigger>
          <TabsTrigger value="universe" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Market Valuation
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            Research & Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-6 w-full">
          <Card className="border-t-4 border-t-yellow-500">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-3 text-yellow-800 text-xl">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
                  Performance & Intrinsic Value
                </CardTitle>
                <p className="text-gray-400 text-sm mt-1">Data 15 mins delayed</p>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
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
                        ${getRealStockData(stock).price.toFixed(2)}
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
                        style={{ backgroundColor: getColorForCustomRange(((stock.intrinsicValue / getRealStockData(stock).price) - 1) * 100, -10, -5, 15) }}
                      >
                        {(((stock.intrinsicValue - getRealStockData(stock).price) / getRealStockData(stock).price) * 100).toFixed(2)}%
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
                        style={{ backgroundColor: getColorForCustomRange(((getRealStockData(stock).price - stock.buyPrice) / stock.buyPrice) * 100, -10, 5, 15) }}
                      >
                        {(((getRealStockData(stock).price - stock.buyPrice) / stock.buyPrice) * 100) >= 0 ? '+' : ''}{(((getRealStockData(stock).price - stock.buyPrice) / stock.buyPrice) * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="universe" className="space-y-6 w-full">
          <Card className="border-t-4 border-t-green-500">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-3 text-green-800 text-xl">
                  <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                  Market Valuation
                </CardTitle>
                <p className="text-gray-400 text-sm mt-1">Data 15 mins delayed</p>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
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
                        ${getRealStockData(stock).price.toFixed(2)}
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
                        style={{ backgroundColor: getColorForCustomRange(
                          stock.fiftyTwoWeekLow ? ((getRealStockData(stock).price / stock.fiftyTwoWeekLow) - 1) * 100 : 0, 
                          10, 20, 30
                        ) }}
                      >
                        {stock.fiftyTwoWeekLow ? `${(((getRealStockData(stock).price / stock.fiftyTwoWeekLow) - 1) * 100).toFixed(1)}%` : 'N/A'}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRangeInverted(
                          stock.fiftyTwoWeekHigh ? ((stock.fiftyTwoWeekHigh - getRealStockData(stock).price) / stock.fiftyTwoWeekHigh) * 100 : 0, 
                          -25, -15, 0
                        ) }}
                      >
                        {stock.fiftyTwoWeekHigh ? `${(((stock.fiftyTwoWeekHigh - getRealStockData(stock).price) / stock.fiftyTwoWeekHigh) * 100).toFixed(1)}%` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6 w-full">
          <Card className="border-t-4 border-t-orange-500">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-3 text-orange-800 text-xl">
                  <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                  Research & Analysis
                </CardTitle>
                <p className="text-gray-500 text-sm mt-1">Data 15 mins delayed</p>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
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
                            const annualDividend = dividend.cashAmount * Number(dividend.frequency)
                            const yieldPercent = (annualDividend / getRealStockData(stock).price) * 100
                            return `${yieldPercent.toFixed(2)}%`
                          }
                          return '0.00%'
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StockDetailDrawer
        stock={selectedStock}
        quotesByPeriod={quotesByPeriod}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}