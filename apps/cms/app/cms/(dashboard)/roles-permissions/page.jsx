'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/cms/ui/card'
import { Input } from '@/components/cms/ui/input'
import { Button } from '@/components/cms/ui/button'
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
import { Checkbox } from '@skill-learn/ui/components/checkbox'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Shield,
  Key,
  Users,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Copy,
  RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cms/utils'

// Tab components
const tabs = [
  { id: 'permissions', label: 'Permissions', icon: Key },
  { id: 'templates', label: 'Role Templates', icon: Shield },
]

export default function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState('permissions')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Permissions state
  const [permissions, setPermissions] = useState([])
  const [groupedPermissions, setGroupedPermissions] = useState({})
  const [categories, setCategories] = useState([])

  // Role templates state
  const [roleTemplates, setRoleTemplates] = useState([])
  const [templateSets, setTemplateSets] = useState([])
  const [groupedTemplates, setGroupedTemplates] = useState({})

  // UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [templateSetFilter, setTemplateSetFilter] = useState('all')
  const [expandedCategories, setExpandedCategories] = useState({})

  // Dialog states
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permissionAssignDialogOpen, setPermissionAssignDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  // Form states
  const [permissionForm, setPermissionForm] = useState({
    name: '',
    displayName: '',
    description: '',
    category: '',
  })
  const [templateForm, setTemplateForm] = useState({
    templateSetName: 'generic',
    roleName: '',
    description: '',
    slotPosition: 1,
    isDefaultSet: false,
    permissionIds: [],
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  // Fetch permissions
  const fetchPermissions = useCallback(async () => {
    try {
      const response = await fetch('/api/permissions?includeDeprecated=true')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch permissions')
      }
      const data = await response.json()
      setPermissions(data.permissions || [])
      setGroupedPermissions(data.groupedByCategory || {})
      setCategories(data.categories || [])

      // Expand all categories by default
      const expanded = {}
      data.categories?.forEach(cat => {
        expanded[cat] = true
      })
      setExpandedCategories(expanded)
    } catch (err) {
      console.error('Error fetching permissions:', err)
      throw err
    }
  }, [])

  // Fetch role templates
  const fetchRoleTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/role-templates')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch role templates')
      }
      const data = await response.json()
      setRoleTemplates(data.roleTemplates || [])
      setGroupedTemplates(data.groupedBySet || {})
      setTemplateSets(data.templateSets || [])
    } catch (err) {
      console.error('Error fetching role templates:', err)
      throw err
    }
  }, [])

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([fetchPermissions(), fetchRoleTemplates()])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [fetchPermissions, fetchRoleTemplates])

  // Filter permissions
  const filteredPermissions = permissions.filter(perm => {
    const matchesSearch =
      perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || perm.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Filter role templates
  const filteredTemplates = roleTemplates.filter(template => {
    const matchesSearch =
      template.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.templateSetName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSet = templateSetFilter === 'all' || template.templateSetName === templateSetFilter
    return matchesSearch && matchesSet
  })

  // Handle permission create/update
  const handlePermissionSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    try {
      const url = isEditing
        ? `/api/permissions/${selectedItem.id}`
        : '/api/permissions'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissionForm),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save permission')
      }

      setPermissionDialogOpen(false)
      resetPermissionForm()
      await fetchPermissions()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle template create/update
  const handleTemplateSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    try {
      const url = isEditing
        ? `/api/role-templates/${selectedItem.id}`
        : '/api/role-templates'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save role template')
      }

      setTemplateDialogOpen(false)
      resetTemplateForm()
      await fetchRoleTemplates()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    setFormLoading(true)
    setFormError(null)

    try {
      const url = activeTab === 'permissions'
        ? `/api/permissions/${selectedItem.id}`
        : `/api/role-templates/${selectedItem.id}`

      const response = await fetch(url, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete')
      }

      setDeleteDialogOpen(false)
      setSelectedItem(null)

      if (activeTab === 'permissions') {
        await fetchPermissions()
      } else {
        await fetchRoleTemplates()
      }
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle permission assignment to template
  const handlePermissionAssignment = async (permissionId, isChecked) => {
    if (!selectedItem) return

    try {
      const url = `/api/role-templates/${selectedItem.id}/permissions`
      const method = isChecked ? 'POST' : 'DELETE'
      const body = { permissionIds: [permissionId] }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update permissions')
      }

      // Refresh templates
      await fetchRoleTemplates()
      // Update selected item
      const updatedTemplate = roleTemplates.find(t => t.id === selectedItem.id)
      if (updatedTemplate) {
        setSelectedItem(updatedTemplate)
      }
    } catch (err) {
      console.error('Error updating permissions:', err)
    }
  }

  // Reset forms
  const resetPermissionForm = () => {
    setPermissionForm({
      name: '',
      displayName: '',
      description: '',
      category: '',
    })
    setSelectedItem(null)
    setIsEditing(false)
    setFormError(null)
  }

  const resetTemplateForm = () => {
    setTemplateForm({
      templateSetName: 'generic',
      roleName: '',
      description: '',
      slotPosition: 1,
      isDefaultSet: false,
      permissionIds: [],
    })
    setSelectedItem(null)
    setIsEditing(false)
    setFormError(null)
  }

  // Open edit dialogs
  const openEditPermission = (permission) => {
    setSelectedItem(permission)
    setPermissionForm({
      name: permission.name,
      displayName: permission.displayName,
      description: permission.description || '',
      category: permission.category,
    })
    setIsEditing(true)
    setPermissionDialogOpen(true)
  }

  const openEditTemplate = (template) => {
    setSelectedItem(template)
    setTemplateForm({
      templateSetName: template.templateSetName,
      roleName: template.roleName,
      description: template.description || '',
      slotPosition: template.slotPosition,
      isDefaultSet: template.isDefaultSet,
      permissionIds: template.permissions?.map(p => p.id) || [],
    })
    setIsEditing(true)
    setTemplateDialogOpen(true)
  }

  // Open permission assignment dialog
  const openPermissionAssignment = (template) => {
    setSelectedItem(template)
    setPermissionAssignDialogOpen(true)
  }

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  // Get category display name
  const getCategoryDisplayName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 w-full">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-muted-foreground">
        Dashboard / <span className="text-foreground">Roles & Permissions</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Manage global permissions and role templates for tenant onboarding.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            if (activeTab === 'permissions') {
              resetPermissionForm()
              setPermissionDialogOpen(true)
            } else {
              resetTemplateForm()
              setTemplateDialogOpen(true)
            }
          }}
        >
          <Plus className="h-4 w-4" />
          {activeTab === 'permissions' ? 'Add Permission' : 'Add Role Template'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSearchQuery('')
              }}
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

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={activeTab === 'permissions' ? "Search permissions..." : "Search templates..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {activeTab === 'permissions' && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {getCategoryDisplayName(category)}
              </option>
            ))}
          </select>
        )}

        {activeTab === 'templates' && (
          <select
            value={templateSetFilter}
            onChange={(e) => setTemplateSetFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Template Sets</option>
            {templateSets.map((set) => (
              <option key={set} value={set}>
                {set.charAt(0).toUpperCase() + set.slice(1)}
              </option>
            ))}
          </select>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            setLoading(true)
            try {
              await Promise.all([fetchPermissions(), fetchRoleTemplates()])
            } catch (err) {
              setError(err.message)
            } finally {
              setLoading(false)
            }
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Permissions Tab Content */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {categories.filter(cat => categoryFilter === 'all' || cat === categoryFilter).map((category) => {
            const categoryPermissions = groupedPermissions[category] || []
            const filteredCategoryPermissions = categoryPermissions.filter(perm =>
              perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              perm.displayName.toLowerCase().includes(searchQuery.toLowerCase())
            )

            if (filteredCategoryPermissions.length === 0) return null

            return (
              <Card key={category}>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {expandedCategories[category] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <CardTitle className="text-lg">
                        {getCategoryDisplayName(category)}
                      </CardTitle>
                      <Badge variant="secondary">
                        {filteredCategoryPermissions.length}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {expandedCategories[category] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="pt-0">
                        <div className="grid gap-2">
                          {filteredCategoryPermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                                    {permission.name}
                                  </code>
                                  {permission.isDeprecated && (
                                    <Badge variant="destructive" className="text-xs">
                                      Deprecated
                                    </Badge>
                                  )}
                                  {!permission.isActive && (
                                    <Badge variant="secondary" className="text-xs">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm font-medium mt-1">
                                  {permission.displayName}
                                </p>
                                {permission.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {permission.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  Used by {permission.usageCount} role(s)
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEditPermission(permission)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    setSelectedItem(permission)
                                    setDeleteDialogOpen(true)
                                  }}
                                  disabled={permission.usageCount > 0}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )
          })}

          {filteredPermissions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No permissions found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Role Templates Tab Content */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {template.templateSetName}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Slot {template.slotPosition}
                        </Badge>
                        {template.isDefaultSet && (
                          <Badge className="text-xs bg-green-500">
                            Default
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{template.roleName}</CardTitle>
                      {template.description && (
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Permissions</span>
                      <span className="font-medium">{template.permissionCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Used by tenants</span>
                      <span className="font-medium">{template.tenantRolesUsingThisTemplate}</span>
                    </div>

                    {/* Permission preview */}
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Permissions preview:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.permissions?.slice(0, 5).map((perm) => (
                          <Badge key={perm.id} variant="outline" className="text-xs">
                            {perm.name}
                          </Badge>
                        ))}
                        {template.permissions?.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.permissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openPermissionAssignment(template)}
                      >
                        <Key className="h-4 w-4 mr-1" />
                        Permissions
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setSelectedItem(template)
                          setDeleteDialogOpen(true)
                        }}
                        disabled={template.tenantRolesUsingThisTemplate > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredTemplates.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No role templates found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Permission Dialog */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Permission' : 'Create Permission'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the permission details.'
                : 'Add a new permission to the global catalog.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePermissionSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="perm-name">Name (resource.action) *</Label>
                <Input
                  id="perm-name"
                  value={permissionForm.name}
                  onChange={(e) =>
                    setPermissionForm({ ...permissionForm, name: e.target.value })
                  }
                  placeholder="users.create"
                  pattern="^[a-z_]+\.[a-z_]+$"
                  disabled={isEditing}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Format: resource.action (lowercase with underscores)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="perm-displayName">Display Name *</Label>
                <Input
                  id="perm-displayName"
                  value={permissionForm.displayName}
                  onChange={(e) =>
                    setPermissionForm({ ...permissionForm, displayName: e.target.value })
                  }
                  placeholder="Create Users"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="perm-category">Category *</Label>
                <Input
                  id="perm-category"
                  value={permissionForm.category}
                  onChange={(e) =>
                    setPermissionForm({ ...permissionForm, category: e.target.value })
                  }
                  placeholder="user_management"
                  list="categories"
                  required
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="perm-description">Description</Label>
                <Input
                  id="perm-description"
                  value={permissionForm.description}
                  onChange={(e) =>
                    setPermissionForm({ ...permissionForm, description: e.target.value })
                  }
                  placeholder="Permission to create new users"
                />
              </div>
              {formError && (
                <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                  {formError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPermissionDialogOpen(false)
                  resetPermissionForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : isEditing ? (
                  'Update Permission'
                ) : (
                  'Create Permission'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Role Template' : 'Create Role Template'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the role template details.'
                : 'Add a new role template for tenant onboarding.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTemplateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="template-set">Template Set *</Label>
                <Input
                  id="template-set"
                  value={templateForm.templateSetName}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, templateSetName: e.target.value })
                  }
                  placeholder="generic"
                  list="templateSets"
                  required
                />
                <datalist id="templateSets">
                  {templateSets.map((set) => (
                    <option key={set} value={set} />
                  ))}
                </datalist>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="template-name">Role Name *</Label>
                <Input
                  id="template-name"
                  value={templateForm.roleName}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, roleName: e.target.value })
                  }
                  placeholder="Administrator"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="template-slot">Slot Position (1-10) *</Label>
                <Input
                  id="template-slot"
                  type="number"
                  min="1"
                  max="10"
                  value={templateForm.slotPosition}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      slotPosition: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  value={templateForm.description}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, description: e.target.value })
                  }
                  placeholder="Full access to all tenant features"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="template-default"
                  checked={templateForm.isDefaultSet}
                  onCheckedChange={(checked) =>
                    setTemplateForm({ ...templateForm, isDefaultSet: checked })
                  }
                />
                <Label htmlFor="template-default" className="cursor-pointer">
                  Mark this template set as default for new tenants
                </Label>
              </div>
              {formError && (
                <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                  {formError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTemplateDialogOpen(false)
                  resetTemplateForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : isEditing ? (
                  'Update Template'
                ) : (
                  'Create Template'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permission Assignment Dialog */}
      <Dialog open={permissionAssignDialogOpen} onOpenChange={setPermissionAssignDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Permissions - {selectedItem?.roleName}
            </DialogTitle>
            <DialogDescription>
              Select which permissions this role template should have.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {categories.map((category) => {
              const categoryPerms = groupedPermissions[category] || []
              if (categoryPerms.length === 0) return null

              const selectedPermIds = new Set(
                selectedItem?.permissions?.map((p) => p.id) || []
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
                            handlePermissionAssignment(perm.id, checked)
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
            <Button
              variant="outline"
              onClick={() => {
                setPermissionAssignDialogOpen(false)
                setSelectedItem(null)
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>
                {activeTab === 'permissions'
                  ? selectedItem?.displayName
                  : selectedItem?.roleName}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
              {formError}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setSelectedItem(null)
                setFormError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
