import { Button } from "@/app/components/ui/button";
import type { ArtworkType, PriceSortOrder } from "@/common/types/artwork";
import { AddArtworkButton } from "../form/AddArtworkButton";
import { ArtworkSearchInput } from "./ArtworkSearchInput";
import { ArtworkSort } from "./ArtworkSort";
import { ArtworkTypeFilter } from "./ArtworkTypeFilter";

interface ArtworkToolbarProps {
  artist: string;
  type: ArtworkType | null;
  price: PriceSortOrder | null;
  hasActiveFilters: boolean;
  onArtistChange: (artist: string) => void;
  onTypeChange: (type: ArtworkType | null) => void;
  onPriceChange: (price: PriceSortOrder | null) => void;
  onReset: () => void;
}

export function ArtworkToolbar({
  artist,
  type,
  price,
  hasActiveFilters,
  onArtistChange,
  onTypeChange,
  onPriceChange,
  onReset,
}: ArtworkToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <ArtworkSearchInput value={artist} onChange={onArtistChange} />
      <ArtworkTypeFilter value={type} onChange={onTypeChange} />
      <ArtworkSort value={price} onChange={onPriceChange} />
      {hasActiveFilters && (
        <Button variant="ghost" onClick={onReset}>
          Reset
        </Button>
      )}
      <div className="sm:ml-auto">
        <AddArtworkButton />
      </div>
    </div>
  );
}
