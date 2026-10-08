-- CreateEnum
CREATE TYPE "ArtworkType" AS ENUM ('painting', 'sculpture', 'photography', 'drawing', 'print');

-- CreateTable
CREATE TABLE "Artwork" (
    "id" UUID NOT NULL,
    "title" VARCHAR(99) NOT NULL,
    "artist" VARCHAR(50) NOT NULL,
    "type" "ArtworkType" NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
);
