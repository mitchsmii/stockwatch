"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useState } from "react"

// Complete stock data for the green section (same as tracker page)
const stockData = [
  {
    "ticker": "ADEYEY",
    "percentage": 9,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": true,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "LULU",
    "percentage": 8,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "CRM",
    "percentage": 1,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "GOOGL",
    "percentage": 9,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "BRK.B",
    "percentage": 2,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "AMZN",
    "percentage": 0,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "MEDP",
    "percentage": 3,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "SHOP",
    "percentage": 7,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "FTNT",
    "percentage": 1,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "MELI",
    "percentage": 5,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "BABA",
    "percentage": 1,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "PAYC",
    "percentage": 1,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": true,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "PANW",
    "percentage": 5,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "LVMUY",
    "percentage": 0,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "ASML",
    "percentage": 5,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "MSFT",
    "percentage": 1,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "V",
    "percentage": 3,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "MA",
    "percentage": 2,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "ADBE",
    "percentage": 8,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": false,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "CPRT",
    "percentage": 8,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  },
  {
    "ticker": "LLY",
    "percentage": 1,
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
    "type": "QG",
    "res": "QG",
    "isGreenRange": true,
    "isGreenOver10Under6": false,
    "isGreenPercentOffHigh": true
  }
]

// Pricing & Valuation data for yellow section
const pricingData = [
  {
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "hlc": "X",
    "mktCap": 2812345,
    "price": 175.43,
    "oneDay": 2.34,
    "oneWeek": 1.8,
    "oneMonth": -3.2,
    "oneYear": 12.5,
    "intValue": 185.00,
    "upside": 5.45,
    "tenYearRet": 17.7,
    "vsMkt": 12.9,
    "buyPrice": 185.00,
    "percentDiff": 5.45,
    "lastUpdated": "2 min ago"
  },
  {
    "ticker": "TSLA",
    "name": "Tesla, Inc.",
    "hlc": "",
    "mktCap": 565432,
    "price": 242.54,
    "oneDay": -1.23,
    "oneWeek": -3.7,
    "oneMonth": -7.7,
    "oneYear": -17.2,
    "intValue": 220.00,
    "upside": -9.3,
    "tenYearRet": 17.9,
    "vsMkt": 13.1,
    "buyPrice": 220.00,
    "percentDiff": -9.3,
    "lastUpdated": "5 min ago"
  },
  {
    "ticker": "MSFT",
    "name": "Microsoft Corp.",
    "hlc": "X",
    "mktCap": 3123456,
    "price": 378.85,
    "oneDay": 0.87,
    "oneWeek": 2.1,
    "oneMonth": 4.5,
    "oneYear": 8.9,
    "intValue": 400.00,
    "upside": 5.58,
    "tenYearRet": 18.2,
    "vsMkt": 13.4,
    "buyPrice": 400.00,
    "percentDiff": 5.58,
    "lastUpdated": "1 min ago"
  },
  {
    "ticker": "GOOGL",
    "name": "Alphabet Inc.",
    "hlc": "",
    "mktCap": 1845678,
    "price": 142.56,
    "oneDay": 1.45,
    "oneWeek": -1.2,
    "oneMonth": 2.8,
    "oneYear": 15.3,
    "intValue": 155.00,
    "upside": 8.72,
    "tenYearRet": 16.8,
    "vsMkt": 11.9,
    "buyPrice": 155.00,
    "percentDiff": 8.72,
    "lastUpdated": "3 min ago"
  },
  {
    "ticker": "AMZN",
    "name": "Amazon.com Inc.",
    "hlc": "X",
    "mktCap": 1876543,
    "price": 178.75,
    "oneDay": -0.32,
    "oneWeek": 1.5,
    "oneMonth": 6.2,
    "oneYear": 22.1,
    "intValue": 190.00,
    "upside": 6.29,
    "tenYearRet": 19.1,
    "vsMkt": 14.2,
    "buyPrice": 190.00,
    "percentDiff": 6.29,
    "lastUpdated": "4 min ago"
  },
  {
    "ticker": "NVDA",
    "name": "NVIDIA Corp.",
    "hlc": "",
    "mktCap": 1234567,
    "price": 875.23,
    "oneDay": 3.45,
    "oneWeek": 8.9,
    "oneMonth": 15.6,
    "oneYear": 89.2,
    "intValue": 950.00,
    "upside": 8.54,
    "tenYearRet": 25.3,
    "vsMkt": 20.4,
    "buyPrice": 950.00,
    "percentDiff": 8.54,
    "lastUpdated": "1 min ago"
  },
  {
    "ticker": "META",
    "name": "Meta Platforms Inc.",
    "hlc": "X",
    "mktCap": 987654,
    "price": 445.67,
    "oneDay": 1.23,
    "oneWeek": 2.8,
    "oneMonth": 12.4,
    "oneYear": 45.6,
    "intValue": 480.00,
    "upside": 7.71,
    "tenYearRet": 21.5,
    "vsMkt": 16.6,
    "buyPrice": 480.00,
    "percentDiff": 7.71,
    "lastUpdated": "2 min ago"
  }
]

