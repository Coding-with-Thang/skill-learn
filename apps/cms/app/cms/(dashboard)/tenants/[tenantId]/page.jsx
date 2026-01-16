'use client'

import { useState, useEffect, useCallback } from 'react'
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
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/cms/utils'

import {
  ArrowLeft,
  Users,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Shield,
  Key,
  Eye,
  Table,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  UserPlus,
  Grid,
  Gamepad2,
  FileQuestion,
  Trophy,
  Gift,
  Award,
  Flame,
  GraduationCap,
  Coins,
  FolderTree,
  BarChart3,
  ScrollText,
  ToggleLeft,
  ToggleRight,
  Lock,
  Unlock,
} from 'lucide-react'

// Tab definitions
const tabs = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'assignments', label: 'User Role Assignments', icon: Key },
  { id: 'features', label: 'Features', icon: ToggleLeft },
]

// Feature icon mapping
const featureIcons = {
  Gamepad2,
  FileQuestion,
  Trophy,
  Gift,
  Award,
  Flame,
  GraduationCap,
  Coins,
  FolderTree,
  BarChart3,
  ScrollText,
  Shield,
}

// Custom Switch Component
const Switch = ({ checked, onCheckedChange, disabled = false }) => (
  <button
    onClick={() => !disabled && onCheckedChange(!checked)}
    disabled={disabled}
    className={`
      relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent 
      transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
      focus-visible:ring-primary focus-visible:ring-offset-2
      ${checked ? 'bg-primary' : 'bg-input'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    <span
      className={`
        pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 
        transition-transform duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-0'}
      `}
    />
  </button>
)

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
  const [rolesViewMode, setRolesViewMode] = useState('cards') // 'cards' or 'table'
  const [roleDetailsDialogOpen, setRoleDetailsDialogOpen] = useState(false)
  const [roleSearchQuery, setRoleSearchQuery] = useState('')

  // Role form
  const [roleForm, setRoleForm] = useState({
    roleAlias: '',
    description: '',
    slotPosition: 1,
    templateId: '',
    permissionIds: [],
  })

  // Features state
  const [features, setFeatures] = useState([])
  const [groupedFeatures, setGroupedFeatures] = useState({})
  const [featureLoading, setFeatureLoading] = useState(false)

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

  const fetchFeatures = useCallback(async () => {
    const response = await fetch(`/api/tenants/${tenantId}/features`)
    if (!response.ok) throw new Error('Failed to fetch features')
    const data = await response.json()
    setFeatures(data.features || [])
    setGroupedFeatures(data.groupedByCategory || {})
  }, [tenantId])

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
        fetchFeatures(),
      ])
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [tenantId, fetchTenant, fetchUsers, fetchAllTenants, fetchRoles, fetchUserRoles, fetchRoleTemplates, fetchPermissions, fetchFeatures])

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

  // Handle single user move
  const handleSingleUserMove = (userId) => {
    setSelectedUsers(new Set([userId]))
    setMoveDialogOpen(true)
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

  // Handle toggle role active/inactive
  const handleToggleRoleActive = async (role) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/roles/${role.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !role.isActive,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update role')

      await fetchRoles()
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle view role details
  const handleViewRoleDetails = async (role) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/roles/${role.id}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch role details')

      setSelectedRole(data.role)
      setRoleDetailsDialogOpen(true)
    } catch (err) {
      setError(err.message)
    }
  }

  // Filter roles
  const filteredRoles = roles.filter(role => {
    const searchLower = roleSearchQuery.toLowerCase()
    return (
      role.roleAlias?.toLowerCase().includes(searchLower) ||
      role.description?.toLowerCase().includes(searchLower) ||
      role.permissions?.some(p =>
        p.displayName?.toLowerCase().includes(searchLower) ||
        p.name?.toLowerCase().includes(searchLower)
      )
    )
  })

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

  // Handle feature toggle (super admin controls superAdminEnabled)
  const handleFeatureToggle = async (featureId, superAdminEnabled) => {
    setFeatureLoading(true)
    try {
      const response = await fetch(`/api/tenants/${tenantId}/features`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureId, superAdminEnabled }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update feature')
      }

      // Refresh features
      await fetchFeatures()
    } catch (err) {
      setError(err.message)
    } finally {
      setFeatureLoading(false)
    }
  }

  // Initialize features for tenant
  const handleInitializeFeatures = async () => {
    setFeatureLoading(true)
    try {
      const response = await fetch(`/api/tenants/${tenantId}/features`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to initialize features')
      }

      await fetchFeatures()
    } catch (err) {
      setError(err.message)
    } finally {
      setFeatureLoading(false)
    }
  }

  // Get feature icon component
  const getFeatureIcon = (iconName) => {
    return featureIcons[iconName] || ToggleLeft
  }

  // Get category display name
  const getFeatureCategoryDisplayName = (category) => {
    const names = {
      gamification: 'Gamification',
      learning: 'Learning & Training',
      analytics: 'Analytics',
      admin: 'Administration',
      general: 'General',
    }
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1)
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !tenant) {
    return (
      <div className="p-4 lg:p-6 w-full">
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
    <div className="p-4 lg:p-6 w-full">
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
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{tenant?.name}</h1>
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
            Promise.all([fetchTenant(), fetchUsers(), fetchRoles(), fetchUserRoles(), fetchFeatures()])
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
                        <Image
                          src={user.imageUrl}
                          alt={user.username}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-semibold">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSingleUserMove(user.id)}
                        className="gap-2"
                        title="Move user to another tenant"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Move
                      </Button>
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

          {roles.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search roles by name, description, or permissions..."
                  value={roleSearchQuery}
                  onChange={(e) => setRoleSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Button
                  variant={rolesViewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setRolesViewMode('cards')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={rolesViewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setRolesViewMode('table')}
                >
                  <Table className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

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
          ) : filteredRoles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No roles match your search.</p>
              </CardContent>
            </Card>
          ) : rolesViewMode === 'table' ? (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Slot</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Permissions</th>
                      <th className="text-left p-4 font-medium">Users</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.map((role) => (
                      <tr key={role.id} className="border-b last:border-b-0 hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{role.roleAlias}</p>
                            {role.description && (
                              <p className="text-sm text-muted-foreground">{role.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">Slot {role.slotPosition}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={role.isActive ? 'default' : 'destructive'}>
                            {role.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{role.permissionCount}</span>
                            {role.permissions && role.permissions.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({role.permissions.slice(0, 3).map(p => p.displayName).join(', ')}
                                {role.permissions.length > 3 && '...'})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{role.userCount}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRoleDetails(role)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRole(role)
                                setRolePermissionsDialogOpen(true)
                              }}
                              title="Manage permissions"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditRole(role)}
                              title="Edit role"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleRoleActive(role)}
                              title={role.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {role.isActive ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedRole(role)
                                setDeleteRoleDialogOpen(true)
                              }}
                              disabled={role.userCount > 0}
                              title="Delete role"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoles.map((role) => (
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

                      {role.permissions && role.permissions.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="font-medium text-foreground">Permissions:</p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((perm) => (
                              <Badge key={perm.id} variant="outline" className="text-xs">
                                {perm.displayName}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRoleDetails(role)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                          title="Edit role"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleRoleActive(role)}
                          title={role.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {role.isActive ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
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
                          title="Delete role"
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
                              <Image
                                src={ur.user.imageUrl}
                                alt={ur.user.username}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-semibold">
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

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Feature Management</h2>
              <p className="text-sm text-muted-foreground">
                Enable or disable features for this tenant. Locked features cannot be changed by tenant admins.
              </p>
            </div>
            {features.length === 0 && (
              <Button onClick={handleInitializeFeatures} disabled={featureLoading}>
                {featureLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Initialize Features
              </Button>
            )}
          </div>

          {features.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ToggleLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No features configured for this tenant.</p>
                <Button onClick={handleInitializeFeatures} disabled={featureLoading}>
                  {featureLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Initialize Default Features
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{getFeatureCategoryDisplayName(category)}</CardTitle>
                    <CardDescription>
                      {categoryFeatures.filter(f => f.isEffectivelyEnabled).length} of {categoryFeatures.length} enabled
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryFeatures.map((feature) => {
                        const Icon = getFeatureIcon(feature.icon)
                        return (
                          <div
                            key={feature.id}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-lg border transition-colors",
                              feature.superAdminEnabled ? "bg-background" : "bg-muted/50"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2 rounded-lg",
                                feature.isEffectivelyEnabled
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              )}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{feature.name}</h4>
                                  {!feature.superAdminEnabled && (
                                    <Badge variant="secondary" className="text-xs gap-1">
                                      <Lock className="h-3 w-3" />
                                      Disabled by Admin
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {feature.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Key: <code className="bg-muted px-1 rounded">{feature.key}</code>
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <Switch
                                checked={feature.superAdminEnabled}
                                onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                                disabled={featureLoading}
                              />
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                {feature.superAdminEnabled ? (
                                  <>
                                    <Unlock className="h-3 w-3" />
                                    Allowed
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-3 w-3" />
                                    Blocked
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Feature Legend */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Legend</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Unlock className="h-4 w-4" />
                    <span>Allowed</span>
                  </div>
                  <span className="text-muted-foreground">- Tenant admin can enable/disable this feature</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Blocked</span>
                  </div>
                  <span className="text-muted-foreground">- Feature is disabled and locked for this tenant</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Move Users Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={(open) => {
        setMoveDialogOpen(open)
        if (!open) {
          // Reset state when dialog closes
          setTargetTenantId('')
          setFormError(null)
          setSuccessMessage(null)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move User{selectedUsers.size > 1 ? 's' : ''} to Another Tenant</DialogTitle>
            <DialogDescription>
              Move {selectedUsers.size} selected user{selectedUsers.size > 1 ? 's' : ''} to a different tenant.
              {selectedUsers.size === 1 && ' This feature will be deprecated in the future.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {successMessage ? (
              <div className="rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 p-3 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {successMessage}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 p-3 text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Deprecation Notice</p>
                    <p className="text-xs mt-1">
                      This feature is temporary and will be deprecated in the future. Use only when necessary.
                    </p>
                  </div>
                </div>
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
              Are you sure you want to delete the role &quot;{selectedRole?.roleAlias}&quot;?
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

      {/* Role Details Dialog */}
      <Dialog open={roleDetailsDialogOpen} onOpenChange={setRoleDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Details - {selectedRole?.roleAlias}</DialogTitle>
            <DialogDescription>
              View all information and permissions for this role.
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="py-4 space-y-6">
              {/* Role Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Role Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Role Name</Label>
                    <p className="font-medium">{selectedRole.roleAlias}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Slot Position</Label>
                    <p className="font-medium">
                      <Badge variant="secondary">Slot {selectedRole.slotPosition}</Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <p>
                      <Badge variant={selectedRole.isActive ? 'default' : 'destructive'}>
                        {selectedRole.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Users with Role</Label>
                    <p className="font-medium">{selectedRole.userCount || 0}</p>
                  </div>
                  {selectedRole.description && (
                    <div className="col-span-2">
                      <Label className="text-sm text-muted-foreground">Description</Label>
                      <p className="text-sm">{selectedRole.description}</p>
                    </div>
                  )}
                  {selectedRole.createdFromTemplate && (
                    <div className="col-span-2">
                      <Label className="text-sm text-muted-foreground">Based on Template</Label>
                      <p className="text-sm">
                        {selectedRole.createdFromTemplate.roleName} ({selectedRole.createdFromTemplate.templateSetName})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions by Category */}
              {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      Permissions ({selectedRole.permissions.length})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRoleDetailsDialogOpen(false)
                        setRolePermissionsDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Permissions
                    </Button>
                  </div>

                  {/* Group permissions by category */}
                  {(() => {
                    const permissionsByCategory = selectedRole.permissions.reduce((acc, perm) => {
                      const category = perm.category || 'other'
                      if (!acc[category]) {
                        acc[category] = []
                      }
                      acc[category].push(perm)
                      return acc
                    }, {})

                    return Object.keys(permissionsByCategory).map((category) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          {getCategoryDisplayName(category)}
                          <Badge variant="secondary" className="text-xs">
                            {permissionsByCategory[category].length}
                          </Badge>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                          {permissionsByCategory[category].map((perm) => (
                            <div
                              key={perm.id}
                              className="flex items-start gap-2 p-2 rounded border bg-muted/30"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{perm.displayName}</p>
                                <code className="text-xs text-muted-foreground">{perm.name}</code>
                                {perm.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No permissions assigned to this role.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRoleDetailsDialogOpen(false)
                      setRolePermissionsDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Permissions
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setRoleDetailsDialogOpen(false)
                if (selectedRole) {
                  setRolePermissionsDialogOpen(true)
                }
              }}
            >
              <Key className="h-4 w-4 mr-2" />
              Manage Permissions
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
