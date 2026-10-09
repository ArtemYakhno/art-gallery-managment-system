import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ArtworkFormDialog } from "./ArtworkFormDialog";

export function AddArtworkButton() {
  return (
    <ArtworkFormDialog
      trigger={
        <Button>
          <Plus aria-hidden />
          Add New Artwork
        </Button>
      }
    />
  );
}
