"use client";

import {
  BookOpen,
  CreditCard,
  FileQuestion,
  FileText,
  Gift,
  Key,
  Layout,
  LayoutGrid,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import { NavMain } from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@skill-learn/ui/components/sidebar";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
const data = {
  navGroups: [
    {
      label: "ADMIN DASHBOARD",
      items: [
        {
          title: "Overview",
          url: "/dashboard",
          icon: Layout,
          isActive: true,
        },
        {
          title: "Courses",
          url: "/dashboard/courses",
          icon: BookOpen,
          items: [
            {
              title: "Manage Courses",
              url: "/dashboard/courses",
            },
            {
              title: "Course Creator",
              url: "/dashboard/courses/create",
            },
          ],
        },
        {
          title: "Quiz Management",
          url: "/dashboard/quizzes",
          icon: FileQuestion,
          items: [
            {
              title: "Categories",
              url: "/dashboard/categories",
            },
            {
              title: "Manage Quizzes",
              url: "/dashboard/quizzes",
            },
            {
              title: "Quiz Creator",
              url: "/dashboard/quizzes/quiz-manager",
            },
          ],
        },
      ],
    },
    {
      label: "ORGANIZATION",
      items: [
        {
          title: "Billing",
          url: "/dashboard/billing",
          icon: CreditCard,
        },
        {
          title: "Roles",
          url: "/dashboard/roles",
          icon: Shield,
          items: [
            {
              title: "Manage Roles",
              url: "/dashboard/roles",
            },
            {
              title: "User Assignments",
              url: "/dashboard/user-roles",
            },
          ],
        },
      ],
    },
    {
      label: "PLATFORM",
      items: [
        {
          title: "Rewards",
          url: "/dashboard/rewards",
          icon: Gift,
        },
        {
          title: "Users",
          url: "/dashboard/users",
          icon: Users,
        },
        {
          title: "Documentation",
          url: "/dashboard/documentation",
          icon: FileText,
        },
        {
          title: "Settings",
          url: "/dashboard/settings",
          icon: Settings,
          items: [
            {
              title: "Default Values",
              url: "/dashboard/settings",
            },
            {
              title: "Audit Logs",
              url: "/dashboard/audit-logs",
            },
          ],
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center py-2 group-data-[collapsible=icon]:p-0">
          <Logo
            className="group-data-[collapsible=icon]:!gap-0 transition-all duration-200"
            textClassName="group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all duration-200"
            imageClassName="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 transition-all duration-200"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/home">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
                  <LayoutGrid className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">Back to Home</span>
                  <span className="truncate text-xs">Main Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
