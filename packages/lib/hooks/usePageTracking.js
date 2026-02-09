"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuditLog } from "./useAuditLog.js";

export function usePageTracking() {
  const router = useRouter();
  const { logUserAction } = useAuditLog();

  useEffect(() => {
    const handleRouteChange = (url) => {
      logUserAction("view", "page", null, `Visited page: ${url}`);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    // Log initial page load
    handleRouteChange(router.asPath);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router, logUserAction]);
}
