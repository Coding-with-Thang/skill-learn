"use client";

import MobileSidebar from "@/components/layout/MobileSidebar";
import { Search, Bell } from "lucide-react";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import { UserButtonWrapper } from '@/components/features/auth/UserButtonWrapper';
import { useUser } from "@clerk/nextjs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUserRole } from "@/lib/hooks/useUserRole";

export default function TopBar({ adminMode }) {
  const { user } = useUser();
  const { role } = useUserRole();

  const displayRole = role ? role.toLowerCase().replace('_', ' ') : 'Member';

  return (
    <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-md border-b border-border/40 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] px-4 md:px-8 py-4 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4">
        {adminMode ? <SidebarTrigger /> : <MobileSidebar />}
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar - Hidden on small screens or expandable */}
        <div className="hidden md:flex items-center bg-muted/50 rounded-full px-4 py-2 border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-48"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Actions */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors cursor-pointer">
            <Search className="w-5 h-5 text-muted-foreground md:hidden" />
          </div>

          <ThemeSwitcher />

          <div className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors cursor-pointer">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-2 border-l border-border">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-foreground">
                {user?.fullName || "User"}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {displayRole}
              </span>
            </div>
            <UserButtonWrapper />
          </div>
        </div>
      </div>
    </header>
  );
}
