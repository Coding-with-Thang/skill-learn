"use client"

import { SignIn, SignedIn, SignOutButton, useUser } from '@clerk/nextjs'
import { dark, light } from '@clerk/themes'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/cms/ui/button'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function CMSSignInPage() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState('light')
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const { isSignedIn, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Check for theme preference
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme === 'dark') {
      setTheme('dark')
    }
  }, [])

  // Check super admin status when user is signed in
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      if (!isSignedIn) {
        setCheckingAccess(false)
        return
      }

      try {
        const response = await fetch('/api/check-super-admin')
        const data = await response.json()

        if (data.isSuperAdmin) {
          setIsSuperAdmin(true)
          // Redirect to dashboard if already super admin
          router.push('/cms/tenants')
        } else {
          setIsSuperAdmin(false)
          setCheckingAccess(false)
        }
      } catch (error) {
        console.error('Error checking super admin status:', error)
        setCheckingAccess(false)
      }
    }

    if (mounted && isSignedIn) {
      checkSuperAdminStatus()
    } else {
      setCheckingAccess(false)
    }
  }, [mounted, isSignedIn, router])

  if (!mounted || checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Checking access...</div>
        </div>
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

        {/* Already signed in but not super admin */}
        {isSignedIn && !isSuperAdmin && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  Access Restricted
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You are signed in as <strong>{user?.emailAddresses?.[0]?.emailAddress || user?.username}</strong>,
                  but you don&apos;t have super admin privileges.
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Contact an existing super administrator to request access.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <SignOutButton>
                <Button variant="outline" className="flex-1">
                  Sign Out
                </Button>
              </SignOutButton>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => router.push('/')}
              >
                Go to LMS
              </Button>
            </div>
          </div>
        )}

        {/* Clerk Sign In Component */}
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignIn
              routing="path"
              path="/cms/sign-in"
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
            Don&apos;t have access? Contact your system administrator to request super admin privileges.
          </p>
        </div>
      </div>
    </div>
  )
}
