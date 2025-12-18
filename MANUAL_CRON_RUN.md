# How to Manually Run the Cron Job

This guide shows you how to manually trigger the cron job to populate your database.

## Option 1: Using cURL (Command Line)

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app-url.vercel.app/api/cron/populate-stocks
```

**Replace:**
- `YOUR_CRON_SECRET` with your actual CRON_SECRET from `.env.local`
- `your-app-url.vercel.app` with your actual Vercel deployment URL

**Example:**
```bash
curl -X GET \
  -H "Authorization: Bearer abc123xyz789" \
  https://stocktracker.vercel.app/api/cron/populate-stocks
```

## Option 2: Using Browser (Development)

If you're running locally with `npm run dev`, you can bypass the auth check:

1. **Temporarily comment out the auth check** in `src/app/api/cron/populate-stocks/route.ts`:

```typescript
// Verify this is a Vercel cron request
// const authHeader = request.headers.get('authorization')
// if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//   console.error(`❌ Unauthorized cron request`)
//   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
// }
```

2. **Visit the URL in your browser:**
   ```
   http://localhost:3000/api/cron/populate-stocks
   ```

3. **Don't forget to uncomment the auth check** before committing!

## Option 3: Using Postman/Insomnia

1. Create a new GET request
2. URL: `https://your-app-url.vercel.app/api/cron/populate-stocks`
3. Headers:
   - Key: `Authorization`
   - Value: `Bearer YOUR_CRON_SECRET`
4. Send the request

## Option 4: Using Next.js API Route Directly (Local Testing)

Create a test script in your project root:

```typescript
// test-cron.ts
import { populatePriceBased } from './src/app/api/cron/populate-stocks/route'

// You'll need to export the function or create a test script
// This is just for reference
```

Actually, the easiest way locally is Option 2 (temporarily disable auth).

## Expected Response

On success, you should see:
```json
{
  "success": true,
  "message": "Stock data updated successfully for AAPL"
}
```

## Checking the Results

After running, verify data was inserted:

### In Supabase SQL Editor:

```sql
-- Check stocks table
SELECT * FROM stocks;

-- Check stock_prices table
SELECT * FROM stock_prices ORDER BY date DESC LIMIT 10;

-- Check stock_snapshots table
SELECT * FROM stock_snapshots ORDER BY snapshot_date DESC LIMIT 5;
```

### Expected Data:

**stocks table:**
- 1 row for AAPL with company metrics (market_cap, pe_ratio, etc.)

**stock_prices table:**
- Current price row (today's date)
- Historical price rows (yesterday, 5 days ago, 30 days ago, 365 days ago)

**stock_snapshots table:**
- 1 row for AAPL with today's snapshot data

## Troubleshooting

### Error: "Unauthorized"
- Make sure you're including the Authorization header
- Check that your CRON_SECRET matches exactly

### Error: "Table 'stocks' does not exist"
- Run the migration script first in Supabase SQL Editor
- Make sure the tables were created successfully

### Error: "Foreign key constraint violation"
- Make sure you insert into `stocks` table first (the cron job does this automatically)
- The `stock_prices` and `stock_snapshots` tables reference `stocks.symbol`

### No data appearing
- Check your Supabase logs for errors
- Verify your Polygon API key is working
- Check the console/terminal for any error messages

## What the Cron Job Does

1. **Fetches current price** from Polygon.io snapshot API
2. **Fetches historical prices** (year of data) from Polygon.io aggregates API
3. **Fetches market cap** from Polygon.io reference API
4. **Upserts to `stocks` table** with company data
5. **Upserts to `stock_prices` table** with current and historical prices
6. **Upserts to `stock_snapshots` table** with today's snapshot

All operations use `upsert` so running it multiple times is safe - it will update existing records.

