"use client"

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroBanner from "./HeroBanner";
import Features from './Features';
import HowItWorks from './HowItWorks';
import Testimonials from './Testimonials';
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

  // Client-side redirect fallback (middleware handles server-side)
  useEffect(() => {
    if (isLoaded && user) {
      router.push('/home');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
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
    <>
      {/* Hero Section */}
      <section className="w-screen mb-4 overflow-x-hidden">
        {renderSection(HeroBanner)}
      </section>

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8 min-h-[80dvh] flex flex-col gap-8">
        <section className="w-full max-w-3xl mx-auto grid grid-cols-1 gap-6 px-2 sm:px-4 md:px-8">
          {renderSection(Features)}
          {renderSection(HowItWorks)}
          {renderSection(Testimonials)}
        </section>
      </main>
    </>
  );
}

