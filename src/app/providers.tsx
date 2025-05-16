"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { TabProvider } from "@/contexts/TabContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <TabProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </TabProvider>
    </ThemeProvider>
  );
}
