import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

type Role = "admin" | "staff" | "student";

type AuthPayload = JWTPayload & {
  sub: string;
  tokenVersion: number;
  jti: string;
  role: Role;
};

type RefreshedTokens = {
  accessToken: string;
  refreshToken: string;
};

const ADMIN_DASHBOARD = "/admin/students";
const STUDENT_DASHBOARD = "/student/dashboard";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

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

async function verifyAccessToken(
  token: string,
): Promise<AuthPayload | null> {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify<AuthPayload>(
      token,
      secretKey,
    );

    if (
      typeof payload.sub !== "string" ||
      typeof payload.jti !== "string" ||
      typeof payload.tokenVersion !== "number" ||
      !payload.role
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function refreshTokens(
  refreshToken: string,
): Promise<RefreshedTokens | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  try {
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json().catch(() => null);

    if (!json || !json.data) {
      return null;
    }

    const { accessToken, refreshToken: newRefreshToken } =
      json.data;

    if (
      typeof accessToken !== "string" ||
      typeof newRefreshToken !== "string"
    ) {
      return null;
    }

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch {
    return null;
  }
}

function setAuthCookies(
  response: NextResponse,
  tokens: RefreshedTokens,
): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 15,
    path: "/",
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}

function redirect(
  request: NextRequest,
  pathname: string,
): NextResponse {
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

  let accessToken = request.cookies.get(
    ACCESS_TOKEN_COOKIE,
  )?.value;

  const refreshToken = request.cookies.get(
    REFRESH_TOKEN_COOKIE,
  )?.value;

  let payload: AuthPayload | null = null;
  let refreshedTokens: RefreshedTokens | null = null;

  /*
   * First attempt: validate the current access token.
   */
  if (accessToken) {
    payload = await verifyAccessToken(accessToken);
  }

  /*
   * Second attempt: access token is missing/expired/invalid,
   * so try to rotate the refresh token.
   */
  if (!payload && refreshToken) {
    refreshedTokens = await refreshTokens(refreshToken);

    if (refreshedTokens) {
      accessToken = refreshedTokens.accessToken;

      payload = await verifyAccessToken(
        refreshedTokens.accessToken,
      );
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
      const response = redirect(
        request,
        STUDENT_DASHBOARD,
      );

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
      const response = redirect(
        request,
        ADMIN_DASHBOARD,
      );

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