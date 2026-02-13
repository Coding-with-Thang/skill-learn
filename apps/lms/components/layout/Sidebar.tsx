"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  GraduationCap,
  BarChart2,
  Trophy,
  Gamepad2,
  ShieldCheck,
  User,
  Layers,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@skill-learn/lib/utils";
import { useFeaturesStore } from "@skill-learn/lib/stores/featuresStore";
import { Logo } from "@/components/shared/Logo";

export default function Sidebar({ isOperations }) {
  const pathname = usePathname();
  const isEnabled = useFeaturesStore((s) => s.isEnabled);
  const isLoading = useFeaturesStore((s) => s.isLoading);
  const fetchFeatures = useFeaturesStore((s) => s.fetchFeatures);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Admin Navigation Items
  const adminNavItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutGrid },
    { label: "Users", href: "/dashboard/users", icon: User },
    { label: "Courses", href: "/dashboard/courses", icon: GraduationCap, feature: "training_courses" },
    { label: "Quizzes", href: "/dashboard/quizzes", icon: ShieldCheck, feature: "course_quizzes" },
    { label: "Categories", href: "/dashboard/categories", icon: BarChart2, feature: "categories" },
    { label: "Rewards", href: "/dashboard/rewards", icon: Trophy, feature: "rewards_store" },
    { label: "Audit Logs", href: "/dashboard/audit-logs", icon: ShieldCheck, feature: "audit_logs" },
    { label: "Settings", href: "/dashboard/settings", icon: ShieldCheck },
  ];

  // User Navigation Items
  const userNavItems = [
    { label: "Dashboard", href: "/home", icon: LayoutGrid },
    { label: "Training", href: "/training", icon: GraduationCap, feature: "training_courses" },
    { label: "Flash Cards", href: "/flashcards", icon: Layers, feature: "flash_cards" },
    { label: "Report Card", href: "/user/stats", icon: BarChart2, feature: "user_stats" },
    { label: "Games", href: "/games", icon: Gamepad2, feature: "games" },
    { label: "Achievements", href: "/achievements", icon: Trophy },
    { label: "Rewards", href: "/rewards", icon: Trophy, feature: "rewards_store" },
  ];

  const isAdminRoute = pathname?.startsWith('/dashboard');
  const baseItems = isAdminRoute ? adminNavItems : userNavItems;

  // Filter items based on feature availability (only filter if not loading)
  const items = isLoading
    ? baseItems
    : baseItems.filter(item => !item.feature || isEnabled(item.feature));

  // Add link to switch between views if user has access
  if (isOperations && !isAdminRoute) {
    items.push({
      label: "Admin Dashboard",
      href: "/dashboard",
      icon: ShieldCheck,
      special: true,
    });
  } else if (isAdminRoute) {
    items.push({
      label: "Back to App",
      href: "/home",
      icon: LayoutGrid, // Or ArrowLeft
    });
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0 z-30">
      <div className="p-6">
        <Logo />
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-sm"
                  : item.special
                    ? "bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-border/50">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              <span>Weekly Goal</span>
              <span className="text-primary">65%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '65%' }} />
            </div>
            <div className="text-[10px] text-muted-foreground">
              65% Achieved
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="px-4 py-3 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">Need Help?</span>
              <span className="text-[10px] text-muted-foreground">Contact Support</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
