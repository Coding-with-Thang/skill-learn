"use client";

import { useState, useEffect, useCallback } from "react";
import api from '../utils/axios';

/**
 * React hook for checking subscription status on the client
 */
export function useSubscription() {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get("/subscription/status");
      setStatus(response.data);
    } catch (err) {
      console.error("Error fetching subscription status:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch subscription status");
      setStatus({
        authenticated: false,
        isActive: false,
        needsOnboarding: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    // Status data
    status,
    isLoading,
    error,

    // Convenience accessors
    isAuthenticated: status?.authenticated ?? false,
    isActive: status?.isActive ?? false,
    isTrialing: status?.isTrialing ?? false,
    isPastDue: status?.isPastDue ?? false,
    isCanceled: status?.isCanceled ?? false,
    needsPayment: status?.needsPayment ?? false,
    needsOnboarding: status?.needsOnboarding ?? false,
    canWrite: status?.canWrite ?? false,
    canRead: status?.canRead ?? false,
    tenant: status?.tenant ?? null,
    message: status?.message ?? null,
    redirectTo: status?.redirectTo ?? null,
    showWarning: status?.showWarning ?? false,

    // Actions
    refresh: fetchStatus,
  };
}

export default useSubscription;
