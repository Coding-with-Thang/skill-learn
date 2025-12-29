"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/features/admin/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import BreadCrumbCom from "@/components/shared/BreadCrumb"
import Footer from "@/components/layout/Footer"

export default function DashboardLayout({ children }) {
    const pathname = usePathname()

    // Convert pathname to breadcrumb segments
    const getBreadcrumbs = () => {
        // Remove leading slash and split into segments
        const segments = pathname.split('/').filter(Boolean)

        // If we're at the dashboard root
        if (segments.length === 1) {
            return {
                crumbs: [],
                endtrail: "Dashboard Overview"
            }
        }

        // For nested routes
        return {
            crumbs: [{ name: "Dashboard", href: "dashboard" }],
            endtrail: segments[segments.length - 1]
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        }
    }

    const { crumbs, endtrail } = getBreadcrumbs()

    return (
        <div className="relative flex flex-col md:flex-row min-h-screen w-full">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex flex-col min-h-screen w-full bg-background" style={{ backgroundColor: "var(--background)" }}>
                        <header className="flex h-16 mb-3 shrink-0 items-center gap-2 px-2 sm:px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                            <SidebarTrigger className="ml-2" />
                            <BreadCrumbCom crumbs={crumbs} endtrail={endtrail} />
                        </header>
                        <main className="flex-1 flex flex-col p-2 sm:p-6 w-full min-w-0 max-w-6xl mx-auto gap-4">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}