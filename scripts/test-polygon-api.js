// Simple test script to check Polygon API key
require('dotenv').config({ path: '.env.local' })

const polygonApiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY

console.log('🔑 Testing Polygon API key...')
console.log('API Key (first 10 chars):', polygonApiKey ? polygonApiKey.substring(0, 10) + '...' : 'NOT FOUND')

if (!polygonApiKey) {
  console.error('❌ No API key found in .env.local')
  process.exit(1)
}

// Test a simple endpoint
async function testAPI() {
  try {
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/AAPL?apiKey=${polygonApiKey}`
    console.log('🌐 Testing URL:', url)
    
    const response = await fetch(url)
    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API call successful!')
      console.log('📈 Data received:', JSON.stringify(data, null, 2))
    } else {
      const errorText = await response.text()
      console.error('❌ API call failed:', errorText)
    }
  } catch (err) {
    console.error('❌ Network error:', err.message)
  }
}

testAPI() 