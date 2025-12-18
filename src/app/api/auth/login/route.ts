import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }

    if (data.user) {
      return NextResponse.json({ success: true, user: data.user })
    }
    
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Invalid request' 
    }, { status: 400 })
  }
} 