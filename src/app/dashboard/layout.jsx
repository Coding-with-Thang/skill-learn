"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "../components/Admin/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import BreadCrumbCom from "../components/BreadCrumb"

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
    <SidebarProvider>
      <AppSidebar className="mt-15" />
      <SidebarInset>
        <div className="min-h-screen w-full bg-gray-100">
          <header className="flex h-16 mb-3 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <SidebarTrigger className="ml-2" />
            <BreadCrumbCom crumbs={crumbs} endtrail={endtrail} />
          </header>
          <div className="flex gap-1 px-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
