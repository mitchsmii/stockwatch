import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const authValue = authHeader.split(' ')[1]
    const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':')
    if (user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD) {
      return NextResponse.next()
    }
  }
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