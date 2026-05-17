import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Skip API, tRPC, NextAuth, uploadthing, _next, _vercel, sitemap.xml, robots.txt, and any file with extension
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
  ],
};
