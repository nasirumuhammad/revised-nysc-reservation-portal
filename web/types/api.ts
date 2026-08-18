export type ApiSuccessResponse<T> = {
  message: string;
  data?: T;
};

export type ApiErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
};
