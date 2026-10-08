import type { AxiosError } from "axios";
import type { ZodError } from "zod";

export class ApiValidationError extends Error {
  readonly zodError: ZodError;

  constructor(message: string, zodError: ZodError) {
    super(message);
    this.name = "ApiValidationError";
    this.zodError = zodError;
  }
}

interface BackendErrorBody {
  statusCode?: number;
  message?: string;
  errors?: Record<string, string[]>;
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiValidationError)
    return "Server returned unexpected data";

  const axiosError = error as AxiosError<BackendErrorBody>;
  if (!axiosError?.response) return "No server connection";

  return axiosError.response.data?.message ?? "An unknown error occurred";
}
