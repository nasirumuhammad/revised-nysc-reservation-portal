import { z } from "zod";

export const Gender = ["male", "female"] as const;

export const ClassOfDegree = [
  "first class",
  "second class upper",
  "second class lower",
  "third class",
  "pass",
] as const;

export const Marital_status = ["single", "married"] as const;

export const createStudentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(255),

  middleName: z.string().trim().max(255).optional().or(z.literal("")),

  surname: z.string().trim().min(1, "Surname is required").max(255),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address."),

  gender: z.enum(Gender, {
    message: "Select a gender",
  }),

  dateOfBirth: z.string().min(1, "Date of birth is required"),

  maritalStatus: z.enum(Marital_status, {
    message: "Select a marital status",
  }),

  classOfDegree: z.enum(ClassOfDegree, {
    message: "Select a class of degree",
  }),

  dateOfGraduation: z.string().min(1, "Date of graduation is required"),

  jambRegNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "JAMB reg number is required")
    .max(50),

  registrationNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Registration number is required")
    .max(50),

  stateOfOrigin: z
    .string()
    .trim()
    .min(1, "State of origin is required")
    .max(100),

  isMilitary: z.boolean().default(false),
});

export const editStudentSchema = createStudentSchema.extend({
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
});

export type EditStudentSchema = z.infer<typeof editStudentSchema>;
export type CreateStudentSchema = z.infer<typeof createStudentSchema>;
