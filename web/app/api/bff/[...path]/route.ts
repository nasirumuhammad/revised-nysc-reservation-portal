import { getCookie, setAuthCookies, clearAuthCookies } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

type ApiResponse<T> = {
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

async function refreshTokens(): Promise<TokenPair | null> {
  const refreshToken = await getCookie("refreshToken");

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
    cache: "no-store",
  });

  const result = (await response
    .json()
    .catch(() => null)) as ApiResponse<TokenPair> | null;

  if (!response.ok || !result?.data) {
    await clearAuthCookies();
    return null;
  }

  await setAuthCookies(result.data.accessToken, result.data.refreshToken);

  return result.data;
}

export async function bffRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  let accessToken = await getCookie("accessToken");

  const makeRequest = async (token: string | undefined) => {
    const headers = new Headers(options.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  };

  let response = await makeRequest(accessToken);

  if (response.status !== 401) {
    return response;
  }

  const tokens = await refreshTokens();

  if (!tokens) {
    return response;
  }

  accessToken = tokens.accessToken;

  return makeRequest(accessToken);
}
