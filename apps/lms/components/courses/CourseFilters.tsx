"use client"

import React, { useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@skill-learn/ui/components/loading'
import { useCoursesStore } from "@skill-learn/lib/stores/coursesStore"

type CategoryOption = { id: string; name: string };
export default function CourseFilters({ categories = [] as CategoryOption[], initialCategory = '', initialPageSize = 5 }: { categories?: CategoryOption[]; initialCategory?: string; initialPageSize?: number }) {
    const router = useRouter()
    const category = useCoursesStore((s) => s.category)
    const pageSize = useCoursesStore((s) => s.pageSize)
    const setCategory = useCoursesStore((s) => s.setCategory)
    const setPageSize = useCoursesStore((s) => s.setPageSize)

    const isFirst = useRef(true)
    const [isPending, startTransition] = useTransition()

    // Hydrate store from server-provided initial props on first mount
    useEffect(() => {
        if (initialCategory && initialCategory !== category) setCategory(initialCategory)
        if (initialPageSize && Number(initialPageSize) !== pageSize) setPageSize(Number(initialPageSize))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
        <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground">Category</label>
            <select name="category" value={category || ''} onChange={(e) => setCategory(e.target.value)} className="rounded-4xld border px-2 py-1">
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            <label className="text-sm text-muted-foreground">Per page</label>
            <select name="pageSize" value={String(pageSize || 5)} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-4xld border px-2 py-1">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
            </select>

            {isPending && <LoadingSpinner size="small" />}
        </div>
    )
}
