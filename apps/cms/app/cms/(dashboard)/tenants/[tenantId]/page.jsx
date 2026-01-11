'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import { Input } from '@/components/cms/ui/input'
import { Badge } from '@/components/cms/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skill-learn/ui/components/dialog'
import { Label } from '@skill-learn/ui/components/label'
import { ArrowLeft, Users, Loader2, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cms/utils'

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.tenantId

  const [tenant, setTenant] = useState(null)
  const [users, setUsers] = useState([])
  const [allTenants, setAllTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState(new Set())
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [targetTenantId, setTargetTenantId] = useState('')
  const [moving, setMoving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const dialogJustOpenedRef = useRef(false)
  const isOpeningRef = useRef(false)

  // Fetch tenant details
  const fetchTenant = async () => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}`)
      if (!response.ok) throw new Error('Failed to fetch tenant')
      const data = await response.json()
      setTenant(data.tenant)
    } catch (err) {
      setError(err.message)
    }
  }

  // Fetch users for this tenant
  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/users`)
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message)
    }
  }

  // Fetch all tenants (for move dialog)
  const fetchAllTenants = async () => {
    try {
      const response = await fetch('/api/tenants')
      if (!response.ok) throw new Error('Failed to fetch tenants')
      const data = await response.json()
      const tenants = data.tenants || []
      // Exclude current tenant from the list
      const filtered = tenants.filter(t => t.id !== tenantId)
      console.log('Fetched tenants for move dialog', {
        totalTenants: tenants.length,
        currentTenantId: tenantId,
        filteredCount: filtered.length,
        filtered: filtered.map(t => ({ id: t.id, name: t.name }))
      })
      setAllTenants(filtered)
    } catch (err) {
      console.error('Error fetching tenants:', err)
      setAllTenants([])
    }
  }

  useEffect(() => {
    if (tenantId) {
      setLoading(true)
      Promise.all([fetchTenant(), fetchUsers(), fetchAllTenants()])
        .finally(() => setLoading(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId])

  // Debug: Log when dialog opens
  useEffect(() => {
    if (moveDialogOpen) {
      console.log('✅ Dialog state is TRUE - dialog should be visible', {
        selectedUsersCount: selectedUsers.size,
        allTenantsCount: allTenants.length
      })
    } else {
      console.log('❌ Dialog state is FALSE - dialog should be hidden')
    }
  }, [moveDialogOpen, selectedUsers.size, allTenants.length])

  // Handle user selection
  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  // Handle move users
  const handleMoveUsers = async () => {
    if (!targetTenantId || selectedUsers.size === 0) {
      setError('Please select a target tenant and at least one user')
      return
    }

    setMoving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      console.log('Moving users:', {
        userIds: Array.from(selectedUsers),
        sourceTenantId: tenantId,
        targetTenantId,
      })

      const response = await fetch(`/api/tenants/${tenantId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers),
          targetTenantId,
        }),
      })

      const data = await response.json()
      console.log('Move users response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to move users')
      }

      // Show success message
      setSuccessMessage(data.message || `Successfully moved ${data.movedCount || selectedUsers.size} user(s)`)

      // Refresh data
      await Promise.all([fetchTenant(), fetchUsers()])
      setSelectedUsers(new Set())
      setTargetTenantId('')
      
      // Close dialog after a short delay
      setTimeout(() => {
        setMoveDialogOpen(false)
        setSuccessMessage(null)
      }, 1500)
    } catch (err) {
      console.error('Error moving users:', err)
      setError(err.message || 'An error occurred while moving users')
    } finally {
      setMoving(false)
    }
  }

  // Filter users by search query
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !tenant) {
    return (
      <div className="p-6 w-full">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Link href="/cms/tenants">
              <Button className="mt-4">Back to Tenants</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 w-full">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/cms/tenants" className="hover:text-foreground">
          Dashboard / Tenants
        </Link>
        {' / '}
        <span className="text-foreground">{tenant?.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/cms/tenants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tenant?.name}</h1>
            <p className="text-muted-foreground mt-1">
              Manage users and tenant settings
            </p>
          </div>
        </div>
        {selectedUsers.size > 0 && (
          <>
            <Button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Move users button clicked', { 
                  selectedUsers: Array.from(selectedUsers), 
                  allTenantsCount: allTenants.length,
                  currentDialogState: moveDialogOpen
                })
                console.log('Opening move dialog...')
                setMoveDialogOpen(true)
                setError(null)
                setSuccessMessage(null)
              }}
              className="gap-2"
              type="button"
            >
              <UserCheck className="h-4 w-4" />
              Move {selectedUsers.size} User{selectedUsers.size > 1 ? 's' : ''}
            </Button>
            {/* Debug indicator */}
            {moveDialogOpen && (
              <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded z-[9999]">
                Dialog is open! (Debug)
              </div>
            )}
          </>
        )}
      </div>

      {/* Tenant Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{tenant?.activeUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Role Slots</p>
                <p className="text-2xl font-bold">
                  {tenant?.roleCount || 0} / {tenant?.maxRoleSlots || 0}
                </p>
              </div>
              <Badge className={cn(
                "font-medium",
                ((tenant?.roleCount || 0) / (tenant?.maxRoleSlots || 1)) >= 0.9 ? 'bg-red-500' :
                ((tenant?.roleCount || 0) / (tenant?.maxRoleSlots || 1)) >= 0.75 ? 'bg-amber-500' :
                'bg-blue-500'
              )}>
                {Math.round(((tenant?.roleCount || 0) / (tenant?.maxRoleSlots || 1)) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subscription</p>
                <p className="text-2xl font-bold capitalize">{tenant?.subscriptionTier || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users ({users.length})</CardTitle>
              <CardDescription>
                Select users to move them to another tenant
              </CardDescription>
            </div>
            {selectedUsers.size > 0 && (
              <Badge variant="secondary">
                {selectedUsers.size} selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search users by name, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
              {error}
            </div>
          )}

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No users found matching your search' : 'No users in this tenant'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All */}
              <div className="flex items-center gap-2 pb-2 border-b">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
                    } else {
                      setSelectedUsers(new Set())
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label className="text-sm font-medium cursor-pointer">
                  Select All ({filteredUsers.length})
                </Label>
              </div>

              {/* Users */}
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-1 flex items-center gap-3">
                    {user.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.imageUrl}
                        alt={user.username}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-semibold">
                        {user.firstName?.[0] || user.username?.[0] || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{user.username} {user.email && `• ${user.email}`}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                    <Badge variant="secondary">
                      {user.points} pts
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Move Users Dialog */}
      <Dialog 
        open={moveDialogOpen} 
        onOpenChange={(open) => {
          console.log('🔔 Dialog onOpenChange', { open, moving, successMessage })
          
          // Block closing if operation in progress
          if (!open && (moving || successMessage)) {
            console.log('🚫 Blocking close - operation in progress')
            return // Don't update state
          }
          
          // Update state normally
          setMoveDialogOpen(open)
          
          // Reset form when closing
          if (!open) {
            setTargetTenantId('')
            setError(null)
            setSuccessMessage(null)
            dialogJustOpenedRef.current = false
            isOpeningRef.current = false
          }
        }}
      >
        <DialogContent 
          onInteractOutside={(e) => {
            // Prevent closing when clicking outside if moving or showing success
            if (moving || successMessage) {
              e.preventDefault()
            }
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing with Escape if moving
            if (moving) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Move Users to Another Tenant</DialogTitle>
            <DialogDescription>
              Move {selectedUsers.size} selected user{selectedUsers.size > 1 ? 's' : ''} to a different tenant.
              This will update their tenant assignment and remove their role assignments from the current tenant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {successMessage ? (
              <div className="rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 p-3 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {successMessage}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="targetTenant">Target Tenant</Label>
                  {allTenants.length === 0 ? (
                    <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        No other tenants available. You need at least 2 tenants to move users between them.
                      </p>
                    </div>
                  ) : (
                    <select
                      id="targetTenant"
                      value={targetTenantId}
                      onChange={(e) => {
                        console.log('Target tenant selected', e.target.value)
                        setTargetTenantId(e.target.value)
                        setError(null)
                      }}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={moving}
                    >
                      <option value="">Select a tenant...</option>
                      {allTenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.activeUsers} users)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {error && (
                  <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMoveDialogOpen(false)
                setTargetTenantId('')
                setError(null)
                setSuccessMessage(null)
              }}
              disabled={moving}
            >
              {successMessage ? 'Close' : 'Cancel'}
            </Button>
            {!successMessage && (
              <Button
                onClick={handleMoveUsers}
                disabled={!targetTenantId || moving}
              >
                {moving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Moving...
                  </>
                ) : (
                  'Move Users'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
