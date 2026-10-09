import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { artworksService } from "@/common/api/artworks";
import type { Artwork, ArtworkFormValues } from "@/common/types/artwork";
import { handleMutationError } from "@/common/utils/errors/handleMutationError";
import { artworkKeys } from "./artworks.keys";

const FIELD_MAP: Partial<Record<string, Path<ArtworkFormValues>>> = {
  title: "title",
  artist: "artist",
  type: "type",
  price: "price",
  availability: "availability",
};

export function useSaveArtworkMutation(
  artwork: Artwork | undefined,
  setError: UseFormSetError<ArtworkFormValues>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: artworkKeys.save(artwork?.id),
    mutationFn: (body: ArtworkFormValues) =>
      artwork
        ? artworksService.update(artwork.id, body)
        : artworksService.create(body),
    onSuccess: () => {
      toast.success(artwork ? "Artwork updated" : "Artwork added");
    },
    onError: (error) => handleMutationError(error, setError, FIELD_MAP),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: artworkKeys.lists() }),
  });
}
