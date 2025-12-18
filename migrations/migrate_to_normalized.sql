-- ============================================
-- Migration Script: Normalized Database Structure
-- ============================================
-- This script creates a normalized database structure:
-- 1. stocks (company data - one row per symbol)
-- 2. stock_prices (time-series price data - one row per symbol per date)
-- 3. stock_snapshots (optional daily snapshots for historical reference)
-- ============================================

-- Step 1: Create the normalized tables
-- ============================================

-- Table 1: stocks (Static/Semi-Static Company Data)
CREATE TABLE IF NOT EXISTS stocks (
  symbol VARCHAR(10) PRIMARY KEY,
  market_cap NUMERIC,
  pe_ratio NUMERIC,
  dividend_yield NUMERIC,
  fifty_two_week_high NUMERIC,
  fifty_two_week_low NUMERIC,
  ten_year_est_return NUMERIC,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: stock_prices (Time-Series Price Data)
CREATE TABLE IF NOT EXISTS stock_prices (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
  date DATE NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(symbol, date)
);

-- Table 3: stock_snapshots (Daily Snapshots for historical tracking)
CREATE TABLE IF NOT EXISTS stock_snapshots (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  current_price NUMERIC,
  price_yesterday NUMERIC,
  price_one_week_ago NUMERIC,
  price_one_month_ago NUMERIC,
  price_one_year_ago NUMERIC,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(symbol, snapshot_date)
);

-- Step 2: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_date ON stock_prices(symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol ON stock_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_snapshots_symbol_date ON stock_snapshots(symbol, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_snapshots_symbol ON stock_snapshots(symbol);

-- Step 3: Verify tables were created
-- ============================================

DO $$
DECLARE
  stocks_count INTEGER;
  prices_count INTEGER;
  snapshots_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO stocks_count FROM stocks;
  SELECT COUNT(*) INTO prices_count FROM stock_prices;
  SELECT COUNT(*) INTO snapshots_count FROM stock_snapshots;
  
  RAISE NOTICE 'Tables Created Successfully:';
  RAISE NOTICE '  stocks table: % rows', stocks_count;
  RAISE NOTICE '  stock_prices table: % rows', prices_count;
  RAISE NOTICE '  stock_snapshots table: % rows', snapshots_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. The cron job will populate these tables automatically';
  RAISE NOTICE '  2. Test the application to verify data loads correctly';
END $$;

-- ============================================
-- Setup Complete!
-- ============================================
-- The normalized tables have been created and are ready to use.
-- The cron job will automatically populate them with stock data.
-- ============================================
