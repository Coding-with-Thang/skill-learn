"use client";

import { useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { usePermissionsStore } from "@skill-learn/lib/stores/permissionsStore";
import { LoadingPage } from "@skill-learn/ui/components/loading";
import { SidebarProvider, useSidebar } from "@skill-learn/ui/components/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@skill-learn/lib/utils";

function DashboardContent({ children, isOperations }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex min-h-screen bg-background w-full">
      <Sidebar isOperations={isOperations} />

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-w-0 pt-20",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

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
    <SidebarProvider>
      <DashboardContent isOperations={isOperations}>
        {children}
      </DashboardContent>
    </SidebarProvider>
  );
}
