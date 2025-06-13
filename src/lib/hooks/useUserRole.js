"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import api from "@/utils/axios";

export function useUserRole() {
  const { isLoaded: clerkLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchRole = async () => {
      if (!clerkLoaded) {
        return; // Wait for Clerk to load
      }

      if (!user) {
        setIsLoading(false);
        setRole(null);
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

        console.log("Fetching user role...");
        const { data } = await api.get("/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetched user role data:", data);
        setRole(data.role);
        setError(null);
        setRetryCount(0);
      } catch (error) {
        console.error("Error fetching user role:", error);

        // Retry logic for temporary failures
        if (
          retryCount < 3 &&
          (error.code === "ECONNABORTED" ||
            error.response?.status === 401 ||
            error.response?.status >= 500)
        ) {
          console.log(`Retrying user role fetch (attempt ${retryCount + 1})`);
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            fetchRole();
          }, 1000 * (retryCount + 1)); // Exponential backoff
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
    };

    fetchRole();
  }, [clerkLoaded, user, getToken, retryCount]);

  return { role, isLoading, error, retry: () => setRetryCount(0) };
}
