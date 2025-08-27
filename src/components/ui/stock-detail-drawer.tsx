import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react"
import { getColorForCustomRange } from "@/lib/utils/getColorForChange"
import { useState, useMemo, useCallback } from "react"

interface StockDetailDrawerProps {
  stock: {
    ticker: string
    price: number
    marketCap: number
    oneDayChange: number
    oneWeekChange: number
    oneMonthChange: number
    oneYearChange: number
    pe5y?: number
    peLtm?: number
    peFwd?: number
    intValue?: number
    week52Low?: number
    week52High?: number
    range?: number
    buyPrice?: number
    buyUpsidePercent?: number
    tenYearEstReturn?: number
    beta?: number
    dividendYield?: number
    volume?: number
    percentPlusMinus?: number
    held?: boolean
    recommend?: string
    busModel?: number
    profit?: number
    balSheet?: number
    moat?: number
    growth?: number
    management?: number
    histReturn?: number
    overallRating?: number
    qualityRating?: number
    valueRating?: number
    tenYearPriceSameShares?: number
  } | null
  quotesByPeriod: Record<string, Array<{
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
  } | null>>
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveMetrics?: (ticker: string, metrics: Record<string, number>) => void
}

export function StockDetailDrawer({ stock, quotesByPeriod, open, onOpenChange, onSaveMetrics }: StockDetailDrawerProps) {
  // Move all hooks to the top level, before any early returns
  const [metrics, setMetrics] = useState({
    busModel: stock?.busModel || 0,
    profit: stock?.profit || 0,
    balSheet: stock?.balSheet || 0,
    moat: stock?.moat || 0,
    growth: stock?.growth || 0,
    management: stock?.management || 0,
    histReturn: stock?.histReturn || 0,
  })

  // Memoize real-time data to avoid recalculating
  const realTimeData = useMemo(() => {
    if (!stock) return null
    
    const dayQuote = quotesByPeriod.day?.find(q => q?.symbol === stock.ticker)
    const weekQuote = quotesByPeriod.week?.find(q => q?.symbol === stock.ticker)
    const monthQuote = quotesByPeriod.month?.find(q => q?.symbol === stock.ticker)
    const yearQuote = quotesByPeriod.year?.find(q => q?.symbol === stock.ticker)
    
    if (dayQuote) {
      return {
        ...stock,
        price: dayQuote.close,
        oneDayChange: dayQuote.changePercent,
        oneWeekChange: weekQuote?.changePercent || stock.oneWeekChange,
        oneMonthChange: monthQuote?.changePercent || stock.oneMonthChange,
        oneYearChange: yearQuote?.changePercent || stock.oneYearChange,
        week52High: yearQuote?.high || stock.week52High,
        week52Low: yearQuote?.low || stock.week52Low,
      }
    }
    
    return stock
  }, [stock, quotesByPeriod])

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    if (numValue >= 0 && numValue <= 10) {
      setMetrics(prev => ({
        ...prev,
        [field]: numValue
      }))
    }
  }, [])

  // Handle form submission
  const handleSave = useCallback(() => {
    if (onSaveMetrics && stock) {
      onSaveMetrics(stock.ticker, metrics)
    }
  }, [onSaveMetrics, stock, metrics])

  // Handle reset
  const handleReset = useCallback(() => {
    if (stock) {
      setMetrics({
        busModel: stock.busModel || 0,
        profit: stock.profit || 0,
        balSheet: stock.balSheet || 0,
        moat: stock.moat || 0,
        growth: stock.growth || 0,
        management: stock.management || 0,
        histReturn: stock.histReturn || 0,
      })
    }
  }, [stock])

  // Calculate overall rating
  const overallRating = useMemo(() => {
    const values = Object.values(metrics).filter(v => v > 0)
    return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 'N/A'
  }, [metrics])

  // Early return after all hooks
  if (!stock) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">{stock.ticker}</DrawerTitle>
            <DrawerDescription>
              Detailed stock information and performance metrics
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Side - Display Information */}
              <div className="space-y-6">
                {/* Price and Market Cap */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Current Price</p>
                    <p className="text-2xl font-bold">${realTimeData?.price?.toFixed(2) || stock.price.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Market Cap</p>
                    <p className="text-lg font-semibold">${(stock.marketCap / 1000).toFixed(1)}B</p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">1 Day</p>
                      <p 
                        className="text-sm font-medium"
                        style={{
                          backgroundColor: getColorForCustomRange(realTimeData?.oneDayChange || stock.oneDayChange, -2, 0, 2),
                          color: '#111',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {(realTimeData?.oneDayChange || stock.oneDayChange) >= 0 ? `+${(realTimeData?.oneDayChange || stock.oneDayChange).toFixed(2)}%` : `(${Math.abs(realTimeData?.oneDayChange || stock.oneDayChange).toFixed(2)}%)`}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">1 Week</p>
                      <p 
                        className="text-sm font-medium"
                        style={{
                          backgroundColor: getColorForCustomRange(realTimeData?.oneWeekChange || stock.oneWeekChange, -5, 0, 5),
                          color: '#111',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {(realTimeData?.oneWeekChange || stock.oneWeekChange) >= 0 ? `+${(realTimeData?.oneWeekChange || stock.oneWeekChange).toFixed(2)}%` : `(${Math.abs(realTimeData?.oneWeekChange || stock.oneWeekChange).toFixed(2)}%)`}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">1 Month</p>
                      <p 
                        className="text-sm font-medium"
                        style={{
                          backgroundColor: getColorForCustomRange(realTimeData?.oneMonthChange || stock.oneMonthChange, -5, 0, 5),
                          color: '#111',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {(realTimeData?.oneMonthChange || stock.oneMonthChange) >= 0 ? `+${(realTimeData?.oneMonthChange || stock.oneMonthChange).toFixed(2)}%` : `(${Math.abs(realTimeData?.oneMonthChange || stock.oneMonthChange).toFixed(2)}%)`}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">1 Year</p>
                      <p 
                        className="text-sm font-medium"
                        style={{
                          backgroundColor: getColorForCustomRange(realTimeData?.oneYearChange || stock.oneYearChange, -15, 0, 15),
                          color: '#111',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {(realTimeData?.oneYearChange || stock.oneYearChange) >= 0 ? `+${(realTimeData?.oneYearChange || stock.oneYearChange).toFixed(2)}%` : `(${Math.abs(realTimeData?.oneYearChange || stock.oneYearChange).toFixed(2)}%)`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Valuation Metrics */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Valuation
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">P/E 5Y</p>
                      <p className="text-sm font-medium">{stock.pe5y?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">P/E LTM</p>
                      <p className="text-sm font-medium">{stock.peLtm?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">P/E Forward</p>
                      <p className="text-sm font-medium">{stock.peFwd?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Intrinsic Value</p>
                      <p className="text-sm font-medium">${stock.intValue?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* 52-Week Range */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">52-Week Range</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Low</p>
                      <p className="text-sm font-medium">${realTimeData?.week52Low?.toFixed(2) || stock.week52Low?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">High</p>
                      <p className="text-sm font-medium">${realTimeData?.week52High?.toFixed(2) || stock.week52High?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Range</p>
                    <p 
                      className="text-sm font-medium"
                      style={{
                        backgroundColor: getColorForCustomRange(stock.range || 0, 0.1, 0.2, 0.3),
                        color: '#111',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-block',
                      }}
                    >
                      {stock.range?.toFixed(2) || 'N/A'}%
                    </p>
                  </div>
                </div>

                {/* Investment Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Investment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Buy Price</p>
                      <p className="text-sm font-medium">${stock.buyPrice?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">% +/-</p>
                      <p 
                        className="text-sm font-medium"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.percentPlusMinus || 0, -0.1, -0.05, 0.15),
                          color: '#111',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {((stock.percentPlusMinus || 0) * 100) >= 0 ? "+" : ""}{((stock.percentPlusMinus || 0) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Held:</span>
                    <Badge variant={stock.held ? "default" : "secondary"}>
                      {stock.held ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {stock.recommend && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Recommendation:</span>
                      <Badge 
                        variant="secondary" 
                        className={stock.recommend === "Strong Buy" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"}
                      >
                        {stock.recommend}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Input Fields */}
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900 text-lg">Edit Stock Metrics</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="busModel">Business Model (1-10)</Label>
                    <Input 
                      id="busModel"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={metrics.busModel || ''}
                      onChange={(e) => handleInputChange('busModel', e.target.value)}
                      className="w-full"
                      aria-describedby="busModel-help"
                    />
                    <p id="busModel-help" className="text-xs text-gray-500">Rate the business model strength from 1 (weak) to 10 (excellent)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profit">Profit (1-10)</Label>
                    <Input 
                      id="profit"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={metrics.profit || ''}
                      onChange={(e) => handleInputChange('profit', e.target.value)}
                      className="w-full"
                      aria-describedby="profit-help"
                    />
                    <p id="profit-help" className="text-xs text-gray-500">Rate the profitability from 1 (poor) to 10 (excellent)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="balSheet">Balance Sheet (1-10)</Label>
                    <Input 
                      id="balSheet"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={metrics.balSheet || ''}
                      onChange={(e) => handleInputChange('balSheet', e.target.value)}
                      className="w-full"
                      aria-describedby="balSheet-help"
                    />
                    <p id="balSheet-help" className="text-xs text-gray-500">Rate the balance sheet strength from 1 (weak) to 10 (excellent)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moat">Moat (1-10)</Label>
                    <Input 
                      id="moat"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={metrics.moat || ''}
                      onChange={(e) => handleInputChange('moat', e.target.value)}
                      className="w-full"
                      aria-describedby="moat-help"
                    />
                    <p id="moat-help" className="text-xs text-gray-500">Rate the competitive moat from 1 (none) to 10 (very strong)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="growth">Growth (1-10)</Label>
                    <Input 
                      id="growth"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={metrics.growth || ''}
                      onChange={(e) => handleInputChange('growth', e.target.value)}
                      className="w-full"
                      aria-describedby="growth-help"
                    />
                    <p id="growth-help" className="text-xs text-gray-500">Rate the growth potential from 1 (stagnant) to 10 (high growth)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="management">Management (1-10)</Label>
                    <Input 
                      id="management"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={metrics.management || ''}
                      onChange={(e) => handleInputChange('management', e.target.value)}
                      className="w-full"
                      aria-describedby="management-help"
                    />
                    <p id="management-help" className="text-xs text-gray-500">Rate the management quality from 1 (poor) to 10 (excellent)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="histReturn">Historical Returns (1-10)</Label>
                    <Input 
                      id="histReturn"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={metrics.histReturn || ''}
                      onChange={(e) => handleInputChange('histReturn', e.target.value)}
                      className="w-full"
                      aria-describedby="histReturn-help"
                    />
                    <p id="histReturn-help" className="text-xs text-gray-500">Rate the historical return performance from 1 (poor) to 10 (excellent)</p>
                  </div>

                  {/* Overall Rating Display */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Overall Rating:</span>
                      <span className="text-lg font-bold text-blue-600">{overallRating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSave}
                    className="flex-1"
                    disabled={!onSaveMetrics}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 