import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default function middleware(req: any, event: any) {
  // In development environment, allow requests to proceed so Guest Mode & local auth work smoothly
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  // Fail closed in production when Clerk is not configured
  if (!process.env.CLERK_SECRET_KEY) {
    return new NextResponse("Authentication service not configured (missing CLERK_SECRET_KEY)", { status: 500 });
  }

  return clerkMiddleware(async (auth, request) => {
    try {
      const { pathname } = request.nextUrl;
      
      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up");

      if (!isPublic) {
        await auth.protect();
      }
    } catch (error: any) {
      if (error?.digest?.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
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
