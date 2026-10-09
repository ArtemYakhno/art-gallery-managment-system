import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import type { Artwork } from "@/common/types/artwork";
import { formatPrice } from "@/common/utils/formatPrice";
import { ARTWORK_TYPE_CONFIG } from "@/features/artworks/constants/artworkType.config";
import { ArtworkImagePlaceholder } from "./ArtworkImagePlaceholder";
import { DeleteArtworkDialog } from "./DeleteArtworkDialog";
import { EditArtworkButton } from "./form/EditArtworkButton";

interface ArtworkCardProps {
  artwork: Artwork;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const { id, title, artist, type, price, availability } = artwork;

  return (
    <Card className="gap-3 pt-3">
      <CardContent className="space-y-3 px-3">
        <ArtworkImagePlaceholder id={id} type={type} />

        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug wrap-break-word">
            {title}
          </h3>
          <span className="shrink-0 font-semibold">{formatPrice(price)}</span>
        </div>

        <p className="text-xs text-muted-foreground">By: {artist}</p>

        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{ARTWORK_TYPE_CONFIG[type].label}</Badge>
            {availability ? (
              <Badge className="bg-green-100 text-green-800">For sale</Badge>
            ) : (
              <Badge variant="secondary">Exhibition only</Badge>
            )}
          </div>
          <div className="ml-auto flex shrink-0 gap-1">
            <EditArtworkButton artwork={artwork} />
            <DeleteArtworkDialog artwork={artwork} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
