"use client"

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import HeroSection from "@/components/features/landing/HeroSection";
import BuiltForEveryone from '@/components/features/landing/BuiltForEveryone';
import VersatilePlatform from '@/components/features/landing/VersatilePlatform';
import SkillLearnHere from '@/components/features/landing/SkillLearnHere';
import FAQ from '@/components/features/landing/FAQ';
import Testimonials from '@/components/features/landing/Testimonials';
import { LoadingPage } from "@/components/ui/loading"
import { ErrorCard } from "@/components/ui/error-boundary"

/**
 * Landing Page - Public facing marketing page for non-authenticated users
 * Authenticated users are automatically redirected to /home via middleware
 */
export default function LandingPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [error, setError] = useState(null);
  const pathname = usePathname();

  // Client-side redirect fallback (middleware handles server-side)
  useEffect(() => {
    if (isLoaded && user) {
      router.push('/home');
    }
  }, [isLoaded, user, router]);

  // Don't show the global loading spinner when the client is still resolving
  // on the landing page root ("/") — avoid blocker UI flicker for public root.
  if (!isLoaded && pathname !== '/') {
    return <LoadingPage />;
  }

  // Show loading while redirecting authenticated users
  if (user) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorCard
          error={error}
          message="Failed to load landing page"
          reset={() => setError(null)}
        />
      </main>
    );
  }

  // Wrap each section in error boundaries
  const renderSection = (Component, props = {}) => {
    try {
      return <Component {...props} />;
    } catch (err) {
      console.error(`Failed to render ${Component.name}:`, err);
      return (
        <ErrorCard
          error={err}
          message={`Failed to load ${Component.name}`}
        />
      );
    }
  };

  return (
    <main className="w-full">
      {renderSection(HeroSection)}
      {renderSection(BuiltForEveryone)}
      {renderSection(VersatilePlatform)}
      {renderSection(SkillLearnHere)}
      {renderSection(FAQ)}
      {renderSection(Testimonials)}
    </main>
  );
}
