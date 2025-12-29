"use client";

import {
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
  LayoutGrid,
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
} from "@/components/ui/sidebar";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Courses",
      url: "/dashboard/courses",
      icon: SquareTerminal,
      isActive: true,
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
      icon: SquareTerminal,
      isActive: true,
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
    {
      title: "Rewards",
      url: "/dashboard",
      icon: Bot,
      items: [
        {
          title: "Manage Rewards",
          url: "/dashboard/rewards",
        },
        {
          title: "Reward Redeem Logs",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Users",
      url: "/dashboard",
      icon: BookOpen,
      items: [
        {
          title: "User Management",
          url: "/dashboard/users",
        },
      ],
    },
    {
      title: "Documentation",
      url: "/dashboard",
      icon: BookOpen,
      items: [
        {
          title: "Changelog",
          url: "/dashboard/changelog",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard",
      icon: Settings2,
      items: [
        {
          title: "Config",
          url: "/dashboard/settings",
        },
        {
          title: "Audit Logs",
          url: "/dashboard/audit-logs",
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
        <NavMain items={data.navMain} />
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
