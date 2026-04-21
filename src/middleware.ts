import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(list: { name: string; value: string; options: CookieOptions }[]) {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isAuthRoute    =
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  const isPublicRoute  =
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/join")     ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js"

  if (!user && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons).*)"],
}
