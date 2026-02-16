"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  type LucideIcon,
  LayoutGrid,
  GraduationCap,
  BarChart2,
  Trophy,
  Gamepad2,
  ShieldCheck,
  User,
  Layers,
  Gift,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@skill-learn/lib/utils";
import { useFeaturesStore } from "@skill-learn/lib/stores/featuresStore";
import { Logo } from "@/components/shared/Logo";
import { SidebarTrigger, useSidebar } from "@skill-learn/ui/components/sidebar";

export default function Sidebar({ isOperations }) {
  const pathname = usePathname();
  const isEnabled = useFeaturesStore((s) => s.isEnabled);
  const isLoading = useFeaturesStore((s) => s.isLoading);
  const fetchFeatures = useFeaturesStore((s) => s.fetchFeatures);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    feature?: string;
    special?: boolean;
  };

  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  // User Navigation Items
  const userNavItems: NavItem[] = [
    { label: t("dashboard"), href: "/home", icon: LayoutGrid },
    {
      label: t("training"),
      href: "/training",
      icon: GraduationCap,
      feature: "training_courses",
    },
    {
      label: t("flashCards"),
      href: "/flashcards",
      icon: Layers,
      feature: "flash_cards",
    },
    {
      label: t("reportCard"),
      href: "/user/stats",
      icon: BarChart2,
      feature: "user_stats",
    },
    { label: t("games"), href: "/games", icon: Gamepad2, feature: "games" },
    { label: t("achievements"), href: "/achievements", icon: Trophy },
    {
      label: t("rewards"),
      href: "/rewards",
      icon: Gift,
      feature: "rewards_store",
    },
  ];

  const items = isLoading
    ? userNavItems
    : userNavItems.filter((item) => !item.feature || isEnabled(item.feature));

  if (isOperations) {
    items.push({
      label: t("adminDashboard"),
      href: "/dashboard",
      icon: ShieldCheck,
      special: true,
    });
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-card border-r border-border fixed left-0 top-0 z-30 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className={cn("p-6", isCollapsed && "px-4 flex justify-center")}>
        <Logo
          imageClassName="w-8 h-8"
          textClassName={cn("text-lg", isCollapsed && "hidden")}
        />
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-8 overflow-y-auto min-h-0 custom-scrollbar">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : ""}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isCollapsed && "justify-center px-0 h-12 w-12 mx-auto",
                isActive
                  ? "bg-primary/20 text-primary font-semibold shadow-sm"
                  : item.special
                    ? "bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors shrink-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {!isCollapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {state === "expanded" && (
        <div className="px-6 py-4 border-t border-border/50 shrink-0 overflow-hidden">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                <span>{tCommon("weeklyGoal")}</span>
                <span className="text-primary">65%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500 weekly-goal-progress-fill" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "mt-auto border-t border-border/10",
          isCollapsed && "border-none pt-2",
        )}
      >
        <div
          onClick={() => {}}
          className={cn(
            "flex items-center gap-3 px-4 py-3 mx-4 my-1 rounded-xl transition-all duration-200 group cursor-pointer hover:bg-muted",
            isCollapsed && "justify-center px-0 h-12 w-12 mx-auto",
          )}
        >
          <div className="flex items-center justify-center">
            <SidebarTrigger className="h-5 w-5 p-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          {!isCollapsed && (
            <span className="text-sm text-muted-foreground group-hover:text-foreground">
              {tCommon("collapseSidebar")}
            </span>
          )}
        </div>

        <div
          className={cn(
            "p-4 border-t border-border/10",
            isCollapsed && "p-2 mb-2",
          )}
        >
          <div
            className={cn(
              "px-4 py-3 bg-muted/50 rounded-xl",
              isCollapsed && "px-0 py-2 flex justify-center",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <User className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">
                    {tCommon("needHelp")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {tCommon("contactSupport")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
