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
  User
} from "lucide-react";
import { cn } from "@skill-learn/lib/utils.js";
import { useFeatures } from "@skill-learn/lib";
import { Logo } from "@/components/shared/Logo";

export default function Sidebar({ isOperations }) {
  const pathname = usePathname();
  const { isEnabled, isLoading } = useFeatures();

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
    { label: "Report Card", href: "/user/stats", icon: BarChart2, feature: "user_stats" },
    { label: "Games", href: "/games", icon: Gamepad2, feature: "games" },
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

      <div className="p-4 border-t border-gray-50">
        <div className="px-4 py-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-700">Need Help?</span>
              <span className="text-[10px] text-gray-500">Contact Support</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
