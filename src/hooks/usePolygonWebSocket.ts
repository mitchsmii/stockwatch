import { useEffect, useRef, useState, useCallback } from 'react'


interface WebSocketMessage {
  ev: string     // Event type: "A" = trade, "AM" = minute aggregate, "status" = connection status
  sym?: string   // Symbol
  p?: number     // Trade price
  c?: number     // Close price (for minute aggregates)
  h?: number     // High price
  l?: number     // Low price
  o?: number     // Open price
  v?: number     // Volume
  s?: number     // Size/Timestamp (depends on event type)
  e?: number     // End timestamp (for minute aggregates)
  t?: number     // Timestamp
  message?: string // Status message
}

interface PriceUpdate {
  symbol: string
  price: number
  timestamp: number
}

interface UsePolygonWebSocketReturn {
  prices: Record<string, PriceUpdate>
  connected: boolean
  error: string | null
  subscribe: (symbols: string[]) => void
  unsubscribe: (symbols: string[]) => void
}

export function usePolygonWebSocket(): UsePolygonWebSocketReturn {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({})
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscribedSymbolsRef = useRef<Set<string>>(new Set())
  const connectionLimitReachedRef = useRef<boolean>(false)
  const isConnectingRef = useRef<boolean>(false)

  const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY

  const connect = useCallback(() => {
    if (!apiKey) {
      setError('Polygon API key not found')
      return
    }

    // Don't connect if we're already connecting or have hit connection limit
    if (isConnectingRef.current) {
      console.log('⚠️ Connection already in progress, skipping...')
      return
    }

    if (connectionLimitReachedRef.current) {
      console.log('⚠️ Connection limit reached, not attempting to connect')
      setError('Connection limit reached. Please refresh the page.')
      return
    }

    // Check if we already have an open connection
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        console.log('✅ WebSocket already connected, skipping...')
        return
      }
      if (wsRef.current.readyState === WebSocket.CONNECTING) {
        console.log('⚠️ WebSocket connection in progress, skipping...')
        return
      }
      // Only close if it's in a closable state
      if (wsRef.current.readyState !== WebSocket.CLOSED) {
        console.log('🔌 Closing existing WebSocket connection...')
        try {
          wsRef.current.close()
        } catch (e) {
          console.warn('Error closing existing connection:', e)
        }
      }
      wsRef.current = null
    }

    isConnectingRef.current = true
    console.log('🔌 Connecting to Polygon WebSocket (15-min delayed)...')

    // Connect to Polygon WebSocket - DELAYED FEED (15 minutes)
    // Real-time: wss://socket.polygon.io/stocks
    // Delayed: wss://delayed.polygon.io/stocks
    const ws = new WebSocket('wss://delayed.polygon.io/stocks')
    wsRef.current = ws

    ws.onopen = () => {
      console.log('✅ WebSocket connected')
      setConnected(true)
      setError(null)
      isConnectingRef.current = false

      // Authenticate
      ws.send(JSON.stringify({
        action: 'auth',
        params: apiKey
      }))

      // Resubscribe to symbols if we have any
      if (subscribedSymbolsRef.current.size > 0) {
        const symbols = Array.from(subscribedSymbolsRef.current)
        console.log('🔄 Resubscribing to:', symbols)
        ws.send(JSON.stringify({
          action: 'subscribe',
          params: symbols.map(s => `AM.${s}`).join(',') // A = trades
        }))
      }
    }

    ws.onmessage = (event) => {
      try {
        const messages = JSON.parse(event.data) as WebSocketMessage[]
        
        // Debug: Log all messages to see what we're receiving
        console.log('📨 Received messages:', messages)
        
        messages.forEach((msg) => {
          // Handle status messages
          if (msg.ev === 'status') {
            console.log('📡 Status:', msg.message)
            if (msg.message?.includes('authenticated')) {
              console.log('🔐 Authenticated successfully')
            }
            // Check for connection limit error in status message
            if (msg.message?.includes('Maximum number of websocket connections exceeded') || 
                msg.message?.includes('connection limit')) {
              console.error('❌ Connection limit error detected in status message')
              connectionLimitReachedRef.current = true
              setError('Connection limit reached. Please refresh the page.')
              setConnected(false)
              // Close the connection properly
              if (wsRef.current) {
                wsRef.current.close(1000, 'Connection limit exceeded')
              }
              return
            }
            return // Skip processing status messages
          }
          
          // Handle minute aggregates (ev: "AM") - PRIMARY for delayed feed
          if (msg.ev === 'AM' && msg.sym && msg.c) { // 'c' = close price
            const symbol = msg.sym
            const price = msg.c // Use close price from minute aggregate
            const timestamp = msg.e || Date.now() // 'e' = end timestamp

            // Update prices state
            setPrices(prev => ({
              ...prev,
              [symbol]: {
                symbol,
                price,
                timestamp
              }
            }))

            console.log(`📊 ${symbol} (minute aggregate): $${price.toFixed(2)} at ${new Date(timestamp).toLocaleTimeString()}`)
          }
          
          // Handle trade updates (ev: "A") - SECONDARY
          if (msg.ev === 'A' && msg.sym && msg.p) {
            const symbol = msg.sym
            const price = msg.p
            const timestamp = msg.t || Date.now()

            // Update prices state
            setPrices(prev => ({
              ...prev,
              [symbol]: {
                symbol,
                price,
                timestamp
              }
            }))

            console.log(`💰 ${symbol} (trade): $${price.toFixed(2)} at ${new Date(timestamp).toLocaleTimeString()}`)
          }
        })
      } catch (err) {
        console.error('❌ Error parsing WebSocket message:', err)
      }
    }

    ws.onerror = (event) => {
      console.error('❌ WebSocket error:', event)
      setError('WebSocket connection error')
      isConnectingRef.current = false
    }

    ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason)
      setConnected(false)
      wsRef.current = null
      isConnectingRef.current = false

      // Handle connection limit error specifically
      if (event.reason?.includes('Maximum number of websocket connections exceeded') ||
          event.reason?.includes('connection limit') ||
          event.code === 1008) { // 1008 = policy violation (often used for connection limits)
        connectionLimitReachedRef.current = true
        setError('Connection limit reached. Please refresh the page.')
        console.error('❌ Connection limit reached - not attempting reconnect')
        return
      }

      // Don't reconnect if we've hit the connection limit
      if (connectionLimitReachedRef.current) {
        console.log('⚠️ Connection limit reached, skipping reconnection')
        return
      }

      // Attempt to reconnect after 5 seconds (but only if it's not a normal closure)
      if (event.code !== 1000) { // 1000 = normal closure
        console.log('🔄 Reconnecting in 5 seconds...')
        reconnectTimeoutRef.current = setTimeout(() => {
          // Double-check we haven't hit limit before reconnecting
          if (!connectionLimitReachedRef.current) {
            connect()
          }
        }, 5000)
      }
    }
  }, [apiKey])

  const subscribe = useCallback((symbols: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, will subscribe when connected')
      // Store symbols to subscribe when connection is ready
      symbols.forEach(s => subscribedSymbolsRef.current.add(s))
      return
    }

    console.log('📥 Subscribing to:', symbols)
    
    // Add to tracked symbols
    symbols.forEach(s => subscribedSymbolsRef.current.add(s))

    // Subscribe to minute aggregates (AM.{symbol}) - works better with delayed feed
    // According to Polygon docs, minute aggregates provide regular updates
    const minuteParams = symbols.map(s => `AM.${s}`).join(',')
    
    wsRef.current.send(JSON.stringify({
      action: 'subscribe',
      params: minuteParams
    }))
    
    console.log('📡 Subscribed to minute aggregates:', minuteParams)
  }, [])

  const unsubscribe = useCallback((symbols: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    console.log('📤 Unsubscribing from:', symbols)
    
    // Remove from tracked symbols
    symbols.forEach(s => subscribedSymbolsRef.current.delete(s))

    const params = symbols.map(s => `A.${s}`).join(',')
    
    wsRef.current.send(JSON.stringify({
      action: 'unsubscribe',
      params: params
    }))
  }, [])

  // Connect on mount
  useEffect(() => {
    // Reset connection limit flag on mount (in case component remounts after hitting limit)
    // But only if we're not already at the limit (to prevent reconnection loops)
    if (!connectionLimitReachedRef.current) {
      connect()
    } else {
      console.log('⚠️ Connection limit previously reached, skipping connection attempt')
    }

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket connection')
      isConnectingRef.current = false
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        console.log('🔌 Closing WebSocket connection on cleanup...')
        // Don't set connectionLimitReached on manual cleanup
        wsRef.current.close(1000, 'Component unmounted')
        wsRef.current = null
      }
    }
  }, [connect])

  return {
    prices,
    connected,
    error,
    subscribe,
    unsubscribe
  }
}

