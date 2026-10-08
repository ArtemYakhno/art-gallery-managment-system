import { HttpStatusCode } from "axios";
import { apiClient } from "@/common/lib/apiClient";
import { parseApiResponse } from "@/common/utils/errors/parseApiResponse";
import { healthSchema } from "@/common/schemas/health.schema";
import type { Health } from "@/common/types/health";

export const healthService = {
  // A 503 still means the API answered — it reports which indicator is down,
  // so it is parsed as data instead of being thrown.
  getHealth: async (): Promise<Health> => {
    const { data } = await apiClient.get("/health", {
      validateStatus: (status) =>
        status === HttpStatusCode.Ok ||
        status === HttpStatusCode.ServiceUnavailable,
    });
    return parseApiResponse(healthSchema, data);
  },
};
