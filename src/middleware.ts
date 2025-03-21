import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                      req.nextUrl.pathname.startsWith("/register");
    const path = req.nextUrl.pathname;

    // Handle auth pages (login/register)
    if (isAuthPage) {
      if (isAuth) {
        // If user is already logged in, redirect based on their role
        switch (token.role) {
          case "SEEKER":
            return NextResponse.redirect(new URL("/seeker/dashboard", req.url));
          case "COMPANY":
            return NextResponse.redirect(new URL("/company/dashboard", req.url));
          default:
            return NextResponse.redirect(new URL("/", req.url));
        }
      }
      return null;
    }

    // If not authenticated and trying to access protected routes
    if (!isAuth && (path.startsWith("/seeker") || path.startsWith("/company"))) {
      const from = encodeURIComponent(path);
      return NextResponse.redirect(new URL(`/login?from=${from}`, req.url));
    }

    // Role-based access control
    if (isAuth) {
      if (path.startsWith("/seeker") && token.role !== "SEEKER") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      if (path.startsWith("/company") && token.role !== "COMPANY") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // We'll handle authorization in the middleware
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/company/:path*",
    "/seeker/:path*",
    "/login",
    "/register",
  ],
}; 
