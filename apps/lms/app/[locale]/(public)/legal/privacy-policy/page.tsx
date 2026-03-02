"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
    FileText,
    Database,
    ShieldCheck,
    Lock,
    Cookie,
    Mail,
    ChevronRight,
    Printer,
    FileDown,
    Info,
    AlertTriangle,
    ArrowUp,
    ExternalLink,
    MessageSquare,
    Phone,
    ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@skill-learn/ui/components/button";
import { cn } from "@skill-learn/lib/utils";

export default function PrivacyPolicyPage() {
    const t = useTranslations("legal");
    const [activeSection, setActiveSection] = useState("introduction");
    const sections = [
        { id: "introduction", name: t("introduction"), icon: Info },
        { id: "data-collection", name: "1. " + t("dataCollection"), icon: Database },
        { id: "usage-rights", name: "2. " + t("usageRights"), icon: ShieldCheck },
        { id: "data-security", name: "3. " + t("dataSecurity"), icon: Lock },
        { id: "cookie-policy", name: "4. " + t("cookiePolicy"), icon: Cookie },
        { id: "contact-us", name: "5. " + t("contactUs"), icon: Mail },
    ];

    useEffect(() => {
        const handleScroll = () => {
            // Simple intersection observer logic
            const scrollPosition = window.scrollY + 200;
            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: "smooth",
            });
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] font-sans text-slate-900">
            {/* Hero Header */}
            <section className="bg-white border-b border-slate-100 pt-16 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                        <span className="hover:text-brand-teal cursor-pointer">{t("legalResources")}</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-medium">{t("privacyPolicy")}</span>
                    </nav>

                    <h1 className="text-4xl md:text-brand-teal font-bold text-slate-900 mb-6 tracking-tight">
                        {t("privacyPolicy")}
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl leading-relaxed mb-10">
                        {t("privacyPolicyIntro")}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t("lastUpdated")}</span>
                                <span className="text-sm font-semibold text-slate-700">OCT 24, 2023</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-brand-teal/5 border border-brand-teal/10 rounded-lg">
                                <span className="text-[10px] font-bold text-brand-teal uppercase tracking-widest leading-none">{t("version")}:</span>
                                <span className="text-sm font-semibold text-brand-teal">2.4</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm">
                                <FileDown className="w-4 h-4" />
                                {t("pdf")}
                            </button>
                            <button className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-lg transition-colors text-sm shadow-sm">
                                <Printer className="w-4 h-4" />
                                {t("print")}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-72 shrink-0">
                        <div className="sticky top-10 space-y-8">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">{t("navigation")}</h3>
                                <p className="text-xs text-slate-400 mb-4 px-4">{t("tableOfContents")}</p>
                                <nav className="space-y-1">
                                    {sections.map((section) => {
                                        const Icon = section.icon;
                                        const isActive = activeSection === section.id;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => scrollToSection(section.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                                    isActive
                                                        ? "bg-brand-teal/10 text-brand-teal shadow-sm"
                                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "w-4 h-4",
                                                    isActive ? "text-brand-teal" : "text-slate-400 group-hover:text-slate-500"
                                                )} />
                                                {section.name}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Legal Update Card */}
                            <div className="bg-linear-to-br from-emerald-500 to-brand-teal rounded-4xl p-6 text-white shadow-xl shadow-brand-teal/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded mb-4">
                                    {t("legalUpdate")}
                                </span>
                                <h4 className="text-lg font-bold mb-2">{t("getNotifiedAboutPolicyChanges")}</h4>
                                <p className="text-white/80 text-xs mb-6 leading-relaxed">{t("stayUpdatedLegal")}</p>
                                <button className="w-full bg-white text-brand-teal font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-lg">
                                    {t("subscribe")}
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Policy Text */}
                    <div className="flex-1 max-w-4xl">
                        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                            {/* Introduction */}
                            <section id="introduction" className="mb-16 scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8">{t("introduction")}</h2>
                                <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-600 leading-relaxed">
                                    <p>{t("introP1")}</p>
                                    <p>{t("introP2")}</p>
                                </div>

                                {/* Callout: GDPR */}
                                <div className="mt-10 bg-[#F0F7FF] border-l-4 border-[#007AFF] rounded-4xl-2xl p-6 flex flex-col sm:flex-row gap-4 items-start">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Info className="w-5 h-5 text-[#007AFF]" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#004A99] font-bold mb-1 uppercase text-xs tracking-widest">{t("noteToEuropeanUsers")}</h4>
                                        <p className="text-[#005ABF] text-sm leading-relaxed">
                                            {t("noteToEuropeanUsersDesc")}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Data Collection */}
                            <section id="data-collection" className="mb-16 scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8">1. {t("dataCollection")}</h2>
                                <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-600 leading-relaxed">
                                    <p>{t("dataCollectionP1")}</p>
                                    <ul className="space-y-4 list-none pl-0">
                                        <li className="flex items-start gap-4">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                                            <p className="m-0 text-slate-700">
                                                <strong className="text-slate-900 font-bold">{t("identityDataLabel")}</strong> {t("identityDataDesc")}
                                            </p>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                                            <p className="m-0 text-slate-700">
                                                <strong className="text-slate-900 font-bold">{t("contactDataLabel")}</strong> {t("contactDataDesc")}
                                            </p>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                                            <p className="m-0 text-slate-700">
                                                <strong className="text-slate-900 font-bold">{t("technicalDataLabel")}</strong> {t("technicalDataDesc")}
                                            </p>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <div className="mt-3 w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                                            <p className="m-0 text-slate-700">
                                                <strong className="text-slate-900 font-bold">{t("usageDataLabel")}</strong> {t("usageDataDesc")}
                                            </p>
                                        </li>
                                    </ul>
                                    <div className="mt-8">
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{t("howWeCollectData")}</h3>
                                        <p>{t("howWeCollectDataP")}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Usage Rights */}
                            <section id="usage-rights" className="mb-16 scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8">2. {t("usageRights")}</h2>
                                <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-600 leading-relaxed">
                                    <p>{t("usageRightsP1")}</p>
                                    <ol className="list-decimal pl-6 space-y-4">
                                        <li>{t("usageRightsL1")}</li>
                                        <li>{t("usageRightsL2")}</li>
                                        <li>{t("usageRightsL3")}</li>
                                    </ol>
                                </div>

                                {/* Callout: Action Required */}
                                <div className="mt-10 bg-[#FFF7E6] border-l-4 border-[#FFA500] rounded-4xl-2xl p-6 flex flex-col sm:flex-row gap-4 items-start">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <AlertTriangle className="w-5 h-5 text-[#FFA500]" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#996300] font-bold mb-1 uppercase text-xs tracking-widest leading-none">{t("actionRequired")}</h4>
                                        <p className="text-[#BF7C00] text-sm leading-relaxed mt-2">
                                            {t("actionRequiredP")}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Data Security */}
                            <section id="data-security" className="mb-16 scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8">3. {t("dataSecurity")}</h2>
                                <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-600 leading-relaxed">
                                    <p>{t("dataSecurityP1")}</p>
                                    <p>{t("dataSecurityP2")}</p>
                                </div>
                            </section>

                            {/* Cookie Policy */}
                            <section id="cookie-policy" className="mb-16 scroll-mt-20 text-slate-600 leading-relaxed text-lg">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">4. {t("cookiePolicy")}</h2>
                                <p className="mb-6">{t("cookiePolicyP1")}</p>
                                <div className="mt-8 flex items-center justify-start">
                                    <a href="#" className="flex items-center gap-2 text-brand-teal font-bold hover:underline transition-all">
                                        {t("manageCookiePrefs")}
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </section>

                            {/* Contact Us */}
                            <section id="contact-us" className="scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8">5. {t("contactUs")}</h2>
                                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                    {t("contactUsP1")}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                                    <div className="bg-[#F8F9FB] rounded-4xl p-8 border border-slate-100 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-3 bg-white rounded-xl shadow-sm mb-6">
                                            <Mail className="w-6 h-6 text-brand-teal" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">{t("emailAddressLabel")}</span>
                                        <a href="mailto:privacy@skill-learn.com" className="text-brand-teal font-bold text-lg hover:underline transition-all">
                                            privacy@skill-learn.com
                                        </a>
                                    </div>

                                    <div className="bg-[#F8F9FB] rounded-4xl p-8 border border-slate-100 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-3 bg-white rounded-xl shadow-sm mb-6">
                                            <Phone className="w-6 h-6 text-brand-teal" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">{t("phoneNumberLabel")}</span>
                                        <a href="tel:+15551234567" className="text-slate-900 font-bold text-lg hover:underline transition-all">
                                            +1 (555) 123-4567
                                        </a>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}