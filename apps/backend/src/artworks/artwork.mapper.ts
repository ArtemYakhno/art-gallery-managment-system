import type { Prisma } from '../generated/prisma/client.js';
import type { ArtworkResponseDto } from './dto/artwork-response.dto.js';

//timestamps stay internal
export const ARTWORK_SELECT = {
  id: true,
  title: true,
  artist: true,
  type: true,
  price: true,
  availability: true,
} satisfies Prisma.ArtworkSelect;

type SelectedArtwork = Prisma.ArtworkGetPayload<{
  select: typeof ARTWORK_SELECT;
}>;

export function toArtworkResponse(
  artwork: SelectedArtwork,
): ArtworkResponseDto {
  return { ...artwork, price: artwork.price.toNumber() };
}
