'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import { Input } from '@/components/cms/ui/input'
import { Badge } from '@/components/cms/ui/badge'
import { Plus, Search, MoreVertical, Shield, Mail, User, ShieldCheck } from 'lucide-react'

// Mock Data
const admins = [
  {
    id: 1,
    name: 'Alex Morgan',
    email: 'alex.morgan@lms.admin',
    role: 'Super Admin',
    status: 'active',
    lastActive: '2 mins ago',
    permissions: ['all'],
  },
  {
    id: 2,
    name: 'Sarah Chen',
    email: 'sarah.chen@lms.admin',
    role: 'Support Manager',
    status: 'active',
    lastActive: '1 hr ago',
    permissions: ['users.read', 'tickets.manage'],
  },
  {
    id: 3,
    name: 'James Wilson',
    email: 'james.w@lms.admin',
    role: 'Content Moderator',
    status: 'inactive',
    lastActive: '2 days ago',
    permissions: ['content.moderate'],
  },
]

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Admin Users</h1>
          <p className="text-muted-foreground">Manage access and roles for the administrative console.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Admin
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Administrators</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="pb-3 text-left font-medium">User</th>
                  <th className="pb-3 text-left font-medium">Role</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                  <th className="pb-3 text-left font-medium hidden md:table-cell">Last Active</th>
                  <th className="pb-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {admins.map((admin) => (
                  <tr key={admin.id} className="group border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {admin.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-purple-500" />
                        <span>{admin.role}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant={admin.status === 'active' ? 'default' : 'secondary'} className={admin.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {admin.status}
                      </Badge>
                    </td>
                    <td className="py-4 hidden md:table-cell text-muted-foreground">
                      {admin.lastActive}
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Roles Breakdown Helper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Super Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              1
            </div>
            <p className="text-xs text-muted-foreground mt-1">Full access to all systems</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Support Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              12
            </div>
            <p className="text-xs text-muted-foreground mt-1">Limited to ticket management</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Content Mods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              5
            </div>
            <p className="text-xs text-muted-foreground mt-1">Course & Community moderation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
