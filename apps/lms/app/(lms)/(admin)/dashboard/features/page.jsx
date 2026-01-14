'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@skill-learn/ui/components/card'
import { Badge } from '@skill-learn/ui/components/badge'
import { Button } from '@skill-learn/ui/components/button'
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
  ToggleRight,
  Lock,
  RefreshCw,
  Loader2,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@skill-learn/lib/utils.js'

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

export default function FeaturesPage() {
  const [features, setFeatures] = useState([])
  const [groupedFeatures, setGroupedFeatures] = useState({})
  const [summary, setSummary] = useState({ total: 0, enabled: 0, disabled: 0, locked: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingFeatureId, setTogglingFeatureId] = useState(null)

  // Fetch features
  const fetchFeatures = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/tenant/features')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch features')
      }

      const data = await response.json()
      setFeatures(data.features || [])
      setGroupedFeatures(data.groupedByCategory || {})
      setSummary(data.summary || { total: 0, enabled: 0, disabled: 0, locked: 0 })
    } catch (err) {
      console.error('Error fetching features:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeatures()
  }, [])

  // Handle feature toggle
  const handleToggle = async (featureId, newEnabledState) => {
    setTogglingFeatureId(featureId)
    try {
      const response = await fetch('/api/tenant/features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureId, enabled: newEnabledState }),
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
      setTogglingFeatureId(null)
    }
  }

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const names = {
      gamification: 'Gamification',
      learning: 'Learning & Training',
      analytics: 'Analytics',
      admin: 'Administration',
      general: 'General',
    }
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1)
  }

  // Get icon component
  const getIconComponent = (iconName) => {
    return featureIcons[iconName] || ToggleLeft
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Feature Management</h1>
          <p className="text-muted-foreground">
            Enable or disable features for your organization.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchFeatures} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Features</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <ToggleLeft className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enabled</p>
                <p className="text-2xl font-bold text-green-600">{summary.enabled}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disabled</p>
                <p className="text-2xl font-bold text-amber-600">{summary.disabled}</p>
              </div>
              <XCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Locked</p>
                <p className="text-2xl font-bold text-red-600">{summary.locked}</p>
              </div>
              <Lock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-4">
          {error}
        </div>
      )}

      {/* Info Banner */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Feature Management</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Toggle features on or off to customize your organization&apos;s experience. 
                Features marked with a lock icon have been restricted by your platform administrator 
                and cannot be enabled.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features List */}
      {features.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ToggleLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No features available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFeatures).map(([category, categoryFeatures], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{getCategoryDisplayName(category)}</CardTitle>
                  <CardDescription>
                    {categoryFeatures.filter(f => f.isEffectivelyEnabled).length} of {categoryFeatures.length} enabled
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryFeatures.map((feature, index) => {
                    const Icon = getIconComponent(feature.icon)
                    const isToggling = togglingFeatureId === feature.id
                    
                    return (
                      <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border transition-colors",
                          !feature.canToggle && "bg-muted/30",
                          feature.isEffectivelyEnabled ? "bg-background" : "bg-muted/50"
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
                              {!feature.canToggle && (
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Lock className="h-3 w-3" />
                                  Restricted
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          {isToggling ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          ) : (
                            <>
                              <Switch
                                checked={feature.enabled}
                                onCheckedChange={(checked) => handleToggle(feature.id, checked)}
                                disabled={!feature.canToggle || loading}
                              />
                              <span className="text-xs text-muted-foreground">
                                {feature.enabled ? 'On' : 'Off'}
                              </span>
                            </>
                          )}
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

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <ToggleRight className="h-4 w-4 text-primary" />
                <span className="font-medium">Enabled</span>
              </div>
              <span className="text-muted-foreground">- Feature is active for your organization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Restricted</span>
              </div>
              <span className="text-muted-foreground">- Feature controlled by platform admin</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
