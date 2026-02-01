"use client";

import { useMemo } from "react";
import {
  BookOpen,
  CreditCard,
  FileQuestion,
  FileText,
  Gift,
  Key,
  Layout,
  LayoutGrid,
  Layers,
  Settings,
  Shield,
  ToggleLeft,
  Users,
} from "lucide-react";
import { useFeatures } from "@skill-learn/lib/hooks/useFeatures.js";

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

// Define navigation data with feature requirements
const getNavData = () => ({
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
          feature: "training_courses",
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
          feature: "course_quizzes",
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
          title: "Flash Cards",
          url: "/dashboard/flashcards-analytics",
          icon: Layers,
          feature: "flash_cards",
          items: [
            {
              title: "Analytics & Suggestions",
              url: "/dashboard/flashcards-analytics",
            },
            {
              title: "Priorities & Settings",
              url: "/dashboard/flashcards-priorities",
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
          title: "Features",
          url: "/dashboard/features",
          icon: ToggleLeft,
        },
        {
          title: "Roles",
          url: "/dashboard/roles",
          icon: Shield,
          feature: "custom_roles",
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
          feature: "rewards_store",
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
              feature: "audit_logs",
            },
          ],
        },
      ],
    },
  ],
});

export function AppSidebar({ ...props }) {
  const { isEnabled, isLoading } = useFeatures();

  // Filter navigation items based on enabled features
  const filteredNavGroups = useMemo(() => {
    if (isLoading) {
      return getNavData().navGroups;
    }

    return getNavData().navGroups.map(group => ({
      ...group,
      items: group.items
        .filter(item => !item.feature || isEnabled(item.feature))
        .map(item => ({
          ...item,
          // Also filter sub-items if they have feature requirements
          items: item.items?.filter(subItem => !subItem.feature || isEnabled(subItem.feature)),
        })),
    })).filter(group => group.items.length > 0);
  }, [isEnabled, isLoading]);

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
        {filteredNavGroups.map((group) => (
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
