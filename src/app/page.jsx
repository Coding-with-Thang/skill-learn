"use client"

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from "./components/User/Landing/HeroSection";
import BuiltForEveryone from './components/User/Landing/BuiltForEveryone';
import VersatilePlatform from './components/User/Landing/VersatilePlatform';
import SkillLearnHere from './components/User/Landing/SkillLearnHere';
import FAQ from './components/User/Landing/FAQ';
import Testimonials from './components/User/Landing/Testimonials';

/**
 * Landing Page - Public facing marketing page for non-authenticated users
 * Authenticated users are automatically redirected to /home via middleware
 * 
 * Performance Optimization: Landing page content loads immediately without
 * waiting for auth state. Authenticated users are silently redirected in background.
 */
export default function LandingPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  // Silent background redirect for authenticated users
  // No loading spinner - better UX and conversion rates
  useEffect(() => {
    if (isLoaded && user) {
      router.push('/home');
    }
  }, [isLoaded, user, router]);

  // Always show landing page immediately
  // Redirect happens silently in background
  return (
    <main className="w-full">
      <HeroSection />
      <BuiltForEveryone />
      <VersatilePlatform />
      <SkillLearnHere />
      <FAQ />
      <Testimonials />
    </main>
  );
}
