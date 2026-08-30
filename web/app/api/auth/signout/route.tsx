import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.API_URL;

if (!BASE_URL) {
  throw new Error("API_URL is not defined");
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const response = NextResponse.json(
    {
      message: "Signed out successfully",
      success: true,
    },
    { status: 200 },
  );

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set("accessToken", "", cookieOptions);
  response.cookies.set("refreshToken", "", cookieOptions);

  if (refreshToken) {
    await fetch(`${BASE_URL}/auth/signout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      cache: "no-store",
    }).catch((error) => {
      console.warn("Failed to invalidate token on NestJS:", error);
    });
  }

  return response;
}
