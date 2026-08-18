import { getCookie } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = ApiError.name;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const accessToken = await getCookie("accessToken");
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && {
        Authorization: `Bearer ${accessToken}`,
      }),
      ...options?.headers,
    },
  });

  const result = await response.json();

  if (!response.ok)
    throw new ApiError(result.message, response.status, result.errors);

  return result;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, options),
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  upload: <T>(endpoint: string, formData: FormData) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok)
        throw new ApiError(result.message, response.status, result.errors);
      return result as T;
    }),
};
