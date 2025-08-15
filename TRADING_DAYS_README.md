# IntrinArc Trading Days API

This document describes the new functionality for fetching the most recent 5 consecutive U.S. market trading days and computing weekly bars using the Polygon API.

## Overview

The new functionality provides methods to:
1. Fetch the most recent 5 consecutive U.S. market trading days
2. Compute a weekly bar from those 5 days
3. Handle multiple symbols efficiently with parallel processing

## New Interfaces

### DailyBar
```typescript
export interface DailyBar {
  date: string          // Date in YYYY-MM-DD format
  open: number          // Opening price
  high: number          // Highest price during the day
  low: number           // Lowest price during the day
  close: number         // Closing price
  volume: number        // Trading volume
  vwap?: number         // Volume-weighted average price (optional)
  timestamp: number     // Unix timestamp
}
```

### WeeklyBar
```typescript
export interface WeeklyBar {
  symbol: string        // Stock symbol (e.g., "AAPL")
  open: number          // Opening price (Day 1 open)
  high: number          // Highest price across all 5 days
  low: number           // Lowest price across all 5 days
  close: number         // Closing price (Day 5 close)
  volume: number        // Total volume across all 5 days
  vwap?: number         // Volume-weighted average price across 5 days
  startDate: string     // Start date of the week
  endDate: string       // End date of the week
  timestamp: number     // Unix timestamp of the last day
}
```

## New Methods

### 1. getLastFiveTradingDays(symbol: string)
Fetches the most recent 5 consecutive U.S. market trading days.

**Strategy:**
- Requests a broad date window (last 30 calendar days)
- Uses `sort=desc&limit=10` to get more data than needed
- Takes the first 5 results (most recent) since `sort=desc` returns newest first
- Sorts results chronologically (oldest to newest) for weekly calculations
- Returns exactly 5 daily bars including today if it's a trading day

**Example:**
```typescript
import { PolygonApi } from '@/lib/api/polygonApi'

const dailyBars = await PolygonApi.getLastFiveTradingDays('AAPL')
console.log(dailyBars)
// Returns array of 5 DailyBar objects
```

### 2. computeWeeklyBar(symbol: string, dailyBars: DailyBar[])
Computes a weekly bar from 5 consecutive trading days.

**Calculations:**
- **Open**: Day 1 open price
- **Close**: Day 5 close price
- **High**: Maximum of all daily highs
- **Low**: Minimum of all daily lows
- **Volume**: Sum of all daily volumes
- **VWAP**: Volume-weighted average across all 5 days (if all days have VWAP data)

**Example:**
```typescript
import { PolygonApi } from '@/lib/api/polygonApi'

const dailyBars = await PolygonApi.getLastFiveTradingDays('AAPL')
const weeklyBar = PolygonApi.computeWeeklyBar('AAPL', dailyBars)
console.log(weeklyBar)
// Returns WeeklyBar object
```

### 3. getWeeklyBar(symbol: string)
Combines fetching and computing - gets daily bars and returns a weekly bar.

**Example:**
```typescript
import { PolygonApi } from '@/lib/api/polygonApi'

const weeklyBar = await PolygonApi.getWeeklyBar('AAPL')
console.log(weeklyBar)
// Returns WeeklyBar object
```

### 4. getMultipleWeeklyBars(symbols: string[])
Fetches weekly bars for multiple symbols using parallel processing.

**Example:**
```typescript
import { PolygonApi } from '@/lib/api/polygonApi'

const symbols = ['AAPL', 'MSFT', 'GOOGL']
const weeklyBars = await PolygonApi.getMultipleWeeklyBars(symbols)
console.log(weeklyBars)
// Returns array of WeeklyBar objects
```

### 5. getMonthlyQuoteExact(symbol: string)
Gets monthly data with exact 1-month calculation (by calendar date, not by 30 days).

**Strategy:**
- Calculates exactly 1 month ago from today using calendar dates
- Handles different month lengths automatically (28, 30, 31 days)
- No more "30 days" approximation
- Perfect for financial reporting and analysis

**Example:**
```typescript
import { PolygonApi } from '@/lib/api/polygonApi'

const monthlyQuote = await PolygonApi.getMonthlyQuoteExact('AAPL')
console.log(monthlyQuote)
// Returns StockQuote with exact monthly data
```

### 6. getMultipleMonthlyQuotesExact(symbols: string[])
Fetches monthly quotes for multiple symbols using exact 1-month calculation.

**Example:**
```typescript
import { PolygonApi } from '@/lib/api/polygonApi'

const symbols = ['AAPL', 'MSFT', 'GOOGL']
const monthlyQuotes = await PolygonApi.getMultipleMonthlyQuotesExact(symbols)
console.log(monthlyQuotes)
// Returns array of StockQuote objects with exact monthly data
```

