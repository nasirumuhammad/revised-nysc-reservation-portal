import {
  CsvUploadResult,
  PaginatedResult,
  StudentRecord,
} from "@/types/students";
import { apiClient } from "./api-client";
import {
  CreateStudentSchema,
  EditStudentSchema,
} from "@/schemas/create-student.schema";

export const studentsApi = {
  getMe: () => apiClient.get<StudentRecord>("/students/me"),
  list: (params: { search?: string; page: number; limit: number }) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page));
    query.set("limit", String(params.limit));
    return apiClient.get<PaginatedResult<StudentRecord>>(
      `/students?${query.toString()}`,
    );
  },
  remove: (id: string) => apiClient.delete<void>(`/students/${id}`),
  bulkRemove: (ids: string[]) =>
    apiClient.post<{ deleted: number }>("/students/bulk-delete", { ids }),
  bulkUpload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.postForm<CsvUploadResult>(
      "/students/bulk-upload",
      formData,
    );
  },
  create: (payload: CreateStudentSchema) =>
    apiClient.post<StudentRecord>("/students", payload),
  update: (id: string, payload: Partial<EditStudentSchema>) =>
    apiClient.patch<StudentRecord>(`/students/${id}`, payload),
};
