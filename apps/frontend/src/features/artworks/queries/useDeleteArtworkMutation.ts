import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { artworksService } from "@/common/api/artworks";
import { handleMutationError } from "@/common/utils/errors/handleMutationError";
import { artworkKeys } from "./artworks.keys";

export function useDeleteArtworkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: artworksService.remove,
    onSuccess: () => {
      toast.success("Artwork deleted");
    },
    onError: (error) => handleMutationError(error),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: artworkKeys.lists() }),
  });
}
