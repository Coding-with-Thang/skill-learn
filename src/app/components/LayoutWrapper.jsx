"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import TopBanner from "./Landing/TopBanner";
import LandingHeader from "./Landing/LandingHeader";
import LandingFooter from "./Landing/LandingFooter";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <>
      {isLandingPage ? (
        <>
          <TopBanner />
          <LandingHeader />
        </>
      ) : (
        <Header />
      )}
      {children}
      {isLandingPage ? <LandingFooter /> : <Footer />}
    </>
  );
}

