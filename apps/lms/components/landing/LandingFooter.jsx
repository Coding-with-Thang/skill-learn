"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export default function LandingFooter() {
  const footerLinks = {
    Product: [
      { name: "Features", href: "/features" },
      "Gantt charts",
      "AI"
    ],
    Business: [
      "All teams",
      "Marketing",
      "Creative",
      "Project Management",
      "Product Development",
      "Business Operations",
    ],
    Resources: [
      { name: "Help Center", href: "/support/faq" },
      { name: "Community", href: "/onboarding/welcome" },
      { name: "Pricing", href: "/pricing" },
      { name: "Sitemap", href: "/sitemap" },
      { name: "Case Studies", href: "/resources/case-studies/techflow" },
      { name: "Contact Us", href: "/contact" },
      { name: "Support", href: "/support/faq" },
      { name: "Careers", href: "/careers" }
      { name: "Changelog", href: "/changelog" },
    ],
    Legal: [
      { name: "Legal Hub", href: "/legal" },
      { name: "Privacy Policy", href: "/legal/privacy-policy" },
      { name: "Terms of Service", href: "/legal/terms-of-condition" },
      { name: "Accessibility", href: "/legal/accessibility" },
      { name: "Compliance", href: "/legal/compliance" }
    ]
  };

  return (
    <footer className="bg-brand-teal text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold text-lg mb-6 text-white/90">{category}</h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={typeof link === "string" ? "#" : link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm font-medium flex items-center gap-1 group"
                    >
                      {typeof link === "string" ? link : link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Logo textClassName="text-white" />
            <p className="text-white/50 text-xs font-medium tracking-wide">
              © {new Date().getFullYear()} SKILL-LEARN INC. ALL RIGHTS RESERVED.
            </p>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
            <Link href="/legal" className="text-white/60 hover:text-white transition-colors">
              Legal Hub
            </Link>
            <Link href="/sitemap" className="text-white/60 hover:text-white transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

