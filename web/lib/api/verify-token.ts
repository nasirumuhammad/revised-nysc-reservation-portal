import { jwtVerify, type JWTPayload } from "jose";

export type Role = "admin" | "staff" | "student";

export type AuthPayload = JWTPayload & {
  sub: string;
  tokenVersion: number;
  jti: string;
  role: Role;
};

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(secret);

/**
 * Verifies an access token's signature and shape. Runs on the edge
 * runtime (used by proxy.ts) as well as Node route handlers, so this
 * stays dependency-light — jose only, no Node-specific APIs.
 *
 * Returns null on any invalid/expired/malformed token rather than
 * throwing, so callers can treat "not authenticated" uniformly.
 */
export async function verifyAccessToken(
  token: string,
): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify<AuthPayload>(token, secretKey);

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
