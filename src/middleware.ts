import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization')
  
  // Check if user is already authenticated
  if (authHeader) {
    const authValue = authHeader.split(' ')[1]
    const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':')
    
    // Check against environment variables
    if (user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD) {
      return NextResponse.next()
    }
  }
  
  // If not authenticated, return 401 with WWW-Authenticate header
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="IntrinArc Dashboard"',
    },
  })
}

export const config = {
  // Apply middleware to all routes except public assets
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 