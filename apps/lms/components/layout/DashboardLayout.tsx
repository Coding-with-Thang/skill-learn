"use client";

import { useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { usePermissionsStore } from "@skill-learn/lib/stores/permissionsStore";
import { LoadingPage } from "@skill-learn/ui/components/loading";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarProvider } from "@skill-learn/ui/components/sidebar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const hasAnyPermission = usePermissionsStore((s) => s.hasAnyPermission);
  const loading = usePermissionsStore((s) => s.isLoading);
  const fetchPermissions = usePermissionsStore((s) => s.fetchPermissions);
  const pathname = usePathname();

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  if (loading) {
    return <LoadingPage />;
  }

  // Check for admin permissions instead of roles
  const isOperations = hasAnyPermission([
    'dashboard.admin',
    'dashboard.manager',
    'users.create',
    'users.update',
    'roles.assign'
  ]);
  const isAdminRoute = isOperations && pathname?.startsWith('/dashboard');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOperations={isOperations} />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
