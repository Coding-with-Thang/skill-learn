'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import {
  Plus,
  FileText,
  RefreshCw,
  Settings,
  Mail,
  Users
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

const actions = [
  { id: 1, icon: Plus, label: 'Add New Tenant', color: 'from-blue-500 to-blue-600' },
  { id: 2, icon: FileText, label: 'Generate Report', color: 'from-purple-500 to-purple-600' },
  { id: 3, icon: RefreshCw, label: 'Process Refund', color: 'from-amber-500 to-amber-600' },
  { id: 4, icon: Settings, label: 'System Settings', color: 'from-gray-500 to-gray-600' },
  { id: 5, icon: Mail, label: 'Send Announcement', color: 'from-green-500 to-green-600' },
  { id: 6, icon: Users, label: 'Invite Admin', color: 'from-indigo-500 to-indigo-600' },
]

export default function QuickActions() {
  const [activeAction, setActiveAction] = useState(null)

  const handleAction = (action) => {
    setActiveAction(action.id)
    // TODO: Implement action handlers
    setTimeout(() => setActiveAction(null), 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.05 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => handleAction(action)}
                    className="h-auto w-full flex-col gap-2 p-4 hover:shadow-md transition-all hover:-translate-y-0.5 group relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className={`rounded-full bg-gradient-to-br ${action.color} p-2.5 text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {action.label}
                    </span>
                    {activeAction === action.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
