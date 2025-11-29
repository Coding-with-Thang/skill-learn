"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import PublicLayout from "./PublicLayout";
import { useUser } from "@clerk/nextjs";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

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
        <>
          <Header />
          {children}
          <Footer />
        </>
      )}
    </>
  );
}

