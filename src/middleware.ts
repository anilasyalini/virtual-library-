import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {

  const token = request.cookies.get("auth");

  const { pathname } = request.nextUrl;
 
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") || // Allow Next.js internals
    pathname.includes(".") // Allow static files
  ) {
    return NextResponse.next();
  }
 
  // if no cookie → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
 
  return NextResponse.next();
}