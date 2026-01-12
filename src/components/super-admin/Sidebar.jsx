import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  Activity,
  Users,
  Target,
  MessageSquare,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/super-admin/dashboard" },
  { icon: Building2, label: "Tenants", href: "/super-admin/tenants" },
  { icon: CreditCard, label: "Billing", href: "/super-admin/billing" },
  { icon: BarChart3, label: "Analytics", href: "/super-admin/analytics" },
  { icon: Activity, label: "System Health", href: "/super-admin/health" },
  { icon: Users, label: "Admin Users", href: "/super-admin/admins" },
  { icon: Target, label: "Features", href: "/super-admin/features" },
  { icon: MessageSquare, label: "Support", href: "/super-admin/support" },
  { icon: Megaphone, label: "Announcements", href: "/super-admin/announcements" },
  { icon: Settings, label: "Settings", href: "/super-admin/settings" },
];

export function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 25 }}
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col border-r bg-card/50 backdrop-blur-xl transition-all",
        "border-border"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate"
          >
            EduFlow CMS
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} passHref>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
