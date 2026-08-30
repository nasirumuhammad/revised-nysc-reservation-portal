import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.API_URL;

if (!BASE_URL) {
  throw new Error("API_URL is not defined");
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(`${BASE_URL}/auth/otp/verify-signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.data) {
    return NextResponse.json(result || { message: "OTP verification failed" }, {
      status: response.status,
    });
  }

  // Check if result.data exists
  if (!result?.data) {
    console.error("No data in response:", result);
    return NextResponse.json(
      { message: "Invalid response from server" },
      { status: 500 },
    );
  }

  const { accessToken, refreshToken } = result.data;

  const nextResponse = NextResponse.json({
    message: result.message || "OTP verified successfully",
  });

  nextResponse.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });

  nextResponse.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return nextResponse;
}
