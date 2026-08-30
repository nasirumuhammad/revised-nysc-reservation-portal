import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(
      accessToken,
      new TextEncoder().encode(JWT_SECRET),
    );

    return NextResponse.json({
      user: {
        sub: payload.sub,
        role: payload.role,
        tokenVersion: payload.tokenVersion,
        jti: payload.jti,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 },
    );
  }
}
