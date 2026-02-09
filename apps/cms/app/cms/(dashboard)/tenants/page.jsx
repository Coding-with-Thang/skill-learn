'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@skill-learn/ui/components/card"
import { Input } from "@skill-learn/ui/components/input"
import { Button } from "@skill-learn/ui/components/button"
import { Badge } from "@skill-learn/ui/components/badge"
import { Progress } from "@skill-learn/ui/components/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@skill-learn/ui/components/dialog'
import { Label } from '@skill-learn/ui/components/label'
import { Search, MoreVertical, Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, getStatusColor, getPlanColor } from '@/lib/cms/utils'
import Link from 'next/link'
import api from '@skill-learn/lib/utils/axios.js'
import { slugify } from '@skill-learn/lib/utils/utils.js'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subscriptionTier: 'free',
    maxRoleSlots: 5,
    requireEmailForRegistration: true,
  })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch tenants
  const fetchTenants = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/tenants')

      setTenants(response.data.tenants || [])
    } catch (err) {
      console.error('Error fetching tenants:', err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(err.response?.data?.error || 'Unauthorized - Super admin access required')
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to load tenants')
      }
      setTenants([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  // Filter tenants
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubscription = subscriptionFilter === 'all' || tenant.subscriptionTier === subscriptionFilter
    return matchesSearch && matchesSubscription
  })

  // Handle create
  const handleCreate = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const response = await api.post('/tenants', formData)

      if (response.data.error) {
        throw new Error(response.data.error || 'Failed to create tenant')
      }

      setCreateDialogOpen(false)
      setFormData({ name: '', slug: '', subscriptionTier: 'free', maxRoleSlots: 5 })
      fetchTenants()
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(err.response?.data?.error || 'Unauthorized - Super admin access required')
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to create tenant')
      }
    } finally {
      setFormLoading(false)
    }
  }

  // Handle edit
  const handleEdit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const response = await api.put(`/tenants/${selectedTenant.id}`, formData)

      if (response.data.error) {
        throw new Error(response.data.error || 'Failed to update tenant')
      }

      setEditDialogOpen(false)
      setSelectedTenant(null)
      setFormData({ name: '', slug: '', subscriptionTier: 'free', maxRoleSlots: 5, requireEmailForRegistration: true })
      fetchTenants()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update tenant')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    setFormLoading(true)
    setError(null)

    try {
      const response = await api.delete(`/tenants/${selectedTenant.id}`)

      if (response.data.error) {
        throw new Error(response.data.error || 'Failed to delete tenant')
      }

      setDeleteDialogOpen(false)
      setSelectedTenant(null)
      fetchTenants()
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(err.response?.data?.error || 'Unauthorized - Super admin access required')
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to delete tenant')
      }
    } finally {
      setFormLoading(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (tenant) => {
    setSelectedTenant(tenant)
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      subscriptionTier: tenant.subscriptionTier,
      maxRoleSlots: tenant.maxRoleSlots,
      requireEmailForRegistration: tenant.requireEmailForRegistration !== false,
    })
    setEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (tenant) => {
    setSelectedTenant(tenant)
    setDeleteDialogOpen(true)
  }

  // Generate slug from name using slugify utility
  const generateSlug = (name) => {
    return slugify(name)
  }

  // Get tenant logo (first letter of name)
  const getTenantLogo = (name) => {
    return name.charAt(0).toUpperCase()
  }

  // Get role slots usage percentage
  const getRoleSlotsPercentage = (tenant) => {
    if (tenant.maxRoleSlots === 0) return 0
    return (tenant.roleCount / tenant.maxRoleSlots) * 100
  }

  // Get subscription tiers for filter
  const subscriptionTiers = [...new Set(tenants.map(t => t.subscriptionTier))]

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 w-full">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-muted-foreground">
        Dashboard / <span className="text-foreground">Tenants</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Tenant Management</h1>
          <p className="text-muted-foreground mt-1">
            Oversee and manage all organization tenants across the platform.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Add a new tenant to the platform. The slug will be auto-generated from the name.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setFormData({
                        ...formData,
                        name,
                        slug: generateSlug(name),
                      })
                    }}
                    placeholder="Acme Corp"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="acme-corp"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                  <select
                    id="subscriptionTier"
                    value={formData.subscriptionTier}
                    onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxRoleSlots">Max Role Slots</Label>
                  <Input
                    id="maxRoleSlots"
                    type="number"
                    min="1"
                    value={formData.maxRoleSlots}
                    onChange={(e) => setFormData({ ...formData, maxRoleSlots: parseInt(e.target.value) || 5 })}
                    required
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                    {error}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false)
                    setFormData({ name: '', slug: '', subscriptionTier: 'free', maxRoleSlots: 5 })
                    setError(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Tenant'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tenants by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={subscriptionFilter}
          onChange={(e) => setSubscriptionFilter(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Subscription Tiers</option>
          {subscriptionTiers.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>

        <Button
          variant="ghost"
          className="text-primary"
          onClick={() => {
            setSearchQuery('')
            setSubscriptionFilter('all')
            setStatusFilter('all')
          }}
        >
          Clear all
        </Button>
      </div>

      {/* Tenant Cards Grid */}
      {error && !loading && (
        <div className="mb-6 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-4">
          {error}
        </div>
      )}

      {filteredTenants.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No tenants found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredTenants.map((tenant, index) => (
            <motion.div
              key={tenant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-primary/10 text-xl font-semibold">
                        {getTenantLogo(tenant.name)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{tenant.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" />
                          {tenant.slug}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setOpenMenuId(openMenuId === tenant.id ? null : tenant.id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {openMenuId === tenant.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 bg-background border rounded-lg shadow-lg p-1 min-w-[120px] z-2000">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                openEditDialog(tenant)
                                setOpenMenuId(null)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-red-600 hover:text-red-700"
                              onClick={() => {
                                openDeleteDialog(tenant)
                                setOpenMenuId(null)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={cn("font-medium", getPlanColor(tenant.subscriptionTier))}>
                      {tenant.subscriptionTier}
                    </Badge>
                  </div>

                  {/* Active Users */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Active Users</span>
                      <span className="font-medium">
                        {tenant.activeUsers.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Role Slots */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Role Slots</span>
                      <span className="font-medium">
                        {tenant.roleCount} / {tenant.maxRoleSlots}
                      </span>
                    </div>
                    <Progress
                      value={getRoleSlotsPercentage(tenant)}
                      indicatorClassName={cn(
                        getRoleSlotsPercentage(tenant) >= 90 ? 'bg-red-500' :
                          getRoleSlotsPercentage(tenant) >= 75 ? 'bg-amber-500' :
                            'bg-blue-500'
                      )}
                    />
                  </div>

                  {/* Action Button */}
                  <Link href={`/cms/tenants/${tenant.id}`}>
                    <Button variant="outline" className="w-full">
                      Manage Tenant
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{filteredTenants.length}</span> of{' '}
          <span className="font-medium">{tenants.length}</span> tenant(s)
        </p>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData({
                      ...formData,
                      name,
                      slug: generateSlug(name),
                    })
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Slug *</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subscriptionTier">Subscription Tier</Label>
                <select
                  id="edit-subscriptionTier"
                  value={formData.subscriptionTier}
                  onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-maxRoleSlots">Max Role Slots</Label>
                <Input
                  id="edit-maxRoleSlots"
                  type="number"
                  min="1"
                  value={formData.maxRoleSlots}
                  onChange={(e) => setFormData({ ...formData, maxRoleSlots: parseInt(e.target.value) || 5 })}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="edit-requireEmail"
                  type="checkbox"
                  checked={formData.requireEmailForRegistration}
                  onChange={(e) => setFormData({ ...formData, requireEmailForRegistration: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="edit-requireEmail" className="cursor-pointer">
                  Require email for LMS sign-up
                </Label>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                When unchecked, users can register with username + password only (no email). Use for tenants that do not want to collect email.
              </p>
              {error && (
                <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                  {error}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setSelectedTenant(null)
                  setFormData({ name: '', slug: '', subscriptionTier: 'free', maxRoleSlots: 5, requireEmailForRegistration: true })
                  setError(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Tenant'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedTenant?.name}</strong>? This action cannot be undone.
              {selectedTenant?.activeUsers > 0 && (
                <span className="block mt-2 text-red-600">
                  Warning: This tenant has {selectedTenant.activeUsers} user(s). You must remove them first.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setSelectedTenant(null)
                setError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={formLoading || (selectedTenant?.activeUsers > 0)}
            >
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Tenant'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
