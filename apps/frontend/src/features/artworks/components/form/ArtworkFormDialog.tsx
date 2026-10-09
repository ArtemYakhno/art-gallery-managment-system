import { useState, type ReactNode } from "react";
import { useIsMutating } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import type { Artwork } from "@/common/types/artwork";
import { artworkKeys } from "@/features/artworks/queries/artworks.keys";
import { ArtworkForm } from "./ArtworkForm";

interface ArtworkFormDialogProps {
  artwork?: Artwork;
  trigger: ReactNode;
}

export function ArtworkFormDialog({
  artwork,
  trigger,
}: ArtworkFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isSaving =
    useIsMutating({ mutationKey: artworkKeys.save(artwork?.id) }) > 0;

  // Escape / outside click must not close the dialog while saving.
  const onOpenChange = (next: boolean) => {
    if (!isSaving) setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(event) => {
          if (!artwork) return;
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {artwork ? "Edit Artwork" : "Add New Artwork"}
          </DialogTitle>
          <DialogDescription>
            {artwork
              ? "Change the details and save."
              : "Fill in the details of the new piece."}
          </DialogDescription>
        </DialogHeader>
        <ArtworkForm artwork={artwork} closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
