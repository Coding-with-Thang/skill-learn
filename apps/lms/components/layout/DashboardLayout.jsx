"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useUserRole } from "@skill-learn/lib/hooks/useUserRole.js";
import { LoadingPage } from "@skill-learn/ui/components/loading";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarProvider } from "@skill-learn/ui/components/sidebar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const { role, isLoading } = useUserRole();
  const pathname = usePathname();

  if (isLoading) {
    return <LoadingPage />;
  }

  const isOperations = role === 'OPERATIONS' || role === 'MANAGER';
  const isAdminRoute = isOperations && pathname?.startsWith('/dashboard');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar isOperations={isOperations} />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <TopBar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
