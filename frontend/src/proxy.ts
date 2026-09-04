import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default function middleware(req: any, event: any) {
  // Allow explicit bypass only in non-production environments (dev/test)
  const clerkDisabled = process.env.DISABLE_CLERK_AUTH === "true";
  if (clerkDisabled && process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  // Fail closed in production when Clerk is not configured
  if (process.env.NODE_ENV === "production" && !process.env.CLERK_SECRET_KEY) {
    return new NextResponse("Authentication service not configured (missing CLERK_SECRET_KEY)", { status: 500 });
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
      // Fail closed in production on unexpected Clerk errors
      if (process.env.NODE_ENV === "production") {
        console.error("Clerk auth middleware error:", error);
        return new NextResponse("Authentication error", { status: 500 });
      }
      console.warn("⚠️ Clerk auth error caught (dev only):", error);
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
