import { z } from "zod";

export const healthIndicatorSchema = z.object({
  status: z.enum(["up", "down"]),
  message: z.string().optional(),
});

// Both the 200 report and the 503 error body carry `details` keyed by indicator.
export const healthSchema = z.object({
  details: z.record(z.string(), healthIndicatorSchema),
});
