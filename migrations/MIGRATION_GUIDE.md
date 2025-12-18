# Migration Guide: Normalized Database Structure

This guide explains how to migrate from the old `stocks_complete_data` table to the new normalized structure.

## Overview

We're migrating from a single denormalized table to a normalized structure with three tables:
1. **`stocks`** - Company data (one row per symbol)
2. **`stock_prices`** - Time-series price data (one row per symbol per date)
3. **`stock_snapshots`** - Daily snapshots for historical reference (optional)

## Benefits

- **Much faster queries**: Single row lookup per symbol vs. filtering hundreds of rows
- **No data duplication**: Historical prices stored once
- **Better scalability**: Easy to add more symbols and dates
- **Query time improvement**: From ~500ms-2s to <50ms

## Migration Steps

### Step 1: Run the Migration Script

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the entire contents of `migrate_to_normalized.sql`
4. Execute the script
5. Check the output for the migration summary

### Step 2: Verify Migration

Run this query to verify everything migrated correctly:

```sql
-- Check that all symbols are in stocks table
SELECT COUNT(*) as stock_count FROM stocks;

-- Check price data
SELECT symbol, COUNT(*) as price_count 
FROM stock_prices 
GROUP BY symbol 
ORDER BY symbol;

-- Check snapshots
SELECT COUNT(*) as snapshot_count FROM stock_snapshots;
```

### Step 3: Test the Application

1. The cron job has been updated to use the new structure
2. The frontend hook (`useStockDatabase`) has been updated to query the new structure
3. Test by:
   - Loading the dashboard
   - Verifying data loads quickly
   - Checking that all stock data displays correctly

### Step 4: (Optional) Drop Old Table

**ONLY after verifying everything works**, you can drop the old table:

```sql
DROP TABLE IF EXISTS stocks_complete_data;
```

**⚠️ Warning**: Make sure you've verified the migration is working correctly before dropping the old table!

## Code Changes Made

### 1. Cron Job (`src/app/api/cron/populate-stocks/route.ts`)

**Before**: Inserted one row into `stocks_complete_data` with all data

**After**: 
- Upserts company data into `stocks` table
- Inserts current price into `stock_prices` table
- Optionally inserts historical price references
- Optionally creates snapshot in `stock_snapshots` table

### 2. Database Hook (`src/hooks/useStockDatabase.ts`)

**Before**: 
- Queried `stocks_complete_data` with complex filtering
- Had to find latest row per symbol client-side

**After**:
- Queries `stocks` table directly (one row per symbol = instant)
- Queries `stock_prices` for current and historical prices
- Combines data client-side

### 3. Frontend (`src/app/dashboard/page.tsx`)

**No changes needed!** The hook still returns data in the same format, so the frontend works unchanged.

## Troubleshooting

### Issue: "Table 'stocks' does not exist"

**Solution**: Make sure you've run the migration script in Supabase SQL Editor.

### Issue: Data not showing up

**Check**:
1. Did the cron job run successfully?
2. Check Supabase logs for errors
3. Verify data exists in the new tables:
   ```sql
   SELECT * FROM stocks LIMIT 5;
   SELECT * FROM stock_prices ORDER BY date DESC LIMIT 10;
   ```

### Issue: Historical prices showing as 0

**Check**: 
- Verify that historical prices were inserted into `stock_prices` table
- The cron job attempts to insert historical prices, but they're optional
- If missing, the next cron run should populate them

### Issue: Slow queries still

**Check**:
1. Verify indexes were created:
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'stocks';
   SELECT indexname FROM pg_indexes WHERE tablename = 'stock_prices';
   ```

2. If indexes are missing, run:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
   CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_date ON stock_prices(symbol, date DESC);
   CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol ON stock_prices(symbol);
   ```

## Rollback Plan

If you need to rollback:

1. The old `stocks_complete_data` table is still there (unless you dropped it)
2. Revert the code changes:
   - Restore `src/app/api/cron/populate-stocks/route.ts` from git
   - Restore `src/hooks/useStockDatabase.ts` from git
3. Point queries back to `stocks_complete_data`

## Performance Comparison

### Before (Old Structure)
- Query: `SELECT * FROM stocks_complete_data WHERE symbol IN (...) ORDER BY date DESC`
- Returns: Potentially 365+ rows per symbol
- Client-side filtering: Required to find latest
- Query time: 500ms - 2s

### After (New Structure)
- Query 1: `SELECT * FROM stocks WHERE symbol IN (...)`
- Query 2: `SELECT * FROM stock_prices WHERE symbol IN (...) AND date IN (...)`
- Returns: Exactly what's needed (1 row per symbol + price rows)
- Client-side filtering: Minimal (just organizing by symbol)
- Query time: <50ms

## Questions?

If you run into any issues, check:
1. Supabase SQL logs
2. Browser console for errors
3. Network tab to see query responses

