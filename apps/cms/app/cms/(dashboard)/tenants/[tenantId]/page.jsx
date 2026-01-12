'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import { Input } from '@/components/cms/ui/input'
import { Badge } from '@/components/cms/ui/badge'
import { Progress } from '@/components/cms/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skill-learn/ui/components/dialog'
import { Label } from '@skill-learn/ui/components/label'
import { Checkbox } from '@skill-learn/ui/components/checkbox'
import {
  ArrowLeft,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Shield,
  Key,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  UserPlus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cms/utils'

// Tab definitions
const tabs = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'assignments', label: 'User Role Assignments', icon: Key },
]

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.tenantId

  // State
  const [activeTab, setActiveTab] = useState('users')
  const [tenant, setTenant] = useState(null)
  const [users, setUsers] = useState([])
  const [allTenants, setAllTenants] = useState([])
  const [roles, setRoles] = useState([])
  const [userRoles, setUserRoles] = useState([])
  const [roleTemplates, setRoleTemplates] = useState([])
  const [permissions, setPermissions] = useState([])
  const [groupedPermissions, setGroupedPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)

  // Dialog states
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false)
  const [rolePermissionsDialogOpen, setRolePermissionsDialogOpen] = useState(false)
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false)
  const [initializeRolesDialogOpen, setInitializeRolesDialogOpen] = useState(false)

  const [targetTenantId, setTargetTenantId] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedUserForRole, setSelectedUserForRole] = useState('')
  const [selectedRoleForAssignment, setSelectedRoleForAssignment] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [templateSetName, setTemplateSetName] = useState('generic')

  // Role form
  const [roleForm, setRoleForm] = useState({
    roleAlias: '',
    description: '',
    slotPosition: 1,
    templateId: '',
    permissionIds: [],
  })

  // Fetch functions
  const fetchTenant = useCallback(async () => {
    const response = await fetch(`/api/tenants/${tenantId}`)
    if (!response.ok) throw new Error('Failed to fetch tenant')
    const data = await response.json()
    setTenant(data.tenant)
  }, [tenantId])

  const fetchUsers = useCallback(async () => {
    const response = await fetch(`/api/tenants/${tenantId}/users`)
    if (!response.ok) throw new Error('Failed to fetch users')
    const data = await response.json()
    setUsers(data.users || [])
  }, [tenantId])

  const fetchAllTenants = useCallback(async () => {
    const response = await fetch('/api/tenants')
    if (!response.ok) throw new Error('Failed to fetch tenants')
    const data = await response.json()
    setAllTenants((data.tenants || []).filter(t => t.id !== tenantId))
  }, [tenantId])

  const fetchRoles = useCallback(async () => {
    const response = await fetch(`/api/tenants/${tenantId}/roles`)
    if (!response.ok) throw new Error('Failed to fetch roles')
    const data = await response.json()
    setRoles(data.roles || [])
  }, [tenantId])

  const fetchUserRoles = useCallback(async () => {
    const response = await fetch(`/api/tenants/${tenantId}/user-roles`)
    if (!response.ok) throw new Error('Failed to fetch user roles')
    const data = await response.json()
    setUserRoles(data.userRoles || [])
  }, [tenantId])

  const fetchRoleTemplates = useCallback(async () => {
    const response = await fetch('/api/role-templates')
    if (!response.ok) throw new Error('Failed to fetch role templates')
    const data = await response.json()
    setRoleTemplates(data.roleTemplates || [])
  }, [])

  const fetchPermissions = useCallback(async () => {
    const response = await fetch('/api/permissions')
    if (!response.ok) throw new Error('Failed to fetch permissions')
    const data = await response.json()
    setPermissions(data.permissions || [])
    setGroupedPermissions(data.groupedByCategory || {})
  }, [])

  // Load all data
  useEffect(() => {
    if (tenantId) {
      setLoading(true)
      Promise.all([
        fetchTenant(),
        fetchUsers(),
        fetchAllTenants(),
        fetchRoles(),
        fetchUserRoles(),
        fetchRoleTemplates(),
        fetchPermissions(),
      ])
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [tenantId, fetchTenant, fetchUsers, fetchAllTenants, fetchRoles, fetchUserRoles, fetchRoleTemplates, fetchPermissions])

  // Handle user selection for move
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
    if (!targetTenantId || selectedUsers.size === 0) return

    setFormLoading(true)
    setFormError(null)

    try {
      const response = await fetch(`/api/tenants/${tenantId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers),
          targetTenantId,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to move users')

      setSuccessMessage(data.message || `Successfully moved ${selectedUsers.size} user(s)`)
      await Promise.all([fetchTenant(), fetchUsers(), fetchUserRoles()])
      setSelectedUsers(new Set())
      setTargetTenantId('')

      setTimeout(() => {
        setMoveDialogOpen(false)
        setSuccessMessage(null)
      }, 1500)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle role create/update
  const handleRoleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    try {
      const url = isEditing
        ? `/api/tenants/${tenantId}/roles/${selectedRole.id}`
        : `/api/tenants/${tenantId}/roles`
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to save role')

      setRoleDialogOpen(false)
      resetRoleForm()
      await Promise.all([fetchTenant(), fetchRoles()])
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle role delete
  const handleDeleteRole = async () => {
    if (!selectedRole) return

    setFormLoading(true)
    setFormError(null)

    try {
      const response = await fetch(`/api/tenants/${tenantId}/roles/${selectedRole.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete role')

      setDeleteRoleDialogOpen(false)
      setSelectedRole(null)
      await Promise.all([fetchTenant(), fetchRoles(), fetchUserRoles()])
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle assign role to user
  const handleAssignRole = async () => {
    if (!selectedUserForRole || !selectedRoleForAssignment) return

    setFormLoading(true)
    setFormError(null)

    try {
      const response = await fetch(`/api/tenants/${tenantId}/user-roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForRole,
          tenantRoleId: selectedRoleForAssignment,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to assign role')

      setAssignRoleDialogOpen(false)
      setSelectedUserForRole('')
      setSelectedRoleForAssignment('')
      await fetchUserRoles()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle remove user role
  const handleRemoveUserRole = async (userRoleId) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/user-roles?userRoleId=${userRoleId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to remove role')

      await fetchUserRoles()
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle initialize roles from template
  const handleInitializeRoles = async () => {
    setFormLoading(true)
    setFormError(null)

    try {
      const response = await fetch(`/api/tenants/${tenantId}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateSetName }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to initialize roles')

      setInitializeRolesDialogOpen(false)
      await Promise.all([fetchTenant(), fetchRoles()])
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle permission toggle for role
  const handleRolePermissionToggle = async (permissionId, isChecked) => {
    if (!selectedRole) return

    try {
      const url = `/api/tenants/${tenantId}/roles/${selectedRole.id}/permissions`
      const method = isChecked ? 'POST' : 'DELETE'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: [permissionId] }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update permissions')
      }

      await fetchRoles()
      // Update selected role
      const updatedRoles = roles.map(r => {
        if (r.id === selectedRole.id) {
          const newPerms = isChecked
            ? [...(r.permissions || []), permissions.find(p => p.id === permissionId)]
            : (r.permissions || []).filter(p => p.id !== permissionId)
          return { ...r, permissions: newPerms }
        }
        return r
      })
      setSelectedRole(updatedRoles.find(r => r.id === selectedRole.id))
    } catch (err) {
      console.error('Error updating permissions:', err)
    }
  }

  // Reset role form
  const resetRoleForm = () => {
    setRoleForm({
      roleAlias: '',
      description: '',
      slotPosition: Math.max(...(roles.map(r => r.slotPosition) || [0]), 0) + 1,
      templateId: '',
      permissionIds: [],
    })
    setSelectedRole(null)
    setIsEditing(false)
    setFormError(null)
  }

  // Open edit role dialog
  const openEditRole = (role) => {
    setSelectedRole(role)
    setRoleForm({
      roleAlias: role.roleAlias,
      description: role.description || '',
      slotPosition: role.slotPosition,
      templateId: role.createdFromTemplate?.id || '',
      permissionIds: role.permissions?.map(p => p.id) || [],
    })
    setIsEditing(true)
    setRoleDialogOpen(true)
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower)
    )
  })

  // Get category display name
  const getCategoryDisplayName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Get unique template sets
  const templateSets = [...new Set(roleTemplates.map(t => t.templateSetName))]

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
              Manage users, roles, and permissions
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setLoading(true)
            Promise.all([fetchTenant(), fetchUsers(), fetchRoles(), fetchUserRoles()])
              .finally(() => setLoading(false))
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Tenant Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                  {roles.length} / {tenant?.maxRoleSlots || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress
              value={(roles.length / (tenant?.maxRoleSlots || 1)) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Role Assignments</p>
                <p className="text-2xl font-bold">{userRoles.length}</p>
              </div>
              <Key className="h-8 w-8 text-muted-foreground" />
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

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-4">
          {error}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
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
                <Button onClick={() => setMoveDialogOpen(true)} className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  Move {selectedUsers.size} User{selectedUsers.size > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
                      } else {
                        setSelectedUsers(new Set())
                      }
                    }}
                  />
                  <Label className="text-sm font-medium cursor-pointer">
                    Select All ({filteredUsers.length})
                  </Label>
                </div>

                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                    <div className="flex-1 flex items-center gap-3">
                      {user.imageUrl ? (
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
                          @{user.username}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Tenant Roles</h2>
              <p className="text-sm text-muted-foreground">
                {roles.length} of {tenant?.maxRoleSlots || 5} role slots used
              </p>
            </div>
            <div className="flex gap-2">
              {roles.length === 0 && (
                <Button variant="outline" onClick={() => setInitializeRolesDialogOpen(true)}>
                  Initialize from Template
                </Button>
              )}
              <Button
                onClick={() => {
                  resetRoleForm()
                  setRoleDialogOpen(true)
                }}
                disabled={roles.length >= (tenant?.maxRoleSlots || 5)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>
          </div>

          {roles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No roles configured for this tenant.</p>
                <Button onClick={() => setInitializeRolesDialogOpen(true)}>
                  Initialize from Template Set
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <Card key={role.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            Slot {role.slotPosition}
                          </Badge>
                          {!role.isActive && (
                            <Badge variant="destructive" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{role.roleAlias}</CardTitle>
                        {role.description && (
                          <CardDescription className="mt-1">
                            {role.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Permissions</span>
                        <span className="font-medium">{role.permissionCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Users with role</span>
                        <span className="font-medium">{role.userCount}</span>
                      </div>

                      {role.createdFromTemplate && (
                        <div className="text-xs text-muted-foreground">
                          Based on: {role.createdFromTemplate.roleName}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedRole(role)
                            setRolePermissionsDialogOpen(true)
                          }}
                        >
                          <Key className="h-4 w-4 mr-1" />
                          Permissions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedRole(role)
                            setDeleteRoleDialogOpen(true)
                          }}
                          disabled={role.userCount > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Role Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">User Role Assignments</h2>
              <p className="text-sm text-muted-foreground">
                {userRoles.length} role assignments
              </p>
            </div>
            <Button onClick={() => setAssignRoleDialogOpen(true)} disabled={roles.length === 0}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Role
            </Button>
          </div>

          {userRoles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No role assignments yet.</p>
                {roles.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Create roles first before assigning them to users.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Assigned</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRoles.map((ur) => (
                      <tr key={ur.id} className="border-b last:border-b-0 hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {ur.user?.imageUrl ? (
                              <img
                                src={ur.user.imageUrl}
                                alt={ur.user.username}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-semibold">
                                {ur.user?.firstName?.[0] || 'U'}
                              </div>
                            )}
                            <div>
                              <p className="font-medium">
                                {ur.user?.fullName || ur.user?.username || ur.userId}
                              </p>
                              {ur.user?.username && (
                                <p className="text-xs text-muted-foreground">
                                  @{ur.user.username}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{ur.role?.roleAlias}</Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(ur.assignedAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleRemoveUserRole(ur.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Move Users Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Users to Another Tenant</DialogTitle>
            <DialogDescription>
              Move {selectedUsers.size} selected user(s) to a different tenant.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {successMessage ? (
              <div className="rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 p-3 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {successMessage}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Target Tenant</Label>
                <select
                  value={targetTenantId}
                  onChange={(e) => setTargetTenantId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  disabled={formLoading}
                >
                  <option value="">Select a tenant...</option>
                  {allTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.activeUsers} users)
                    </option>
                  ))}
                </select>
              </div>
            )}
            {formError && (
              <div className="mt-4 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                {formError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)} disabled={formLoading}>
              {successMessage ? 'Close' : 'Cancel'}
            </Button>
            {!successMessage && (
              <Button onClick={handleMoveUsers} disabled={!targetTenantId || formLoading}>
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Move Users
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Role' : 'Create Role'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the role details.' : 'Create a new role for this tenant.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRoleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Role Name *</Label>
                <Input
                  value={roleForm.roleAlias}
                  onChange={(e) => setRoleForm({ ...roleForm, roleAlias: e.target.value })}
                  placeholder="Administrator"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Full access to all features"
                />
              </div>
              <div className="grid gap-2">
                <Label>Slot Position</Label>
                <Input
                  type="number"
                  min="1"
                  max={tenant?.maxRoleSlots || 5}
                  value={roleForm.slotPosition}
                  onChange={(e) => setRoleForm({ ...roleForm, slotPosition: parseInt(e.target.value) || 1 })}
                />
              </div>
              {!isEditing && (
                <div className="grid gap-2">
                  <Label>Base on Template (optional)</Label>
                  <select
                    value={roleForm.templateId}
                    onChange={(e) => setRoleForm({ ...roleForm, templateId: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Custom role (no template)</option>
                    {roleTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.templateSetName} / {t.roleName} ({t.permissionCount} permissions)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {formError && (
                <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                  {formError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isEditing ? 'Update Role' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={assignRoleDialogOpen} onOpenChange={setAssignRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to User</DialogTitle>
            <DialogDescription>
              Select a user and role to create an assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>User *</Label>
              <select
                value={selectedUserForRole}
                onChange={(e) => setSelectedUserForRole(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u.clerkId || u.id} value={u.clerkId || u.id}>
                    {u.firstName} {u.lastName} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Role *</Label>
              <select
                value={selectedRoleForAssignment}
                onChange={(e) => setSelectedRoleForAssignment(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select a role...</option>
                {roles.filter(r => r.isActive).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roleAlias}
                  </option>
                ))}
              </select>
            </div>
            {formError && (
              <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                {formError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={!selectedUserForRole || !selectedRoleForAssignment || formLoading}
            >
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Permissions Dialog */}
      <Dialog open={rolePermissionsDialogOpen} onOpenChange={setRolePermissionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions - {selectedRole?.roleAlias}</DialogTitle>
            <DialogDescription>
              Select which permissions this role should have.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {Object.keys(groupedPermissions).map((category) => {
              const categoryPerms = groupedPermissions[category] || []
              if (categoryPerms.length === 0) return null

              const selectedPermIds = new Set(
                selectedRole?.permissions?.map((p) => p.id) || []
              )

              return (
                <div key={category} className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    {getCategoryDisplayName(category)}
                    <Badge variant="secondary" className="text-xs">
                      {categoryPerms.filter(p => selectedPermIds.has(p.id)).length}/{categoryPerms.length}
                    </Badge>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryPerms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 p-2 rounded border hover:bg-muted/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedPermIds.has(perm.id)}
                          onCheckedChange={(checked) =>
                            handleRolePermissionToggle(perm.id, checked)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {perm.displayName}
                          </p>
                          <code className="text-xs text-muted-foreground">
                            {perm.name}
                          </code>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRolePermissionsDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={deleteRoleDialogOpen} onOpenChange={setDeleteRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{selectedRole?.roleAlias}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
              {formError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole} disabled={formLoading}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initialize Roles Dialog */}
      <Dialog open={initializeRolesDialogOpen} onOpenChange={setInitializeRolesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Initialize Roles from Template</DialogTitle>
            <DialogDescription>
              Create default roles for this tenant from a predefined template set.
              This will create up to {tenant?.maxRoleSlots || 5} roles with pre-configured permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Template Set</Label>
              <select
                value={templateSetName}
                onChange={(e) => setTemplateSetName(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="generic">Generic - General-purpose organizations</option>
                <option value="education">Education - Schools and institutions</option>
                <option value="business">Business - Corporate training</option>
                <option value="support">Support - Customer support teams</option>
                <option value="saas">SaaS - SaaS product teams</option>
                <option value="healthcare">Healthcare - Healthcare training</option>
                <option value="retail">Retail - Retail operations</option>
              </select>
            </div>

            {/* Template preview */}
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm font-medium mb-2">Roles to be created:</p>
              {templateSetName === 'generic' && (
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Administrator - Full system access</li>
                  <li>2. Manager - Manage content and users</li>
                  <li>3. Team Lead - Lead teams, assign content</li>
                  <li>4. Member - Standard user access</li>
                  <li>5. Guest - Limited read-only access</li>
                </ul>
              )}
              {templateSetName === 'education' && (
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. School Admin - Full administrative access</li>
                  <li>2. Teacher - Create and manage courses</li>
                  <li>3. Teaching Assistant - Help with courses</li>
                  <li>4. Student - Access courses and quizzes</li>
                  <li>5. Parent - View student progress</li>
                </ul>
              )}
              {templateSetName === 'business' && (
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Owner - Full control including billing</li>
                  <li>2. HR Manager - Manage employees</li>
                  <li>3. Department Head - Manage team training</li>
                  <li>4. Employee - Standard training access</li>
                  <li>5. Contractor - Limited external access</li>
                </ul>
              )}
              {templateSetName === 'support' && (
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Support Director - Full support access</li>
                  <li>2. Support Manager - Oversee support team</li>
                  <li>3. Senior Agent - Handle escalations</li>
                  <li>4. Support Agent - Standard support</li>
                  <li>5. Customer - Self-service access</li>
                </ul>
              )}
              {templateSetName === 'saas' && (
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Owner - Full control including billing</li>
                  <li>2. Admin - Manage users and settings</li>
                  <li>3. Power User - Advanced features</li>
                  <li>4. User - Standard platform access</li>
                  <li>5. Read-Only - View-only access</li>
                </ul>
              )}
              {templateSetName === 'healthcare' && (
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Administrator - Full administrative access</li>
                  <li>2. Training Director - Manage training</li>
                  <li>3. Supervisor - Supervise staff training</li>
                  <li>4. Staff - Complete required training</li>
                  <li>5. Volunteer - Basic training access</li>
                </ul>
              )}
              {templateSetName === 'retail' && (
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Regional Manager - Full regional access</li>
                  <li>2. Store Manager - Manage store training</li>
                  <li>3. Shift Lead - Lead shifts</li>
                  <li>4. Sales Associate - Standard access</li>
                  <li>5. New Hire - Onboarding access</li>
                </ul>
              )}
            </div>

            {formError && (
              <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                {formError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInitializeRolesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInitializeRoles} disabled={formLoading}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Initialize Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
