"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, X, Search, Check } from "lucide-react"
import { getColorForCustomRange } from "@/utils/getColorForChange"
import stocksData from "@/data/stocks.json"
import { StockDetailDrawer } from "@/components/ui/stock-detail-drawer"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("pricing")
  const [newTicker, setNewTicker] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Use imported stock data
  const [stocks, setStocks] = useState(stocksData)

  const addStock = () => {
    if (newTicker.trim()) {
      const newStock = {
        "ticker": newTicker.toUpperCase(),
        "held": Math.random() > 0.5,
        "mktCap": Math.random() * 3000 + 500,
        "price": Math.random() * 200 + 100,
        "oneDay": (Math.random() - 0.5) * 10,
        "oneWeek": (Math.random() - 0.5) * 15,
        "oneMonth": (Math.random() - 0.5) * 25,
        "oneYear": (Math.random() - 0.5) * 50,
        "intValue": Math.random() * 250 + 150,
        "plusMinus": (Math.random() - 0.5) * 20,
        "tenYearRet": Math.random() * 30 + 10,
        "vsMkt": (Math.random() - 0.5) * 20,
        "buyPrice": Math.random() * 200 + 50,
        "percentPlusMinus": (Math.random() - 0.5) * 20,
        "pe5y": Math.random() * 50 + 20,
        "peLtm": Math.random() * 50 + 20,
        "peFwd": Math.random() * 50 + 20,
        "week52Low": Math.random() * 100 + 50,
        "week52High": Math.random() * 200 + 150,
        "range": Math.random() * 50 + 30,
        "week52HighDate": "07/15/2025",
        "daysOff52w": Math.floor(Math.random() * 200),
        "isGreenRange": Math.random() > 0.5,
        "over10Under6": Math.random() > 0.7 ? "Y" : "",
        "percentOff52wLow": Math.random() * 50 + 10,
        "percentOff52wHigh": (Math.random() - 0.5) * 30,
        "isGreenOver10Under6": Math.random() > 0.5,
        "isGreenPercentOffHigh": Math.random() > 0.5,
        "type": "QG",
        "level": "L3",
        "lastAnnUp": "3/24/25",
        "lastUpdate": "08/14/2025",
        "nextRept": "12/10/24",
        "update": "✓",
        "recommend": Math.random() > 0.5 ? "Strong Buy" : "Buy",
        "rating": Math.random() * 2 + 8,
        "rating2": Math.random() * 2 + 8,
        "valueRating": Math.random() * 2 + 8,
        "upDn": (Math.random() - 0.5) * 100,
        "sameSh": Math.random() * 1000 + 100,
        "cagr": Math.random() * 20 + 10,
        "dividendY": Math.random() > 0.7 ? Math.random() * 2 : 0.0,
        "cagi": Math.random() * 20 + 10,
        "yield": Math.random() * 5,
        "busModel": Math.random() * 10,
        "profit": Math.random() * 10,
        "balSheet": Math.random() * 10,
        "moat": Math.random() * 10,
        "growth": Math.random() * 10,
        "management": Math.random() * 10,
        "histReturn": Math.random() * 10
      }
      setStocks([...stocks, newStock])
      setNewTicker("")
      setShowAddForm(false)
    }
  }

  const removeStock = (tickerToRemove: string) => {
    setStocks(stocks.filter(stock => stock.ticker !== tickerToRemove))
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
    let sortedStocks = [...stocks]
    
    // Apply sorting
    if (sortColumn) {
      sortedStocks.sort((a, b) => {
        const aValue = a[sortColumn as keyof typeof a]
        const bValue = b[sortColumn as keyof typeof b]
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue)
          return sortDirection === "asc" ? comparison : -comparison
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          const comparison = aValue - bValue
          return sortDirection === "asc" ? comparison : -comparison
        } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          const comparison = (aValue === bValue) ? 0 : aValue ? 1 : -1
          return sortDirection === "asc" ? comparison : -comparison
        }
        return 0
      })
    }
    
    return sortedStocks
  }

  return (
    <div className="w-full p-6 space-y-6 max-w-none">
      <StockDetailDrawer 
        stock={selectedStock} 
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Dashboard</h1>
          <p className="text-gray-600">Track and analyze your investment portfolio</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Stock
        </Button>
      </div>
      
      {showAddForm && (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex gap-4 items-end">
              <div className="space-y-2 flex-1">
                <Label htmlFor="ticker" className="text-sm font-medium">Ticker Symbol</Label>
                <Input
                  id="ticker"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                  className="mt-1"
                  maxLength={5}
                />
              </div>
              <Button type="submit" disabled={!newTicker.trim()} className="bg-blue-600 hover:bg-blue-700">
                Add Stock
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="pricing" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            Performance & Intrinsic Value
          </TabsTrigger>
          <TabsTrigger value="universe" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Market Valuation
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            Research & Analysis
          </TabsTrigger>
        </TabsList>

        {/* Yellow Section - Performance & Intrinsic Value */}
        <TabsContent value="pricing" className="space-y-6 w-full">
          <Card className="border-t-4 border-t-yellow-500 shadow-sm w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-yellow-800 text-xl">
                <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
                Performance & Intrinsic Value
            </CardTitle>
          </CardHeader>
            <CardContent className="overflow-x-auto w-full">
              <Table className="text-sm w-full">
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200">
                    <TableHead className="font-semibold w-14 sticky left-0 bg-white z-10 text-gray-700">
                      <button 
                        className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${sortColumn === "ticker" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("ticker")}
                      >
                        Ticker
                        {sortColumn === "ticker" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "held" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("held")}
                      >
                        Held
                        {sortColumn === "held" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "mktCap" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("mktCap")}
                      >
                            Mkt Cap
                        {sortColumn === "mktCap" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "price" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("price")}
                      >
                            Price
                        {sortColumn === "price" && (
                              <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "oneDay" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("oneDay")}
                      >
                        1D
                        {sortColumn === "oneDay" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "oneWeek" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("oneWeek")}
                      >
                        1WK
                        {sortColumn === "oneWeek" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "oneMonth" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("oneMonth")}
                      >
                        1M
                        {sortColumn === "oneMonth" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "oneYear" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("oneYear")}
                      >
                        1YR
                        {sortColumn === "oneYear" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "intValue" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("intValue")}
                      >
                            Intrinsic Value
                        {sortColumn === "intValue" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "plusMinus" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("plusMinus")}
                      >
                        +/- %
                        {sortColumn === "plusMinus" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "tenYearRet" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("tenYearRet")}
                      >
                            10Y Est. Ret %
                        {sortColumn === "tenYearRet" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>

                    <TableHead className="text-center w-16">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "buyPrice" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("buyPrice")}
                      >
                            Buy Price
                        {sortColumn === "buyPrice" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-12">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "percentPlusMinus" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("percentPlusMinus")}
                      >
                        +/- %
                        {sortColumn === "percentPlusMinus" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-12">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedStocks().map((stock) => (
                    <TableRow 
                      key={stock.ticker}
                      className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                      onClick={() => {
                        setSelectedStock(stock)
                        setDrawerOpen(true)
                      }}
                    >
                      <TableCell className="font-medium py-3 sticky left-0 bg-white z-10">{stock.ticker}</TableCell>
                      <TableCell className="text-center py-1">
                        {stock.held ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : ""}
                      </TableCell>
                      <TableCell className="text-center py-1">${(stock.mktCap / 1000).toFixed(1)}B</TableCell>
                      <TableCell className="text-center py-1">${stock.price.toFixed(2)}</TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.oneDay, -0.02, 0, 0.02),
                          color: '#111',
                        }}
                      >
                        {(stock.oneDay * 100) >= 0 ? `+${(stock.oneDay * 100).toFixed(2)}%` : `(${Math.abs(stock.oneDay * 100).toFixed(2)}%)`}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.oneWeek, -0.05, 0, 0.05),
                          color: '#111',
                        }}
                      >
                        {(stock.oneWeek * 100) >= 0 ? `+${(stock.oneWeek * 100).toFixed(2)}%` : `(${Math.abs(stock.oneWeek * 100).toFixed(2)}%)`}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.oneMonth, -0.05, 0, 0.05),
                          color: '#111',
                        }}
                      >
                        {(stock.oneMonth * 100) >= 0 ? `+${(stock.oneMonth * 100).toFixed(2)}%` : `(${Math.abs(stock.oneMonth * 100).toFixed(2)}%)`}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.oneYear, -0.15, 0, 0.15),
                          color: '#111',
                        }}
                      >
                        {(stock.oneYear * 100) >= 0 ? `+${(stock.oneYear * 100).toFixed(2)}%` : `(${Math.abs(stock.oneYear * 100).toFixed(2)}%)`}
                      </TableCell>
                      <TableCell className="text-center py-1">${stock.intValue.toFixed(2)}</TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.plusMinus, -0.1, -0.05, 0.15),
                          color: '#111',
                        }}
                      >
                        {(stock.plusMinus * 100) >= 0 ? "+" : ""}{(stock.plusMinus * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.tenYearRet, 0.05, 0.125, 0.2),
                          color: '#111',
                        }}
                      >
                        {(stock.tenYearRet * 100).toFixed(2)}%
                      </TableCell>

                      <TableCell className="text-center py-1">${stock.buyPrice.toFixed(2)}</TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.percentPlusMinus, -0.1, -0.05, 0.15),
                          color: '#111',
                        }}
                      >
                        {(stock.percentPlusMinus * 100) >= 0 ? "+" : ""}{(stock.percentPlusMinus * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-center py-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeStock(stock.ticker)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Green Section - Market Valuation */}
        <TabsContent value="universe" className="space-y-6 w-full">
          <Card className="border-t-4 border-t-green-500 shadow-sm w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-green-800 text-xl">
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                Market Valuation
            </CardTitle>
          </CardHeader>
            <CardContent className="overflow-x-auto w-full">
              <Table className="text-sm w-full">
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200">
                    <TableHead className="font-semibold w-16 sticky left-0 bg-white z-20 text-gray-700 border-r border-gray-200">
                      <button 
                        className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${sortColumn === "ticker" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("ticker")}
                      >
                        Ticker
                        {sortColumn === "ticker" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "pe5y" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("pe5y")}
                      >
                            P/E 5Y
                        {sortColumn === "pe5y" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "peLtm" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("peLtm")}
                      >
                            P/E LTM
                        {sortColumn === "peLtm" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "peFwd" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("peFwd")}
                      >
                            P/E Fwd
                        {sortColumn === "peFwd" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-20">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "week52Low" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("week52Low")}
                      >
                            52-Wk Low
                        {sortColumn === "week52Low" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-20">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "week52High" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("week52High")}
                      >
                            52-Wk High
                        {sortColumn === "week52High" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "range" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("range")}
                      >
                            Range
                        {sortColumn === "range" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-20">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "week52HighDate" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("week52HighDate")}
                      >
                            52-Wk High Date
                        {sortColumn === "week52HighDate" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "daysOff52w" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("daysOff52w")}
                      >
                            Days Off 52Wk High
                        {sortColumn === "daysOff52w" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-16">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "over10Under6" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("over10Under6")}
                      >
                            {'(10%)+'} 60d
                        {sortColumn === "over10Under6" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-20">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "percentOff52wLow" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("percentOff52wLow")}
                      >
                            % off 52-Wk Lo
                        {sortColumn === "percentOff52wLow" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-20">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "percentOff52wHigh" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("percentOff52wHigh")}
                      >
                            % off 52-Wk Hi
                        {sortColumn === "percentOff52wHigh" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-16">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedStocks().map((stock) => (
                    <TableRow 
                      key={stock.ticker}
                      className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                      onClick={() => {
                        setSelectedStock(stock)
                        setDrawerOpen(true)
                      }}
                    >
                      <TableCell className="font-medium py-3 sticky left-0 bg-white z-20 border-r border-gray-200">{stock.ticker}</TableCell>
                      <TableCell className="text-center py-1">{stock.pe5y.toFixed(2)}</TableCell>
                      <TableCell className="text-center py-1">{stock.peLtm.toFixed(2)}</TableCell>
                      <TableCell className="text-center py-1">{stock.peFwd.toFixed(2)}</TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{                            color: '#111',
                        }}
                      >
                        ${stock.week52Low.toFixed(2)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          color: '#111',
                        }}
                      >
                        ${stock.week52High.toFixed(2)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.range, 0.1, 0.2, 0.3),
                          color: '#111',
                        }}
                      >
                        {stock.range.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-center text-sm py-1">{stock.week52HighDate}</TableCell>
                      <TableCell className="text-center py-1">{stock.daysOff52w}</TableCell>
                      <TableCell className="text-center py-1">
                        <Badge 
                          variant="secondary" 
                          className={`${
                            stock.isGreenOver10Under6 ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {stock.over10Under6 || "-"}
              </Badge>
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(((stock.price - stock.week52Low) / stock.week52Low), 0.1, 0.2, 0.3),
                          color: '#111',
                        }}
                      >
                        {(((stock.price - stock.week52Low) / stock.week52Low) * 100) >= 0 ? "+" : ""}{(((stock.price - stock.week52Low) / stock.week52Low) * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(((stock.price - stock.week52High) / stock.week52High), -0.25, -0.15, 0),
                          color: '#111',
                        }}
                      >
                        {(((stock.price - stock.week52High) / stock.week52High) * 100) >= 0 ? "+" : ""}{(((stock.price - stock.week52High) / stock.week52High) * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-center py-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeStock(stock.ticker)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Orange Section - Research */}
        <TabsContent value="alerts" className="space-y-6 w-full">
          <Card className="border-t-4 border-t-orange-500 shadow-sm w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-800 text-xl">
                <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                Research & Analysis
            </CardTitle>
          </CardHeader>
            <CardContent className="overflow-x-auto w-full">
              <Table className="text-sm w-full">
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200">
                    <TableHead className="font-semibold w-14 sticky left-0 bg-white z-20 text-gray-700 border-r border-gray-200">
                      <button 
                        className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${sortColumn === "ticker" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("ticker")}
                      >
                            Ticker
                        {sortColumn === "ticker" && (
                              <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                          </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "type" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("type")}
                      >
                        Company Type
                        {sortColumn === "type" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "level" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("level")}
                      >
                        Research Level
                        {sortColumn === "level" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "lastAnnUp" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("lastAnnUp")}
                      >
                        Last Ann Update
                        {sortColumn === "lastAnnUp" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "lastUpdate" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("lastUpdate")}
                      >
                        Last Int Update
                        {sortColumn === "lastUpdate" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "nextRept" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("nextRept")}
                      >
                        Next Earnings Date
                        {sortColumn === "nextRept" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>

                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "recommend" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("recommend")}
                      >
                        Recommendation
                        {sortColumn === "recommend" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "rating" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("rating")}
                      >
                        Overall Rating
                        {sortColumn === "rating" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "rating2" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("rating2")}
                      >
                        Quality Rating
                        {sortColumn === "rating2" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "valueRating" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("valueRating")}
                      >
                        Value Rating
                        {sortColumn === "valueRating" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "upDn" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("upDn")}
                      >
                        Intrinsic Value Up/Dn %
                        {sortColumn === "upDn" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "sameSh" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("sameSh")}
                      >
                        10Y Price Same Shares
                        {sortColumn === "sameSh" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "cagr" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("cagr")}
                      >
                        OE/Shr 10Y CAGR
                        {sortColumn === "cagr" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "dividendY" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("dividendY")}
                      >
                        Dividend Yield
                        {sortColumn === "dividendY" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "cagi" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("cagi")}
                      >
                        Total 10Y CAGR
                        {sortColumn === "cagi" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "yield" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("yield")}
                      >
                        Curr OE FCF Yield
                        {sortColumn === "yield" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "busModel" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("busModel")}
                      >
                        Business Model
                        {sortColumn === "busModel" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "profit" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("profit")}
                      >
                        Profit
                        {sortColumn === "profit" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "balSheet" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("balSheet")}
                      >
                        Balance Sheet
                        {sortColumn === "balSheet" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "moat" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("moat")}
                      >
                        Moat
                        {sortColumn === "moat" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "growth" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("growth")}
                      >
                        Growth
                        {sortColumn === "growth" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "management" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("management")}
                      >
                        Mgmt
                        {sortColumn === "management" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-14">
                      <button 
                        className={`flex items-center justify-center gap-1 hover:text-blue-600 ${sortColumn === "histReturn" ? "text-blue-600 font-semibold" : ""}`}
                        onClick={() => handleSort("histReturn")}
                      >
                        Hist Return
                        {sortColumn === "histReturn" && (
                          <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-10">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedStocks().map((stock) => (
                    <TableRow 
                      key={stock.ticker}
                      className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                      onClick={() => {
                        setSelectedStock(stock)
                        setDrawerOpen(true)
                      }}
                    >
                      <TableCell className="font-medium py-3 sticky left-0 bg-white z-20 border-r border-gray-200">{stock.ticker}</TableCell>
                      <TableCell className="text-center py-1">{stock.type}</TableCell>
                      <TableCell className="text-center py-1">{stock.level}</TableCell>
                      <TableCell className="text-center py-1">{stock.lastAnnUp}</TableCell>
                      <TableCell className="text-center py-1">{stock.lastUpdate}</TableCell>
                      <TableCell className="text-center py-1">{stock.nextRept}</TableCell>

                      <TableCell className="text-center py-1">
                        <Badge 
                          variant="secondary" 
                          className={`${
                            stock.recommend === "Strong Buy" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {stock.recommend}
                        </Badge>
                      </TableCell>
                      <TableCell 
                        className="text-center py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.rating, 1, 5, 10), color: '#111' }}
                      >
                        {stock.rating.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.rating2, 1, 5, 10), color: '#111' }}
                      >
                        {stock.rating2.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.valueRating, 1, 5, 10), color: '#111' }}
                      >
                        {stock.valueRating.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.upDn, -0.1, -0.05, 0.15),
                          color: '#111',
                        }}
                      >
                        {(stock.upDn * 100) >= 0 ? "+" : ""}{(stock.upDn * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell 
                        className="text-center py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.sameSh, 100, 500, 1000), color: '#111' }}
                      >
                        {stock.sameSh.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.cagr, 0.05, 0.125, 0.2),
                          color: '#111',
                        }}
                      >
                        {(stock.cagr * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.dividendY, 0.02, 0.05, 0.1),
                          color: '#111',
                        }}
                      >
                        {(stock.dividendY * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.cagi, 0.05, 0.125, 0.2),
                          color: '#111',
                        }}
                      >
                        {(stock.cagi * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell 
                        className="text-center font-medium py-1"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.yield, 0.02, 0.05, 0.1),
                          color: '#111',
                        }}
                      >
                        {(stock.yield * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell 
                        className="text-center py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.busModel ?? 1, 1, 5, 10), color: '#111' }}
                      >
                        {stock.busModel !== undefined ? stock.busModel.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell 
                        className="text-center py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.profit ?? 1, 1, 5, 10), color: '#111' }}
                      >
                        {stock.profit !== undefined ? stock.profit.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell 
                        className="text-center py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.balSheet ?? 1, 1, 5, 10), color: '#111' }}
                      >
                        {stock.balSheet !== undefined ? stock.balSheet.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell 
                        className="text-center py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.moat ?? 1, 1, 5, 10), color: '#111' }}
                      >
                        {stock.moat !== undefined ? stock.moat.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell 
                        className="text-center py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.growth ?? 1, 1, 5, 10), color: '#111' }}
                      >
                        {stock.growth !== undefined ? stock.growth.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell 
                        className="text-center py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.management ?? 1, 1, 5, 10), color: '#111' }}
                      >
                        {stock.management !== undefined ? stock.management.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell 
                        className="text-center py-1"
                        style={{ backgroundColor: getColorForCustomRange(stock.histReturn ?? 1, 1, 5, 10), color: '#111' }}
                      >
                        {stock.histReturn !== undefined ? stock.histReturn.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeStock(stock.ticker)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
