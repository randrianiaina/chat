import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  // Add public routes here
  publicRoutes: ['/sign-in', '/sign-up', '/api/webhooks/clerk'],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
