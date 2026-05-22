import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Bypass middleware auth checks for all API routes and the auth callback.
  // API endpoints handle their own session validation internally and return clean 401s,
  // while the callback route handles code-to-session exchange on its own.
  // This bypass prevents double-checking auth on protected APIs and removes blocking calls
  // to Supabase auth APIs for public endpoints like stats.
  if (pathname.startsWith('/api') || pathname.startsWith('/auth/callback')) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  let user = null
  let error = null
  try {
    const { data, error: authError } = await supabase.auth.getUser()
    user = data?.user || null
    error = authError
  } catch (err: any) {
    error = err
  }

  if (error) {
    const isTokenError = 
      error.status === 400 || 
      error.message?.includes('Refresh Token Not Found') || 
      error.message?.includes('invalid_grant') ||
      error.code === 'refresh_token_not_found';
      
    if (isTokenError) {
      // Clear stale Supabase auth cookies to prevent the browser from sending them
      // on subsequent requests and spamming the console with AuthApiErrors.
      const allCookies = request.cookies.getAll()
      let clearedCount = 0
      allCookies.forEach((cookie) => {
        if (cookie.name.startsWith('sb-')) {
          request.cookies.delete(cookie.name)
          supabaseResponse.cookies.delete(cookie.name)
          clearedCount++
        }
      })
      if (clearedCount > 0) {
        console.log(`[Supabase Auth] Stale or invalid session cookies detected. Cleared ${clearedCount} cookie(s) from request and response to avoid console error spam.`);
      }
    }
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isLandingPage = request.nextUrl.pathname === '/';
  const isPublicApi = request.nextUrl.pathname === '/api/global-stats';
  const hasAuthCode = request.nextUrl.searchParams.has('code');
  const hasError = request.nextUrl.searchParams.has('error');

  // Helper to create a redirect response while preserving cookies set/deleted by Supabase
  const redirectResponse = (url: URL) => {
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      const cookieOptions: any = {}
      if (cookie.path) cookieOptions.path = cookie.path
      if (cookie.maxAge) cookieOptions.maxAge = cookie.maxAge
      if (cookie.sameSite) cookieOptions.sameSite = cookie.sameSite
      if (cookie.secure !== undefined) cookieOptions.secure = cookie.secure
      if (cookie.httpOnly !== undefined) cookieOptions.httpOnly = cookie.httpOnly
      response.cookies.set(cookie.name, cookie.value, cookieOptions)
    })
    return response
  }

  if (!user && !isAuthPage && !isLandingPage && !isPublicApi && !hasAuthCode && !hasError) {
    // no user, redirect to landing page with auto-login trigger
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('login', 'true')
    return redirectResponse(url)
  }

  // If user is logged in and tries to access login page, send to jobs
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/jobs'
    return redirectResponse(url)
  }

  return supabaseResponse
}
