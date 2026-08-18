import { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";
import { ApiError } from "../api";
import { tokenStorage } from "./token-storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  const json = (await response.json().catch(() => null)) as
    | ApiSuccessResponse<{ accessToken: string; refreshToken: string }>
    | ApiErrorResponse
    | null;

  if (!response.ok || !json || !("data" in json) || !json.data) {
    tokenStorage.clear();
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  tokenStorage.setTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken;
}

async function performFetch(
  path: string,
  method: string,
  body: unknown,
  accessToken: string | null,
  auth: boolean,
  signal?: AbortSignal,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    signal,
    body: typeof body !== "undefined" ? JSON.stringify(body) : undefined,
  });
}

async function parseResponse<T>(response: Response): Promise<T | undefined> {
  const json = (await response.json().catch(() => null)) as
    | ApiSuccessResponse<T>
    | ApiErrorResponse
    | null;

  if (!response.ok) {
    const errorBody = json as ApiErrorResponse | null;
    throw new ApiError(
      errorBody?.message ?? "Something went wrong. Please try again.",
      response.status,
      errorBody?.errors,
    );
  }

  return (json as ApiSuccessResponse<T> | null)?.data;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T | undefined> {
  const { method = "GET", body, auth = true, signal } = options;

  let response = await performFetch(
    path,
    method,
    body,
    tokenStorage.getAccessToken(),
    auth,
    signal,
  );

  if (response.status === 401 && auth) {
    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newAccessToken = await refreshPromise;
      response = await performFetch(
        path,
        method,
        body,
        newAccessToken,
        auth,
        signal,
      );
    } catch {
      tokenStorage.clear();
      throw new ApiError("Session expired. Please sign in again.", 401);
    }
  }

  return parseResponse<T>(response);
}

async function requestForm<T>(
  path: string,
  formData: FormData,
): Promise<T | undefined> {
  const accessToken = tokenStorage.getAccessToken();
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  return parseResponse<T>(response);
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body"> & { body?: unknown },
  ) => request<T>(path, { ...options, method: "DELETE" }),
  postForm: <T>(path: string, formData: FormData) =>
    requestForm<T>(path, formData),
};
