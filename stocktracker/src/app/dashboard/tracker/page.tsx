import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

// Stock data from Excel spreadsheet (removing %, Type, and Res columns)
const stockData = [
  {
    "ticker": "ADEYEY",
    "pe5y": 82.44,
    "peLtm": 57.47,
    "peFwd": 43.50,
    "week52Low": 11.23,
    "week52High": 19.94,
    "range": 77.5,
    "week52HighDate": "06/10/2025",
    "daysOff52w": 30,
    "over10Under6": "Y",
    "percentOff52wLow": 57.54,
    "percentOff52wHigh": -11.27,
    "isGreenRange": false,
    "isGreenOver10Under6": true,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "LULU",
    "pe5y": 44.38,
    "peLtm": 16.10,
    "peFwd": 16.35,
    "week52Low": 219.97,
    "week52High": 423.32,
    "range": 92.4,
    "week52HighDate": "01/30/2025",
    "daysOff52w": 161,
    "over10Under6": "",
    "percentOff52wLow": 8.43,
    "percentOff52wHigh": -43.65,
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "CRM",
    "pe5y": 111.89,
    "peLtm": 42.38,
    "peFwd": 23.33,
    "week52Low": 230.00,
    "week52High": 369.00,
    "range": 60.4,
    "week52HighDate": "12/04/2024",
    "daysOff52w": 218,
    "over10Under6": "",
    "percentOff52wLow": 14.77,
    "percentOff52wHigh": -28.46,
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "GOOGL",
    "pe5y": 24.95,
    "peLtm": 19.70,
    "peFwd": 18.51,
    "week52Low": 140.53,
    "week52High": 207.05,
    "range": 47.3,
    "week52HighDate": "02/04/2025",
    "daysOff52w": 156,
    "over10Under6": "",
    "percentOff52wLow": 26.39,
    "percentOff52wHigh": -14.21,
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "BRK.B",
    "pe5y": 8.06,
    "peLtm": 12.76,
    "peFwd": 23.55,
    "week52Low": 405.03,
    "week52High": 542.07,
    "range": 33.8,
    "week52HighDate": "05/02/2025",
    "daysOff52w": 69,
    "over10Under6": "",
    "percentOff52wLow": 18.08,
    "percentOff52wHigh": -11.77,
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "AMZN",
    "pe5y": 52.40,
    "peLtm": 36.30,
    "peFwd": 35.84,
    "week52Low": 151.61,
    "week52High": 242.52,
    "range": 60.0,
    "week52HighDate": "02/04/2025",
    "daysOff52w": 156,
    "over10Under6": "",
    "percentOff52wLow": 46.60,
    "percentOff52wHigh": -8.35,
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "MEDP",
    "pe5y": 33.03,
    "peLtm": 24.49,
    "peFwd": 25.76,
    "week52Low": 250.05,
    "week52High": 459.77,
    "range": 83.9,
    "week52HighDate": "07/17/2024",
    "daysOff52w": 358,
    "over10Under6": "",
    "percentOff52wLow": 31.27,
    "percentOff52wHigh": -28.61,
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "SHOP",
    "pe5y": 245.40,
    "peLtm": 92.19,
    "peFwd": 82.85,
    "week52Low": 48.56,
    "week52High": 129.38,
    "range": 166.4,
    "week52HighDate": "02/18/2025",
    "daysOff52w": 142,
    "over10Under6": "",
    "percentOff52wLow": 137.15,
    "percentOff52wHigh": -10.99,
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "FTNT",
    "pe5y": 48.46,
    "peLtm": 44.31,
    "peFwd": 40.54,
    "week52Low": 54.57,
    "week52High": 114.82,
    "range": 110.4,
    "week52HighDate": "02/18/2025",
    "daysOff52w": 142,
    "over10Under6": "",
    "percentOff52wLow": 83.62,
    "percentOff52wHigh": -12.73,
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "MELI",
    "pe5y": 84.80,
    "peLtm": 60.93,
    "peFwd": 48.14,
    "week52Low": 1579.78,
    "week52High": 2645.22,
    "range": 67.4,
    "week52HighDate": "07/01/2025",
    "daysOff52w": 9,
    "over10Under6": "",
    "percentOff52wLow": 52.05,
    "percentOff52wHigh": -9.19,
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "BABA",
    "pe5y": 24.59,
    "peLtm": 13.60,
    "peFwd": 11.28,
    "week52Low": 72.95,
    "week52High": 148.43,
    "range": 103.5,
    "week52HighDate": "03/17/2025",
    "daysOff52w": 115,
    "over10Under6": "",
    "percentOff52wLow": 46.18,
    "percentOff52wHigh": -28.15,
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "PAYC",
    "pe5y": 74.90,
    "peLtm": 33.42,
    "peFwd": 25.60,
    "week52Low": 139.50,
    "week52High": 267.76,
    "range": 91.9,
    "week52HighDate": "06/05/2025",
    "daysOff52w": 35,
    "over10Under6": "Y",
    "percentOff52wLow": 64.42,
    "percentOff52wHigh": -14.34,
    "isGreenRange": false,
    "isGreenOver10Under6": true,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "PANW",
    "pe5y": 119.59,
    "peLtm": 117.92,
    "peFwd": 58.66,
    "week52Low": 142.01,
    "week52High": 208.39,
    "range": 46.7,
    "week52HighDate": "02/19/2025",
    "daysOff52w": 141,
    "over10Under6": "",
    "percentOff52wLow": 35.25,
    "percentOff52wHigh": -7.83,
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "LVMUY",
    "pe5y": 27.00,
    "peLtm": 21.17,
    "peFwd": 22.80,
    "week52Low": 101.80,
    "week52High": 159.97,
    "range": 57.1,
    "week52HighDate": "01/27/2025",
    "daysOff52w": 164,
    "over10Under6": "",
    "percentOff52wLow": 15.87,
    "percentOff52wHigh": -26.26,
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "ASML",
    "pe5y": 39.84,
    "peLtm": 33.68,
    "peFwd": 29.36,
    "week52Low": 578.51,
    "week52High": 1110.09,
    "range": 91.9,
    "week52HighDate": "07/11/2024",
    "daysOff52w": 364,
    "over10Under6": "",
    "percentOff52wLow": 38.65,
    "percentOff52wHigh": -27.75,
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "MSFT",
    "pe5y": 34.40,
    "peLtm": 38.91,
    "peFwd": 37.44,
    "week52Low": 344.79,
    "week52High": 506.78,
    "range": 47.0,
    "week52HighDate": "07/09/2025",
    "daysOff52w": 1,
    "over10Under6": "",
    "percentOff52wLow": 45.45,
    "percentOff52wHigh": -1.05,
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "V",
    "pe5y": 31.11,
    "peLtm": 36.39,
    "peFwd": 31.42,
    "week52Low": 252.70,
    "week52High": 375.51,
    "range": 48.6,
    "week52HighDate": "06/11/2025",
    "daysOff52w": 29,
    "over10Under6": "",
    "percentOff52wLow": 40.83,
    "percentOff52wHigh": -5.23,
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "MA",
    "pe5y": 37.75,
    "peLtm": 39.64,
    "peFwd": 35.34,
    "week52Low": 428.86,
    "week52High": 594.71,
    "range": 38.7,
    "week52HighDate": "06/11/2025",
    "daysOff52w": 29,
    "over10Under6": "",
    "percentOff52wLow": 31.40,
    "percentOff52wHigh": -5.24,
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "ADBE",
    "pe5y": 47.79,
    "peLtm": 23.88,
    "peFwd": 18.03,
    "week52Low": 332.01,
    "week52High": 587.75,
    "range": 77.0,
    "week52HighDate": "09/12/2024",
    "daysOff52w": 301,
    "over10Under6": "",
    "percentOff52wLow": 11.87,
    "percentOff52wHigh": -36.80,
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "CPRT",
    "pe5y": 33.16,
    "peLtm": 31.49,
    "peFwd": 31.05,
    "week52Low": 47.33,
    "week52High": 64.38,
    "range": 36.0,
    "week52HighDate": "11/27/2024",
    "daysOff52w": 225,
    "over10Under6": "",
    "percentOff52wLow": 1.39,
    "percentOff52wHigh": -25.46,
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "LLY",
    "pe5y": 49.06,
    "peLtm": 65.19,
    "peFwd": 36.32,
    "week52Low": 677.09,
    "week52High": 972.53,
    "range": 43.6,
    "week52HighDate": "08/22/2024",
    "daysOff52w": 322,
    "over10Under6": "",
    "percentOff52wLow": 16.77,
    "percentOff52wHigh": -18.70,
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  }
]

