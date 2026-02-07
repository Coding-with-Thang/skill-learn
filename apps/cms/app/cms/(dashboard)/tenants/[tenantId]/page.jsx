'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@skill-learn/ui/components/card"
import { Button } from "@skill-learn/ui/components/button"
import { Input } from "@skill-learn/ui/components/input"
import { Badge } from "@skill-learn/ui/components/badge"
import { Progress } from "@skill-learn/ui/components/progress"
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
import api from '@skill-learn/lib/utils/axios.js'
import { useTenantsStore } from '@skill-learn/lib/stores/tenantsStore.js'
import { useRoleTemplatesStore } from '@skill-learn/lib/stores/roleTemplatesStore.js'
import { usePermissionsStore } from '@skill-learn/lib/stores/permissionsStore.js'
import { parseApiResponse } from '@skill-learn/lib/utils/apiResponseParser.js'

import {
  ArrowLeft,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
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
    className={cn(
      "relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent",
      "transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2",
      "focus-visible:ring-primary focus-visible:ring-offset-2",
      checked ? 'bg-primary' : 'bg-input',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <span
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0",
        "transition-transform duration-200 ease-in-out",
        checked ? 'translate-x-5' : 'translate-x-0'
      )}
    />
  </button>
)

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.tenantId

  // Use selectors to only re-render when specific state changes
  const tenant = useTenantsStore((state) => state.currentTenant);
  const users = useTenantsStore((state) => state.users);
  const roles = useTenantsStore((state) => state.roles);
  const userRoles = useTenantsStore((state) => state.userRoles);
  const features = useTenantsStore((state) => state.features);
  const groupedFeatures = useTenantsStore((state) => state.featuresByCategory);
  const allTenants = useTenantsStore((state) => state.allTenants);
  const storeLoading = useTenantsStore((state) => state.isLoading);
  const storeError = useTenantsStore((state) => state.error);
  const fetchTenant = useTenantsStore((state) => state.fetchTenant);
  const fetchUsers = useTenantsStore((state) => state.fetchUsers);
  const fetchRoles = useTenantsStore((state) => state.fetchRoles);
  const fetchUserRoles = useTenantsStore((state) => state.fetchUserRoles);
  const fetchFeatures = useTenantsStore((state) => state.fetchFeatures);

  const roleTemplates = useRoleTemplatesStore((state) => state.roleTemplates);
  const fetchRoleTemplates = useRoleTemplatesStore((state) => state.fetchRoleTemplates);

  // Get store instance for accessing updated state after mutations
  const tenantsStore = useTenantsStore.getState();

  // Local state (UI only)
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // For permissions (can be fetched separately since it's not tenant-specific)
  const [permissions, setPermissions] = useState([])
  const [groupedPermissions, setGroupedPermissions] = useState({})

  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false)
  const [rolePermissionsDialogOpen, setRolePermissionsDialogOpen] = useState(false)
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false)
  const [initializeRolesDialogOpen, setInitializeRolesDialogOpen] = useState(false)

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
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false)
  const [userRoleToReassign, setUserRoleToReassign] = useState(null)
  const [reassignTargetRoleId, setReassignTargetRoleId] = useState('')

  // Role form
  const [roleForm, setRoleForm] = useState({
    roleAlias: '',
    description: '',
    slotPosition: 1,
    templateId: '',
    permissionIds: [],
  })

  // Feature loading state
  const [featureLoading, setFeatureLoading] = useState(false)

  // Fetch permissions (global, not tenant-specific)
  const fetchPermissions = useCallback(async () => {
    try {
      const response = await api.get('/permissions')
      const data = parseApiResponse(response)
      setPermissions(data.permissions || [])
      setGroupedPermissions(data.groupedByCategory || {})
    } catch (err) {
      console.error('Error fetching permissions:', err)
    }
  }, [])

  // Load all data
  useEffect(() => {
    if (tenantId) {
      setLoading(true)
      setError(null)

      Promise.all([
        fetchTenant(tenantId),
        fetchUsers(tenantId),
        fetchRoles(tenantId),
        fetchUserRoles(tenantId),
        fetchRoleTemplates(),
        fetchPermissions(), // Global permissions (no tenantId)
        fetchFeatures(tenantId),
      ])
        .catch(err => {
          setError(err.response?.data?.error || err.message || 'Failed to load data')
        })
        .finally(() => setLoading(false))
    }
  }, [tenantId, fetchTenant, fetchUsers, fetchRoles, fetchUserRoles, fetchFeatures, fetchRoleTemplates, fetchPermissions])

  // Handle role create/update
  const handleRoleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    try {
      const url = isEditing
        ? `/tenants/${tenantId}/roles/${selectedRole.id}`
        : `/tenants/${tenantId}/roles`

      const response = isEditing
        ? await api.put(url, roleForm)
        : await api.post(url, roleForm)

      if (response.data.error) throw new Error(response.data.error || 'Failed to save role')

      setRoleDialogOpen(false)
      resetRoleForm()
      await Promise.all([fetchTenant(tenantId), fetchRoles(tenantId, true)])
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
      const response = await api.delete(`/tenants/${tenantId}/roles/${selectedRole.id}`)

      if (response.data.error) throw new Error(response.data.error || 'Failed to delete role')

      setDeleteRoleDialogOpen(false)
      setSelectedRole(null)
      await Promise.all([fetchTenant(tenantId), fetchRoles(tenantId, true), fetchUserRoles(tenantId, true)])
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
      const response = await api.post(`/tenants/${tenantId}/user-roles`, {
        userId: selectedUserForRole,
        tenantRoleId: selectedRoleForAssignment,
      })

      if (response.data.error) throw new Error(response.data.error || 'Failed to assign role')

      setAssignRoleDialogOpen(false)
      setSelectedUserForRole('')
      setSelectedRoleForAssignment('')
      await fetchUserRoles(tenantId, true)
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Failed to assign role')
    } finally {
      setFormLoading(false)
    }
  }

  const handleReassignUserRole = async () => {
    if (!userRoleToReassign || !reassignTargetRoleId) return
    setFormLoading(true)
    setFormError(null)
    try {
      const response = await api.put(`/tenants/${tenantId}/user-roles`, {
        userRoleId: userRoleToReassign.id,
        tenantRoleId: reassignTargetRoleId,
      })
      if (response.data.error) throw new Error(response.data.error || 'Failed to reassign role')
      setReassignDialogOpen(false)
      setUserRoleToReassign(null)
      setReassignTargetRoleId('')
      await fetchUserRoles(tenantId, true)
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Failed to reassign role')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle initialize roles from template
  const handleInitializeRoles = async () => {
    setFormLoading(true)
    setFormError(null)

    try {
      const response = await api.put(`/tenants/${tenantId}/roles`, { templateSetName })

      if (response.data.error) throw new Error(response.data.error || 'Failed to initialize roles')

      setInitializeRolesDialogOpen(false)
      await Promise.all([fetchTenant(tenantId), fetchRoles(tenantId, true)])
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
      const url = `/tenants/${tenantId}/roles/${selectedRole.id}/permissions`

      const response = isChecked
        ? await api.post(url, { permissionIds: [permissionId] })
        : await api.delete(url, { data: { permissionIds: [permissionId] } })

      if (response.data.error) throw new Error(response.data.error || 'Failed to update permissions')

      await fetchRoles(tenantId, true)

      // Update selected role from updated store data
      const updatedRoles = useTenantsStore.getState().roles
      const updatedRole = updatedRoles.find(r => r.id === selectedRole.id)
      if (updatedRole) {
        setSelectedRole(updatedRole)
      }
    } catch (err) {
      console.error('Error updating permissions:', err)
    }
  }

  // Handle toggle role active/inactive
  const handleToggleRoleActive = async (role) => {
    try {
      const response = await api.put(`/tenants/${tenantId}/roles/${role.id}`, {
        isActive: !role.isActive,
      })

      if (response.data.error) throw new Error(response.data.error || 'Failed to update role')

      await fetchRoles(tenantId, true)

      // Update selected role from updated store data if it exists
      const updatedRoles = useTenantsStore.getState().roles
      const updatedRole = updatedRoles.find(r => r.id === role.id)
      if (updatedRole) {
        setSelectedRole(updatedRole)
      }
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Failed to update role')
    }
  }

  const activeRoleCount = roles.filter((r) => r.isActive).length
  const cannotDeactivateRole = (role) => role.isActive && activeRoleCount <= 1

  // Handle view role details
  const handleViewRoleDetails = async (role) => {
    try {
      const response = await api.get(`/tenants/${tenantId}/roles/${role.id}`)

      if (response.data.error) throw new Error(response.data.error || 'Failed to fetch role details')

      setSelectedRole(response.data.role)
      setRoleDetailsDialogOpen(true)
    } catch (err) {
      setError(err.message)
    }
  }

  // Filter roles from store (using selector for reactivity)
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

  // Create a map of user roles by userId (Clerk ID) for quick lookup
  const userRoleMap = new Map()
  userRoles.forEach(ur => {
    const userId = ur.userId
    // Store the role with highest priority (if user has multiple roles, take the first active one)
    if (!userRoleMap.has(userId) && ur.role?.roleAlias) {
      userRoleMap.set(userId, ur.role.roleAlias)
    }
  })

  // Helper function to get user's role from userRoles
  const getUserRole = (user) => {
    // Try clerkId first, then id
    const userId = user.clerkId || user.id
    return userRoleMap.get(userId) || null
  }

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

    // Optimistic update: immediately update the store for instant UI feedback
    const previousFeatures = [...features]
    const previousGroupedFeatures = { ...groupedFeatures }

    const updatedFeatures = features.map(f =>
      f.id === featureId
        ? { ...f, superAdminEnabled, isEffectivelyEnabled: f.enabled && superAdminEnabled && f.isActive }
        : f
    )

    // Update grouped features as well
    const updatedGroupedFeatures = Object.entries(groupedFeatures).reduce((acc, [category, categoryFeatures]) => {
      acc[category] = categoryFeatures.map(f =>
        f.id === featureId
          ? { ...f, superAdminEnabled, isEffectivelyEnabled: f.enabled && superAdminEnabled && f.isActive }
          : f
      )
      return acc
    }, {})

    // Apply optimistic update to store using Zustand's setState
    useTenantsStore.setState({
      features: updatedFeatures,
      featuresByCategory: updatedGroupedFeatures,
    })

    try {
      const response = await api.put(`/tenants/${tenantId}/features`, { featureId, superAdminEnabled })

      if (response.data.error) throw new Error(response.data.error || 'Failed to update feature')

      // Refresh features to get the latest state from server (force bypasses request deduplication)
      await fetchFeatures(tenantId, true)
    } catch (err) {
      // Revert optimistic update on error
      useTenantsStore.setState({
        features: previousFeatures,
        featuresByCategory: previousGroupedFeatures,
      })
      setError(err.message)
    } finally {
      setFeatureLoading(false)
    }
  }

  // Initialize features for tenant
  const handleInitializeFeatures = async () => {
    setFeatureLoading(true)
    try {
      const response = await api.post(`/tenants/${tenantId}/features`)

      if (response.data.error) throw new Error(response.data.error || 'Failed to initialize features')

      // Refresh features (force bypasses request deduplication)
      await fetchFeatures(tenantId, true)
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

  // Combine store loading with local loading
  const isLoading = loading || storeLoading
  const displayError = error || storeError

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (displayError && !tenant) {
    return (
      <div className="p-4 lg:p-6 w-full">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{displayError}</p>
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
            Promise.all([
              fetchTenant(tenantId),
              fetchUsers(tenantId),
              fetchRoles(tenantId),
              fetchUserRoles(tenantId),
              fetchFeatures(tenantId),
            ])
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
      {displayError && (
        <div className="mb-6 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-4">
          {displayError}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>
              Users belonging to this tenant
            </CardDescription>
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
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.username}
                        width={40}
                        height={40}
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
                    {(() => {
                      const userRole = getUserRole(user)
                      return userRole ? (
                        <Badge variant="outline">
                          {userRole}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No role
                        </Badge>
                      )
                    })()}
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
                  console.log('Add Role button clicked')
                  resetRoleForm()
                  setRoleDialogOpen(true)
                  console.log('roleDialogOpen set to:', true)
                }}
                disabled={roles.length >= (tenant?.maxRoleSlots || 5)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>
          </div>

          {/* Default Role Setting */}
          {roles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Default Role for New Users</CardTitle>
                <CardDescription>
                  Select which role should be assigned by default when creating new users in the LMS admin dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="defaultRole">Default Role</Label>
                    <select
                      id="defaultRole"
                      value={tenant?.defaultRoleId || ''}
                      onChange={async (e) => {
                        const newDefaultRoleId = e.target.value || null
                        try {
                          const response = await api.put(`/tenants/${tenantId}`, {
                            defaultRoleId: newDefaultRoleId,
                          })
                          if (response.data.error) {
                            throw new Error(response.data.error)
                          }
                          // Refresh tenant data
                          await fetchTenant(tenantId, true)
                        } catch (err) {
                          console.error('Error updating default role:', err)
                          setError(err.response?.data?.error || err.message || 'Failed to update default role')
                        }
                      }}
                      className="w-full mt-2 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">No default role</option>
                      {roles.filter(r => r.isActive).map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.roleAlias} {role.id === tenant?.defaultRoleId ? '(Current Default)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {tenant?.defaultRole && (
                    <div className="text-sm text-muted-foreground">
                      Current: <Badge variant="secondary">{tenant.defaultRole.roleAlias}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{role.roleAlias}</p>
                              {role.modifiedFromTemplate && (
                                <Badge variant="outline" className="text-xs">
                                  Custom
                                </Badge>
                              )}
                              {role.createdFromTemplate && !role.modifiedFromTemplate && (
                                <Badge variant="default" className="text-xs bg-blue-500">
                                  Template
                                </Badge>
                              )}
                            </div>
                            {role.description && (
                              <p className="text-sm text-muted-foreground">{role.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">Slot {role.slotPosition}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={role.isActive ? 'success' : 'destructive'}>
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
                              disabled={cannotDeactivateRole(role)}
                              title={
                                role.isActive
                                  ? cannotDeactivateRole(role)
                                    ? 'Tenant must have at least one active role'
                                    : 'Deactivate'
                                  : 'Activate'
                              }
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
                          {role.modifiedFromTemplate && (
                            <Badge variant="outline" className="text-xs">
                              Custom
                            </Badge>
                          )}
                          {role.createdFromTemplate && !role.modifiedFromTemplate && (
                            <Badge variant="default" className="text-xs bg-blue-500">
                              Template
                            </Badge>
                          )}
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
                          disabled={cannotDeactivateRole(role)}
                          title={
                            role.isActive
                              ? cannotDeactivateRole(role)
                                ? 'Tenant must have at least one active role'
                                : 'Deactivate'
                              : 'Activate'
                          }
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
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{ur.role?.roleAlias}</Badge>
                            {(() => {
                              const roleMeta = roles.find((r) => r.id === ur.role?.id)
                              if (roleMeta?.modifiedFromTemplate) {
                                return (
                                  <Badge variant="outline" className="text-xs">
                                    Custom
                                  </Badge>
                                )
                              }
                              if (roleMeta?.createdFromTemplate && !roleMeta?.modifiedFromTemplate) {
                                return (
                                  <Badge variant="secondary" className="text-xs">
                                    Template
                                  </Badge>
                                )
                              }
                              return null
                            })()}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(ur.assignedAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUserRoleToReassign(ur)
                              setReassignTargetRoleId('')
                              setReassignDialogOpen(true)
                            }}
                            title="Change role"
                          >
                            <Edit className="h-4 w-4" />
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

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={(open) => {
        console.log('Dialog onOpenChange called with:', open)
        setRoleDialogOpen(open)
      }}>
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
                    {r.createdFromTemplate ? ` (Template: ${r.createdFromTemplate.templateSetName})` : ' (Custom)'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                You can assign both custom roles and roles created from templates.
              </p>
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

      {/* Reassign User Role Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setUserRoleToReassign(null)
          setReassignTargetRoleId('')
          setFormError(null)
        }
        setReassignDialogOpen(open)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              Assign this user to a different role. Users must have a role; use this to change it.
            </DialogDescription>
          </DialogHeader>
          {userRoleToReassign && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label className="text-sm text-muted-foreground">User</Label>
                <p className="font-medium">
                  {userRoleToReassign.user?.fullName || userRoleToReassign.user?.username || userRoleToReassign.userId}
                </p>
              </div>
              <div className="grid gap-2">
                <Label>New role *</Label>
                <select
                  value={reassignTargetRoleId}
                  onChange={(e) => setReassignTargetRoleId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  disabled={formLoading}
                >
                  <option value="">Select a role...</option>
                  {roles
                    .filter((r) => r.isActive && r.id !== userRoleToReassign.role?.id)
                    .map((r) => (
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignDialogOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleReassignUserRole}
              disabled={!reassignTargetRoleId || formLoading}
            >
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Change role
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
                    <div className="font-medium">
                      <Badge variant="secondary">Slot {selectedRole.slotPosition}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div>
                      <Badge variant={selectedRole.isActive ? 'success' : 'destructive'}>
                        {selectedRole.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
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
