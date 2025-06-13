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
        // Get token from the auth session
        const token = await getToken();
        console.log("Fetched token:", token);
        const { data } = await api.get("/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched user role data:", data);
        setRole(data.role);
        setError(null);
      } catch (error) {
        console.error("Error fetching user role:", error);
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
  }, [clerkLoaded, user, getToken]);

  return { role, isLoading, error };
}
