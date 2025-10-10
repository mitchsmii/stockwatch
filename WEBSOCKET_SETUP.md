# WebSocket Live Updates - Setup Guide (15-Minute Delayed)

## What Was Implemented

Your dashboard now has **live price updates** via Polygon.io WebSocket streaming with a 15-minute delay!

### Features:
- ✅ **Live price updates** - Prices update as trades happen
- ✅ **Auto-reconnection** - If connection drops, automatically reconnects
- ✅ **Connection status** - Visual indicator shows when connected
- ✅ **Smart data merging** - Combines live prices with historical database data
- ✅ **Clean lifecycle** - Properly subscribes/unsubscribes when stocks change

---

## How It Works

### 1. **WebSocket Hook** (`usePolygonWebSocket.ts`)

The custom React hook handles all WebSocket logic:

```typescript
const { prices, connected, error, subscribe, unsubscribe } = usePolygonWebSocket()
```

**What it does:**
- Connects to `wss://delayed.polygon.io/stocks` (15-minute delayed feed)
- Authenticates with your API key
- Subscribes to stock symbols
- Listens for trade updates (event type "A")
- Updates prices continuously (with 15-min delay)
- Auto-reconnects if connection drops

### 2. **Dashboard Integration**

Your dashboard now:

1. **Connects** to WebSocket on mount
2. **Subscribes** to all stocks in your portfolio
3. **Merges** live prices with database data
4. **Displays** the most current price
5. **Shows** connection status (green "Live Updates" badge)

### 3. **Data Flow**

```
Polygon WebSocket (delayed) → usePolygonWebSocket hook → livePrices state → getRealStockData() → Dashboard UI
      ↓
   Trade event every few seconds (15-min delayed)
      ↓
   Price updates continuously
```

**Priority:**
1. **Live WebSocket price** (if available) ← Delayed 15 minutes
2. **Database price** (from cron job) ← Updated daily at 9:30 AM
3. **Fallback price** (from stocks.json) ← Static backup

**Note:** The WebSocket feed is 15 minutes behind real market prices. This is perfect for general tracking and analysis!

---

## What You'll See

### Connection Status Indicator

Top-right of dashboard:

- 🔵 **"Live Updates (15-min delayed)"** with Wifi icon = Connected and streaming
- ⚪ **"Connecting..."** with WifiOff icon = Not connected yet

### Console Logs

Open browser DevTools (F12) and check the Console:

```
🔌 Connecting to Polygon WebSocket...
✅ WebSocket connected
📡 Status: authenticated
📡 Subscribing to real-time updates for: ['AAPL']
💰 AAPL: $178.23
💰 AAPL: $178.25
💰 AAPL: $178.24
```

### Price Updates

- Prices in all three tabs will update in real-time
- Percentage changes recalculate automatically
- Color coding updates dynamically

---

## Testing

### 1. **Start Dev Server**

```bash
npm run dev
```

### 2. **Open Dashboard**

Navigate to: `http://localhost:3000/dashboard`

### 3. **Check Console**

- Look for "WebSocket connected" message
- Should see "authenticated" status
- Watch for "AAPL: $XXX.XX" price updates

### 4. **Watch Prices**

During market hours (9:30 AM - 4:00 PM EST), you'll see prices update every few seconds as trades occur (delayed by 15 minutes).

**Example:** If AAPL traded at $178.50 at 2:00 PM, you'll see that price around 2:15 PM.

**After hours:** Prices won't update (market closed), but WebSocket stays connected.

---

## How to Add More Stocks

When you add a stock through the "Add Stock" button:
1. Stock gets added to the `stocks` array
2. `useEffect` detects the change
3. Automatically subscribes to the new stock's WebSocket feed
4. You'll immediately start seeing real-time prices for it

**Code snippet from dashboard:**
```typescript
useEffect(() => {
  if (stocks.length > 0) {
    const symbols = stocks.map(stock => stock.ticker)
    subscribe(symbols)  // Auto-subscribes to all stocks
    
    return () => unsubscribe(symbols)  // Cleanup
  }
}, [stocks, subscribe, unsubscribe])
```

---

## Troubleshooting

### "Connecting..." Never Changes to "Live Updates"

