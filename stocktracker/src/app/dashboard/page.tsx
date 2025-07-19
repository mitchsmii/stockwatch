import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Tracker Dashboard</h1>
        <SidebarTrigger />
      </div>
      
      <Tabs defaultValue="green" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="green">Green</TabsTrigger>
          <TabsTrigger value="yellow">Yellow</TabsTrigger>
          <TabsTrigger value="orange">Orange</TabsTrigger>
        </TabsList>
        
        <TabsContent value="green" className="mt-6">
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Portfolio Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900">Total Value</p>
                    <p className="text-sm text-gray-600">Portfolio worth</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$45,230.50</p>
                    <p className="text-sm text-green-600">+$2,340.25</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900">Daily Gain</p>
                    <p className="text-sm text-gray-600">Today's performance</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+5.45%</p>
                    <p className="text-sm text-green-600">+$2,340.25</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900">Monthly Return</p>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+12.34%</p>
                    <p className="text-sm text-green-600">+$4,950.75</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Badge variant="secondary" className="bg-green-200 text-green-800 hover:bg-green-300">
                  +5.45% today
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="yellow" className="mt-6">
          <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900">AAPL</p>
                    <p className="text-sm text-gray-600">Apple Inc.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$175.43</p>
                    <p className="text-sm text-green-600">+2.34%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900">TSLA</p>
                    <p className="text-sm text-gray-600">Tesla, Inc.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">$242.54</p>
                    <p className="text-sm text-red-600">-1.23%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900">MSFT</p>
                    <p className="text-sm text-gray-600">Microsoft Corp.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$378.85</p>
                    <p className="text-sm text-green-600">+0.87%</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 hover:bg-yellow-300">
                  3 stocks tracked
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orange" className="mt-6">
          <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                Market Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Price Alert</p>
                    <p className="text-sm text-gray-600">AAPL reached $175.43</p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Volume Spike</p>
                    <p className="text-sm text-gray-600">TSLA volume increased 45%</p>
                    <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">News Alert</p>
                    <p className="text-sm text-gray-600">MSFT earnings report released</p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Badge variant="secondary" className="bg-orange-200 text-orange-800 hover:bg-orange-300">
                  3 new alerts
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 