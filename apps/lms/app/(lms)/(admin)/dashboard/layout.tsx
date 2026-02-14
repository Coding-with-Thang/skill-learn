"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { AppSidebar } from "@/components/admin/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@skill-learn/ui/components/sidebar"
import BreadCrumbCom from "@/components/shared/BreadCrumb"
import Footer from "@/components/layout/Footer"
import { PageErrorBoundary } from "@/components/layout/PageErrorBoundary"
import TopBar from "@/components/layout/TopBar"

// Friendly labels for known path segments (lowercase key)
const SEGMENT_LABELS = {
    dashboard: "Dashboard",
    categories: "Categories",
    courses: "Courses",
    create: "Create",
    edit: "Edit",
    preview: "Preview",
    quizzes: "Quizzes",
    "quiz-manager": "Quiz Manager",
    rewards: "Rewards",
    users: "Users",
    roles: "Roles",
    "user-roles": "User Roles",
    settings: "Settings",
    "audit-logs": "Audit Logs",
    billing: "Billing",
    features: "Features",
    documentation: "Documentation",
    "flashcards-analytics": "Flashcards Analytics",
    "flashcards-cards": "Flashcards Cards",
    "flashcards-categories": "Flashcards Categories",
    "flashcards-import": "Flashcards Import",
    "flashcards-learning-analytics": "Flashcards Learning Analytics",
    "flashcards-priorities": "Flashcards Priorities",
}

function formatSegmentLabel(segment) {
    const key = segment.toLowerCase()
    if (SEGMENT_LABELS[key]) return SEGMENT_LABELS[key]
    // Dynamic segment (e.g. courseId): show shortened or generic
    if (/^[0-9a-f-]{36}$/i.test(segment) || /^[0-9a-f]{24}$/i.test(segment)) {
        return "Detail"
    }
    return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export default function DashboardLayout({ children }) {
    const pathname = usePathname()

    const { crumbs, endtrail } = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean)

        if (segments.length === 0) {
            return { crumbs: [], endtrail: "Dashboard" }
        }

        if (segments.length === 1 && segments[0] === "dashboard") {
            return { crumbs: [], endtrail: "Dashboard Overview" }
        }

        // Shortened trail for lesson edit: remove "Detail" segments
        const lessonEditMatch = pathname.match(
            /^\/dashboard\/courses\/([^/]+)\/chapters\/([^/]+)\/lessons\/([^/]+)\/edit\/?$/
        )
        if (lessonEditMatch) {
            const [, courseId] = lessonEditMatch
            return {
                crumbs: [
                    { name: "Dashboard", href: "/dashboard" },
                    { name: "Courses", href: "/dashboard/courses" },
                    { name: "Chapters", href: `/dashboard/courses/${courseId}/edit` },
                    { name: "Lessons", href: `/dashboard/courses/${courseId}/edit` },
                ],
                endtrail: "Edit",
            }
        }

        // Shortened trail for chapter edit or other course nested paths: remove "Detail" segments
        const chapterMatch = pathname.match(/^\/dashboard\/courses\/([^/]+)\/chapters\/([^/]+)(?:\/|$)/)
        if (chapterMatch) {
            const [, courseId] = chapterMatch
            return {
                crumbs: [
                    { name: "Dashboard", href: "/dashboard" },
                    { name: "Courses", href: "/dashboard/courses" },
                    { name: "Chapters", href: `/dashboard/courses/${courseId}/edit` },
                ],
                endtrail: formatSegmentLabel(segments[segments.length - 1]),
            }
        }

        // Shortened trail for course edit/preview: remove "Detail" for courseId
        const courseEditMatch = pathname.match(/^\/dashboard\/courses\/([^/]+)\/(edit|preview)(?:\/|$)/)
        if (courseEditMatch) {
            const [, , action] = courseEditMatch
            return {
                crumbs: [
                    { name: "Dashboard", href: "/dashboard" },
                    { name: "Courses", href: "/dashboard/courses" },
                ],
                endtrail: formatSegmentLabel(action),
            }
        }

        // Build full trail: every segment except the last becomes a crumb; last is endtrail
        // Skip segments that format to "Detail" to shorten ID-heavy paths
        const crumbs: { name: string; href: string }[] = []
        for (let i = 0; i < segments.length - 1; i++) {
            const segment = segments[i]
            const label = formatSegmentLabel(segment)
            if (label === "Detail") continue
            const href = `/${  segments.slice(0, i + 1).join('/')}`
            crumbs.push({ name: label, href })
        }
        const lastSegment = segments[segments.length - 1]
        const endtrail = formatSegmentLabel(lastSegment)

        return { crumbs, endtrail }
    }, [pathname])

    return (
        <div className="relative flex flex-col md:flex-row min-h-screen w-full">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex flex-col min-h-screen w-full bg-background" style={{ backgroundColor: "var(--background)" }}>
                        <TopBar adminMode={true} />
                        <main className="flex-1 flex flex-col p-4 sm:p-8 w-full min-w-0 max-w-7xl mx-auto gap-6 overflow-y-auto">
                            <BreadCrumbCom crumbs={crumbs} endtrail={endtrail} />
                            <PageErrorBoundary pageName="Dashboard">
                                {children}
                            </PageErrorBoundary>
                        </main>
                        <Footer />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}