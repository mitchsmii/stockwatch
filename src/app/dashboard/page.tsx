"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, X, Check } from "lucide-react"
import { getColorForCustomRange } from "@/lib/utils/getColorForChange"
import stocksData from "@/data/stocks.json"
import { StockDetailDrawer } from "@/components/ui/stock-detail-drawer"
import { usePolygonData } from "@/hooks/usePolygonData"
import { PolygonRefreshButton } from "@/components/ui/polygon-refresh-button"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("pricing")
  const [newTicker, setNewTicker] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedStock, setSelectedStock] = useState<typeof stocksData[0] | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(new Set())

  // Use imported stock data
  const [stocks, setStocks] = useState(stocksData)

  // Polygon API data
  const { companyOverviews, loading, error, refreshData } = usePolygonData()
  
  // Store quotes by time period
  const [quotesByPeriod, setQuotesByPeriod] = useState<Record<string, Array<{
    symbol: string
    open: number
    close: number
    timestamp: number
    change: number
    changePercent: number
    dataRange?: string
  }>>>({
    day: [],
    week: [],
    month: [],
    year: []
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
        "volume": Math.floor(Math.random() * 100000000),
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
    
    // Fetch data for day, week, and month
    console.log('📈 Fetching day data...')
    const dayQuotes = await refreshData(symbols, 'day')
    console.log('📊 day quotes received:', dayQuotes)
    
    console.log('📈 Fetching week data...')
    const weekQuotes = await refreshData(symbols, 'week')
    console.log('📊 week quotes received:', weekQuotes)
    
    console.log('📈 Fetching month data...')
    const monthQuotes = await refreshData(symbols, 'month')
    console.log('📊 month quotes received:', monthQuotes)
    
    const newQuotesByPeriod: Record<string, Array<{
      symbol: string
      open: number
      close: number
      timestamp: number
      change: number
      changePercent: number
      dataRange?: string
    }>> = {
      day: dayQuotes,
      week: weekQuotes,
      month: monthQuotes
    }
    
    setQuotesByPeriod(newQuotesByPeriod)
    console.log('✅ Refresh complete. Quotes by period:', newQuotesByPeriod)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addStock()
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getSortedStocks = () => {
    if (!sortColumn) return stocks

    return [...stocks].sort((a, b) => {
      const aVal = a[sortColumn as keyof typeof a]
      const bVal = b[sortColumn as keyof typeof b]

      // Handle numeric values
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal
      }

      // Handle string values
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal)
      }

      // Handle boolean values
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortDirection === "asc" 
          ? (aVal === bVal ? 0 : aVal ? 1 : -1)
          : (aVal === bVal ? 0 : aVal ? -1 : 1)
      }

      return 0
    })
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toFixed(0)}`
  }

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toFixed(0)
  }

  const sortedStocks = getSortedStocks()

  // Helper function to get real data from Polygon API
  const getRealStockData = (stock: typeof stocksData[0]) => {
    const dayQuote = quotesByPeriod.day.find(q => q.symbol === stock.ticker)
    const weekQuote = quotesByPeriod.week.find(q => q.symbol === stock.ticker)
    const monthQuote = quotesByPeriod.month.find(q => q.symbol === stock.ticker)
    const overview = companyOverviews[stock.ticker]
    
    if (dayQuote) {
      return {
        ...stock,
        price: dayQuote.close, // Use close price from min object
        oneDayChange: dayQuote.changePercent,
        oneWeekChange: weekQuote?.changePercent || stock.oneWeekChange, // Use real week data if available
        oneMonthChange: monthQuote?.changePercent || stock.oneMonthChange, // Use real month data if available
        marketCap: overview?.marketCap || stock.marketCap,
        volume: stock.volume, // Use original stock data for volume
        // Keep other fields from original stock data for now
      }
    }
    
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
              <CardTitle className="flex items-center gap-3 text-yellow-800 text-xl">
                <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
                Performance & Intrinsic Value
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200">
                    <TableHead className="w-14 sticky left-0 bg-white z-10">
                      <button 
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        onClick={() => handleSort("ticker")}
                      >
                        Ticker
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("held")}
                      >
                        Held
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("marketCap")}
                      >
                        Mkt Cap
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("price")}
                      >
                        Price
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("oneDayChange")}
                      >
                        1D
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("oneWeekChange")}
                      >
                        1WK
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("oneMonthChange")}
                      >
                        1M
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("intrinsicValue")}
                      >
                        Intrinsic Value
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("upsidePercent")}
                      >
                        +/- %
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("tenYearEstReturn")}
                      >
                        10Y Est. Ret %
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("buyPrice")}
                      >
                        Buy Price
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("buyUpsidePercent")}
                      >
                        +/- %
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
                        {formatMarketCap(stock.marketCap)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        ${getRealStockData(stock).price.toFixed(2)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(getRealStockData(stock).oneDayChange, -10, 0, 10) }}
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
                        style={{ backgroundColor: getColorForCustomRange(getRealStockData(stock).oneMonthChange, -10, 0, 10) }}
                      >
                        {getRealStockData(stock).oneMonthChange >= 0 ? '+' : ''}{getRealStockData(stock).oneMonthChange.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-center py-1">
                        ${stock.intrinsicValue.toFixed(2)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.upsidePercent, -20, 0, 20) }}
                      >
                        {stock.upsidePercent >= 0 ? '+' : ''}{stock.upsidePercent.toFixed(2)}%
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
                        style={{ backgroundColor: getColorForCustomRange(stock.buyUpsidePercent, -20, 0, 20) }}
                      >
                        {stock.buyUpsidePercent >= 0 ? '+' : ''}{stock.buyUpsidePercent.toFixed(2)}%
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
              <CardTitle className="flex items-center gap-3 text-green-800 text-xl">
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                Market Valuation
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200">
                    <TableHead className="w-14 sticky left-0 bg-white z-10">
                      <button 
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        onClick={() => handleSort("ticker")}
                      >
                        Ticker
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("held")}
                      >
                        Held
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("marketCap")}
                      >
                        Mkt Cap
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("price")}
                      >
                        Price
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("peRatio")}
                      >
                        P/E
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("fiftyTwoWeekHigh")}
                      >
                        52W High
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("fiftyTwoWeekLow")}
                      >
                        52W Low
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("dividendYield")}
                      >
                        Div Yield
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("beta")}
                      >
                        Beta
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("volume")}
                      >
                        Volume
                      </button>
                    </TableHead>
                                            <TableHead className="text-center w-16">
                          <button 
                            className="flex items-center justify-center gap-1 hover:text-blue-600"
                            onClick={() => handleSort("isGreenOver10Under6")}
                          >
                            {'>10%, <60d'}
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
                        {formatMarketCap(getRealStockData(stock).marketCap)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        ${getRealStockData(stock).price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {stock.peRatio.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        ${stock.fiftyTwoWeekHigh.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        ${stock.fiftyTwoWeekLow.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {stock.dividendYield.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {stock.beta.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {formatVolume(getRealStockData(stock).volume)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {stock.isGreenOver10Under6}
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
              <CardTitle className="flex items-center gap-3 text-orange-800 text-xl">
                <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                Research & Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200">
                    <TableHead className="w-14 sticky left-0 bg-white z-10">
                      <button 
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        onClick={() => handleSort("ticker")}
                      >
                        Ticker
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("held")}
                      >
                        Held
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("overallRating")}
                      >
                        Overall Rating
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("qualityRating")}
                      >
                        Quality Rating
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("valueRating")}
                      >
                        Value Rating
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-20">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("tenYearPriceSameShares")}
                      >
                        10Y Price Same Shares
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("busModel")}
                      >
                        Bus Model
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("profit")}
                      >
                        Profit
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("balSheet")}
                      >
                        Bal Sheet
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("moat")}
                      >
                        Moat
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("growth")}
                      >
                        Growth
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("management")}
                      >
                        Management
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className="flex items-center justify-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort("histReturn")}
                      >
                        Hist Return
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
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
