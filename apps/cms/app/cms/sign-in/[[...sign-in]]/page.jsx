"use client"

import { SignIn, SignedIn, SignOutButton, useUser } from '@clerk/nextjs'
import { dark, light } from '@clerk/themes'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/cms/ui/button'

export default function CMSSignInPage() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState('light')
  const { isSignedIn } = useUser()

  useEffect(() => {
    setMounted(true)
    // Check for theme preference
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme === 'dark') {
      setTheme('dark')
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">CMS Admin Portal</h1>
          <p className="text-muted-foreground">
            Sign in to access the Super Admin Dashboard
          </p>
          <p className="text-sm text-muted-foreground/80">
            Only authorized super administrators can access this portal
          </p>
        </div>

        {/* Sign Out Button (if signed in) */}
        <SignedIn>
          <div className="flex justify-center">
            <SignOutButton>
              <Button variant="outline" className="w-full">
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </SignedIn>

        {/* Clerk Sign In Component */}
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignIn
              routing="path"
              path="/cms/sign-in"
              signUpUrl="/cms/sign-up"
              afterSignInUrl="/cms/tenants"
              appearance={{
                baseTheme: theme === 'dark' ? dark : light,
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-lg",
                },
              }}
            />
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Don't have access? Contact your system administrator to request super admin privileges.
          </p>
        </div>
      </div>
    </div>
  )
}
