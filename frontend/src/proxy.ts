import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default function middleware(req: any, event: any) {
  // If Clerk secret key is not set or bypass is enabled, allow requests through
  if (!process.env.CLERK_SECRET_KEY || process.env.DISABLE_CLERK_AUTH === "true") {
    return NextResponse.next();
  }

  return clerkMiddleware(async (auth, request) => {
    try {
      const { pathname } = request.nextUrl;
      
      // Public routes that bypass auth protection
      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up");

      if (!isPublic) {
        await auth.protect();
      }
    } catch (error: any) {
      // In Next.js, redirect() works by throwing NEXT_REDIRECT - rethrow it so redirect happens!
      if (error?.digest?.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
      console.warn("⚠️ Clerk auth error caught:", error);
      return NextResponse.next();
    }
  })(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
