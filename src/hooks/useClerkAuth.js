import { useUser, useAuth } from "@clerk/nextjs";

export function useClerkAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  return {
    user,
    isLoaded,
    isSignedIn,
    getToken,
    isAuthenticated: isLoaded && isSignedIn,
  };
}
