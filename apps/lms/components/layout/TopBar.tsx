"use client";

import MobileSidebar from "@/components/layout/MobileSidebar";
import { Search, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { UserButtonWrapper } from '@/components/auth/UserButtonWrapper';
import { useUser } from "@clerk/nextjs";
import { useUserRole } from "@skill-learn/lib/hooks/useUserRole";
import { SearchCommand } from "./SearchCommand";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useState } from "react";
import { Logo } from "@/components/shared/Logo";
export default function TopBar({ adminMode = false }: { adminMode?: boolean } = {}) {
  const { user } = useUser();
  const { role } = useUserRole();

  const displayRole = role ? role.toLowerCase().replace('_', ' ') : 'Member';

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-2000 w-full bg-card border-b border-border px-4 md:px-8 py-5 md:py-6 flex items-center justify-between transition-all gap-4">
      <div className="flex items-center gap-4">
        {!adminMode && <MobileSidebar />}
        <Logo imageClassName="w-10 h-10" textClassName="text-xl" />
      </div>

      <div className="flex items-center gap-8">
        {/* Search Trigger Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center bg-muted/50 rounded-4xl px-5 py-3 border border-border/50 hover:border-primary/50 hover:bg-muted transition-all w-full max-w-lg group cursor-pointer"
          aria-label="Search knowledge base"
          title="Search (⌘K)"
        >
          <Search className="w-4 h-4 text-muted-foreground mr-4 group-hover:text-primary transition-colors" />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 text-left">
            Search your knowledge base...
          </span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>
            <span>K</span>
          </div>
        </button>

        <SearchCommand isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />

        <div className="flex items-center gap-5">
          {/* Actions */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-muted transition-colors cursor-pointer md:hidden"
            aria-label="Search"
            title="Search"
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>

          <ThemeToggle />

          <LanguageSwitcher className="hidden sm:flex" />

          <div 
            className="relative flex items-center justify-center w-11 h-11 rounded-full hover:bg-muted transition-colors cursor-pointer"
            role="button"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card"></span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4 pl-6 border-l border-border/50">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-foreground whitespace-nowrap">
                {user?.fullName || "User"}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground capitalize whitespace-nowrap">
                {displayRole}
              </span>
            </div>
            <div className="hover:scale-105 transition-transform duration-200">
              <UserButtonWrapper />
            </div>
          </div>
        </div>
      </div>
    </header >
  );
}
