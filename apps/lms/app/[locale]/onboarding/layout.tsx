"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function OnboardingLayout({ children }) {
  const t = useTranslations("onboarding");
  const tCommon = useTranslations("common");

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-brand-teal to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Skill-Learn</span>
            </Link>
            <div className="text-sm text-gray-500">
              {t("needHelp")}{" "}
              <a href="mailto:support@skill-learn.com" className="text-brand-teal hover:underline">
                {tCommon("contactSupport")}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Skill-Learn. {t("allRightsReserved")}</p>
      </footer>
    </div>
  );
}
