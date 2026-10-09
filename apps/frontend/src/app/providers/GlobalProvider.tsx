import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/react";
import { Toaster } from "sonner";
import { MainLayout } from "@/app/layouts/MainLayout";
import { queryClient } from "@/common/lib/queryClient";
import { GalleryPage } from "@/pages/GalleryPage";

export const GlobalProvider = () => {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <MainLayout>
          <GalleryPage />
        </MainLayout>
        <Toaster position="top-right" richColors />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </NuqsAdapter>
  );
};
