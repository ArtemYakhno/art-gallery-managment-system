import { Pencil } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type { Artwork } from "@/common/types/artwork";
import { ArtworkFormDialog } from "./ArtworkFormDialog";

export function EditArtworkButton({ artwork }: { artwork: Artwork }) {
  return (
    <ArtworkFormDialog
      artwork={artwork}
      trigger={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${artwork.title}`}
        >
          <Pencil aria-hidden />
        </Button>
      }
    />
  );
}
