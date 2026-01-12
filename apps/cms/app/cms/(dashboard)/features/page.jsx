'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/cms/ui/card'
import { Badge } from '@/components/cms/ui/badge'
import { Zap, Lock, Globe, Smartphone, Beaker } from 'lucide-react'

// Custom Switch Component since it's missing in UI lib
const Switch = ({ checked, onCheckedChange }) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`
      relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent 
      transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
      focus-visible:ring-primary focus-visible:ring-offset-2
      ${checked ? 'bg-primary' : 'bg-input'}
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

const initialFeatures = [
  {
    id: 1,
    name: 'AI Course Generator',
    description: 'Allow tenants to auto-generate course content using LLMs.',
    status: 'beta',
    enabled: true,
    icon: Zap,
  },
  {
    id: 2,
    name: 'Global Leaderboards',
    description: 'Enable cross-tenant leaderboards for competitive gamification.',
    status: 'stable',
    enabled: false,
    icon: Globe,
  },
  {
    id: 3,
    name: 'Mobile App Push Notifications',
    description: 'Send push notifications to tenant mobile apps.',
    status: 'stable',
    enabled: true,
    icon: Smartphone,
  },
  {
    id: 4,
    name: 'Single Sign-On (SSO) Enforcement',
    description: 'Force all tenants to use SSO for their users.',
    status: 'experimental',
    enabled: false,
    icon: Lock,
  },
  {
    id: 5,
    name: 'Advanced Analytics (Beta)',
    description: 'New analytics engine with predictive modeling.',
    status: 'beta',
    enabled: true,
    icon: Beaker,
  },
]

export default function FeaturesPage() {
  const [features, setFeatures] = useState(initialFeatures)

  const toggleFeature = (id) => {
    setFeatures(features.map(f =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ))
  }

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Platform Features</h1>
        <p className="text-muted-foreground">Manage global feature flags and experimental capabilities.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="p-6 flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${feature.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{feature.name}</h3>
                      <Badge variant="outline" className={
                        feature.status === 'beta' ? 'border-orange-500 text-orange-500' :
                          feature.status === 'experimental' ? 'border-purple-500 text-purple-500' :
                            'border-green-500 text-green-500'
                      }>
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={() => toggleFeature(feature.id)}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {feature.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
