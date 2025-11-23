"use client"

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from "./components/Landing/HeroSection";
import BuiltForEveryone from './components/Landing/BuiltForEveryone';
import VersatilePlatform from './components/Landing/VersatilePlatform';
import SkillLearnHere from './components/Landing/SkillLearnHere';
import FAQ from './components/Landing/FAQ';
import Testimonials from './components/Landing/Testimonials';
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
