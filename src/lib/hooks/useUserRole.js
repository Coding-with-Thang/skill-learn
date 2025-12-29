"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import api from "@/utils/axios";

export function useUserRole() {
  const { isLoaded: clerkLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef(null);

  const fetchRole = useCallback(async () => {
    if (!clerkLoaded) {
      return; // Wait for Clerk to load
    }

    if (!user) {
      setIsLoading(false);
      setRole(null);
      retryCountRef.current = 0;
      return;
    }

    try {
      // Wait a bit for the session to be fully established
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get token from the auth session
      const token = await getToken();

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // API returns { success: true, data: { user: {...} } }
      const responseData = response.data?.data || response.data;
      const userData = responseData?.user || responseData;
      setRole(userData?.role);
      setError(null);
      retryCountRef.current = 0;
    } catch (error) {
      console.error("Error fetching user role:", error);

      // Retry logic for temporary failures
      if (
        retryCountRef.current < 3 &&
        (error.code === "ECONNABORTED" ||
          error.response?.status === 401 ||
          error.response?.status >= 500)
      ) {
        retryCountRef.current += 1;
        timeoutRef.current = setTimeout(() => {
          fetchRole();
        }, 1000 * retryCountRef.current); // Exponential backoff
        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch user data"
      );
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [clerkLoaded, user, getToken]);

  useEffect(() => {
    fetchRole();

    // Cleanup function to clear timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [fetchRole]);

  const retry = useCallback(() => {
    // Clear any pending retry timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    retryCountRef.current = 0;
    setError(null);
    setIsLoading(true);
    fetchRole();
  }, [fetchRole]);

  return { role, isLoading, error, retry };
}
