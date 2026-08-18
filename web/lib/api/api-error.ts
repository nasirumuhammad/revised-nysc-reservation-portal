export class ApiError extends Error {
  readonly statusCode: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}
