import { NextRequest, NextResponse } from "next/server";
import { refreshTokens } from "@/lib/api/refresh-session";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from "@/lib/api/cookie-config";

const BASE_URL = process.env.API_URL;

if (!BASE_URL) {
  throw new Error("API_URL is not defined");
}

function isBinaryResponse(contentType: string): boolean {
  const binaryTypes = [
    "application/pdf",
    "application/zip",
    "application/octet-stream",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/",
    "audio/",
    "video/",
  ];

  return binaryTypes.some((type) => contentType.includes(type));
}

// Helper to create response with proper body
async function createProxyResponse(response: Response): Promise<NextResponse> {
  const contentType =
    response.headers.get("content-type") || "application/json";

  // Forward content-disposition if present
  const contentDisposition = response.headers.get("content-disposition");

  const headers: Record<string, string> = {
    "Content-Type": contentType,
  };

  if (contentDisposition) {
    headers["Content-Disposition"] = contentDisposition;
  }

  const body = isBinaryResponse(contentType)
    ? await response.arrayBuffer()
    : await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers,
  });
}

async function bffRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const endpoint = `/${pathSegments.join("/")}`;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  const makeRequest = async (token: string | undefined) => {
    const headers = new Headers();

    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const body = ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.text();

    const url = new URL(request.url);
    const queryString = url.search;

    return fetch(`${BASE_URL}${endpoint}${queryString}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
  };

  let response = await makeRequest(accessToken);

  if (response.status === 401) {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    const tokens = refreshToken ? await refreshTokens(refreshToken) : null;

    if (tokens) {
      response = await makeRequest(tokens.accessToken);

      const nextResponse = await createProxyResponse(response);
      setAuthCookies(nextResponse, tokens);

      return nextResponse;
    }
  }

  return createProxyResponse(response);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return bffRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return bffRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return bffRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return bffRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return bffRequest(request, path);
}
