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
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

export default function Sidebar({ isOperations }) {
  const pathname = usePathname();

  // Admin Navigation Items
  const adminNavItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutGrid },
    { label: "Users", href: "/dashboard/users", icon: User },
    { label: "Courses", href: "/dashboard/courses", icon: GraduationCap },
    { label: "Quizzes", href: "/dashboard/quizzes", icon: ShieldCheck }, // Using ShieldCheck as placeholder or find better
    { label: "Categories", href: "/dashboard/categories", icon: BarChart2 }, // Placeholder icon
    { label: "Rewards", href: "/dashboard/rewards", icon: Trophy },
    { label: "Audit Logs", href: "/dashboard/audit-logs", icon: ShieldCheck },
    { label: "Settings", href: "/dashboard/settings", icon: ShieldCheck },
  ];

  // User Navigation Items
  const userNavItems = [
    { label: "Dashboard", href: "/home", icon: LayoutGrid },
    { label: "My Training", href: "/training", icon: GraduationCap },
    { label: "My Stats", href: "/user/stats", icon: BarChart2 },
    { label: "Games", href: "/games", icon: Gamepad2 },
    { label: "Rewards", href: "/rewards", icon: Trophy },
  ];

  const isAdminRoute = pathname?.startsWith('/dashboard');
  const items = isAdminRoute ? adminNavItems : userNavItems;

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
    <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border/50 shadow-[1px_0_5px_0_rgba(0,0,0,0.02)] fixed left-0 top-0 z-30 transition-all duration-300">
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

      <div className="p-4 border-t border-border">
        <div className="px-4 py-3 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
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
