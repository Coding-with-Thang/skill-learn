'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import { Input } from '@/components/cms/ui/input'
import { Badge } from '@/components/cms/ui/badge'
import { Save, Lock, Globe, Mail, Bell, Shield } from 'lucide-react'

// Mock Tabs using state
const tabs = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground">Manage global settings for the entire multi-tenant platform.</p>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'general' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Basic platform information and localization.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Platform Name</label>
                      <Input defaultValue="EduCore LMS Enterprise" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Support Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input defaultValue="support@educore.io" className="pl-9" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Default Timezone</label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                          <option>(UTC+00:00) UTC</option>
                          <option>(UTC+01:00) London</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Security & Access</CardTitle>
                        <CardDescription>Control authentication and session policies.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                      <div>
                        <h4 className="font-medium">Enforce 2FA for Admins</h4>
                        <p className="text-sm text-muted-foreground">Require Two-Factor Authentication for all administrative accounts.</p>
                      </div>
                      <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                        <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                      <div>
                        <h4 className="font-medium">Strict Password Complexity</h4>
                        <p className="text-sm text-muted-foreground">Require special characters, numbers, and mixed case.</p>
                      </div>
                      <div className="h-6 w-11 rounded-full bg-input relative cursor-pointer">
                        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Session Timeout (Minutes)</label>
                        <span className="text-sm text-primary font-bold">30 mins</span>
                      </div>
                      <input type="range" className="w-full" min="5" max="120" defaultValue="30" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {(activeTab === 'email' || activeTab === 'notifications') && (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <p>Settings for {activeTab} are coming soon.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Action Bar */}
          <div className="fixed bottom-0 right-0 p-4 lg:p-6 w-full lg:w-[calc(100%-256px)] bg-background/80 backdrop-blur-sm border-t flex items-center justify-between z-10 transition-all duration-300">
            <span className="text-sm text-muted-foreground">Last autosave: 2 minutes ago</span>
            <div className="flex gap-4">
              <Button variant="outline">Discard</Button>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Apply Changes
              </Button>
            </div>
          </div>
          {/* Spacer for fixed bottom bar */}
          <div className="h-20" />
        </div>
      </div>
    </div>
  )
}
