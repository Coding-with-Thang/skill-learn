"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronDown, ChevronUp, Cookie, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@skill-learn/lib/utils";

const COOKIE_CONSENT_KEY = "skill_learn_cookie_consent";

export function CookieConsent() {
  const t = useTranslations("cookie");
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected = { essential: true, analytics: false, marketing: false };
    saveConsent(allRejected);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (data) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const togglePreference = (key) => {
    if (key === 'essential') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Floating Trigger Button (Visible when banner is closed) */}
      <AnimatePresence>
        {!isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsVisible(true);
              setIsExpanded(true);
            }}
            className="fixed bottom-6 right-6 z-[9998] p-3 bg-brand-teal text-white rounded-full shadow-lg hover:bg-brand-teal-dark transition-all group flex items-center gap-0 overflow-hidden"
            title={t("cookieSettings")}
          >
            <Cookie className="w-5 h-5 shrink-0" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-[150px] group-hover:ml-2 transition-all duration-500 whitespace-nowrap text-[12px] font-bold">
              {t("privacySettings")}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-[9999] w-full max-w-[360px] bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden font-sans",
              isExpanded ? "max-h-[550px]" : "max-h-[250px]"
            )}
          >
            {/* Close button for manual management */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-all z-10"
              title={t("closeSettings")}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-brand-teal/5 rounded-xl flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5 text-brand-teal" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-tight">{t("privacyCookies")}</h3>
                  <p className="text-[12px] text-slate-500 leading-tight">
                    {t("cookieDescription")}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-[12px] font-bold text-brand-teal mb-6 hover:text-brand-teal-dark transition-colors"
              >
                {t("managePreferences")} {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-6 space-y-3"
                  >
                    <p className="text-[10px] text-slate-400 mb-2 leading-tight italic">
                      {t("acceptConsent")}
                    </p>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[12px] font-bold text-slate-800">{t("essential")}</span>
                        </div>
                        <div className="w-8 h-5 bg-brand-teal/10 rounded-full flex items-center px-1 opacity-50">
                          <div className="w-3 h-3 bg-brand-teal rounded-full ml-auto" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {t("essentialDesc")}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-brand-teal/20 transition-all cursor-pointer" onClick={() => togglePreference("analytics")}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-slate-800">{t("analytics")}</span>
                        <div className={cn(
                          "w-8 h-5 rounded-full flex items-center px-1 transition-all",
                          preferences.analytics ? "bg-brand-teal" : "bg-slate-200"
                        )}>
                          <div className={cn(
                            "w-3 h-3 bg-white rounded-full transition-all",
                            preferences.analytics ? "ml-auto" : "ml-0"
                          )} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-brand-teal/20 transition-all cursor-pointer" onClick={() => togglePreference("marketing")}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-slate-800">{t("marketing")}</span>
                        <div className={cn(
                          "w-8 h-5 rounded-full flex items-center px-1 transition-all",
                          preferences.marketing ? "bg-brand-teal" : "bg-slate-200"
                        )}>
                          <div className={cn(
                            "w-3 h-3 bg-white rounded-full transition-all",
                            preferences.marketing ? "ml-auto" : "ml-0"
                          )} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <>
                    <button
                      onClick={handleRejectAll}
                      className="flex-1 py-2 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg"
                    >
                      {t("reject")}
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      className="flex-1 py-2 text-[12px] font-bold text-brand-teal bg-white border border-brand-teal rounded-lg hover:bg-brand-teal/5 transition-all"
                    >
                      {t("save")}
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 py-2 text-[12px] font-bold text-white bg-brand-teal rounded-lg shadow-md hover:bg-brand-teal-dark transition-all"
                    >
                      {t("all")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleRejectAll}
                      className="flex-1 py-3 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                    >
                      {t("rejectAll")}
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 py-3 text-[12px] font-bold text-white bg-brand-teal rounded-xl shadow-md hover:bg-brand-teal-dark transition-all"
                    >
                      {t("acceptAll")}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                <Link href="/legal/privacy-policy" className="hover:text-brand-teal transition-colors">{t("privacy")}</Link>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <Link href="/legal/terms-of-condition" className="hover:text-brand-teal transition-colors">{t("terms")}</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
