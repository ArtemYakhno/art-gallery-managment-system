import type { z } from "zod";
import type { healthSchema } from "@/common/schemas/health.schema";

export type Health = z.infer<typeof healthSchema>;
