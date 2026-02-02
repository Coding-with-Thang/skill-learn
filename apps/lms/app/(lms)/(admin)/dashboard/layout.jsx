"use client"

import { usePathname } from "next/navigation"
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