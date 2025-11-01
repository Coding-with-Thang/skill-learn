"use client"

import React, { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading'

export default function CourseFilters({ categories = [], initialCategory = '', initialPageSize = 5 }) {
    const router = useRouter()
    const [category, setCategory] = useState(initialCategory || '')
    const [pageSize, setPageSize] = useState(String(initialPageSize || 5))
    const isFirst = useRef(true)
    const [isPending, startTransition] = useTransition()

    // Auto-apply when category or pageSize changes, but skip on initial mount
    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false
            return
        }

        const t = setTimeout(() => {
            const params = new URLSearchParams()
            if (category) params.set('category', category)
            if (pageSize) params.set('pageSize', String(pageSize))
            // reset to first page when filters change
            params.set('page', '1')

            const href = `/dashboard/courses?${params.toString()}`
            startTransition(() => {
                router.push(href)
            })
        }, 200)

        return () => clearTimeout(t)
    }, [category, pageSize, router, startTransition])

    return (
        <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Category</label>
            <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border px-2 py-1">
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            <label className="text-sm text-muted-foreground">Per page</label>
            <select name="pageSize" value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="rounded-md border px-2 py-1">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
            </select>

            {isPending && <LoadingSpinner size="small" />}
        </div>
    )
}
