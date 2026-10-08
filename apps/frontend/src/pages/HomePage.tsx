import { ApiStatus } from "@/features/health/components/ApiStatus";

// Temporary landing page: verifies the frontend reaches the API. Replaced by the gallery.
export function HomePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-8">
      <h1 className="text-2xl font-bold">ArtGalleryManager</h1>
      <section className="rounded-lg border p-4">
        <h2 className="mb-2 font-semibold">System status</h2>
        <ApiStatus />
      </section>
    </main>
  );
}
