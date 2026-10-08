import { NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import type { PrismaService } from '../common/prisma/prisma.service.js';
import { ArtworksService } from './artworks.service.js';

describe('ArtworksService', () => {
  const dbArtwork = {
    id: '00000000-0000-4000-8000-000000000001',
    title: 'Sunset Over the Ocean',
    artist: 'Claude Monet',
    type: 'painting' as const,
    price: new Prisma.Decimal('2750.50'),
    availability: true,
  };

  const notFound = new Prisma.PrismaClientKnownRequestError('No record found', {
    code: 'P2025',
    clientVersion: 'test',
  });

  let prisma: {
    artwork: {
      findMany: ReturnType<typeof vi.fn>;
      findUniqueOrThrow: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };
  let service: ArtworksService;

  beforeEach(() => {
    prisma = {
      artwork: {
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new ArtworksService(prisma as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('builds filters and price sorting from the query', async () => {
      prisma.artwork.findMany.mockResolvedValue([]);

      await service.findAll({
        price: 'desc',
        artist: 'monet',
        type: 'painting',
      });

      expect(prisma.artwork.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            type: 'painting',
            artist: { contains: 'monet', mode: 'insensitive' },
          },
          orderBy: [{ price: 'desc' }, { id: 'asc' }],
        }),
      );
    });

    it('sorts newest first when no price order is given', async () => {
      prisma.artwork.findMany.mockResolvedValue([]);

      await service.findAll({});

      expect(prisma.artwork.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: undefined, artist: undefined },
          orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        }),
      );
    });

    it('returns price as a number', async () => {
      prisma.artwork.findMany.mockResolvedValue([dbArtwork]);

      const [artwork] = await service.findAll({});

      expect(artwork.price).toBe(2750.5);
    });
  });

  describe('findOne', () => {
    it('throws Not Found when the artwork does not exist', async () => {
      prisma.artwork.findUniqueOrThrow.mockRejectedValue(notFound);

      await expect(service.findOne(dbArtwork.id)).rejects.toThrow(
        new NotFoundException('Artwork not found'),
      );
    });
  });

  describe('replace', () => {
    const body = {
      title: 'Sunset Over the Ocean',
      artist: 'Claude Monet',
      type: 'painting' as const,
      price: 4500,
      availability: false,
    };

    it('overwrites the whole artwork with the given body', async () => {
      prisma.artwork.update.mockResolvedValue(dbArtwork);

      await service.replace(dbArtwork.id, body);

      expect(prisma.artwork.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: dbArtwork.id }, data: body }),
      );
    });

    it('throws Not Found when the artwork does not exist', async () => {
      prisma.artwork.update.mockRejectedValue(notFound);

      await expect(service.replace(dbArtwork.id, body)).rejects.toThrow(
        new NotFoundException('Artwork not found'),
      );
    });
  });

  describe('remove', () => {
    it('throws Not Found when the artwork does not exist', async () => {
      prisma.artwork.delete.mockRejectedValue(notFound);

      await expect(service.remove(dbArtwork.id)).rejects.toThrow(
        new NotFoundException('Artwork not found'),
      );
    });
  });
});
