import { TokenPair } from "./cookie-config";

const BASE_URL = process.env.API_URL;

if (!BASE_URL) {
  throw new Error("API_URL is not defined");
}

type ApiResponse<T> = {
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

/**
 * Exchanges a refresh token for a new access/refresh pair via the
 * NestJS API. Returns null on any failure (expired, revoked, replayed,
 * network error) — callers should treat null as "session is over."
 *
 * Shared by proxy.ts, the BFF passthrough, and /api/auth/me so the
 * rotation call is made exactly one way.
 */
export async function refreshTokens(
  refreshToken: string,
): Promise<TokenPair | null> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response
      .json()
      .catch(() => null)) as ApiResponse<TokenPair> | null;

    const data = json?.data;

    if (
      !data ||
      typeof data.accessToken !== "string" ||
      typeof data.refreshToken !== "string"
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
