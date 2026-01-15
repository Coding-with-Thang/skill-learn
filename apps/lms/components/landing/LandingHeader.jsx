"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@skill-learn/ui/components/button";
import { UserButtonWrapper } from "@/components/auth/UserButtonWrapper";
import { Menu, X } from "lucide-react";

export default function LandingHeader() {
  const { isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-gray-700 hover:text-brand-teal transition-colors">
              Features
            </Link>
            <Link href="#solutions" className="text-gray-700 hover:text-brand-teal transition-colors">
              Solutions
            </Link>
            <Link href="#resources" className="text-gray-700 hover:text-brand-teal transition-colors">
              Resources
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-brand-teal transition-colors">
              Pricing
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoaded && (
              <>
                <SignedIn>
                  <UserButtonWrapper />
                </SignedIn>
                <SignedOut>
                  <Link href="/sign-in" className="text-gray-700 hover:text-brand-teal transition-colors">
                    Log in
                  </Link>
                  <Button
                    asChild
                    className="bg-brand-teal hover:bg-brand-teal-dark text-white"
                  >
                    <Link href="/sign-up">Request a demo</Link>
                  </Button>
                </SignedOut>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-brand-teal hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="/features"
                className="text-gray-700 hover:text-brand-teal transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#solutions"
                className="text-gray-700 hover:text-brand-teal transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              <Link
                href="#resources"
                className="text-gray-700 hover:text-brand-teal transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                href="/pricing"
                className="text-gray-700 hover:text-brand-teal transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="border-t border-gray-200 pt-4 mt-2">
                {isLoaded && (
                  <>
                    <SignedIn>
                      <div className="px-2">
                        <UserButtonWrapper />
                      </div>
                    </SignedIn>
                    <SignedOut>
                      <Link
                        href="/sign-in"
                        className="block text-gray-700 hover:text-brand-teal transition-colors px-2 py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <Button
                        asChild
                        className="w-full mt-2 bg-brand-teal hover:bg-brand-teal-dark text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/sign-up">Request a demo</Link>
                      </Button>
                    </SignedOut>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

