import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('🔐 Middleware triggered for:', request.url)
  console.log('🔑 Environment variables loaded:')
  console.log('  BASIC_AUTH_USER:', process.env.BASIC_AUTH_USER)
  console.log('  BASIC_AUTH_PASSWORD:', process.env.BASIC_AUTH_PASSWORD)
  
  const authHeader = request.headers.get('authorization')
  console.log('📨 Auth header:', authHeader ? 'Present' : 'Missing')
  
  if (authHeader) {
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 