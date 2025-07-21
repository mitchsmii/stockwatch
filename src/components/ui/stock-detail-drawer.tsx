import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react"
import { getColorForCustomRange } from "@/utils/getColorForChange"

interface StockDetailDrawerProps {
  stock: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockDetailDrawer({ stock, open, onOpenChange }: StockDetailDrawerProps) {
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
                    <p className="text-2xl font-bold">${stock.price.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Market Cap</p>
                    <p className="text-lg font-semibold">${(stock.mktCap / 1000).toFixed(1)}B</p>
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
                          backgroundColor: getColorForCustomRange(stock.oneDay, -0.02, 0, 0.02),
                          color: '#111',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {(stock.oneDay * 100) >= 0 ? `+${(stock.oneDay * 100).toFixed(2)}%` : `(${Math.abs(stock.oneDay * 100).toFixed(2)}%)`}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">1 Week</p>
                      <p 
                        className="text-sm font-medium"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.oneWeek, -0.05, 0, 0.05),
                          color: '#111',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {(stock.oneWeek * 100) >= 0 ? `+${(stock.oneWeek * 100).toFixed(2)}%` : `(${Math.abs(stock.oneWeek * 100).toFixed(2)}%)`}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">1 Month</p>
                      <p 
                        className="text-sm font-medium"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.oneMonth, -0.05, 0, 0.05),
                          color: '#111',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {(stock.oneMonth * 100) >= 0 ? `+${(stock.oneMonth * 100).toFixed(2)}%` : `(${Math.abs(stock.oneMonth * 100).toFixed(2)}%)`}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">1 Year</p>
                      <p 
                        className="text-sm font-medium"
                        style={{
                          backgroundColor: getColorForCustomRange(stock.oneYear, -0.15, 0, 0.15),
                          color: '#111',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {(stock.oneYear * 100) >= 0 ? `+${(stock.oneYear * 100).toFixed(2)}%` : `(${Math.abs(stock.oneYear * 100).toFixed(2)}%)`}
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
                        backgroundColor: getColorForCustomRange(stock.range, 0.1, 0.2, 0.3),
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
                          backgroundColor: getColorForCustomRange(stock.percentPlusMinus, -0.1, -0.05, 0.15),
                          color: '#111',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {(stock.percentPlusMinus * 100) >= 0 ? "+" : ""}{(stock.percentPlusMinus * 100)?.toFixed(2) || 'N/A'}%
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
                      defaultValue={stock.busModel || ''}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profit">Profit (1-10)</Label>
                    <Input 
                      id="profit"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      defaultValue={stock.profit || ''}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="balSheet">Balance Sheet (1-10)</Label>
                    <Input 
                      id="balSheet"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      defaultValue={stock.balSheet || ''}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moat">Moat (1-10)</Label>
                    <Input 
                      id="moat"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      defaultValue={stock.moat || ''}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="growth">Growth (1-10)</Label>
                    <Input 
                      id="growth"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      defaultValue={stock.growth || ''}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="management">Management (1-10)</Label>
                    <Input 
                      id="management"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      defaultValue={stock.management || ''}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="histReturn">Historical Returns (1-10)</Label>
                    <Input 
                      id="histReturn"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      defaultValue={stock.histReturn || ''}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Save Changes</Button>
                  <Button variant="outline" className="flex-1">Reset</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 