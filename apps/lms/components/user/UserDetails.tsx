"use client"

import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@skill-learn/ui/components/card"
import { Avatar, AvatarFallback, AvatarImage } from "@skill-learn/ui/components/avatar"

type UserDetailsProps = { user?: { id?: string; firstName?: string; lastName?: string; username?: string; createdAt?: string } | null }

export default function UserDetails({ user: propUser }: UserDetailsProps = {}) {
  const clerk = useUser()
  const { user: clerkUser, isLoaded } = clerk
  const user = propUser ?? clerkUser

  if (propUser !== undefined && propUser !== null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>{(propUser.firstName?.[0] ?? '')}{(propUser.lastName?.[0] ?? '')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{[propUser.firstName, propUser.lastName].filter(Boolean).join(' ') || propUser.username || 'User'}</h3>
              {propUser.createdAt && <p className="text-sm text-muted-foreground">Member since {new Date(propUser.createdAt).toLocaleDateString()}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isLoaded || !clerkUser) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={clerkUser.imageUrl} alt={clerkUser.fullName || 'User'} />
            <AvatarFallback>{clerkUser.firstName?.[0]}{clerkUser.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{clerkUser.fullName}</h3>
            <p className="text-sm text-muted-foreground">Member since {clerkUser.createdAt != null ? new Date(clerkUser.createdAt).toLocaleDateString() : "—"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 