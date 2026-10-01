import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface TokenPayload {
  sub: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "SUPER_ADMIN";
  exp: number;
}

function decodeJwtPayload<T>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getRoleHome(role?: string): string {
  if (role === "SUPER_ADMIN") return "/admin/users";
  if (role === "MENTOR") return "/mentor/cohorts";
  return "/student/learning";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Attempt decode
  let payload: TokenPayload | null = null;
  if (accessToken) {
    payload = decodeJwtPayload<TokenPayload>(accessToken);
  }

  const hasSession = Boolean(payload || refreshToken);
  const role = payload?.role;

  // 1. If visiting Login / Register while authenticated, redirect to home
  if (pathname === "/login" || pathname === "/register") {
    if (hasSession && role) {
      return NextResponse.redirect(new URL(getRoleHome(role), request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected Admin Routes
  if (pathname.startsWith("/admin")) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(getRoleHome(role), request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected Mentor Routes
  if (pathname.startsWith("/mentor")) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role && role !== "MENTOR" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(getRoleHome(role), request.url));
    }
    return NextResponse.next();
  }

  // 4. Protected Student Routes
  if (pathname.startsWith("/student")) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/mentor/:path*",
    "/student/:path*",
    "/login",
    "/register",
  ],
};
