// src/app/layout.tsx (no "use client" here!)
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import { Providers } from "./providers";
import NextTopLoader from "nextjs-toploader";
import { ClientRootLayout } from "./client-wrapper";

export const metadata: Metadata = {
  title: {
    template: "%s | Saudi Interpol",
    default: "Saudi Interpol",
  },
  description: "Saudi Interpol Chat Assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          <ClientRootLayout>{children}</ClientRootLayout>
        </Providers>
      </body>
    </html>
  );
}
