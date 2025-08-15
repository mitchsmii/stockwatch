import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, DollarSign, BarChart3 } from "lucide-react"
import { getColorForCustomRange } from "@/lib/utils/getColorForChange"

interface StockDetailCardProps {
  stock: {
    ticker: string
    price: number
    marketCap: number
    oneDayChange: number
    oneWeekChange: number
    oneMonthChange: number
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
  }
  onClose: () => void
}

export function StockDetailCard({ stock, onClose }: StockDetailCardProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">{stock.ticker}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Price and Market Cap */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="text-2xl font-bold">${stock.price.toFixed(2)}</p>
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
                                            backgroundColor: getColorForCustomRange(stock.oneDayChange / 100, -0.02, 0, 0.02),
                    color: '#111',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                                          {(stock.oneDayChange) >= 0 ? `+${(stock.oneDayChange).toFixed(2)}%` : `(${Math.abs(stock.oneDayChange).toFixed(2)}%)`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">1 Week</p>
                <p 
                  className="text-sm font-medium"
                  style={{
                                            backgroundColor: getColorForCustomRange(stock.oneWeekChange / 100, -0.05, 0, 0.05),
                    color: '#111',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                                          {(stock.oneWeekChange) >= 0 ? `+${(stock.oneWeekChange).toFixed(2)}%` : `(${Math.abs(stock.oneWeekChange).toFixed(2)}%)`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">1 Month</p>
                <p 
                  className="text-sm font-medium"
                  style={{
                                            backgroundColor: getColorForCustomRange(stock.oneMonthChange / 100, -0.05, 0, 0.05),
                    color: '#111',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {(stock.oneMonthChange) >= 0 ? `+${(stock.oneMonthChange).toFixed(2)}%` : `(${Math.abs(stock.oneMonthChange).toFixed(2)}%)`}
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
                <p className="text-sm font-medium">${stock.week52Low?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">High</p>
                <p className="text-sm font-medium">${stock.week52High?.toFixed(2) || 'N/A'}</p>
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
        </CardContent>
      </Card>
    </div>
  )
} 