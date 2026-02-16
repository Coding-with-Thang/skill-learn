"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  CreditCard,
  FileQuestion,
  FileText,
  Gift,
  Layout,
  LayoutGrid,
  Layers,
  Settings,
  Shield,
  ToggleLeft,
  Users,
  ChartBarStacked,
} from "lucide-react";
import { useFeaturesStore } from "@skill-learn/lib/stores/featuresStore";

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
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/shared/Logo";

function getNavData(t: (key: string) => string) {
  return {
    navGroups: [
      {
        label: t("groupAdminDashboard"),
        items: [
          {
            title: t("overview"),
            url: "/dashboard",
            icon: Layout,
            isActive: true,
          },
          {
            title: t("categories"),
            url: "/dashboard/categories",
            icon: ChartBarStacked,
            feature: "categories",
            items: [{ title: t("manageCategories"), url: "/dashboard/categories" }],
          },
          {
            title: t("courses"),
            url: "/dashboard/courses",
            icon: BookOpen,
            feature: "training_courses",
            items: [
              { title: t("manageCourses"), url: "/dashboard/courses" },
              { title: t("courseCreator"), url: "/dashboard/courses/create" },
            ],
          },
          {
            title: t("quizzes"),
            url: "/dashboard/quizzes",
            icon: FileQuestion,
            feature: "course_quizzes",
            items: [
              { title: t("manageQuizzes"), url: "/dashboard/quizzes" },
              { title: t("quizCreator"), url: "/dashboard/quizzes/quiz-manager" },
            ],
          },
          {
            title: t("flashCards"),
            url: "/dashboard/flashcards-analytics",
            icon: Layers,
            feature: "flash_cards",
            items: [
              { title: t("analyticsSuggestions"), url: "/dashboard/flashcards-analytics" },
              { title: t("prioritiesSettings"), url: "/dashboard/flashcards-priorities" },
              { title: t("manageCards"), url: "/dashboard/flashcards-cards" },
              { title: t("manageCardCategories"), url: "/dashboard/flashcards-categories" },
              { title: t("bulkImport"), url: "/dashboard/flashcards-import" },
              { title: t("learningAnalytics"), url: "/dashboard/flashcards-learning-analytics" },
            ],
          },
        ],
      },
      {
        label: t("groupOrganization"),
        items: [
          { title: t("billing"), url: "/dashboard/billing", icon: CreditCard },
          { title: t("features"), url: "/dashboard/features", icon: ToggleLeft },
          {
            title: t("roles"),
            url: "/dashboard/roles",
            icon: Shield,
            feature: "custom_roles",
            items: [
              { title: t("manageRoles"), url: "/dashboard/roles" },
              { title: t("userAssignments"), url: "/dashboard/user-roles" },
            ],
          },
        ],
      },
      {
        label: t("groupPlatform"),
        items: [
          { title: t("rewards"), url: "/dashboard/rewards", icon: Gift, feature: "rewards_store" },
          { title: t("users"), url: "/dashboard/users", icon: Users },
          { title: t("documentation"), url: "/dashboard/documentation", icon: FileText },
          {
            title: t("settings"),
            url: "/dashboard/settings",
            icon: Settings,
            items: [
              { title: t("general"), url: "/dashboard/settings" },
              { title: t("auditLogs"), url: "/dashboard/audit-logs", feature: "audit_logs" },
            ],
          },
        ],
      },
    ],
  };
}

export function AppSidebar({ ...props }) {
  const t = useTranslations("admin");
  const tNav = useTranslations("nav");
  const isEnabled = useFeaturesStore((s) => s.isEnabled);
  const isLoading = useFeaturesStore((s) => s.isLoading);
  const fetchFeatures = useFeaturesStore((s) => s.fetchFeatures);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const filteredNavGroups = useMemo(() => {
    const data = getNavData(t);
    if (isLoading) {
      return data.navGroups;
    }

    return data
      .navGroups.map((group) => ({
        ...group,
        items: group.items
          .filter((item) => !item.feature || isEnabled(item.feature))
          .map((item) => ({
            ...item,
            // Also filter sub-items if they have feature requirements
            items: item.items?.filter(
              (subItem: { title: string; url: string; feature?: string }) =>
                !subItem.feature || isEnabled(subItem.feature),
            ),
          })),
      }))
      .filter((group) => group.items.length > 0);
  }, [isEnabled, isLoading]);

  return (
    <Sidebar
      collapsible="icon"
      className="h-svh flex flex-col bg-sidebar shrink-0"
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-border/10 flex items-center px-4"></SidebarHeader>
      <SidebarContent className="flex-1 pt-6 mt-6 overflow-y-auto min-h-0">
        {filteredNavGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-0 mt-auto">
        <SidebarMenu className="gap-0">
          <SidebarMenuItem>
            <SidebarTrigger className="h-12 w-full justify-start px-[18px] hover:bg-primary/10 hover:text-primary transition-all rounded-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" />
          </SidebarMenuItem>
          <SidebarMenuItem className="p-2">
            <SidebarMenuButton
              size="lg"
              asChild
              className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
            >
              <Link href="/home">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <LayoutGrid className="size-4" />
                </div>
                <div className="grid flex-1 self-end text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold uppercase tracking-tight text-[11px]">
                    {tNav("backToHome")}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground uppercase font-black">
                    {tNav("mainDashboard")}
                  </span>
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
