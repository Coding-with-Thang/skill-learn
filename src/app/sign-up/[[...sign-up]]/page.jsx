"use client"

import { SignUp } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function SignUpPage() {
  const { theme, resolvedTheme } = useTheme();
  // Handle hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Hero Banner */}
      <div
        className="hidden lg:block w-1/2 h-full bg-cover bg-center bg-no-repeat fixed left-0 top-0 bottom-0"
        style={{ backgroundImage: "url('/hero-image.jpg')" }}
        aria-label="Hero banner"
      />

      {/* Sign Up Form */}
      <div className="w-full lg:w-1/2 ml-auto flex justify-center items-center px-8 py-12 min-h-screen">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignInUrl="/home"
          afterSignUpUrl="/home"
          appearance={{
            baseTheme: isDark ? dark : undefined,
            elements: {
              card: "shadow-none bg-transparent"
            }
          }}
        />
      </div>
    </div>
  )
}