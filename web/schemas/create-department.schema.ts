import z from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1, "Department name is required").max(255),
});

export type CreateDepartmentSchema = z.infer<typeof createDepartmentSchema>;
