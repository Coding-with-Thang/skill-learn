"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return null;
  }

  return (
    <footer className="p-4 mt-auto relative bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto text-center">
        <p>{t("copyright")}</p>
        <div className="mt-4 space-x-6 text-sm">
          <Link href="/legal" className="hover:text-brand-teal transition-colors">
            {t("legalHub")}
          </Link>
          <Link href="/legal/privacy-policy" className="hover:text-brand-teal transition-colors">
            {t("privacyPolicy")}
          </Link>
          <Link href="/legal/terms-of-condition" className="hover:text-brand-teal transition-colors">
            {t("termsOfService")}
          </Link>
          <Link href="/sitemap" className="hover:text-brand-teal transition-colors">
            {t("sitemap")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
