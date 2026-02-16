"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/shared/Logo";

export default function LandingFooter() {
  const t = useTranslations("footerLanding");
  const tFooter = useTranslations("footer");

  const footerLinks: Record<string, Array<{ nameKey: string; href: string }>> = {
    product: [
      { nameKey: "features", href: "/features" },
      { nameKey: "ganttCharts", href: "#" },
      { nameKey: "ai", href: "#" },
    ],
    business: [
      { nameKey: "allTeams", href: "#" },
      { nameKey: "marketing", href: "#" },
      { nameKey: "creative", href: "#" },
      { nameKey: "projectManagement", href: "#" },
      { nameKey: "productDevelopment", href: "#" },
      { nameKey: "businessOperations", href: "#" },
    ],
    resources: [
      { nameKey: "helpCenter", href: "/support/faq" },
      { nameKey: "community", href: "/onboarding/start" },
      { nameKey: "pricing", href: "/pricing" },
      { nameKey: "sitemap", href: "/sitemap" },
      { nameKey: "caseStudies", href: "/resources/case-studies/techflow" },
      { nameKey: "contactUs", href: "/contact" },
      { nameKey: "support", href: "/support/faq" },
      { nameKey: "careers", href: "/careers" },
      { nameKey: "changelog", href: "/changelog" },
    ],
    legal: [
      { nameKey: "legalHub", href: "/legal" },
      { nameKey: "privacyPolicy", href: "/legal/privacy-policy" },
      { nameKey: "termsOfService", href: "/legal/terms-of-condition" },
      { nameKey: "accessibility", href: "/legal/accessibility" },
      { nameKey: "compliance", href: "/legal/compliance" },
    ],
  };

  const categoryLabels: Record<string, string> = {
    product: "product",
    business: "business",
    resources: "resources",
    legal: "legal",
  };

  return (
    <footer className="bg-brand-teal text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold text-lg mb-6 text-white/90">{t(categoryLabels[category] ?? "product")}</h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm font-medium flex items-center gap-1 group"
                    >
                      {t(link.nameKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Logo className="" textClassName="text-white" imageClassName="" />
            <p className="text-white/50 text-xs font-medium tracking-wide">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
            <Link href="/legal" className="text-white/60 hover:text-white transition-colors">
              {tFooter("legalHub")}
            </Link>
            <Link href="/sitemap" className="text-white/60 hover:text-white transition-colors">
              {tFooter("sitemap")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

