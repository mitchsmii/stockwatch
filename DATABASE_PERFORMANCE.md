# Database Performance Optimization Guide

## Current Query Performance

The current query fetches prices from the last 400 days, which should be fast for a single stock. However, if you're experiencing slowness, it could be due to:

1. **Supabase Subscription Tier** - Free tier has:
   - Slower query response times
   - Connection pooling limitations
   - Regional latency (data center location)
   
2. **Missing Indexes** - Verify indexes exist in Supabase:
   ```sql
   -- Check if indexes exist
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'stock_prices';
   
   -- Should see:
   -- idx_stock_prices_symbol_date
   -- idx_stock_prices_symbol
   ```

3. **Query Pattern** - Current query is fetching too much data

## Optimized Query Approach

For a single stock (AAPL), we only need:
- Current price (today)
- ~5 historical prices (yesterday, 5 days ago, 30 days ago, 365 days ago)

**Current approach**: Fetches up to 50 rows per symbol
**Optimized approach**: Fetch only what we need

## Supabase Subscription Tiers

### Free Tier
- **Query latency**: 100-500ms (can vary)
- **Connection pooling**: Basic
- **Regional**: May not be optimal for your location
- **Concurrent connections**: Limited

### Pro Tier ($25/month)
- **Query latency**: 50-200ms
- **Connection pooling**: Improved
- **Regional**: Choose your region
- **Better performance**: Significant improvement

### Team/Enterprise
- **Query latency**: <100ms
- **Dedicated resources**: Better performance
- **Custom regions**: Optimize for your users

## Quick Performance Check

Run this in Supabase SQL Editor to see query performance:

```sql
EXPLAIN ANALYZE
SELECT symbol, date, price
FROM stock_prices
WHERE symbol IN ('AAPL')
  AND date >= CURRENT_DATE - INTERVAL '400 days'
ORDER BY symbol, date DESC
LIMIT 50;
```

Look for:
- **Execution time**: Should be <100ms for small datasets
- **Index usage**: Should show "Index Scan" not "Seq Scan"
- **Rows examined**: Should be minimal

## Optimization Options

### Option 1: Reduce Data Fetch (Current Implementation)
- Only fetch last 400 days
- Limit to 50 rows per symbol
- This should be fast for 1 stock

### Option 2: Use Specific Date Queries
Instead of fetching all recent prices, fetch specific dates:
```sql
SELECT * FROM stock_prices 
WHERE symbol = 'AAPL' 
  AND date IN (today, yesterday, 5_days_ago, 30_days_ago, 365_days_ago)
```

### Option 3: Use Supabase RPC Function
Create a PostgreSQL function that returns exactly what you need:
```sql
CREATE OR REPLACE FUNCTION get_stock_data(symbols text[])
RETURNS TABLE(...) AS $$
  -- Efficient query using window functions
$$ LANGUAGE sql;
```

### Option 4: Cache Results
- Cache database results in React state
- Only refetch when needed (e.g., on manual refresh)
- Use React Query or SWR for automatic caching

## Recommended Next Steps

1. **Check query performance** in Supabase SQL Editor using EXPLAIN ANALYZE
2. **Verify indexes exist** on stock_prices table
3. **Test with current optimized query** (already implemented)
4. **If still slow**: Consider upgrading Supabase tier or implementing caching

## Expected Performance

For 1 stock (AAPL) with current optimized query:
- **Free tier**: 200-500ms (network + query)
- **Pro tier**: 100-200ms
- **With caching**: <50ms (after first load)

If you're seeing >2 seconds, there's likely an issue with:
- Missing indexes
- Network latency
- Database connection pooling

