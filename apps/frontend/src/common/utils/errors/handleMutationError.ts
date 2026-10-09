import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import {
  extractErrorMessage,
  extractFieldErrors,
} from "@/common/utils/errors/errors";

export function handleMutationError<T extends FieldValues>(
  error: unknown,
  setError?: UseFormSetError<T>,
  fieldMap?: Partial<Record<string, Path<T>>>,
) {
  const fieldErrors = extractFieldErrors(error);

  let mappedCount = 0;

  if (setError && fieldMap && Object.keys(fieldErrors).length > 0) {
    Object.entries(fieldErrors).forEach(([backendField, message]) => {
      const formField = fieldMap[backendField];
      if (!formField) return;

      setError(formField, { type: "server", message });
      mappedCount += 1;
    });
  }

  const hasUnmappedErrors =
    Object.keys(fieldErrors).length === 0 ||
    mappedCount < Object.keys(fieldErrors).length;

  if (hasUnmappedErrors) {
    toast.error(extractErrorMessage(error));
  }
}
