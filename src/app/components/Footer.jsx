"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <footer className={cn(
      "p-4 mt-auto relative",
      isDashboard ? "bg-gray-50 border-t text-gray-600" : "bg-gray-800 text-white"
    )}>
      <div className="max-w-7xl mx-auto text-center">
        <p>Copyright &copy; 2025 - All rights reserved by Skill-Learn.ca</p>
        <div className="mt-4 space-x-6">
          <a href="#" className={cn("hover:text-gray-400", isDashboard && "hover:text-gray-900")}>Privacy Policy</a>
          <a href="#" className={cn("hover:text-gray-400", isDashboard && "hover:text-gray-900")}>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
