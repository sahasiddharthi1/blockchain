import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { BackgroundOrbs } from "@/components/layout/background-orbs";

export function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-grid">
      <BackgroundOrbs />
      <AppSidebar />
      <div className="relative z-10 flex flex-1 flex-col md:pl-64">
        <AppHeader />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
