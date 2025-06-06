"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Download } from "lucide-react"
import { useAuditLogStore } from "@/app/store/auditLogStore"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

export default function AuditLogsPage() {
  const { logs, pagination, filters, isLoading, fetchLogs, setFilters } = useAuditLogStore()
  const [dateRange, setDateRange] = useState({ from: null, to: null })

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    setFilters({
      startDate: range.from ? range.from.toISOString() : null,
      endDate: range.to ? range.to.toISOString() : null,
    })
  }

  const handleExport = () => {
    // Implement CSV export functionality
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.resource}
              onValueChange={(value) => setFilters({ resource: value })}
            >
              <option value="">All Resources</option>
              <option value="reward">Rewards</option>
              <option value="user">Users</option>
              <option value="points">Points</option>
            </Select>

            <Select
              value={filters.action}
              onValueChange={(value) => setFilters({ action: value })}
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </Select>

            <DatePickerWithRange
              value={dateRange}
              onChange={handleDateRangeChange}
            />

            <Button variant="secondary" onClick={() => setFilters({
              resource: null,
              action: null,
              startDate: null,
              endDate: null,
            })}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.timestamp), "PPpp")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {log.user.firstName} {log.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{log.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${log.action === 'create' && 'bg-green-100 text-green-800'}
                      ${log.action === 'update' && 'bg-blue-100 text-blue-800'}
                      ${log.action === 'delete' && 'bg-red-100 text-red-800'}
                    `}>
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 max-w-md truncate">
                      {log.details}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {(pagination.currentPage - 1) * pagination.perPage + 1} to{" "}
                {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of{" "}
                {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.currentPage === 1}
                  onClick={() => fetchLogs(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={pagination.currentPage === pagination.pages}
                  onClick={() => fetchLogs(pagination.currentPage + 1)}
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