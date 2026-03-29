"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import PublicLayout from "@/components/layout/PublicLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useUser } from "@clerk/nextjs";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLandingPage = pathname === "/" || pathname === "";
  const isForcePasswordRoute = pathname?.includes("/force-password-change");

  // Show landing header/footer on any route where the user is NOT signed in.
  // Consider the user signed-in only when Clerk's isLoaded is true and user exists.
  const { isLoaded, user } = useUser();
  const isAuthenticated = isLoaded && !!user;
  const mustChangePassword =
    isAuthenticated &&
    (user.publicMetadata as { mustChangePassword?: boolean })?.mustChangePassword === true;

  useEffect(() => {
    if (!isLoaded || !user || !mustChangePassword || isForcePasswordRoute) return;
    router.replace("/force-password-change");
  }, [isLoaded, user, mustChangePassword, isForcePasswordRoute, router]);

  const useLandingLayout = !isAuthenticated || isLandingPage;

  if (isAuthenticated && isForcePasswordRoute) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <>
      {useLandingLayout ? (
        <PublicLayout>
          {children}
        </PublicLayout>
      ) : (
        <DashboardLayout>
          {children}
        </DashboardLayout>
      )}
    </>
  );
}

