export type StudentRecord = {
  id: string;
  firstName: string;
  middleName?: string;
  surname: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  classOfDegree: string;
  dateOfGraduation: string;
  jambRegNumber: string;
  registrationNumber: string;
  isMilitary: boolean;
  stateOfOrigin: string;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type CsvRowError = { row: number; errors: Record<string, string[]> };
export type CsvUploadResult = { created: number; errors: CsvRowError[] };
