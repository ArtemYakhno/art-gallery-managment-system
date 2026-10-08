import type { z } from "zod";
import { ApiValidationError } from "./errors";

export function parseApiResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiValidationError("Validation error: ", result.error);
  }
  return result.data;
}
