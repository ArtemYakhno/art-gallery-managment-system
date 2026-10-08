import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/common/lib/queryClient";
import { HomePage } from "@/pages/HomePage";

// Temporary: renders the API status page directly. The router arrives with the gallery pages.
export const GlobalProvider = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HomePage />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
