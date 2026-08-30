import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, type Role } from "@/lib/api/verify-token";
import { refreshTokens } from "@/lib/api/refresh-session";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
  clearAuthCookies,
  type TokenPair,
} from "@/lib/api/cookie-config";

const ADMIN_DASHBOARD = "/admin/students";
const STUDENT_DASHBOARD = "/student/dashboard";

const ADMIN_AUTH_ROUTES = new Set([
  "/admin",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/verify-login",
  "/admin/verify-otp",
]);

const STUDENT_AUTH_ROUTES = new Set(["/student"]);

function isAdminRole(role: Role): boolean {
  return role === "admin" || role === "staff";
}

function isAdminAuthRoute(pathname: string): boolean {
  return ADMIN_AUTH_ROUTES.has(pathname);
}

function isStudentAuthRoute(pathname: string): boolean {
  return STUDENT_AUTH_ROUTES.has(pathname);
}

function isAdminArea(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isStudentArea(pathname: string): boolean {
  return pathname === "/student" || pathname.startsWith("/student/");
}

function redirect(request: NextRequest, pathname: string): NextResponse {
  return NextResponse.redirect(new URL(pathname, request.url));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminArea = isAdminArea(pathname);
  const studentArea = isStudentArea(pathname);

  /*
   * The middleware only concerns itself with the
   * admin and student areas.
   */
  if (!adminArea && !studentArea) {
    return NextResponse.next();
  }

  const adminAuthRoute = isAdminAuthRoute(pathname);
  const studentAuthRoute = isStudentAuthRoute(pathname);

  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  let payload = accessToken ? await verifyAccessToken(accessToken) : null;
  let refreshedTokens: TokenPair | null = null;

  /*
   * Access token missing/expired/invalid — try to rotate the
   * refresh token before giving up on the session.
   */
  if (!payload && refreshToken) {
    refreshedTokens = await refreshTokens(refreshToken);

    if (refreshedTokens) {
      accessToken = refreshedTokens.accessToken;
      payload = await verifyAccessToken(refreshedTokens.accessToken);
    }
  }

  /*
   * No authenticated session.
   */
  if (!payload) {
    /*
     * Authentication pages are public.
     */
    if (adminAuthRoute || studentAuthRoute) {
      const response = NextResponse.next();

      /*
       * If we attempted refresh and failed, remove
       * stale authentication cookies.
       */
      if (refreshToken || accessToken) {
        clearAuthCookies(response);
      }

      return response;
    }

    /*
     * Unauthenticated user trying to access
     * the admin application.
     */
    if (adminArea) {
      return redirect(request, "/admin");
    }

    /*
     * Unauthenticated user trying to access
     * the student application.
     */
    if (studentArea) {
      return redirect(request, "/student");
    }

    return NextResponse.next();
  }

  const role = payload.role;

  const isAdmin = isAdminRole(role);
  const isStudent = role === "student";

  /*
   * An authenticated user cannot access authentication
   * routes anymore.
   */
  if (adminAuthRoute || studentAuthRoute) {
    const response = redirect(
      request,
      isAdmin ? ADMIN_DASHBOARD : STUDENT_DASHBOARD,
    );

    if (refreshedTokens) {
      setAuthCookies(response, refreshedTokens);
    }

    return response;
  }

  /*
   * ADMIN + STAFF:
   *
   * They share the administrative application.
   */
  if (adminArea) {
    if (isAdmin) {
      const response = NextResponse.next();

      if (refreshedTokens) {
        setAuthCookies(response, refreshedTokens);
      }

      return response;
    }

    /*
     * STUDENT attempting to access the admin application.
     */
    if (isStudent) {
      const response = redirect(request, STUDENT_DASHBOARD);

      if (refreshedTokens) {
        setAuthCookies(response, refreshedTokens);
      }

      return response;
    }
  }

  /*
   * STUDENT:
   *
   * Students share the student application.
   */
  if (studentArea) {
    if (isStudent) {
      const response = NextResponse.next();

      if (refreshedTokens) {
        setAuthCookies(response, refreshedTokens);
      }

      return response;
    }

    /*
     * ADMIN/STAFF attempting to access the student application.
     */
    if (isAdmin) {
      const response = redirect(request, ADMIN_DASHBOARD);

      if (refreshedTokens) {
        setAuthCookies(response, refreshedTokens);
      }

      return response;
    }
  }

  /*
   * This should normally be unreachable because every
   * supported role is handled above.
   */
  const response = redirect(
    request,
    isAdmin ? ADMIN_DASHBOARD : STUDENT_DASHBOARD,
  );

  if (refreshedTokens) {
    setAuthCookies(response, refreshedTokens);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
