import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { prisma } from './lib/db'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/instagram/webhook(.*)',  // Add this line
  '/api/webhooks/clerk',
  '/api/instagram/callback'
])
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}