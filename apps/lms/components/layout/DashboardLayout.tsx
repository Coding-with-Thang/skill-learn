"use client";

import { useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { usePermissionsStore } from "@skill-learn/lib/stores/permissionsStore";
import { LoadingPage } from "@skill-learn/ui/components/loading";
import { SidebarProvider, useSidebar } from "@skill-learn/ui/components/sidebar";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@skill-learn/lib/utils";
import { useUser, useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

/**
 * Check if user has admin/operations access.
 * Uses permissions API first, with Clerk metadata as fallback when API fails or returns empty.
 */
function useIsOperations() {
  const hasAnyPermission = usePermissionsStore((s) => s.hasAnyPermission);
  const permissions = usePermissionsStore((s) => s.permissions);
  const { user } = useUser();
  const { sessionClaims } = useAuth();

  const fromPermissions = hasAnyPermission([
    "dashboard.admin",
    "dashboard.manager",
    "users.create",
    "users.update",
    "roles.assign",
  ]);

  // Fallback when permissions API failed or returned empty - use Clerk metadata/session
  const canAccessAdmin = (user?.publicMetadata as { canAccessAdminDashboard?: boolean })?.canAccessAdminDashboard === true;
  const roleFromSession = (sessionClaims as { role?: string })?.role;
  const fromClerk = canAccessAdmin || roleFromSession === "OPERATIONS" || roleFromSession === "MANAGER";

  return fromPermissions || (permissions.length === 0 && fromClerk);
}

function DashboardContent({ children, isOperations }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex min-h-screen bg-background w-full">
      <Sidebar isOperations={isOperations} />

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-w-0",
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
  const loading = usePermissionsStore((s) => s.isLoading);
  const fetchPermissions = usePermissionsStore((s) => s.fetchPermissions);
  const pathname = usePathname();
  const isOperations = useIsOperations();
  const tLoader = useTranslations("loader");

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  if (loading) {
    return <LoadingPage translations={{
      brandName: tLoader("brandName"),
      peopleFirst: tLoader("peopleFirst"),
      potentialUp: tLoader("potentialUp"),
      poweringUp: tLoader("poweringUp"),
      unlockingInsights: tLoader("unlockingInsights"),
      optimizingJourney: tLoader("optimizingJourney"),
      footerTags: tLoader("footerTags"),
      footerBuilt: tLoader("footerBuilt"),
    }} />;
  }

  // Match /dashboard or /en/dashboard (locale-prefixed routes)
  const isAdminRoute = pathname?.includes("/dashboard");

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
