import { StaffRecord } from "@/types/staffs";
import { apiClient } from "./api-client";
import {
  CreateStaffSchema,
  EditStaffSchema,
} from "@/schemas/create-staff.schema";
import { CsvUploadResult, PaginatedResult } from "@/types/students";

export const staffApi = {
  list: (params: { search?: string; page: number; limit: number }) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page));
    query.set("limit", String(params.limit));
    return apiClient.get<PaginatedResult<StaffRecord>>(
      `/staff?${query.toString()}`,
    );
  },
  create: (payload: CreateStaffSchema) =>
    apiClient.post<StaffRecord>("/staff", payload),
  remove: (id: string) => apiClient.delete<void>(`/staff/${id}`),
  bulkRemove: (ids: string[]) =>
    apiClient.post<{ deleted: number }>("/staff/bulk-delete", { ids }),
  bulkUpload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.postForm<CsvUploadResult>("/staff/bulk-upload", formData);
  },
  update: (id: string, payload: Partial<EditStaffSchema>) =>
    apiClient.patch<StaffRecord>(`/staff/${id}`, payload),
};
