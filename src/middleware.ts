import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Debug: Log all environment variables to see what's available
  console.log('🔐 Middleware triggered for:', request.url)
  console.log('🔑 All environment variables:')
  console.log('  NODE_ENV:', process.env.NODE_ENV)
  console.log('  VERCEL:', process.env.VERCEL)
  console.log('  BASIC_AUTH_USER:', process.env.BASIC_AUTH_USER)
  console.log('  BASIC_AUTH_PASSWORD:', process.env.BASIC_AUTH_PASSWORD)
  console.log('  BASIC_AUTH_USER length:', process.env.BASIC_AUTH_USER?.length)
  console.log('  BASIC_AUTH_PASSWORD length:', process.env.BASIC_AUTH_PASSWORD?.length)
  
  // Check if environment variables are loaded
  if (!process.env.BASIC_AUTH_USER || !process.env.BASIC_AUTH_PASSWORD) {
    console.log('❌ Environment variables not loaded!')
    console.log('  BASIC_AUTH_USER exists:', !!process.env.BASIC_AUTH_USER)
    console.log('  BASIC_AUTH_PASSWORD exists:', !!process.env.BASIC_AUTH_PASSWORD)
    
    // For debugging, allow access if no env vars (this should not happen in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Development mode - allowing access without auth')
      return NextResponse.next()
    }
    
    return new NextResponse('Authentication not configured', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
  
  const authHeader = request.headers.get('authorization')
  console.log('📨 Auth header:', authHeader ? 'Present' : 'Missing')
  
  if (authHeader) {
    try {
      const authValue = authHeader.split(' ')[1]
      const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':')
      console.log('👤 Decoded credentials:')
      console.log('  Username:', user)
      console.log('  Password:', pwd)
      console.log('  Expected username:', process.env.BASIC_AUTH_USER)
      console.log('  Expected password:', process.env.BASIC_AUTH_PASSWORD)
      console.log('  Username match:', user === process.env.BASIC_AUTH_USER)
      console.log('  Password match:', pwd === process.env.BASIC_AUTH_PASSWORD)
      
      if (user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD) {
        console.log('✅ Authentication successful!')
        return NextResponse.next()
      }
    } catch (error) {
      console.log('❌ Error parsing auth header:', error)
    }
  }
  
  console.log('❌ Authentication failed, returning 401')
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="IntrinArc Dashboard"',
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 