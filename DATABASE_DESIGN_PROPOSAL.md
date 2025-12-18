# Database Structure Proposal

## Current Issues with `stocks_complete_data`:

1. **Slow queries**: Fetching all rows for symbols then filtering client-side to find the latest
2. **Data duplication**: Historical prices (yesterday, week, month, year ago) are stored in EVERY row
3. **Inefficient structure**: Mixing frequently-changing data (prices) with infrequently-changing data (company metrics)
4. **No easy historical queries**: Hard to query price history efficiently

## Proposed Structure:

### Option 1: Normalized (Recommended for scalability)

#### Table 1: `stocks` (Static/Semi-Static Company Data)
```sql
CREATE TABLE stocks (
  symbol VARCHAR(10) PRIMARY KEY,
  market_cap NUMERIC,
  pe_ratio NUMERIC,
  dividend_yield NUMERIC,
  fifty_two_week_high NUMERIC,
  fifty_two_week_low NUMERIC,
  ten_year_est_return NUMERIC,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stocks_symbol ON stocks(symbol);
```

**Why separate?** These values change infrequently (daily at most), so we only need to update them when they change.

#### Table 2: `stock_prices` (Time-Series Price Data)
```sql
CREATE TABLE stock_prices (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol),
  date DATE NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(symbol, date)
);

CREATE INDEX idx_stock_prices_symbol_date ON stock_prices(symbol, date DESC);
CREATE INDEX idx_stock_prices_symbol ON stock_prices(symbol);
```

**Why separate?** This is pure time-series data. Makes it super easy to:
- Get latest price: `SELECT * FROM stock_prices WHERE symbol = 'AAPL' ORDER BY date DESC LIMIT 1`
- Get historical prices for calculations
- Query price trends over time

#### Table 3: `stock_snapshots` (Daily Snapshots - Optional)
```sql
CREATE TABLE stock_snapshots (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol),
  snapshot_date DATE NOT NULL,
  current_price NUMERIC,
  -- Store calculated metrics that don't need historical data
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(symbol, snapshot_date)
);

CREATE INDEX idx_stock_snapshots_symbol_date ON stock_snapshots(symbol, snapshot_date DESC);
```

**Why optional?** If you need to store daily snapshots for audit/history, but you can also calculate most things on the fly from `stock_prices`.

---

### Option 2: Hybrid (Easier migration, good performance)

Keep it simpler but optimize:

#### Table: `stocks_latest` (Most Recent Data Only)
```sql
CREATE TABLE stocks_latest (
  symbol VARCHAR(10) PRIMARY KEY,
  current_price NUMERIC,
  price_date DATE NOT NULL,
  
  -- Historical prices (still denormalized, but only in latest row)
  price_yesterday NUMERIC,
  price_one_week_ago NUMERIC,
  price_one_month_ago NUMERIC,
  price_one_year_ago NUMERIC,
  
  -- Company metrics
  market_cap NUMERIC,
  pe_ratio NUMERIC,
  dividend_yield NUMERIC,
  fifty_two_week_high NUMERIC,
  fifty_two_week_low NUMERIC,
  ten_year_est_return NUMERIC,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stocks_latest_symbol ON stocks_latest(symbol);
```

**Plus:** Optional `stock_prices` table for historical tracking:
```sql
CREATE TABLE stock_prices (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  price NUMERIC NOT NULL,
  UNIQUE(symbol, date)
);
```

---

### Option 3: Optimized Current Structure (Minimal Changes)

If you want to keep the current structure but make it faster:

1. **Add a composite index:**
```sql
CREATE INDEX idx_stocks_complete_symbol_date ON stocks_complete_data(symbol, date DESC);
```

2. **Use a PostgreSQL view for latest data:**
```sql
CREATE VIEW stocks_latest AS
SELECT DISTINCT ON (symbol) *
FROM stocks_complete_data
ORDER BY symbol, date DESC;
```

3. **Optimize query to use the view:**
```typescript
const { data, error } = await supabase
  .from('stocks_latest')  // Use the view instead
  .select('*')
  .in('symbol', symbols)
```

---

## Recommendation: **Option 2 (Hybrid)**

### Why?
1. **Fast queries**: Single table with primary key on `symbol` = instant lookup
2. **Simple migration**: Easy to convert from current structure
3. **Still flexible**: Can add `stock_prices` table later for historical analysis
4. **No data duplication**: Historical prices only stored in one row per symbol

### Migration Steps:

1. Create new table:
```sql
CREATE TABLE stocks_latest (
  symbol VARCHAR(10) PRIMARY KEY,
  current_price NUMERIC,
  price_date DATE NOT NULL,
  price_yesterday NUMERIC,
  price_one_week_ago NUMERIC,
  price_one_month_ago NUMERIC,
  price_one_year_ago NUMERIC,
  market_cap NUMERIC,
  pe_ratio NUMERIC,
  dividend_yield NUMERIC,
  fifty_two_week_high NUMERIC,
  fifty_two_week_low NUMERIC,
  ten_year_est_return NUMERIC,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

2. Migrate existing data:
```sql
INSERT INTO stocks_latest
SELECT DISTINCT ON (symbol)
  symbol,
  current_price,
  date as price_date,
  price_yesterday,
  price_one_week_ago,
  price_one_month_ago,
  price_one_year_ago,
  market_cap,
  pe_ratio,
  dividend_yield,
  fifty_two_week_high,
  fifty_two_week_low,
  ten_year_est_return,
  updated_at
FROM stocks_complete_data
ORDER BY symbol, date DESC;
```

3. Update cron job to use `UPSERT` on `symbol` only (not `symbol,date`)
4. Update frontend query to use the new table

### Query Performance Comparison:

**Before (Current):**
```sql
-- Fetches ALL rows, then filters client-side
SELECT * FROM stocks_complete_data 
WHERE symbol IN ('AAPL', 'MSFT', ...) 
ORDER BY date DESC;
-- Returns potentially hundreds of rows
```

**After (Optimized):**
```sql
-- Fetches exactly what you need
SELECT * FROM stocks_latest 
WHERE symbol IN ('AAPL', 'MSFT', ...);
-- Returns exactly 1 row per symbol (instant!)
```

---

## Performance Impact:

- **Query time**: Should go from ~500ms-2s to <50ms
- **Data size**: Reduces database size significantly (one row per symbol vs. hundreds)
- **Scalability**: Much better as you add more symbols and days

Would you like me to implement Option 2, or do you prefer one of the other options?

