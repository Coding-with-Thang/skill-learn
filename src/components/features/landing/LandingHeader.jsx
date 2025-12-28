"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { UserButtonWrapper } from "@/components/features/auth/UserButtonWrapper";
import { Menu, X } from "lucide-react";

export default function LandingHeader() {
  const { isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#platform" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Platform
            </Link>
            <Link href="#solutions" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Solutions
            </Link>
            <Link href="#resources" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Resources
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">
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
              className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
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
          <div className="md:hidden border-t border-border py-4 bg-background/95 backdrop-blur-md">
            <nav className="flex flex-col gap-4">
              <Link
                href="#platform"
                className="text-muted-foreground hover:text-primary transition-colors px-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Platform
              </Link>
              <Link
                href="#solutions"
                className="text-muted-foreground hover:text-primary transition-colors px-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              <Link
                href="#resources"
                className="text-muted-foreground hover:text-primary transition-colors px-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                href="#pricing"
                className="text-muted-foreground hover:text-primary transition-colors px-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="border-t border-border pt-4 mt-2">
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
                        className="block text-muted-foreground hover:text-primary transition-colors px-2 py-2 font-medium"
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

