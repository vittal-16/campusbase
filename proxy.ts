import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // If not logged in and trying to access a protected route → send to login
  if (!user && pathname.startsWith('/feed')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!user && pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in but profile not complete → force profile setup
  if (user && pathname.startsWith('/feed')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_complete')
      .eq('id', user.id)
      .single()

    if (profile && !profile.profile_complete) {
      return NextResponse.redirect(new URL('/profile/setup', request.url))
    }
  }

  // If logged in and profile complete → don't allow going back to login/signup
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_complete')
      .eq('id', user.id)
      .single()

    if (profile?.profile_complete) {
      return NextResponse.redirect(new URL('/feed', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/feed/:path*', '/profile/:path*', '/login', '/signup'],
}