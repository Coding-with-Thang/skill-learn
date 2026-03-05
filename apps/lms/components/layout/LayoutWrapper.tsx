"use client";

import { usePathname } from "@/i18n/navigation";
import PublicLayout from "@/components/layout/PublicLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useUser } from "@clerk/nextjs";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/" || pathname === "";

  // Show landing header/footer on any route where the user is NOT signed in.
  // Consider the user signed-in only when Clerk's isLoaded is true and user exists.
  const { isLoaded, user } = useUser();
  const isAuthenticated = isLoaded && !!user;
  const useLandingLayout = !isAuthenticated || isLandingPage;

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

