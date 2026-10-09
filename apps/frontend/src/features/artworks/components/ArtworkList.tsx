import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/common/lib/cn";
import type { ArtworkFilters } from "@/common/types/artwork";
import { extractErrorMessage } from "@/common/utils/errors/errors";
import { useArtworksQuery } from "@/features/artworks/queries/useArtworksQuery";
import { ArtworkCard } from "./ArtworkCard";

const SKELETON_COUNT = 3;
const GRID_CLASS = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

interface ArtworkListProps {
  filters: ArtworkFilters;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function ArtworkList({
  filters,
  hasActiveFilters,
  onResetFilters,
}: ArtworkListProps) {
  const { data, error, isPending, isPlaceholderData, refetch } =
    useArtworksQuery(filters);

  if (isPending) {
    return (
      <div className={GRID_CLASS} aria-label="Loading artworks">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <Skeleton key={index} className="aspect-4/3 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground">{extractErrorMessage(error)}</p>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return hasActiveFilters ? (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground">No artworks match your filters</p>
        <Button variant="outline" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    ) : (
      <p className="py-12 text-center text-muted-foreground">
        No artworks found
      </p>
    );
  }

  return (
    <ul
      className={cn(
        GRID_CLASS,
        "transition-opacity",
        isPlaceholderData && "opacity-60",
      )}
    >
      {data.map((artwork) => (
        <li key={artwork.id}>
          <ArtworkCard artwork={artwork} />
        </li>
      ))}
    </ul>
  );
}
