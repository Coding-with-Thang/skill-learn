"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@skill-learn/ui/components/button";
import { UserButtonWrapper } from "@/components/auth/UserButtonWrapper";
import { Menu, X, ChevronDown } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function LandingHeader() {
  const t = useTranslations("landing");
  const { isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Calculate dropdown position
  useEffect(() => {
    if (resourcesOpen && resourcesRef.current && dropdownRef.current) {
      const rect = resourcesRef.current.getBoundingClientRect();
      dropdownRef.current.style.left = `${rect.left}px`;
      dropdownRef.current.style.top = `${rect.bottom + 8}px`;
    }
  }, [resourcesOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resourcesOpen &&
        resourcesRef.current &&
        dropdownRef.current &&
        !resourcesRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setResourcesOpen(false);
      }
    };

    if (resourcesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [resourcesOpen]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-100 overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-visible">
        <div className="flex items-center justify-between h-16 overflow-visible">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 overflow-visible">
            <LanguageSwitcher className="hidden md:flex" />
            <Link
              href="/features"
              className="text-gray-700 hover:text-brand-teal px-3 py-2 rounded-full bg-transparent hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              Features
            </Link>
            {/* Resources Dropdown */}
            <div className="relative flex items-center">
              <Link
                href="/resources"
                className="text-gray-700 hover:text-brand-teal px-3 py-2 rounded-full bg-transparent hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                Resources
              </Link>
              <button
                ref={resourcesRef}
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="text-gray-700 hover:text-brand-teal p-1 rounded-full bg-transparent hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200 ml-1"
                aria-label={t("toggleResources")}
              >
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              {resourcesOpen && (
                <div
                  ref={dropdownRef}
                  onMouseLeave={() => setResourcesOpen(false)}
                  className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-99999"
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className="py-2">
                    <div className="border-t border-gray-100 my-1" />
                    <Link
                      href="/support/faq"
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-teal transition-colors"
                    >
                      Help Center
                    </Link>
                    <Link
                      href="/legal"
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-teal transition-colors"
                    >
                      Legal Hub
                    </Link>
                    <Link
                      href="/resources/case-studies/techflow"
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-teal transition-colors"
                    >
                      Case Studies
                    </Link>
                    <Link
                      href="/sitemap"
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-teal transition-colors"
                    >
                      Sitemap
                    </Link>
                    <Link
                      href="/changelog"
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-teal transition-colors"
                    >
                      Changelog
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link
              href="/pricing"
              className="text-gray-700 hover:text-brand-teal px-3 py-2 rounded-full bg-transparent hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              Pricing
            </Link>
            <Link
              href="#solutions"
              className="text-gray-700 hover:text-brand-teal px-3 py-2 rounded-full bg-transparent hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              Why Skill-Learn
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
                    className="bg-brand-teal hover:bg-brand-teal-dark text-white rounded-lg px-6"
                  >
                    <Link href="/sign-up">Schedule Demo</Link>
                  </Button>
                </SignedOut>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-4xld text-gray-700 hover:text-brand-teal hover:bg-gray-100"
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
                Why Skill-Learn
              </Link>
              <Link
                href="/resources"
                className="text-gray-700 hover:text-brand-teal transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <div className="px-2">
                <div className="text-gray-700 font-medium mb-2">Quick Links</div>
                <div className="pl-4 flex flex-col gap-2">
                  <Link
                    href="/changelog"
                    className="text-gray-600 hover:text-brand-teal transition-colors text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Changelog
                  </Link>
                  <Link
                    href="/support/faq"
                    className="text-gray-600 hover:text-brand-teal transition-colors text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Help Center
                  </Link>
                  <Link
                    href="/legal"
                    className="text-gray-600 hover:text-brand-teal transition-colors text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Legal Hub
                  </Link>
                  <Link
                    href="/resources/case-studies/techflow"
                    className="text-gray-600 hover:text-brand-teal transition-colors text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Case Studies
                  </Link>
                  <Link
                    href="/sitemap"
                    className="text-gray-600 hover:text-brand-teal transition-colors text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sitemap
                  </Link>
                </div>
              </div>
              <Link
                href="/pricing"
                className="text-gray-700 hover:text-brand-teal transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/careers"
                className="text-gray-700 hover:text-brand-teal transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Careers
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
                        <Link href="/sign-up">Schedule Demo</Link>
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

