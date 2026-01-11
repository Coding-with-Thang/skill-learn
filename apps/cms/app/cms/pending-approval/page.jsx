"use client"

import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function PendingApprovalPage() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl">Access Pending Approval</CardTitle>
          <CardDescription>
            Your account has been created, but super admin access requires approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Account Details:</p>
            <p className="text-sm text-muted-foreground">
              <strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Name:</strong> {user?.firstName} {user?.lastName}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="text-muted-foreground">
                An existing super administrator will review your request and grant access if approved.
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
              <p className="text-muted-foreground">
                You will be notified once your access has been approved.
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button asChild className="w-full">
              <Link href="/cms/sign-in">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
