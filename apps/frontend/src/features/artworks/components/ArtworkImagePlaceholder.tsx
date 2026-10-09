import type { ArtworkType } from "@/common/types/artwork";
import { ARTWORK_TYPE_CONFIG } from "@/features/artworks/constants/artworkType.config";
import { getArtworkGradient } from "@/features/artworks/utils/getArtworkGradient";

interface ArtworkImagePlaceholderProps {
  id: string;
  type: ArtworkType;
}

export function ArtworkImagePlaceholder({
  id,
  type,
}: ArtworkImagePlaceholderProps) {
  const Icon = ARTWORK_TYPE_CONFIG[type].icon;

  return (
    <div
      aria-hidden
      className="flex aspect-4/3 items-center justify-center rounded-lg"
      style={{ backgroundImage: getArtworkGradient(id) }}
    >
      <Icon className="size-12 text-white/70" strokeWidth={1.5} />
    </div>
  );
}
