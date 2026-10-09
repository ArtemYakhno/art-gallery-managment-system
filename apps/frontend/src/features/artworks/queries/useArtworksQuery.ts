import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { artworksService } from "@/common/api/artworks";
import type { ArtworkFilters } from "@/common/types/artwork";
import { artworkKeys } from "./artworks.keys";

export function useArtworksQuery(filters: ArtworkFilters) {
  return useQuery({
    queryKey: artworkKeys.list(filters),
    queryFn: () => artworksService.getAll(filters),
    placeholderData: keepPreviousData,
  });
}
