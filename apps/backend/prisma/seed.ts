import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client.js';
import type { Prisma } from '../src/generated/prisma/client.js';

// Standalone script (not part of Nest), so env comes from the root .env directly.
config({ path: '../../.env' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// Fixed ids make the seed idempotent: re-running updates, never duplicates.
const artworks: Prisma.ArtworkCreateInput[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    title: 'Sunset Over the Ocean',
    artist: 'Claude Monet',
    type: 'painting',
    price: 4500,
    availability: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    title: 'Woman with a Guitar',
    artist: 'Pablo Picasso',
    type: 'painting',
    price: 12000,
    availability: false,
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    title: 'The Thinker (Bronze Cast)',
    artist: 'Auguste Rodin',
    type: 'sculpture',
    price: 30000,
    availability: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    title: 'Moonrise over the Valley',
    artist: 'Ansel Adams',
    type: 'photography',
    price: 2750.5,
    availability: true,
  },
];

async function main() {
  for (const artwork of artworks) {
    await prisma.artwork.upsert({
      where: { id: artwork.id },
      update: artwork,
      create: artwork,
    });
  }
  console.log(`Seeded ${artworks.length} artworks`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
