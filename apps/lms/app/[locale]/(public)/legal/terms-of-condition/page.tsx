"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
    FileText,
    Shield,
    UserCheck,
    Scale,
    LogOut,
    Mail,
    ChevronRight,
    Printer,
    FileDown,
    Info,
    MapPin,
    Search,
    CheckCircle2,
    Lock,
    Globe,
    ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@skill-learn/ui/components/button";
import { cn } from "@skill-learn/lib/utils";

export default function TermsOfConditionPage() {
    const t = useTranslations("legal");
    const [activeSection, setActiveSection] = useState("acceptable-use");
    const [searchQuery, setSearchQuery] = useState("");
    const sections = [
        { id: "acceptable-use", name: t("acceptableUse"), icon: Shield },
        { id: "intellectual-property", name: t("intellectualProperty"), icon: Lock },
        { id: "user-obligations", name: t("userObligations"), icon: UserCheck },
        { id: "limitation-of-liability", name: t("limitationOfLiability"), icon: Scale },
        { id: "termination", name: t("termination"), icon: LogOut },
        { id: "contact", name: t("contact"), icon: Mail },
    ];

    useEffect(() => {
        const handleScroll = () => {
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

    return (
        <div className="min-h-screen bg-[#F8F9FB] font-sans text-slate-900">
            {/* Top Banner/Header Integration matching mockup */}
            <section className="bg-white border-b border-slate-100 pt-16 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                        <span className="hover:text-brand-teal cursor-pointer">{t("legalDocumentation")}</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-medium">{t("termsAndConditions")}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-brand-teal font-bold text-slate-900 mb-4 tracking-tight">
                                {t("termsAndConditions")}
                            </h1>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                {t("termsIntro")} <span className="font-semibold text-slate-400 ml-2">{t("lastUpdatedOctober")}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="flex items-center gap-2 bg-white border-slate-200">
                                <FileDown className="w-4 h-4" />
                                {t("downloadPdf")}
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 text-slate-600">
                                <Printer className="w-4 h-4" />
                            </Button>
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
                            <div className="bg-white rounded-4xl p-6 shadow-sm border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900 mb-4 tracking-tight">{t("tableOfContents")}</h3>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Quick Navigation</p>
                                <nav className="space-y-1">
                                    {sections.map((section) => {
                                        const Icon = section.icon;
                                        const isActive = activeSection === section.id;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => scrollToSection(section.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                                                    isActive
                                                        ? "bg-brand-teal/5 text-brand-teal"
                                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "w-4 h-4",
                                                    isActive ? "text-brand-teal" : "text-slate-400 group-hover:text-slate-500"
                                                )} />
                                                {section.name}
                                                {isActive && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-brand-teal" />}
                                            </button>
                                        );
                                    })}
                                </nav>

                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Search Terms</p>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder={t("findKeyword")}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/20 transition-all"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Policy Text */}
                    <div className="flex-1 max-w-4xl">
                        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                            {/* Introduction */}
                            <section id="introduction" className="mb-16 scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">Introduction</h2>
                                <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-600 leading-relaxed">
                                    <p>
                                        Welcome to Skill-Learn. These Terms & Conditions govern your use of our SaaS Learning Management System platform and any related services. By accessing or using Skill-Learn, you agree to be bound by these Terms. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these terms.
                                    </p>
                                </div>
                            </section>

                            {/* Acceptable Use */}
                            <section id="acceptable-use" className="mb-16 scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">1. Acceptable Use</h2>
                                <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-600 leading-relaxed">
                                    <p>
                                        You agree to use the Skill-Learn platform only for lawful purposes and in accordance with these Terms. You are prohibited from:
                                    </p>
                                    <ul className="space-y-4 list-none pl-0">
                                        {[
                                            "Using the platform in any way that violates applicable federal, state, local, or international law.",
                                            "Attempting to interfere with the proper working of the platform or bypassing any security measures.",
                                            "Engaging in any conduct that restricts or inhibits anyone's use or enjoyment of the platform.",
                                            "Uploading or transmitting viruses, worms, or any other type of malicious code.",
                                            "Impersonating or attempting to impersonate Skill-Learn, a Skill-Learn employee, or any other user.",
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-4">
                                                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                                                <p className="m-0 text-slate-700">{item}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            {/* Intellectual Property Rights */}
                            <section id="intellectual-property" className="mb-16 scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">2. Intellectual Property Rights</h2>
                                <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-600 leading-relaxed">
                                    <p>
                                        The platform and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are owned by Skill-Learn, its licensors, or other providers of such material and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                                    </p>

                                    {/* Quote-style callout matching mockup */}
                                    <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-4xl-2xl p-8 italic text-blue-900 text-lg leading-relaxed shadow-sm">
                                        "User Content remains the property of the User. However, by uploading content to Skill-Learn, you grant us a worldwide, non-exclusive, royalty-free license to host, store, and process that content for the sole purpose of providing the service to you."
                                    </div>
                                </div>
                            </section>

                            {/* User Obligations */}
                            <section id="user-obligations" className="mb-16 scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">3. User Obligations</h2>
                                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                    To access the platform, you may be required to provide certain registration details. It is a condition of your use of the platform that all information you provide is correct, current, and complete.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    <div className="bg-slate-50/50 rounded-4xl p-8 border border-slate-100 flex flex-col shadow-sm">
                                        <h4 className="text-brand-teal font-bold mb-3 tracking-tight">Account Security</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50/50 rounded-4xl p-8 border border-slate-100 flex flex-col shadow-sm">
                                        <h4 className="text-brand-teal font-bold mb-3 tracking-tight">Compliance</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            You must ensure that all sub-users (employees/learners) comply with these terms and conditions at all times.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Limitation of Liability */}
                            <section id="limitation-of-liability" className="mb-16 scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">4. Limitation of Liability</h2>
                                <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-600 leading-relaxed">
                                    <p>
                                        In no event will Skill-Learn, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the platform, any websites linked to it, or any content on the platform.
                                    </p>
                                    <p>
                                        This includes without limitation any direct, indirect, special, incidental, consequential, or punitive damages, including but not limited to, personal injury, pain and suffering, emotional distress, loss of revenue, loss of profits, loss of business, or loss of data.
                                    </p>
                                </div>
                            </section>

                            {/* Termination */}
                            <section id="termination" className="mb-16 scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">5. Termination</h2>
                                <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-600 leading-relaxed">
                                    <p>
                                        We may terminate or suspend your access to all or part of the platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the platform will immediately cease.
                                    </p>
                                </div>
                            </section>

                            {/* Contact Information */}
                            <section id="contact" className="scroll-mt-20">
                                <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">6. Contact Information</h2>
                                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                    If you have any questions or concerns about these Terms & Conditions, please contact our legal team at:
                                </p>

                                <div className="space-y-4 mt-6">
                                    <div className="flex items-center gap-4 text-slate-600 hover:text-brand-teal transition-colors">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <a href="mailto:legal@skill-learn.com" className="font-semibold underline decoration-brand-teal/30 underline-offset-4">legal@skill-learn.com</a>
                                    </div>

                                    <div className="flex items-center gap-4 text-slate-600">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold italic">123 Tech Plaza, Suite 400, San Francisco, CA 94105</span>
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