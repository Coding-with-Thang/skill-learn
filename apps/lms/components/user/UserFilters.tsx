"use client"

import { useState, useEffect } from "react"
import { Input } from "@skill-learn/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@skill-learn/ui/components/select"
import { Card, CardContent } from "@skill-learn/ui/components/card"
import { useDebounce } from "@skill-learn/lib/hooks/useDebounce"
import { useRolesStore } from "@skill-learn/lib/stores/rolesStore"

export function UserFilters({ onFilterChange }) {
    const [searchValue, setSearchValue] = useState('')
    const debouncedSearchValue = useDebounce(searchValue, 300)
    const { roles, fetchRoles } = useRolesStore()

    // Fetch tenant roles on mount
    useEffect(() => {
        fetchRoles()
    }, [fetchRoles])

    // Update parent when debounced value changes
    useEffect(() => {
        onFilterChange('search', debouncedSearchValue)
    }, [debouncedSearchValue, onFilterChange])

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value)
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
                        value={searchValue}
                        onChange={handleSearchChange}
                    />
                    <Select onValueChange={handleRoleFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {roles?.map((role) => (
                                <SelectItem key={role.id} value={role.roleAlias}>
                                    {role.roleAlias}
                                </SelectItem>
                            ))}
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
