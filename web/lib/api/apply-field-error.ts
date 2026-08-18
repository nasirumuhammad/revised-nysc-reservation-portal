import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "../api";

export function applyFieldErrors<T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>,
): boolean {
  if (!error.errors) return false;
  for (const [field, messages] of Object.entries(error.errors)) {
    setError(field as Path<T>, { message: messages[0] });
  }
  return true;
}
