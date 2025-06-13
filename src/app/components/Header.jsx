"use client";

import { useState } from 'react';
import Link from "next/link";
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { LoadingSpinner } from "@/components/ui/loading";
import { LoadingHeader } from "@/components/ui/loading";
import { ErrorCard } from "@/components/ui/error-boundary";
import { useUserRole } from "@/lib/hooks/useUserRole";
import { Navigation } from './Navigation/Navigation';
import { Logo } from './Logo';
import { UserButtonWrapper } from './UserButtonWrapper';

export default function Header() {
  const { isLoaded: clerkLoaded } = useUser();
  const { role, isLoading: roleLoading } = useUserRole();
  const [error, setError] = useState(null);

  const isOperations = role === 'OPERATIONS';

  if (!clerkLoaded || roleLoading) {
    return <LoadingHeader />
  }

  if (error) {
    return (
      <div className="sticky top-0 w-full bg-white border-b-2 z-1000">
        <ErrorCard
          error={error}
          message="Failed to load header"
          reset={() => setError(null)}
          className="m-4"
        />
      </div>
    );
  }

  return (
    <header className="sticky top-0 w-full bg-white border-b-2 z-1000">
      <div className="flex items-center h-16 justify-between">
        <div className="hidden md:flex items-center justify-center pl-5">
          <Logo />
        </div>
        <div className="flex items-center justify-end gap-6 mr-6 lg:mr-9">
          {!clerkLoaded ? (
            <LoadingSpinner size="small" />
          ) : (
            <>
              <SignedIn>
                <Navigation isOperations={isOperations} />
                <div className="relative">
                  <UserButtonWrapper />
                </div>
              </SignedIn>
              <SignedOut>
                <Link href="sign-in" className="hover:underline">Sign In</Link>
              </SignedOut>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
