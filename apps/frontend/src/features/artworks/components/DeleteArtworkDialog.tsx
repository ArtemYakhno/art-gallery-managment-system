import { useRef, useState, type MouseEvent } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { Button } from "@/app/components/ui/button";
import type { Artwork } from "@/common/types/artwork";
import { useDeleteArtworkMutation } from "@/features/artworks/queries/useDeleteArtworkMutation";

export function DeleteArtworkDialog({ artwork }: { artwork: Artwork }) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteArtwork, isPending } = useDeleteArtworkMutation();

  const isDeleting = useRef(false);

  const onConfirm = (event: MouseEvent) => {
    // Keep the dialog open until the request is done (Action closes it by default).
    event.preventDefault();
    if (isDeleting.current) return;
    isDeleting.current = true;

    deleteArtwork(artwork.id, {
      onSuccess: () => setOpen(false),
      onSettled: () => {
        isDeleting.current = false;
      },
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) setOpen(next);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${artwork.title}`}
        >
          <Trash2 aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this artwork?</AlertDialogTitle>
          <AlertDialogDescription>
            “{artwork.title}” will be removed permanently.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Loader2 className="animate-spin" aria-hidden />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
