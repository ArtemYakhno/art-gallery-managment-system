import type { z } from "zod";
import type {
  artworkFormSchema,
  artworkSchema,
  artworkTypeSchema,
  priceSortOrderSchema,
} from "@/common/schemas/artwork.schema";

export type Artwork = z.infer<typeof artworkSchema>;
export type ArtworkType = z.infer<typeof artworkTypeSchema>;
export type PriceSortOrder = z.infer<typeof priceSortOrderSchema>;
export type ArtworkFormValues = z.infer<typeof artworkFormSchema>;

export type ArtworkFilters = {
  price?: PriceSortOrder;
  artist?: string;
  type?: ArtworkType;
};
