import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Creates a function that checks for basic authentication
// This is used to protect the dashboard from unauthorized access
// The NextRequest is used to get the request from the client
// The NextResponse is used to send the response to the client
export function middleware(request: NextRequest) {
  
  // Get the authorization header
  const authHeader = request.headers.get('authorization')
  
  // If no auth header, return 401 to prompt for credentials
  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="IntrinArc"',
      },
    })
  }
  
  // Parse the credentials
  try {
    const authValue = authHeader.split(' ')[1]
    const [username, password] = Buffer.from(authValue, 'base64').toString().split(':')
    
    // Check if credentials match
    if (username === process.env.BASIC_AUTH_USER && 
        password === process.env.BASIC_AUTH_PASSWORD) {
      return NextResponse.next()
    }
  } catch {
    // If there's any error parsing, treat as invalid
  }
  
  // Invalid credentials, return 401
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="IntrinArc"',
    },
  })
}

export const config = {
  matcher: [
    // Protect all routes except static assets and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 