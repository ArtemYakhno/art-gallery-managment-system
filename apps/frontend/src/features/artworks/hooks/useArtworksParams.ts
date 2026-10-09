import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import {
  artworkTypeSchema,
  priceSortOrderSchema,
} from "@/common/schemas/artwork.schema";
import type {
  ArtworkFilters,
  ArtworkType,
  PriceSortOrder,
} from "@/common/types/artwork";

const artworksSearchParams = {
  price: parseAsStringLiteral(priceSortOrderSchema.options),
  type: parseAsStringLiteral(artworkTypeSchema.options),
  artist: parseAsString.withDefault(""),
};

export function useArtworksParams() {
  const [params, setParams] = useQueryStates(artworksSearchParams);

  const filters: ArtworkFilters = {
    price: params.price ?? undefined,
    type: params.type ?? undefined,
    artist: params.artist.trim() || undefined,
  };

  const setArtist = (artist: string) => void setParams({ artist });
  const setType = (type: ArtworkType | null) => void setParams({ type });
  const setPrice = (price: PriceSortOrder | null) => void setParams({ price });
  const resetFilters = () => void setParams(null);

  return {
    params,
    filters,
    hasActiveFilters: Boolean(filters.price || filters.type || filters.artist),
    setArtist,
    setType,
    setPrice,
    resetFilters,
  };
}
