"use client";

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image"
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { Star, BookOpenText, ChartColumnBig, User } from 'lucide-react';
import logo from '../../../public/logo.svg'
import { LoadingSpinner } from "@/components/ui/loading"
import { LoadingHeader } from "@/components/ui/loading"
import { ErrorCard } from "@/components/ui/error-boundary"
import { Button } from "@/components/ui/button"


export default function Header() {
  const { isLoaded, isSignedIn } = useUser();
  const [error, setError] = useState(null);

  if (!isLoaded) {
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

  // Error boundary for UserButton
  const renderUserButton = () => {
    try {
      return (
        <UserButton
          appearance={{
            elements: {
              userButtonPopoverFooter: {
                display: 'none',
              },
            },
          }}
        />
      );
    } catch (err) {
      console.error("Failed to render UserButton:", err);
      return (
        <Button variant="ghost" className="w-10 h-10 rounded-full">
          <User className="h-5 w-5" />
        </Button>
      );
    }
  };

  return (
    <header className="sticky top-0 w-full bg-white border-b-2 z-1000">
      <div className="flex items-center h-16 justify-between">
        <div className="hidden md:flex items-center justify-center pl-5">
          <Link href="/" className="flex gap-1 items-center justify-center">
            <Image
              src={logo}
              width={48}
              alt="Skill-Learn"
            />
            <h1 className='font-bold text-2xl text-nowrap'>Skill-Learn</h1>
          </Link>
        </div>
        <div className="flex items-center justify-end gap-6 mr-6 lg:mr-9">
          {!isLoaded ? (
            <LoadingSpinner size="small" />
          ) : (
            <>
              <SignedIn>
                <Link href="/training" className="flex gap-1 items-center hover:underline">
                  <BookOpenText /> Training
                </Link>
                <Link href="/stats" className="flex gap-1 items-center hover:underline">
                  <ChartColumnBig /> My Stats
                </Link>
                <Link href="/rewards" className="flex gap-1 items-center hover:underline">
                  <Star /> Rewards
                </Link>
                <div className="relative">
                  {renderUserButton()}
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
