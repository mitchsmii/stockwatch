const POLYGON_API_KEY = '6GjM5z6pno8_Ar_iq4rY7Mh98Su3a0Ug'

async function testPolygonAPI() {
  console.log('🧪 Testing Polygon API...\n')
  
  try {
    // Test stock quote
    console.log('📈 Testing AAPL quote...')
    const quoteResponse = await fetch(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/AAPL?apiKey=${POLYGON_API_KEY}`)
    const quoteData = await quoteResponse.json()
    
    if (quoteData.status === 'OK') {
      console.log('✅ AAPL Quote Success!')
      console.log(`   Price: $${quoteData.ticker.day.c}`)
      console.log(`   Change: ${quoteData.ticker.todaysChange.toFixed(2)} (${(quoteData.ticker.todaysChangePerc * 100).toFixed(2)}%)`)
      console.log(`   Volume: ${quoteData.ticker.day.v.toLocaleString()}`)
    } else {
      console.log('❌ Quote failed:', quoteData)
    }
    
    // Test company overview
    console.log('\n🏢 Testing AAPL company overview...')
    const overviewResponse = await fetch(`https://api.polygon.io/v3/reference/tickers/AAPL?apiKey=${POLYGON_API_KEY}`)
    const overviewData = await overviewResponse.json()
    
    if (overviewData.status === 'OK') {
      console.log('✅ Company Overview Success!')
      console.log(`   Name: ${overviewData.results.name}`)
      console.log(`   Market Cap: $${(overviewData.results.market_cap / 1e12).toFixed(2)}T`)
      console.log(`   Sector: ${overviewData.results.sic_description}`)
    } else {
      console.log('❌ Overview failed:', overviewData)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testPolygonAPI() 