"use client";

import {
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Quiz Management",
      url: "/dashboard",
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
          title: "Team",
          url: "/dashboard",
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
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
