import { ArtworkList } from "@/features/artworks/components/ArtworkList";
import { ArtworkToolbar } from "@/features/artworks/components/filters/ArtworkToolbar";
import { useArtworksParams } from "@/features/artworks/hooks/useArtworksParams";

export function GalleryPage() {
  const {
    params,
    filters,
    hasActiveFilters,
    setArtist,
    setType,
    setPrice,
    resetFilters,
  } = useArtworksParams();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Explore Our Collection</h1>
      <ArtworkToolbar
        artist={params.artist}
        type={params.type}
        price={params.price}
        hasActiveFilters={hasActiveFilters}
        onArtistChange={setArtist}
        onTypeChange={setType}
        onPriceChange={setPrice}
        onReset={resetFilters}
      />
      <ArtworkList
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />
    </section>
  );
}
