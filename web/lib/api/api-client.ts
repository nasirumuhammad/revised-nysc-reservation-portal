import { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";
import { ApiError } from "../api";

const BFF_BASE_URL = "/api/bff";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

async function performFetch(
  path: string,
  method: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<Response> {
  return fetch(`${BFF_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
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
  const { method = "GET", body, signal } = options;

  const response = await performFetch(path, method, body, signal);

  return parseResponse<T>(response);
}

async function requestForm<T>(
  path: string,
  formData: FormData,
): Promise<T | undefined> {
  const response = await fetch(`${BFF_BASE_URL}${path}`, {
    method: "POST",
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
  ) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body,
    }),

  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body,
    }),

  delete: <T>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body"> & {
      body?: unknown;
    },
  ) =>
    request<T>(path, {
      ...options,
      method: "DELETE",
    }),

  postForm: <T>(path: string, formData: FormData) =>
    requestForm<T>(path, formData),
};
