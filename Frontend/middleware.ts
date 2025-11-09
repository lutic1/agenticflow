import { auth } from "@/lib/auth/auth"

export default auth((req) => {
  // The auth callback is called before every request
  // You can add custom logic here to protect specific routes

  // For now, we're allowing all routes
  // To protect specific routes, you can check req.auth and req.nextUrl.pathname

  return
})

export const config = {
  // Match all routes except static files and API routes that don't need auth
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
