import z from "zod";

export const createStaffSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(255),
  middleName: z.string().trim().max(255).optional().or(z.literal("")),
  surname: z.string().trim().min(1, "Surname is required").max(255),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address."),
  staffId: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Staff ID is required")
    .max(50),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
});

export const editStaffSchema = createStaffSchema.extend({
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
});

export type EditStaffSchema = z.infer<typeof editStaffSchema>;
export type CreateStaffSchema = z.infer<typeof createStaffSchema>;