export default function TrackerPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-800 bg-green-100 p-4 rounded-lg">
          Stock Universe
        </h1>
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-semibold">Date:</span> 7/10/2025 | 
          <span className="font-semibold ml-2">Count:</span> 21 stocks
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            Research Tracking FS 1.5
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Ticker</TableHead>
                <TableHead className="text-center">5Y P/E</TableHead>
                <TableHead className="text-center">P/E LTM</TableHead>
                <TableHead className="text-center">P/E Fwd</TableHead>
                <TableHead className="text-center">52-Wk Low</TableHead>
                <TableHead className="text-center">52-Wk Hi</TableHead>
                <TableHead className="text-center">Range</TableHead>
                <TableHead className="text-center">52-Wk Hi Date</TableHead>
                <TableHead className="text-center">Days Off 52w</TableHead>
                <TableHead className="text-center">>10%, <6i</TableHead>
                <TableHead className="text-center">% off 52-Wk Lo</TableHead>
                <TableHead className="text-center">% off 52-Wk Hi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.map((stock) => (
                <TableRow 
                  key={stock.ticker}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Link href={`/dashboard/tracker/${stock.ticker.toLowerCase()}`} className="contents">
                    <TableCell className="font-medium">{stock.ticker}</TableCell>
                    <TableCell className="text-center">{stock.pe5y}</TableCell>
                    <TableCell className="text-center">{stock.peLtm}</TableCell>
                    <TableCell className="text-center">{stock.peFwd}</TableCell>
                    <TableCell className="text-center">{stock.week52Low}</TableCell>
                    <TableCell className="text-center">{stock.week52High}</TableCell>
                    <TableCell 
                      className={`text-center font-medium ${
                        stock.isGreenRange 
                          ? "bg-green-200 text-green-800" 
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {stock.range}%
                    </TableCell>
                    <TableCell className="text-center">{stock.week52HighDate}</TableCell>
                    <TableCell className="text-center">{stock.daysOff52w}</TableCell>
                    <TableCell 
                      className={`text-center font-bold ${
                        stock.isGreenOver10Under6 
                          ? "bg-green-200 text-green-800" 
                          : ""
                      }`}
                    >
                      {stock.over10Under6}
                    </TableCell>
                    <TableCell 
                      className={`text-center font-medium ${
                        stock.percentOff52wLow > 0 
                          ? "bg-red-200 text-red-800" 
                          : ""
                      }`}
                    >
                      {stock.percentOff52wLow.toFixed(2)}%
                    </TableCell>
                    <TableCell 
                      className={`text-center font-medium ${
                        stock.isGreenPercentOffHigh 
                          ? "bg-green-200 text-green-800" 
                          : ""
                      }`}
                    >
                      {stock.percentOff52wHigh.toFixed(2)}%
                    </TableCell>
                  </Link>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-800">Green Range Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stockData.filter(stock => stock.isGreenRange).length}
            </div>
            <p className="text-sm text-gray-600">
              Stocks with green range values
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-800">>10%, <6i Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stockData.filter(stock => stock.isGreenOver10Under6).length}
            </div>
            <p className="text-sm text-gray-600">
              Stocks meeting criteria
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-800">% off 52-Wk Hi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stockData.filter(stock => stock.isGreenPercentOffHigh).length}
            </div>
            <p className="text-sm text-gray-600">
              All stocks (green background)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 