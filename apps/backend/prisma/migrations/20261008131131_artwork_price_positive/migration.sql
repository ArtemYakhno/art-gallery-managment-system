-- Prisma schema can't express CHECK constraints, so this one lives only in SQL.
-- Last line of defence: the API rejects price <= 0 earlier, in the DTO (400).
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_price_positive" CHECK ("price" > 0);
