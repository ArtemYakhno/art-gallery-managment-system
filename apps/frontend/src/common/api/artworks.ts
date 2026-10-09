import { apiClient } from "@/common/lib/apiClient";
import { parseApiResponse } from "@/common/utils/errors/parseApiResponse";
import {
  artworkListSchema,
  artworkSchema,
} from "@/common/schemas/artwork.schema";
import type {
  Artwork,
  ArtworkFilters,
  ArtworkFormValues,
} from "@/common/types/artwork";

export const artworksService = {
  getAll: async (filters: ArtworkFilters = {}): Promise<Artwork[]> => {
    const { data } = await apiClient.get("/artworks", {
      params: {
        price: filters.price,
        type: filters.type,
        artist: filters.artist?.trim() || undefined,
      },
    });
    return parseApiResponse(artworkListSchema, data);
  },

  create: async (body: ArtworkFormValues): Promise<Artwork> => {
    const { data } = await apiClient.post("/artworks", body);
    return parseApiResponse(artworkSchema, data);
  },

  update: async (id: string, body: ArtworkFormValues): Promise<Artwork> => {
    const { data } = await apiClient.put(`/artworks/${id}`, body);
    return parseApiResponse(artworkSchema, data);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/artworks/${id}`);
  },
};
