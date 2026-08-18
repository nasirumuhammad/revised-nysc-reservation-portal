export type PaginatedResult<T> = {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type CsvRowError = { row: number; errors: Record<string, string[]> };
export type CsvUploadResult = { created: number; errors: CsvRowError[] };

export type ResourceApi<T> = {
  list: (params: {
    search?: string;
    page: number;
    limit: number;
  }) => Promise<PaginatedResult<T> | undefined>;
  remove: (id: string) => Promise<unknown>;
  bulkRemove: (ids: string[]) => Promise<unknown>;
};
