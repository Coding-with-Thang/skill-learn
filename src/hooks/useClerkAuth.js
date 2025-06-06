"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { clearAuthToken } from "@/utils/axios";

export function useClerkAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      clearAuthToken();
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return {
    user,
    isLoaded,
    isSignedIn,
    getToken,
    signOut: handleSignOut,
    isAuthenticated: isLoaded && isSignedIn,
  };
}
