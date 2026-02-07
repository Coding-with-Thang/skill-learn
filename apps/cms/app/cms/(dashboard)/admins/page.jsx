'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@skill-learn/ui/components/card"
import { Button } from "@skill-learn/ui/components/button"
import { Input } from "@skill-learn/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skill-learn/ui/components/dialog'
import { Plus, Search, Shield, Mail, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [superAdmins, setSuperAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  const fetchSuperAdmins = async () => {
    try {
      const res = await fetch('/api/admin/super-admins')
      const data = await res.json()
      if (res.ok) {
        setSuperAdmins(data.superAdmins || [])
      }
    } catch (err) {
      console.error('Failed to fetch super admins:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuperAdmins()
  }, [])

  const handleAddSuperAdmin = async (e) => {
    e.preventDefault()
    setAddError('')
    setAddSuccess('')
    if (!addEmail.trim()) {
      setAddError('Email is required')
      return
    }
    setAddLoading(true)
    try {
      const res = await fetch('/api/admin/super-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail.trim() }),
      })
      const data = await res.json()

      if (res.ok) {
        setAddSuccess(data.message || 'User promoted successfully.')
        setAddEmail('')
        await fetchSuperAdmins()
        setTimeout(() => {
          setAddSuccess('')
          setAddDialogOpen(false)
        }, 2000)
      } else {
        setAddError(data.error || 'Failed to promote user')
      }
    } catch (err) {
      setAddError('Failed to promote user')
    } finally {
      setAddLoading(false)
    }
  }

  const filteredAdmins = superAdmins.filter((admin) => {
    const q = searchQuery.toLowerCase()
    const email = (admin.email || '').toLowerCase()
    const name = ((admin.fullName || '') + (admin.firstName || '') + (admin.lastName || '')).toLowerCase()
    return email.includes(q) || name.includes(q)
  })

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Super Admins</h1>
          <p className="text-muted-foreground">
            Manage super admin access. Only super admins can promote new super admins.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Super Admin
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Super Administrators</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 text-left font-medium">User</th>
                    <th className="pb-3 text-left font-medium">Email</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-muted-foreground">
                        No super admins found.
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="group border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                              {(admin.fullName || admin.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-purple-500" />
                                {admin.fullName || admin.email || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {admin.email || '—'}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Super Admin Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{superAdmins.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Full access to CMS. New super admins must have an existing account (e.g. from LMS sign-up).
          </p>
        </CardContent>
      </Card>

      {/* Add Super Admin Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open)
        if (!open) {
          setAddEmail('')
          setAddError('')
          setAddSuccess('')
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Super Admin</DialogTitle>
            <DialogDescription>
              Enter the email of a user who already has an account (e.g. signed up via LMS). They will be promoted to super admin and can sign in to CMS after signing out and back in.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSuperAdmin} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                disabled={addLoading}
              />
            </div>
            {addError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {addError}
              </div>
            )}
            {addSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                {addSuccess}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                disabled={addLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addLoading}>
                {addLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Promoting...
                  </>
                ) : (
                  'Promote to Super Admin'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
