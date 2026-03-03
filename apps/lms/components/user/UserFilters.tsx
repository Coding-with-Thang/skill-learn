"use client"

import { useState, useEffect } from "react"
import { Input } from "@skill-learn/ui/components/input"
import { useTranslations } from "next-intl"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@skill-learn/ui/components/select"
import { Card, CardContent } from "@skill-learn/ui/components/card"
import { useDebounce } from "@skill-learn/lib/hooks/useDebounce"
import { useRolesStore } from "@skill-learn/lib/stores/rolesStore"

export function UserFilters({ onFilterChange }) {
    const t = useTranslations("userFilters")
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
                        placeholder={t("searchPlaceholder")}
                        value={searchValue}
                        onChange={handleSearchChange}
                    />
                    <Select onValueChange={handleRoleFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={t("filterByRole")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("allRoles")}</SelectItem>
                            {roles?.map((role) => (
                                <SelectItem key={role.id} value={role.roleAlias}>
                                    {role.roleAlias}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={handleSortChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={t("sortBy")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">{t("name")}</SelectItem>
                            <SelectItem value="role">{t("role")}</SelectItem>
                            <SelectItem value="recent">{t("recent")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    )
}
