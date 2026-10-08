import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/common/api/health";
import { healthKeys } from "./health.keys";

export function useHealthQuery() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: healthService.getHealth,
  });
}
