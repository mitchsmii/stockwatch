import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { TrendingUp, BarChart3, Bell, Target, Zap, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">IntrinArc</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              🚀 Advanced Investment Analysis Platform
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Master Your
              <span className="text-blue-600"> Portfolio</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Advanced investment analysis with real-time pricing, intrinsic value calculations, and market insights. 
              Make informed investment decisions with our comprehensive IntrinArc dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Launch Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Features for Intelligent Investing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to analyze, track, and optimize your investment portfolio with IntrinArc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Pricing & Valuation */}
            <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg">Pricing & Valuation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive pricing analysis with intrinsic value calculations, 
                  target prices, and upside potential metrics.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Intrinsic Value</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Prices</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Upside Analysis</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Universe */}
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Market Universe</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Research tracking with P/E ratios, 52-week ranges, and advanced 
                  screening criteria for optimal stock selection.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>P/E Analysis</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>52-Week Ranges</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Research Tracking</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research & Analysis */}
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Research & Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive research tracking with ratings, intrinsic values, 
                  growth metrics, and dividend analysis for informed decisions.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Research Ratings</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Intrinsic Values</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Growth Metrics</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">21+</div>
              <div className="text-gray-600">Stocks Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">Real-time</div>
              <div className="text-gray-600">Market Data</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">Instant</div>
              <div className="text-gray-600">Alerts & Notifications</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Investing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of investors who trust IntrinArc for their portfolio management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Zap className="w-5 h-5 mr-2" />
                Start Tracking Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
              <Shield className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">IntrinArc</span>
              </div>
              <p className="text-gray-400">
                Advanced investment analysis and portfolio management platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Pricing & Valuation</li>
                <li>Market Universe</li>
                <li>Market Alerts</li>
                <li>Portfolio Tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 IntrinArc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
