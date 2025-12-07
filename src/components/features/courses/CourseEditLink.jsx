"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCoursesStore } from '@/app/store/coursesStore'

export default function CourseEditLink({ courseId, href, children, previewUrl, className }) {
    const router = useRouter()
    const setSelectedCourseId = useCoursesStore((s) => s.setSelectedCourseId)
    const setPreviewImageUrl = useCoursesStore((s) => s.setPreviewImageUrl)

    const handleClick = async (e) => {
        // prevent Link's default so we can set store first, then navigate
        e.preventDefault()
        try {
            setSelectedCourseId(courseId)
            if (previewUrl) setPreviewImageUrl(previewUrl)
        } catch (err) {
            // noop
        }

        // navigate after ensuring store updates
        router.push(href)
    }

    return (
        <Link href={href} onClick={handleClick} className={className}>
            {children}
        </Link>
    )
}
