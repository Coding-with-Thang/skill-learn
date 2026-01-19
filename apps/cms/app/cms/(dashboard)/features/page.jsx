'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/cms/ui/card'
import api from '@skill-learn/lib/utils/axios.js'
import { slugify } from '@skill-learn/lib/utils/utils.js'
import { Badge } from '@/components/cms/ui/badge'
import { Button } from '@/components/cms/ui/button'
import { Input } from '@/components/cms/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skill-learn/ui/components/dialog'
import { Label } from '@skill-learn/ui/components/label'
import { cn } from '@/lib/cms/utils'
import {
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
  ToggleLeft,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Zap,
} from 'lucide-react'

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
  Zap,
  ToggleLeft,
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

// Icon selector options
const iconOptions = [
  'Gamepad2', 'FileQuestion', 'Trophy', 'Gift', 'Award', 'Flame',
  'GraduationCap', 'Coins', 'FolderTree', 'BarChart3', 'ScrollText',
  'Shield', 'Zap', 'ToggleLeft'
]

// Category options
const categoryOptions = [
  { value: 'gamification', label: 'Gamification' },
  { value: 'learning', label: 'Learning & Training' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'admin', label: 'Administration' },
  { value: 'general', label: 'General' },
]

export default function FeaturesPage() {
  const [features, setFeatures] = useState([])
  const [groupedFeatures, setGroupedFeatures] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    category: 'general',
    defaultEnabled: true,
    isActive: true,
    icon: 'ToggleLeft',
    sortOrder: 0,
  })

  // Fetch features
  const fetchFeatures = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/features')

      setFeatures(response.data.features || [])
      setGroupedFeatures(response.data.groupedByCategory || {})
    } catch (err) {
      console.error('Error fetching features:', err)
      setError(err.response?.data?.error || err.message || 'Failed to fetch features')
    } finally {
      setLoading(false)
    }
  }

  // Seed default features
  const seedFeatures = async () => {
    try {
      setLoading(true)
      await api.post('/features/seed')

      await fetchFeatures()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to seed features')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeatures()
  }, [])

  // Handle create
  const handleCreate = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const response = await api.post('/features', formData)

      if (response.data.error) {
        throw new Error(response.data.error || 'Failed to create feature')
      }

      setCreateDialogOpen(false)
      resetForm()
      fetchFeatures()
    } catch (err) {
      setError(err.message)
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
      const response = await api.put(`/features/${selectedFeature.id}`, formData)

      if (response.data.error) {
        throw new Error(response.data.error || 'Failed to update feature')
      }

      setEditDialogOpen(false)
      setSelectedFeature(null)
      resetForm()
      fetchFeatures()
    } catch (err) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    setFormLoading(true)
    setError(null)

    try {
      const response = await api.delete(`/features/${selectedFeature.id}`)

      if (response.data.error) {
        throw new Error(response.data.error || 'Failed to delete feature')
      }

      setDeleteDialogOpen(false)
      setSelectedFeature(null)
      fetchFeatures()
    } catch (err) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle toggle active
  const handleToggleActive = async (feature) => {
    try {
      const response = await api.put(`/features/${feature.id}`, { isActive: !feature.isActive })

      if (response.data.error) {
        throw new Error(response.data.error || 'Failed to toggle feature')
      }

      fetchFeatures()
    } catch (err) {
      setError(err.message)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      key: '',
      name: '',
      description: '',
      category: 'general',
      defaultEnabled: true,
      isActive: true,
      icon: 'ToggleLeft',
      sortOrder: 0,
    })
  }

  // Open edit dialog
  const openEditDialog = (feature) => {
    setSelectedFeature(feature)
    setFormData({
      key: feature.key,
      name: feature.name,
      description: feature.description || '',
      category: feature.category || 'general',
      defaultEnabled: feature.defaultEnabled,
      isActive: feature.isActive,
      icon: feature.icon || 'ToggleLeft',
      sortOrder: feature.sortOrder || 0,
    })
    setEditDialogOpen(true)
  }

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const found = categoryOptions.find(c => c.value === category)
    return found ? found.label : category.charAt(0).toUpperCase() + category.slice(1)
  }

  // Get icon component
  const getIconComponent = (iconName) => {
    return featureIcons[iconName] || ToggleLeft
  }

  // Generate key from name using slugify utility (with underscores for keys)
  const generateKey = (name) => {
    return slugify(name).replace(/-/g, '_')
  }

  if (loading && features.length === 0) {
    return (
      <div className="p-4 lg:p-6 w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Platform Features</h1>
          <p className="text-muted-foreground">Manage global feature flags and capabilities available to tenants.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={fetchFeatures}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {features.length === 0 && (
            <Button variant="outline" onClick={seedFeatures}>
              <Zap className="h-4 w-4 mr-2" />
              Seed Default Features
            </Button>
          )}
          <Button onClick={() => { resetForm(); setCreateDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-4">
          {error}
        </div>
      )}

      {features.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ToggleLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No features defined yet.</p>
            <Button onClick={seedFeatures}>
              <Zap className="h-4 w-4 mr-2" />
              Seed Default Features
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{getCategoryDisplayName(category)}</CardTitle>
                  <CardDescription>
                    {categoryFeatures.filter(f => f.isActive).length} of {categoryFeatures.length} active
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryFeatures.map((feature, index) => {
                    const Icon = getIconComponent(feature.icon)
                    return (
                      <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border",
                          feature.isActive ? 'bg-background' : 'bg-muted/50'
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-lg",
                          feature.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{feature.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {feature.key}
                            </Badge>
                            {feature.defaultEnabled && (
                              <Badge variant="secondary" className="text-xs">
                                Default On
                              </Badge>
                            )}
                            {!feature.isActive && (
                              <Badge variant="destructive" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{feature.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Used by {feature.tenantCount || 0} tenant(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <Switch
                              checked={feature.isActive}
                              onCheckedChange={() => handleToggleActive(feature)}
                            />
                            <span className="text-xs font-medium text-muted-foreground">
                              {feature.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(feature)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedFeature(feature)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Feature</DialogTitle>
            <DialogDescription>
              Add a new feature that can be enabled/disabled per tenant.
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
                      key: generateKey(name),
                    })
                  }}
                  placeholder="Feature Name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="key">Key *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="feature_key"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the feature"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon</Label>
                  <select
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="defaultEnabled"
                    checked={formData.defaultEnabled}
                    onChange={(e) => setFormData({ ...formData, defaultEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="defaultEnabled">Default Enabled</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                  {error}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Feature
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Feature</DialogTitle>
            <DialogDescription>
              Update the feature configuration.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-key">Key (read-only)</Label>
                <Input
                  id="edit-key"
                  value={formData.key}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <select
                    id="edit-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-icon">Icon</Label>
                  <select
                    id="edit-icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-defaultEnabled"
                    checked={formData.defaultEnabled}
                    onChange={(e) => setFormData({ ...formData, defaultEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="edit-defaultEnabled">Default Enabled</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-sortOrder">Sort Order</Label>
                <Input
                  id="edit-sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
                  {error}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Feature
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feature</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedFeature?.name}</strong>?
              This will remove the feature from all tenants. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 text-sm">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Feature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
