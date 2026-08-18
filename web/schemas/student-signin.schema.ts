import z from "zod";

export const studentSigninSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Registration number is required"),
  password: z.string().trim().min(1, "Password is required"),
});

export type StudentSigninSchema = z.infer<typeof studentSigninSchema>;
