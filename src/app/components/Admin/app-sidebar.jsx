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
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Quizzes",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [
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
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Manage Rewards",
          url: "/dashboard/rewards",
        },
        {
          title: "Reward Redeem Logs",
          url: "#",
        },
      ],
    },
    {
      title: "Users",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Manage User",
          url: "users",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
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
