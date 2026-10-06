import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/util/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // The 'code' parameter is appended automatically by Supabase in the email link
  const code = searchParams.get('code')
  
  // The 'next' parameter is what we passed in our auth.ts actions
  const next = searchParams.get('next') ?? '/app'

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a secure session cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successfully authenticated! Redirect to the intended page (e.g., /update-password)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If the link is expired or invalid, redirect back to login with an error flag
  return NextResponse.redirect(`${origin}/auth/login?error=Invalid_or_expired_link`)
}