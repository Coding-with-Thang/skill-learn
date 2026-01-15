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
    <footer className="p-4 mt-auto relative bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto text-center">
        <p>Copyright &copy; 2025 - All rights reserved by Skill-Learn.ca</p>
        <div className="mt-4 space-x-6 text-sm">
          <Link href="/legal" className="hover:text-brand-teal transition-colors">Legal Hub</Link>
          <Link href="/legal/privacy-policy" className="hover:text-brand-teal transition-colors">Privacy Policy</Link>
          <Link href="/legal/terms-of-condition" className="hover:text-brand-teal transition-colors">Terms of Service</Link>
          <Link href="/sitemap" className="hover:text-brand-teal transition-colors">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
