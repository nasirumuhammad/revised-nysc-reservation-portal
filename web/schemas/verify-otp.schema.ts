import z from "zod";

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .trim()
    .length(6, "Invalid verification code")
    .regex(/^\d+$/, "invalid otp"),
});
