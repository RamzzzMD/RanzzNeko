"use client";

import { useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        theme="dark"
        position="top-center"
        richColors
        toastOptions={{
          style: {
            background: "hsl(0 0% 7%)",
            border: "1px solid hsl(0 0% 16%)",
            color: "hsl(0 0% 98%)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