// Market alerts data for orange section
const alertsData = [
  {
    "id": 1,
    "type": "Price Alert",
    "ticker": "AAPL",
    "message": "Reached $175.43",
    "severity": "high",
    "timestamp": "2 minutes ago",
    "status": "new"
  },
  {
    "id": 2,
    "type": "Volume Spike",
    "ticker": "TSLA",
    "message": "Volume increased 45%",
    "severity": "medium",
    "timestamp": "15 minutes ago",
    "status": "new"
  },
  {
    "id": 3,
    "type": "News Alert",
    "ticker": "MSFT",
    "message": "Earnings report released",
    "severity": "high",
    "timestamp": "1 hour ago",
    "status": "read"
  },
  {
    "id": 4,
    "type": "Technical Alert",
    "ticker": "GOOGL",
    "message": "Crossed 50-day moving average",
    "severity": "low",
    "timestamp": "30 minutes ago",
    "status": "new"
  }
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("pricing")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Tracker Dashboard</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            Pricing & Valuation
          </TabsTrigger>
          <TabsTrigger value="universe" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Stock Universe
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            Market Alerts
          </TabsTrigger>
        </TabsList>

        {/* Yellow Section - Pricing & Valuation */}
        <TabsContent value="pricing" className="space-y-6">
          <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                Pricing & Valuation
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Hlc</TableHead>
                    <TableHead className="text-center">Mkt Cap</TableHead>
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead className="text-center">1D</TableHead>
                    <TableHead className="text-center">1WK</TableHead>
                    <TableHead className="text-center">1M</TableHead>
                    <TableHead className="text-center">1YR</TableHead>
                    <TableHead className="text-center">Int Value</TableHead>
                    <TableHead className="text-center">+/-</TableHead>
                    <TableHead className="text-center">10Y Ret %</TableHead>
                    <TableHead className="text-center">vs Mkt</TableHead>
                    <TableHead className="text-center">Buy Price</TableHead>
                    <TableHead className="text-center">% +/-</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingData.map((stock) => (
                    <TableRow 
                      key={stock.ticker}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Link href={`/dashboard/tracker/${stock.ticker.toLowerCase()}`} className="contents">
                        <TableCell className="text-center font-bold">{stock.hlc}</TableCell>
                        <TableCell className="text-center">{(stock.mktCap / 1000).toFixed(0)}</TableCell>
                        <TableCell className="text-center font-bold">${stock.price}</TableCell>
                        <TableCell 
                          className={`text-center font-medium ${
                            stock.oneDay >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.oneDay >= 0 ? "+" : ""}{stock.oneDay}%
                        </TableCell>
                        <TableCell 
                          className={`text-center font-medium ${
                            stock.oneWeek >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.oneWeek >= 0 ? "+" : ""}{stock.oneWeek}%
                        </TableCell>
                        <TableCell 
                          className={`text-center font-medium ${
                            stock.oneMonth >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.oneMonth >= 0 ? "+" : ""}{stock.oneMonth}%
                        </TableCell>
                        <TableCell 
                          className={`text-center font-medium ${
                            stock.oneYear >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.oneYear >= 0 ? "+" : ""}{stock.oneYear}%
                        </TableCell>
                        <TableCell className="text-center">${stock.intValue}</TableCell>
                        <TableCell 
                          className={`text-center font-medium ${
                            stock.upside >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.upside >= 0 ? "+" : ""}{stock.upside}%
                        </TableCell>
                        <TableCell className="text-center">{stock.tenYearRet}%</TableCell>
                        <TableCell className="text-center">{stock.vsMkt}%</TableCell>
                        <TableCell className="text-center">${stock.buyPrice}</TableCell>
                        <TableCell 
                          className={`text-center font-medium ${
                            stock.percentDiff >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.percentDiff >= 0 ? "+" : ""}{stock.percentDiff}%
                        </TableCell>
                      </Link>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Green Section - Stock Universe */}
        <TabsContent value="universe" className="space-y-6">
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
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
                    <TableHead className="text-center">10%, 6i</TableHead>
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
        </TabsContent>

        {/* Orange Section - Market Alerts */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                Market Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Type</TableHead>
                    <TableHead className="text-center">Ticker</TableHead>
                    <TableHead className="text-center">Message</TableHead>
                    <TableHead className="text-center">Severity</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertsData.map((alert) => (
                    <TableRow 
                      key={alert.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">{alert.type}</TableCell>
                      <TableCell className="text-center font-bold">{alert.ticker}</TableCell>
                      <TableCell className="text-center">{alert.message}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="secondary" 
                          className={`${
                            alert.severity === "high" ? "bg-red-200 text-red-800" :
                            alert.severity === "medium" ? "bg-orange-200 text-orange-800" :
                            "bg-yellow-200 text-yellow-800"
                          }`}
                        >
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="secondary" 
                          className={`${
                            alert.status === "new" ? "bg-blue-200 text-blue-800" :
                            "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-500">{alert.timestamp}</TableCell>
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