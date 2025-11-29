"use client";

import Link from "next/link";
import { Logo } from "@/app/components/Logo";

export default function LandingFooter() {
  const footerLinks = {
    Product: [
      "Product tour",
      "Templates",
      "Apps & Integrations",
      "Task management",
      "Gantt charts",
      "Skill-Learn status",
      "Security",
      "CA Notice of Collection",
      "AI"
    ],
    Solutions: [
      "All teams",
      "Marketing",
      "Creative",
      "Project Management",
      "Product Development",
      "Business Operations",
      "Professional Services"
    ],
    Resources: [
      "Help Center",
      "Community",
      "Webinars",
      "Interactive Training",
      "Support"
    ],
    Company: [
      "About Us",
      "Careers",
      "Our Customers",
      "Blog",
      "Events",
      "Newsroom",
      "Partner Program",
      "User Conference",
      "Contact Us"
    ]
  };

  return (
    <footer className="bg-brand-teal text-white pt-12 md:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href="#"
                      className="text-white/80 hover:text-white transition-colors text-sm"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo textClassName="text-white" />
          </div>
          <p className="text-white/80 text-sm">
            Skill-Learn © All rights reserved
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="text-white/80 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-white/80 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

