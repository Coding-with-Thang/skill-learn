'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Pagination as UIPagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis } from '@skill-learn/ui/components/pagination'
import { buttonVariants } from '@skill-learn/ui/components/button'
import { useCoursesStore } from "@skill-learn/lib/stores/coursesStore"

export default function Pagination({ baseHref = '/dashboard/courses?pageSize=5', currentPage = 1, totalPages = 1 }) {
    const storeCurrent = useCoursesStore((s) => s.currentPage)
    const setCurrentPage = useCoursesStore((s) => s.setCurrentPage)

    // Hydrate store current page from server prop on mount
    useEffect(() => {
        if (currentPage && currentPage !== storeCurrent) setCurrentPage(currentPage)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    function getPageList(curr, total) {
        if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1)

        const delta = 2
        const range = new Set([1, total])
        for (let i = curr - delta; i <= curr + delta; i++) {
            if (i > 1 && i < total) range.add(i)
        }

        const pages = Array.from(range).sort((a, b) => a - b)
        const result = []
        let last = 0
        for (const p of pages) {
            if (last && p - last > 1) result.push(null)
            result.push(p)
            last = p
        }
        return result
    }

    const pageList = getPageList(currentPage, totalPages)

    return (
        <UIPagination>
            <PaginationContent>
                {/* Previous */}
                {currentPage > 1 ? (
                    <PaginationItem>
                        <PaginationLink asChild href={`${baseHref}&page=${currentPage - 1}`}>
                            <Link href={`${baseHref}&page=${currentPage - 1}`} onClick={() => setCurrentPage(currentPage - 1)} className={buttonVariants({ variant: 'outline', size: 'default' })}>
                                <ChevronLeftIcon />
                                <span className="hidden sm:block">Previous</span>
                            </Link>
                        </PaginationLink>
                    </PaginationItem>
                ) : (
                    <PaginationItem>
                        <button disabled className={buttonVariants({ variant: 'outline', size: 'default' }) + ' opacity-50 cursor-not-allowed'}>Previous</button>
                    </PaginationItem>
                )}

                {/* Page numbers */}
                {pageList.map((p, idx) => (
                    p === null ? (
                        <PaginationItem key={`e-${idx}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={p}>
                            <PaginationLink asChild isActive={p === currentPage}>
                                <Link href={`${baseHref}&page=${p}`} onClick={() => setCurrentPage(p)} className="px-3 py-1 rounded-4xld border text-sm hover:bg-accent">{p}</Link>
                            </PaginationLink>
                        </PaginationItem>
                    )
                ))}

                {/* Next */}
                {currentPage < totalPages ? (
                    <PaginationItem>
                        <PaginationLink asChild href={`${baseHref}&page=${currentPage + 1}`}>
                            <Link href={`${baseHref}&page=${currentPage + 1}`} onClick={() => setCurrentPage(currentPage + 1)} className={buttonVariants({ size: 'default' })}>
                                <span className="hidden sm:block">Next</span>
                                <ChevronRightIcon />
                            </Link>
                        </PaginationLink>
                    </PaginationItem>
                ) : (
                    <PaginationItem>
                        <button disabled className={buttonVariants({ size: 'default' }) + ' opacity-50 cursor-not-allowed'}>Next</button>
                    </PaginationItem>
                )}
            </PaginationContent>
        </UIPagination>
    )
}
