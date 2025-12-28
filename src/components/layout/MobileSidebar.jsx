"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutGrid,
  GraduationCap,
  BarChart2,
  Gamepad2,
  Trophy,
  ShieldCheck,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUserRole } from "@/lib/hooks/useUserRole";

export default function MobileSidebar() {
  const pathname = usePathname();
  const { role } = useUserRole();
  const isOperations = role === 'OPERATIONS';

  // Admin Navigation Items
  const adminNavItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutGrid },
    { label: "Users", href: "/dashboard/users", icon: User },
    { label: "Courses", href: "/dashboard/courses", icon: GraduationCap },
    { label: "Quizzes", href: "/dashboard/quizzes", icon: ShieldCheck },
    { label: "Categories", href: "/dashboard/categories", icon: BarChart2 },
    { label: "Rewards", href: "/dashboard/rewards", icon: Trophy },
    { label: "Audit Logs", href: "/dashboard/audit-logs", icon: ShieldCheck },
    { label: "Settings", href: "/dashboard/settings", icon: ShieldCheck },
  ];

  // User Navigation Items
  const userNavItems = [
    { label: "Dashboard", href: "/home", icon: LayoutGrid },
    { label: "My Training", href: "/training", icon: GraduationCap },
    { label: "My Stats", href: "/user/stats", icon: BarChart2 },
    { label: "Games", href: "/user/stats", icon: Gamepad2 },
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
      icon: LayoutGrid,
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
        <div className="flex flex-col h-full bg-white">
          <div className="p-6 border-b border-gray-100">
            <Logo />
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
