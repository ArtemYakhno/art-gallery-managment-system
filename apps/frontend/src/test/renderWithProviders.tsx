import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

// Renders UI inside a fresh QueryClient (retry off, so failures surface
// immediately). The client is returned so a test can seed the cache.
// MemoryRouter joins here once the app has routes.
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient() }: { queryClient?: QueryClient } = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper }), queryClient };
}
