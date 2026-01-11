"use client"

import { SignIn } from '@clerk/nextjs'
import { dark, light } from '@clerk/themes'
import { useAppTheme } from '@skill-learn/lib/hooks/useAppTheme.js'

export default function SignInPage() {
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
      <div className="w-1/2 flex justify-center items-center px-8 py-12 bg-white shadow-md">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/home"
          afterSignUpUrl="/home"
        />
      </div>
    </div>
  )
}