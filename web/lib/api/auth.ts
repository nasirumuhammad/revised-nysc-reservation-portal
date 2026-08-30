import { StudentSigninSchema } from "@/schemas/student-signin.schema";
import { apiClient } from "./api-client";
import { ApiError } from "./api-error";

export const authApi = {
  adminSignIn: (payload: { email: string; password: string }) =>
    apiClient.post("/auth/signin/admin", payload, { auth: false }),

  verifySigninOtp: async (payload: { email: string; otp: string }) => {
    const response = await fetch("/api/auth/admin-signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        result?.message || "OTP verification failed",
        response.status,
        result?.errors,
      );
    }
  },

  studentSignIn: async (payload: StudentSigninSchema) => {
    const response = await fetch("/api/auth/student-signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        result?.message || "Authentication failed",
        response.status,
        result?.errors,
      );
    }

    return result;
  },

  signout: async () => {
    const response = await fetch("/api/auth/signout", {
      method: "POST",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        result?.message || "Signout failed",
        response.status,
        result?.errors,
      );
    }

    return result;
  },

  resendLoginOtp: (email: string) =>
    apiClient.post<string>(
      "/auth/otp/resend-login",
      { email },
      { auth: false },
    ),

  forgotPassword: (email: string) =>
    apiClient.post<string>(
      "/auth/reset-password/request",
      { email },
      { auth: false },
    ),

  resendForgotPasswordOtp: (email: string) =>
    apiClient.post<string>(
      "/auth/reset-password/resend-otp",
      { email },
      { auth: false },
    ),

  verifyResetOtp: (payload: { email: string; otp: string }) =>
    apiClient.post<{ resetToken: string }>(
      "/auth/reset-password/verify-otp",
      payload,
      { auth: false },
    ),

  resetPassword: (payload: { token: string; password: string }) =>
    apiClient.post<string>("/auth/reset-password", payload, { auth: false }),
};