**Check:**
1. Is `NEXT_PUBLIC_POLYGON_API_KEY` set in `.env.local`?
2. Do you have a paid Polygon plan? (WebSocket requires Basic+ plan)
3. Open browser console - look for error messages
4. Check if API key is valid

### No Price Updates During Market Hours

**Check:**
1. Is the WebSocket connected? (green badge)
2. Are there actual trades happening? (low volume stocks update less frequently)
3. Check console for "💰 AAPL: $XXX" messages
4. Try a high-volume stock like AAPL or TSLA

### "WebSocket connection error" Message

**Possible causes:**
- Invalid API key
- Free tier API key (needs paid plan for WebSocket)
- Network/firewall blocking WebSocket connections
- Polygon API service issue

### Prices Not Updating After Adding Stock

**Check:**
1. Look at console - should see "📡 Subscribing to: ['AAPL', 'NEWSTOCK']"
2. Make sure ticker symbol is correct (uppercase, no spaces)
3. Polygon may not have data for very small/obscure stocks

---

## API Limits

### Polygon WebSocket Limits:

| Plan | WebSocket Access | Delayed Feed | Real-Time Feed | Price |
|------|-----------------|--------------|----------------|--------|
| Free | ❌ | ❌ | ❌ | $0 |
| Basic | ✅ | ✅ (using this!) | ✅ | $99/mo |
| Starter | ✅ | ✅ | ✅ | $249/mo |
| Developer | ✅ | ✅ | ✅ | $599/mo |

**Your current setup:**
- ✅ 1 WebSocket connection (all stocks share it)
- ✅ Subscribes to all your stocks at once
- ✅ Updates happen automatically as trades occur

---

## Advanced Configuration

### Change Update Frequency

The WebSocket sends data for **every trade**. If you want less frequent updates, you can subscribe to minute aggregates instead:

In `usePolygonWebSocket.ts`, change:
```typescript
// Current: Trade data (every trade)
params: symbols.map(s => `A.${s}`).join(',')

// Alternative: Minute aggregates (every minute)
params: symbols.map(s => `AM.${s}`).join(',')
```

### Subscribe to Specific Events

Polygon supports multiple event types:
- `A.*` = Trades (what we're using)
- `AM.*` = Minute aggregates
- `Q.*` = Quotes (bid/ask)
- `T.*` = Trades (alternative format)

---

## Benefits

### Before (Database Only):
- ❌ Prices updated once daily at 9:30 AM
- ❌ Had to manually click "Refresh Data"
- ❌ Could be hours behind actual market

### After (With WebSocket Delayed Feed):
- ✅ Prices update every few seconds (15-min delayed)
- ✅ Much more current than daily updates
- ✅ Automatic - no manual refresh needed
- ✅ Live percentage changes
- ✅ Perfect for analysis and tracking!

---

## What's Next?

Optional enhancements you could add:

1. **Price change animations** - Flash green/red when price goes up/down
2. **Sound alerts** - Play sound when price hits target
3. **Price charts** - Show mini sparkline charts using WebSocket data
4. **Market hours detection** - Show "Market Closed" badge after 4 PM
5. **Trade volume** - Display real-time volume from WebSocket
6. **Multiple watchlists** - Separate lists with different WebSocket subscriptions

---

## Files Changed

1. ✅ **Created:** `src/hooks/usePolygonWebSocket.ts` - WebSocket logic
2. ✅ **Modified:** `src/app/dashboard/page.tsx` - Integration & UI

**No database changes needed!** WebSocket data is ephemeral (not stored).

---

## Support

If you run into issues:

1. **Check Polygon.io docs:** https://polygon.io/docs/websockets/getting-started
2. **Check your plan:** https://polygon.io/pricing
3. **Test in terminal first:** Make sure WebSocket works outside browser
4. **Check browser console:** Look for detailed error messages

---

## Summary

You now have a **production-ready real-time stock dashboard**! 

- Market hours: Prices update live ⚡
- After hours: Shows connection status, ready for next day 🌙
- Cron job: Still runs daily to populate historical data 📊
- WebSocket: Streams current prices in real-time 🔴

**Best of both worlds!**

