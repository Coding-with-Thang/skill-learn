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
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

export default function Header() {
  const { isLoaded: clerkLoaded } = useUser();
  const { role, isLoading: roleLoading } = useUserRole();
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOperations = role === 'OPERATIONS';

  if (!clerkLoaded || roleLoading) {
    return <LoadingHeader />
  }

  if (error) {
    return (
      <div className="sticky top-0 w-full bg-background border-b-2 z-1000">
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
    <header className="sticky top-0 w-full z-1000 bg-[var(--background)] text-[var(--secondary-foreground)] font-fun transition-colors duration-300">
      <div className="flex items-center h-16 justify-between px-4 md:px-0">
        {/* Logo always visible */}
        <div className="flex items-center justify-center pl-0 md:pl-5">
          <Logo />
        </div>
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center justify-end gap-6 mr-6 lg:mr-9">
          <ThemeSwitcher />
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
        {/* Mobile menu button */}
        <div className="flex md:hidden items-center">
          <button
            aria-label="Open menu"
            className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {/* Hamburger icon */}
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b-2 px-4 pb-4 animate-fade-in z-50 bg-background text-foreground font-fun transition-colors duration-300">
          <ThemeSwitcher />
          {!clerkLoaded ? (
            <div className="py-4 flex justify-center"><LoadingSpinner size="small" /></div>
          ) : (
            <>
              <SignedIn>
                <Navigation isOperations={isOperations} mobile />
                <div className="mt-2">
                  <UserButtonWrapper />
                </div>
              </SignedIn>
              <SignedOut>
                <Link href="sign-in" className="block py-2 hover:underline">Sign In</Link>
              </SignedOut>
            </>
          )}
        </div>
      )}
    </header>
  );
}
