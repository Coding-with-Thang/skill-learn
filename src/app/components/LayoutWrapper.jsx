"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import FooterWrapper from "./FooterWrapper";
import TopBanner from "./User/Landing/TopBanner";
import LandingHeader from "./User/Landing/LandingHeader";
import LandingFooter from "./User/Landing/LandingFooter";

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
      {isLandingPage ? <LandingFooter /> : <FooterWrapper />}
    </>
  );
}

