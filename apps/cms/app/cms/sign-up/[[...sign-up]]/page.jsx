"use client"

import { SignUp } from '@clerk/nextjs'
import { dark, light } from '@clerk/themes'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CMSSignUpPage() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    setMounted(true)
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
          <h1 className="text-3xl font-bold tracking-tight">Request CMS Access</h1>
          <p className="text-muted-foreground">
            Create an account to request super admin access
          </p>
          <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-1">⚠️ Access Restriction</p>
            <p>
              Creating an account does not grant super admin access. An existing super admin must approve your request.
            </p>
          </div>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="flex justify-center">
          <SignUp
            routing="path"
            path="/cms/sign-up"
            signInUrl="/cms/sign-in"
            afterSignUpUrl="/cms/pending-approval"
            appearance={{
              baseTheme: theme === 'dark' ? dark : light,
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Already have an account?{' '}
            <Link href="/cms/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
