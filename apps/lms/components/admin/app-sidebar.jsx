"use client";

import { useEffect, useMemo } from "react";
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
  ChartBarStacked,
} from "lucide-react";
import { useFeaturesStore } from "@skill-learn/lib/stores/featuresStore.js";

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
  SidebarTrigger,
  SidebarSeparator,
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
          title: "Categories",
          url: "/dashboard/categories",
          icon: ChartBarStacked,
          feature: "categories",
          items: [
            {
              title: "Manage Categories",
              url: "/dashboard/categories",
            },
          ],
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
            {
              title: "Manage Cards",
              url: "/dashboard/flashcards-cards",
            },
            {
              title: "Manage Categories",
              url: "/dashboard/flashcards-categories",
            },
            {
              title: "Bulk Import",
              url: "/dashboard/flashcards-import",
            },
            {
              title: "Learning Analytics",
              url: "/dashboard/flashcards-learning-analytics",
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
              title: "General",
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
  const isEnabled = useFeaturesStore((s) => s.isEnabled);
  const isLoading = useFeaturesStore((s) => s.isLoading);
  const fetchFeatures = useFeaturesStore((s) => s.fetchFeatures);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

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
      <SidebarHeader className="border-b border-border/10 bg-muted/5">
        <div className="flex items-center justify-center p-3">
          <SidebarTrigger className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all rounded-xl" />
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-6">
        {filteredNavGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <div className="flex-1" />
      <SidebarSeparator />
      <SidebarFooter className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="group-data-[collapsible=icon]:p-0">
              <Link href="/home">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <LayoutGrid className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold uppercase tracking-tight text-[11px]">Back to Home</span>
                  <span className="truncate text-[10px] text-muted-foreground uppercase font-black">Main Dashboard</span>
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
