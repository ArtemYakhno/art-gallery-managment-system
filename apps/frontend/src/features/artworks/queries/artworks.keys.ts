import type { ArtworkFilters } from "@/common/types/artwork";

export const artworkKeys = {
  all: ["artworks"] as const,
  lists: () => [...artworkKeys.all, "list"] as const,
  list: (filters: ArtworkFilters) => [...artworkKeys.lists(), filters] as const,
  save: (id?: string) => [...artworkKeys.all, "save", id ?? "new"] as const,
};
