"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export function UserFilters({ onFilterChange }) {
    const handleSearchChange = (e) => {
        onFilterChange('search', e.target.value)
    }

    const handleRoleFilterChange = (value) => {
        onFilterChange('role', value)
    }

    const handleSortChange = (value) => {
        onFilterChange('sort', value)
    }

    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        placeholder="Search users..."
                        onChange={handleSearchChange}
                    />
                    <Select onValueChange={handleRoleFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="AGENT">Agent</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="OPERATIONS">Operations</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={handleSortChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="role">Role</SelectItem>
                            <SelectItem value="recent">Recently Added</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    )
}
