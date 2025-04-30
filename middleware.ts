import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { auth, clerkClient } from '@clerk/nextjs/server'


// Define which routes are public (these won't require authentication)
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If the route is not public, protect it
  if (!isPublicRoute(req)) {
    await auth.protect()
  }

})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}