"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return null;
  }

  return (
    <footer className="p-4 mt-auto relative bg-muted text-muted-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto text-center">
        <p>Copyright &copy; 2025 - All rights reserved by Skill-Learn.ca</p>
        <div className="mt-4 space-x-6">
          <Link href="/legal/privacy-policy" className="hover:text-foreground">Privacy Policy</Link>
          <Link href="/legal/terms-of-condition" className="hover:text-foreground">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
