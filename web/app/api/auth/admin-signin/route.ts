import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/api/cookie-config";

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

  const { accessToken, refreshToken } = result.data;

  const nextResponse = NextResponse.json({
    message: result.message || "OTP verified successfully",
  });

  setAuthCookies(nextResponse, { accessToken, refreshToken });

  return nextResponse;
}
