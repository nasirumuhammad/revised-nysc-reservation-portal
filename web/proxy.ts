import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";
import { Role } from "@nysc/enums";

const PUBLIC_ROUTES = [
  "/admin",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/verify",
  "/student/",
];

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some((path) => path === pathname);

async function refreshTokens(refreshToken: string, signinUrl: URL) {
  const refreshResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${refreshToken}` },
    },
  );
  if (!refreshResponse.ok) return NextResponse.redirect(signinUrl);

  const result = await refreshResponse.json();
  const response = NextResponse.next();

  response.cookies.set("accessToken", result.data.accessToken, {
    httpOnly: true,
    maxAge: 60 * 15,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  response.cookies.set("refreshToken", result.data.refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return response;
}

function getDashboardUrl(role: Role, request: NextRequest) {
  if (role === Role.STUDENT) return new URL("/students", request.nextUrl);
  return new URL("/admin/students", request.nextUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signinUrl = new URL("/admin", request.nextUrl);
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const accessTokenSecret = new TextEncoder().encode(process.env.JWT_SECRET);

  if (isPublicRoute(pathname)) {
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, accessTokenSecret);
        return NextResponse.redirect(
          getDashboardUrl(payload.role as Role, request),
        );
      } catch (error) {
        if (error instanceof JWTExpired && refreshToken) {
          try {
            const refreshTokenSecret = new TextEncoder().encode(
              process.env.JWT_REFRESH_SECRET,
            );
            const { payload } = await jwtVerify(
              refreshToken,
              refreshTokenSecret,
            );
            return NextResponse.redirect(
              getDashboardUrl(payload.role as Role, request),
            );
          } catch {
            return NextResponse.next();
          }
        }
      }
    }
    return NextResponse.next();
  }

  if (!refreshToken) return NextResponse.redirect(signinUrl);

  if (!accessToken) {
    try {
      return await refreshTokens(refreshToken, signinUrl);
    } catch {
      return NextResponse.redirect(signinUrl);
    }
  }

  try {
    const { payload } = await jwtVerify(accessToken, accessTokenSecret);

    // Student trying to access an admin route
    if (payload.role === Role.STUDENT && pathname.startsWith("/admin")) {
      return NextResponse.redirect(
        new URL("/students/dashboard", request.nextUrl),
      );
    }

    return NextResponse.next();
  } catch (error) {
    if (error instanceof JWTExpired) {
      try {
        return await refreshTokens(refreshToken, signinUrl);
      } catch {
        return NextResponse.redirect(signinUrl);
      }
    }
    return NextResponse.redirect(signinUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
