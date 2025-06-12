"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return null;
  }

  return (
    <footer className="p-4 mt-auto relative bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto text-center">
        <p>Copyright &copy; 2025 - All rights reserved by Skill-Learn.ca</p>
        <div className="mt-4 space-x-6">
          <a href="#" className="hover:text-gray-400">Privacy Policy</a>
          <a href="#" className="hover:text-gray-400">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
