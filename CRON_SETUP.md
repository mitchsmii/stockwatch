# Vercel Cron Job Setup for Stock Tracker

This guide explains how to set up a daily cron job on Vercel to automatically populate your stock database.

## What Was Created

1. **API Endpoint**: `src/app/api/cron/populate-stocks/route.ts` - A Vercel function that runs your stock population logic
2. **Cron Configuration**: `vercel.json` - Tells Vercel to run this function weekdays at 9:30 AM ET (market open)
3. **Environment Variable**: Added `CRON_SECRET` to your environment template
4. **Scripts Moved**: Moved utility scripts to `/scripts/` directory to avoid build conflicts

## Setup Steps

### 1. Generate a Secure Cron Secret

Generate a secure random string for your `CRON_SECRET`. You can use this command:

```bash
openssl rand -base64 32
```

Or use an online generator to create a secure random string.

### 2. Update Your Environment Variables

Add the `CRON_SECRET` to your `.env.local` file:

```bash
# Add this line to your .env.local file
CRON_SECRET=your_generated_secret_here
```

### 3. Deploy to Vercel

Push your changes to your repository:

```bash
git add .
git commit -m "Add Vercel cron job for daily stock updates"
git push
```

Vercel will automatically detect the `vercel.json` file and set up the cron job.

### 4. Verify the Cron Job

After deployment, you can:

1. Check your Vercel dashboard for the cron job status
2. Manually test the endpoint by calling:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
        https://your-domain.vercel.app/api/cron/populate-stocks
   ```

## Cron Schedule

The current schedule is set to run **weekdays at 1:30 PM UTC** (`30 13 * * 1-5`), which corresponds to **9:30 AM Eastern Time** when the US stock market opens.

You can modify the schedule in `vercel.json` using standard cron syntax:

- `30 13 * * 1-5` = Weekdays at 1:30 PM UTC (9:30 AM ET - Market Open)
- `0 16 * * *` = Daily at 4:00 PM UTC
- `0 9 * * 1-5` = Weekdays at 9:00 AM UTC
- `0 */6 * * *` = Every 6 hours

## How It Works

1. **Vercel's Cron Service** automatically calls your API endpoint at market open (9:30 AM ET / 1:30 PM UTC)
2. **Authentication** is handled via the `CRON_SECRET` header
3. **Your Function** fetches current stock data and historical prices from Polygon API
4. **Database Update** inserts/updates the data in your Supabase database
5. **Logs** are available in your Vercel function logs

## Monitoring

- Check Vercel function logs for execution status
- Monitor your Supabase database for new entries
- The function returns success/error responses for monitoring

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure `CRON_SECRET` is set in Vercel
2. **API Limits**: Polygon API has rate limits - the function handles this gracefully
3. **Database Connection**: Verify Supabase credentials are correct
4. **Timezone**: Cron runs in UTC - adjust schedule if needed

### Manual Testing

You can test the function manually by calling the API endpoint with the correct authorization header.

## Security Notes

- The `CRON_SECRET` should be kept secure and not exposed publicly
- Only Vercel's cron service should call this endpoint
- The function validates the authorization header before processing

## Next Steps

1. Deploy your changes
2. Monitor the first few executions
3. Adjust the schedule if needed
4. Consider adding more stocks beyond AAPL
5. Add error notifications (e.g., via email or Slack webhooks) 