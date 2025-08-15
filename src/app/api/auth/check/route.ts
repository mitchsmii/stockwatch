import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  
  try {
    const authValue = authHeader.split(' ')[1]
    const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':')
    
    if (user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD) {
      return NextResponse.json({ authenticated: true })
    }
  } catch (error) {
    // Invalid auth header format
  }
  
  return NextResponse.json({ authenticated: false }, { status: 401 })
} 