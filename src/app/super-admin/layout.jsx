"use client";

import { useState } from "react";
import { Sidebar } from "@/components/super-admin/Sidebar";
import { TopNav } from "@/components/super-admin/TopNav";
import { cn } from "@/lib/utils";

export default function SuperAdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/20">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <TopNav collapsed={collapsed} />

      <main
        className={cn(
          "pt-24 px-8 pb-8 min-h-screen transition-all duration-300 ease-in-out",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
