"use client"

import { SignUp } from '@clerk/nextjs'
import { dark, light } from '@clerk/themes'
import { useAppTheme } from '@/lib/hooks/useAppTheme'

export default function SignUpPage() {
  const theme = useAppTheme();
  return (
    <div className="flex min-h-screen">
      {/* Hero Banner */}
      <div
        className="hidden lg:block w-1/2 h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-image.jpg')", minHeight: '100vh' }}
        aria-label="Hero banner"
      />

      {/* Sign In Form */}
      <div className="flex flex-1 flex-col justify-center items-center py-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Keyed by theme to force remount on theme change */}
          <SignUp key={theme} appearance={{ baseTheme: theme === 'dark' ? dark : light }} />
        </div>
      </div>
    </div>
  )
}