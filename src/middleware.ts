import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  // Add public routes here
  publicRoutes: ['/sign-in', '/sign-up', '/api/webhooks/clerk', '/api/set-admin'],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
