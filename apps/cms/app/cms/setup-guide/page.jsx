"use client"

import { useUser, SignOutButton, SignedIn } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@skill-learn/ui/components/card"
import { Button } from "@skill-learn/ui/components/button"
import { CheckCircle, AlertCircle, Lock } from 'lucide-react'
import Link from 'next/link'

export default function SetupGuidePage() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const hasSuperAdmin =
    user?.publicMetadata?.role === 'super_admin' ||
    user?.publicMetadata?.appRole === 'super_admin'

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Super Admin Setup
          </CardTitle>
          <CardDescription>
            Initial super admin setup has been completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Check */}
          {hasSuperAdmin ? (
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">You have super admin access!</p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                Your account has the super_admin role. You can now access all CMS features.
              </p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/cms/tenants">Go to Dashboard</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <Lock className="h-5 w-5" />
                <p className="font-medium">Access Restricted</p>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                Super admin setup has been completed. Self-registration is no longer available.
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                To request super admin access, please contact an existing super administrator.
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-xs text-red-600 dark:text-red-400">
                  <strong>Security Notice:</strong> The initial setup process has been locked down to prevent unauthorized access.
                  Only existing super admins can now approve new super admin users through the CMS dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Information for Super Admins */}
          {hasSuperAdmin && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold">Managing Additional Super Admins</h3>
              <p className="text-sm text-muted-foreground">
                As a super admin, you can approve additional super admin users through the CMS interface.
              </p>
              <div className="text-sm space-y-1">
                <p><strong>To add a new super admin:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2 text-muted-foreground">
                  <li>Have the user sign up for a CMS account</li>
                  <li>Use the CMS dashboard to approve them as a super admin</li>
                  <li>The user will need to sign out and sign back in for changes to take effect</li>
                </ol>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <SignedIn>
              <SignOutButton>
                <Button variant="outline">
                  Sign Out
                </Button>
              </SignOutButton>
            </SignedIn>
            {hasSuperAdmin && (
              <Button asChild>
                <Link href="/cms/tenants">Access Dashboard</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
