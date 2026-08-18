import { CreateDepartmentSchema } from "@/schemas/create-department.schema";
import { apiClient } from "./api-client";
import { DepartmentRecord } from "@/types/department";
import { CsvUploadResult, PaginatedResult } from "@/types/students";

export const departmentsApi = {
  list: (params: { search?: string; page: number; limit: number }) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page));
    query.set("limit", String(params.limit));
    return apiClient.get<PaginatedResult<DepartmentRecord>>(
      `/departments?${query.toString()}`,
    );
  },
  create: (payload: CreateDepartmentSchema) =>
    apiClient.post<DepartmentRecord>("/departments", payload),
  remove: (id: string) => apiClient.delete<void>(`/departments/${id}`),
  bulkRemove: (ids: string[]) =>
    apiClient.post<{ deleted: number }>("/departments/bulk-delete", { ids }),
  bulkUpload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.postForm<CsvUploadResult>(
      "/departments/bulk-upload",
      formData,
    );
  },
  update: (id: string, payload: Partial<CreateDepartmentSchema>) =>
    apiClient.patch<DepartmentRecord>(`/departments/${id}`, payload),
};
