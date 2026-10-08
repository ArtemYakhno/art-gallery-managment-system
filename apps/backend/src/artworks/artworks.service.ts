import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { rethrowPrismaError } from '../common/utils/prisma-errors.js';
import { ARTWORK_SELECT, toArtworkResponse } from './artwork.mapper.js';
import type { ArtworkResponseDto } from './dto/artwork-response.dto.js';
import type { CreateArtworkDto } from './dto/create-artwork.dto.js';
import type { GetArtworksQueryDto } from './dto/get-artworks-query.dto.js';
import type { ReplaceArtworkDto } from './dto/replace-artwork.dto.js';

@Injectable()
export class ArtworksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetArtworksQueryDto): Promise<ArtworkResponseDto[]> {
    const where: Prisma.ArtworkWhereInput = {
      type: query.type,
      artist: query.artist
        ? { contains: query.artist, mode: 'insensitive' }
        : undefined,
    };

    // id as a tie-breaker keeps the order stable when prices or dates are equal.
    const orderBy: Prisma.ArtworkOrderByWithRelationInput[] = query.price
      ? [{ price: query.price }, { id: 'asc' }]
      : [{ createdAt: 'desc' }, { id: 'asc' }];

    const artworks = await this.prisma.artwork.findMany({
      where,
      orderBy,
      select: ARTWORK_SELECT,
    });

    return artworks.map(toArtworkResponse);
  }

  async findOne(id: string): Promise<ArtworkResponseDto> {
    const artwork = await this.prisma.artwork
      .findUniqueOrThrow({ where: { id }, select: ARTWORK_SELECT })
      .catch((error: unknown) =>
        rethrowPrismaError(error, { P2025: 'Artwork not found' }),
      );

    return toArtworkResponse(artwork);
  }

  async create(dto: CreateArtworkDto): Promise<ArtworkResponseDto> {
    const artwork = await this.prisma.artwork.create({
      data: dto,
      select: ARTWORK_SELECT,
    });

    return toArtworkResponse(artwork);
  }

  async replace(
    id: string,
    dto: ReplaceArtworkDto,
  ): Promise<ArtworkResponseDto> {
    const artwork = await this.prisma.artwork
      .update({ where: { id }, data: dto, select: ARTWORK_SELECT })
      .catch((error: unknown) =>
        rethrowPrismaError(error, { P2025: 'Artwork not found' }),
      );

    return toArtworkResponse(artwork);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.artwork
      .delete({ where: { id } })
      .catch((error: unknown) =>
        rethrowPrismaError(error, { P2025: 'Artwork not found' }),
      );
  }
}