## API Endpoint Used

The implementation uses Polygon's daily aggregates endpoint:
```
GET /v2/aggs/ticker/{symbol}/range/1/day/{fromDate}/{toDate}
```

**Parameters:**
- `adjusted=true` - Uses adjusted prices
- `sort=desc` - Gets most recent data first
- `limit=10` - Gets more data than needed to ensure we have 5 trading days
- `fromDate` - 30 days ago (broad window)
- `toDate` - Today

## Key Features

### ✅ **Trading Day Accuracy**
- Automatically handles weekends and market holidays
- No manual calendar calculations needed
- Polygon API returns only actual trading days
- **Always includes today if it's a trading day**
- **Gets the 5 most recent consecutive trading days**

### ✅ **Data Consistency**
- Always returns exactly 5 consecutive trading days
- Handles edge cases (month-end, year-end, holidays)
- Chronological ordering guaranteed

### ✅ **Exact Monthly Calculation**
- **Calendar-based**: Always exactly 1 month ago from today (not 30 days)
- **Month-length aware**: Handles 28, 30, and 31-day months automatically
- **Financial accuracy**: Perfect for monthly reporting and analysis
- **User expectation**: Matches how people think about "1 month ago"

### ✅ **Performance**
- Parallel processing for multiple symbols
- Efficient API calls with proper limits
- Minimal data transfer

### ✅ **Error Handling**
- Graceful fallbacks for missing data
- Comprehensive logging for debugging
- Null safety for optional fields

## Usage Examples

### Basic Usage
```typescript
// Get weekly bar for a single stock
const aaplWeekly = await PolygonApi.getWeeklyBar('AAPL')
if (aaplWeekly) {
  console.log(`AAPL weekly: ${aaplWeekly.open} → ${aaplWeekly.close}`)
  console.log(`Weekly range: ${aaplWeekly.low} - ${aaplWeekly.high}`)
  console.log(`Total volume: ${aaplWeekly.volume.toLocaleString()}`)
}
```

### Multiple Stocks
```typescript
// Get weekly bars for multiple stocks
const symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA']
const weeklyBars = await PolygonApi.getMultipleWeeklyBars(symbols)

weeklyBars.forEach(bar => {
  const change = ((bar.close - bar.open) / bar.open * 100).toFixed(2)
  console.log(`${bar.symbol}: ${change}% (${bar.open} → ${bar.close})`)
})
```

### Custom Analysis
```typescript
// Get daily bars for custom analysis
const dailyBars = await PolygonApi.getLastFiveTradingDays('AAPL')
const priceChanges = dailyBars.map((bar, i) => {
  if (i === 0) return 0
  return ((bar.close - dailyBars[i-1].close) / dailyBars[i-1].close * 100).toFixed(2)
})
console.log('Daily changes:', priceChanges.slice(1)) // Skip first day
```

### Exact Monthly Calculation Examples
```typescript
// Get exact monthly data (not 30 days)
const monthlyQuote = await PolygonApi.getMonthlyQuoteExact('AAPL')

// Examples of exact month calculations:
// Aug 15 → Jul 15: 32 days (July has 31 days)
// Jul 15 → Jun 15: 30 days (June has 30 days)  
// Feb 15 → Jan 15: 29 days (February has 28 days in 2024)
// Apr 15 → Mar 15: 31 days (March has 31 days)
```

## Integration with Existing Code

The new functionality is designed to work alongside existing methods:
- `getQuote()` - Current day data
- `getWeeklyQuote()` - Weekly change calculation
- `getMonthlyQuote()` - Monthly change calculation
- `getLastFiveTradingDays()` - **NEW** - 5 consecutive trading days
- `getWeeklyBar()` - **NEW** - Weekly OHLCV bar

## Testing

The functionality has been tested with:
- ✅ Single symbol requests
- ✅ Multiple symbol parallel processing
- ✅ Edge case handling
- ✅ Data validation
- ✅ Error scenarios

## Dependencies

- Polygon.io API key (`NEXT_PUBLIC_POLYGON_API_KEY`)
- Node.js Date handling
- TypeScript interfaces for type safety

## Notes

- **Market Hours**: Results are based on U.S. market trading days
- **Data Freshness**: Data is real-time during market hours
- **API Limits**: Respects Polygon API rate limits
- **Error Handling**: Gracefully handles API failures and missing data

## Recent Fix

**Issue Resolved**: The function now correctly includes today's trading data when available. Previously, it was missing the most recent trading day due to incorrect handling of the `sort=desc` parameter.

**Solution**: 
- Changed from `limit=5` to `limit=10` to ensure we have enough data
- Take the first 5 results from `sort=desc` (newest first) instead of the last 5
- This guarantees we get the 5 most recent trading days including today 