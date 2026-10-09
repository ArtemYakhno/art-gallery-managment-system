import { z } from "zod";
import {
  ARTWORK_ARTIST_MAX_LENGTH,
  ARTWORK_PRICE_MAX,
  ARTWORK_TITLE_MAX_LENGTH,
} from "@/common/constants/artwork.constants";

export const artworkTypeSchema = z.enum(
  ["painting", "sculpture", "photography", "drawing", "print"],
  { error: "Select a type" },
);

export const priceSortOrderSchema = z.enum(["asc", "desc"]);

export const artworkSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  type: artworkTypeSchema,
  price: z.number(),
  availability: z.boolean(),
});

export const artworkListSchema = z.array(artworkSchema);

const hasAtMostTwoDecimals = (value: number) =>
  Math.round(value * 100) / 100 === value;

export const artworkFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(
      ARTWORK_TITLE_MAX_LENGTH,
      `Title must be at most ${ARTWORK_TITLE_MAX_LENGTH} characters`,
    ),
  artist: z
    .string()
    .trim()
    .min(1, "Artist is required")
    .max(
      ARTWORK_ARTIST_MAX_LENGTH,
      `Artist must be at most ${ARTWORK_ARTIST_MAX_LENGTH} characters`,
    ),
  type: artworkTypeSchema,
  price: z
    .number({ error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .max(ARTWORK_PRICE_MAX, "Price is too large")
    .refine(hasAtMostTwoDecimals, "Price can have at most 2 decimal places"),
  availability: z.boolean(),
});
