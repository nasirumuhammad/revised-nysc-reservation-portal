import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/api/verify-token";
import { refreshTokens } from "@/lib/api/refresh-session";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/api/cookie-config";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  let payload = accessToken ? await verifyAccessToken(accessToken) : null;
  let refreshedTokens = null;

  /*
   * Access token missing/expired/invalid — try to rotate the
   * refresh token before reporting "not authenticated", so this
   * endpoint agrees with proxy.ts about session validity instead
   * of reporting logged-out during the window right after expiry.
   */
  if (!payload && refreshToken) {
    refreshedTokens = await refreshTokens(refreshToken);

    if (refreshedTokens) {
      payload = await verifyAccessToken(refreshedTokens.accessToken);
    }
  }

  if (!payload) {
    const response = NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 },
    );

    if (accessToken || refreshToken) {
      clearAuthCookies(response);
    }

    return response;
  }

  const response = NextResponse.json({
    user: {
      sub: payload.sub,
      role: payload.role,
      tokenVersion: payload.tokenVersion,
      jti: payload.jti,
    },
  });

  if (refreshedTokens) {
    setAuthCookies(response, refreshedTokens);
  }

  return response;
}
