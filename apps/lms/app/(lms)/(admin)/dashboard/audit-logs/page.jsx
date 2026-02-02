"use client"

import { useEffect, useState, useRef } from "react"
import { format } from "date-fns"
import { Download, History, Filter, RotateCcw, Search, User, Database, Activity } from "lucide-react"
import { useAuditLogStore } from "@skill-learn/lib/stores/auditLogStore.js"
import { Button } from "@skill-learn/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@skill-learn/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@skill-learn/ui/components/table"
import { DatePickerWithRange } from "@skill-learn/ui/components/date-range-picker"
import { Avatar, AvatarFallback } from "@skill-learn/ui/components/avatar"

export default function AuditLogsPage() {
  const { logs, pagination, filters, isLoading, fetchLogs, setFilters } = useAuditLogStore()
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const debounceTimerRef = useRef(null)

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Debounced filter update function
  const debouncedSetFilters = (newFilters) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      setFilters(newFilters)
    }, 300)
  }

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    debouncedSetFilters({
      startDate: range?.from ? range.from.toISOString() : null,
      endDate: range?.to ? range.to.toISOString() : null,
    })
  }

  const handleFilterChange = (newFilters) => {
    debouncedSetFilters(newFilters)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleExport = () => {
    // TODO: Implement CSV export functionality
  }

  const resetFilters = () => {
    setDateRange({ from: null, to: null })
    setFilters({
      resource: null,
      action: null,
      startDate: null,
      endDate: null,
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <History className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Audit Logs</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-9">Track system activities and resource modifications across your organization</p>
        </div>
        <Button onClick={handleExport} className="h-10 rounded-xl gap-2 font-semibold shadow-xs hover:scale-105 transition-all">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="shadow-none border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4 flex flex-row items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <CardTitle className="text-lg font-bold">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Resource</label>
              <Select
                value={filters.resource || "all"}
                onValueChange={(value) => handleFilterChange({ resource: value === "all" ? null : value })}
              >
                <SelectTrigger className="bg-background/50 border-border/40 h-10 rounded-xl">
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="reward">Rewards</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="points">Points</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Action</label>
              <Select
                value={filters.action || "all"}
                onValueChange={(value) => handleFilterChange({ action: value === "all" ? null : value })}
              >
                <SelectTrigger className="bg-background/50 border-border/40 h-10 rounded-xl">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Date Range</label>
              <DatePickerWithRange
                value={dateRange}
                onChange={handleDateRangeChange}
                className="bg-background/50 rounded-xl"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full h-10 rounded-xl gap-2 font-semibold border-border/40 hover:bg-primary/5 hover:text-primary transition-colors"
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Table */}
      <Card className="shadow-none border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[180px] font-bold uppercase text-[10px] tracking-widest text-muted-foreground py-4">Timestamp</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">User</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Action</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Resource</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse border-border/30">
                      <TableCell colSpan={5} className="h-16">
                        <div className="h-4 bg-muted/40 rounded-full w-full"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-primary/5 transition-colors border-border/30 group">
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{format(new Date(log.timestamp), "MMM dd, yyyy")}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{format(new Date(log.timestamp), "HH:mm:ss")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border/50">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                              {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm truncate">
                              {log.user?.firstName} {log.user?.lastName}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate uppercase font-medium tracking-tighter">ID: {log.user?.id?.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`
                          inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tighter uppercase
                          ${log.action === 'create' ? 'bg-emerald-500/10 text-emerald-600' :
                            log.action === 'update' ? 'bg-amber-500/10 text-amber-600' :
                              'bg-rose-500/10 text-rose-600'}
                        `}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors">
                            <Database className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tight">{log.resource}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground/80 max-w-md truncate font-medium group-hover:text-foreground transition-colors">
                          {log.details}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center gap-3 opacity-50 text-muted-foreground">
                        <Activity className="w-12 h-12" />
                        <p className="font-bold">No audit logs found</p>
                        <p className="text-xs">Adjust your filters or try again later</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/10">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Showing <span className="text-foreground">{(pagination.currentPage - 1) * (pagination.perPage || 50) + 1}</span> to{" "}
                <span className="text-foreground">{Math.min(pagination.currentPage * (pagination.perPage || 50), pagination.total)}</span> of{" "}
                <span className="text-foreground font-black">{pagination.total}</span> entries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1 || isLoading}
                  onClick={() => fetchLogs(pagination.currentPage - 1)}
                  className="rounded-xl font-bold h-9 px-4 border-border/40 hover:bg-primary/5"
                >
                  Previous
                </Button>
                <div className="flex items-center px-3 bg-primary/10 rounded-xl font-black text-xs text-primary">
                  {pagination.currentPage} / {pagination.pages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.pages || isLoading}
                  onClick={() => fetchLogs(pagination.currentPage + 1)}
                  className="rounded-xl font-bold h-9 px-4 border-border/40 hover:bg-primary/5"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
