import { StudentSigninSchema } from "@/schemas/student-signin.schema";
import { apiClient } from "./api-client";

export const authApi = {
  adminSignIn: (payload: { email: string; password: string }) =>
    apiClient.post("/auth/signin/admin", payload, { auth: false }),
  verifySigninOtp: (payload: { email: string; otp: string }) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>(
      "/auth/otp/verify-signin",
      payload,
      { auth: false },
    ),
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
  signout: () => apiClient.post<{ message: string }>("/auth/signout"),
  studentSignIn: (payload: StudentSigninSchema) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>(
      "/auth/signin/student",
      payload,
      { auth: false },
    ),
};
