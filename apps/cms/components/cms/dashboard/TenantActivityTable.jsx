'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Input } from '@/components/cms/ui/input'
import { Button } from '@/components/cms/ui/button'
import { Badge } from '@/components/cms/ui/badge'
import { Search, MoreVertical, Eye, Edit, Ban, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, getStatusColor, getPlanColor, formatTimeAgo } from '@/lib/cms/utils'
import { useDashboardStore } from '@/lib/cms/store'

export default function TenantActivityTable({ tenants }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [activeMenu, setActiveMenu] = useState(null)
  const { searchQuery, setSearchQuery, tenantFilter, setTenantFilter } = useDashboardStore()

  const itemsPerPage = 10

  // Filter tenants
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    const status = tenant.status || (tenant.users > 0 ? 'Active' : 'Inactive')
    const matchesFilter = tenantFilter === 'all' || status.toLowerCase() === tenantFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTenants = filteredTenants.slice(startIndex, startIndex + itemsPerPage)

  const handleAction = (action, tenant) => {
    setActiveMenu(null)
    // TODO: Implement action handlers (view, edit, suspend)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Recent Tenant Activity</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tenants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Tenant Name</th>
                  <th className="pb-3 text-left font-medium hidden md:table-cell">Plan</th>
                  <th className="pb-3 text-left font-medium hidden sm:table-cell">Users</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                  <th className="pb-3 text-left font-medium hidden lg:table-cell">Last Active</th>
                  <th className="pb-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTenants.map((tenant, index) => (
                  <tr
                    key={tenant.id}
                    className="group border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-xl font-semibold">
                          {tenant.logo || tenant.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium">{tenant.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{tenant.slug || tenant.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <Badge className={cn("font-medium", getPlanColor(tenant.plan || tenant.subscriptionTier || 'trial'))}>
                        {tenant.plan || tenant.subscriptionTier || 'Trial'}
                      </Badge>
                    </td>
                    <td className="py-4 hidden sm:table-cell">
                      <span className="font-medium">{(tenant.users || 0).toLocaleString()}</span>
                    </td>
                    <td className="py-4">
                      <Badge className={cn("font-medium", getStatusColor(tenant.status || (tenant.users > 0 ? 'Active' : 'Inactive')))}>
                        {tenant.status || (tenant.users > 0 ? 'Active' : 'Inactive')}
                      </Badge>
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {tenant.lastActive ? formatTimeAgo(new Date(tenant.lastActive)) : 'Never'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActiveMenu(activeMenu === tenant.id ? null : tenant.id)}
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        <AnimatePresence>
                          {activeMenu === tenant.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border bg-card shadow-lg"
                            >
                              <div className="p-1">
                                <button
                                  onClick={() => handleAction('view', tenant)}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleAction('edit', tenant)}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleAction('suspend', tenant)}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Ban className="h-4 w-4" />
                                  Suspend
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTenants.length)} of {filteredTenants.length}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
