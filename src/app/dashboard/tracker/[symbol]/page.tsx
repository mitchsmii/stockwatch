import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"

// Sample stock data (in a real app, this would come from an API or database)
const sampleStocks = {
  aapl: {
    symbol: "AAPL",
    name: "Apple Inc.",
    held: true,
    rating: 9.7,
    price: 175.04,
    marketCap: "2.8T",
    peRatio: 28.5,
    dividendYield: 0.5,
    lastReport: "2024-03-15",
    researchLevel: 3,
    description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide."
  },
  msft: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    held: false,
    rating: 8.5,
    price: 415.32,
    marketCap: "3.1T",
    peRatio: 35.2,
    dividendYield: 0.7,
    lastReport: "2024-03-10",
    researchLevel: 2,
    description: "Microsoft Corporation develops and supports software, services, devices, and solutions worldwide."
  },
  googl: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    held: true,
    rating: 7.2,
    price: 142.56,
    marketCap: "1.8T",
    peRatio: 24.8,
    dividendYield: 0,
    lastReport: "2024-03-01",
    researchLevel: 3,
    description: "Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America."
  },
  amzn: {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    held: false,
    rating: 5.8,
    price: 178.75,
    marketCap: "1.8T",
    peRatio: 60.3,
    dividendYield: 0,
    lastReport: "2024-02-28",
    researchLevel: 1,
    description: "Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally."
  },
  tsla: {
    symbol: "TSLA",
    name: "Tesla Inc.",
    held: true,
    rating: 3.5,
    price: 177.77,
    marketCap: "565B",
    peRatio: 42.1,
    dividendYield: 0,
    lastReport: "2024-03-05",
    researchLevel: 2,
    description: "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally."
  }
}

export default function StockPage({ params }: { params: { symbol: string } }) {
  const stock = sampleStocks[params.symbol.toLowerCase() as keyof typeof sampleStocks]

  if (!stock) {
    notFound()
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{stock.name} ({stock.symbol})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-lg font-medium">${stock.price.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="text-lg font-medium">{stock.marketCap}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">P/E Ratio</p>
              <p className="text-lg font-medium">{stock.peRatio}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dividend Yield</p>
              <p className="text-lg font-medium">{stock.dividendYield}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className={`text-lg font-medium ${
                stock.rating >= 8 ? "text-green-600" :
                stock.rating >= 6 ? "text-green-500" :
                stock.rating >= 4 ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {stock.rating.toFixed(1)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Held</p>
              <p className="text-lg font-medium">
                {stock.held ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  "No"
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Report</p>
              <div className="space-y-0.5">
                <p className="text-lg font-medium">{new Date(stock.lastReport).toLocaleDateString()}</p>
                <p className={`text-xs ${
                  stock.researchLevel === 3 ? "text-green-600" :
                  stock.researchLevel === 2 ? "text-orange-500" :
                  "text-red-600"
                }`}>
                  Level {stock.researchLevel} Research
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About {stock.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{stock.description}</p>
        </CardContent>
      </Card>
    </div>
  )
}