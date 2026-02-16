"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Globe,
} from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { Input } from "@skill-learn/ui/components/input";
import { Label } from "@skill-learn/ui/components/label";
import { Textarea } from "@skill-learn/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@skill-learn/ui/components/select";
import { Card } from "@skill-learn/ui/components/card";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const t = useTranslations("contact");
  const tFooter = useTranslations("footer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success(t("messageSent"));
    setIsSubmitting(false);
    e.target.reset();
  };

  const contactInfo = [
    {
      icon: Mail,
      labelKey: "emailUs" as const,
      value: "support@skill-learn.com",
      href: "mailto:support@skill-learn.com",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      icon: Phone,
      labelKey: "callSales" as const,
      value: "+1 (555) 000-0000",
      href: "tel:+15550000000",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: MapPin,
      labelKey: "visitOffice" as const,
      value: "123 Learning Way, San Francisco, CA",
      href: "#",
      color: "bg-cyan-50 text-cyan-600"
    }
  ];

  const trustedLogos = [
    { name: "Global Tech", color: "bg-slate-200" },
    { name: "EduCorp", color: "bg-slate-200" },
    { name: "Innovate Inc", color: "bg-slate-200" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-20">
      {/* Hero Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-bold uppercase tracking-widest mb-8">
              {t("supportHub")}
            </div>
            <h1 className="text-brand-teal md:text-6xl font-extrabold text-[#1B1B53] mb-8 tracking-tight leading-[1.1]">
              {t("contactTeam")}
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-lg leading-relaxed">
              {t("contactIntro")}
            </p>

            <div className="space-y-6 mb-12">
              {contactInfo.map((item, idx) => (
                <motion.a
                  key={item.labelKey}
                  href={item.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  className="flex items-center gap-6 group p-2 -ml-2 rounded-4xl hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className={`p-4 rounded-4xl ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {t(item.labelKey)}
                    </span>
                    <span className="text-lg font-bold text-[#1B1B53] group-hover:text-brand-teal transition-colors">
                      {item.value}
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-200">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                {t("trustedBy")}
              </p>
              <div className="flex items-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                {trustedLogos.map((logo) => (
                  <div key={logo.name} className={`h-8 w-24 rounded-lg bg-slate-300`} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 md:p-12 rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border-none bg-white">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-bold text-slate-900 ml-1">{t("fullName")}</Label>
                    <Input
                      id="name"
                      placeholder={t("fullNamePlaceholder")}
                      required
                      className="h-14 rounded-4xl bg-slate-50 border-transparent focus:bg-white focus:border-brand-teal/30 focus:ring-0 transition-all px-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-bold text-slate-900 ml-1">{t("workEmail")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      required
                      className="h-14 rounded-4xl bg-slate-50 border-transparent focus:bg-white focus:border-brand-teal/30 focus:ring-0 transition-all px-6"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="company" className="text-sm font-bold text-slate-900 ml-1">{t("companyName")}</Label>
                    <Input
                      id="company"
                      placeholder={t("companyPlaceholder")}
                      className="h-14 rounded-4xl bg-slate-50 border-transparent focus:bg-white focus:border-brand-teal/30 focus:ring-0 transition-all px-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="department" className="text-sm font-bold text-slate-900 ml-1">{t("department")}</Label>
                    <Select>
                      <SelectTrigger className="h-14 rounded-4xl bg-slate-50 border-transparent focus:bg-white focus:border-brand-teal/30 focus:ring-0 transition-all px-6">
                        <SelectValue placeholder={t("selectDepartment")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-4xl border-slate-100 shadow-xl p-2">
                        <SelectItem value="sales" className="rounded-xl py-3 cursor-pointer">{t("salesMarketing")}</SelectItem>
                        <SelectItem value="support" className="rounded-xl py-3 cursor-pointer">{t("technicalSupport")}</SelectItem>
                        <SelectItem value="billing" className="rounded-xl py-3 cursor-pointer">{t("billingFinance")}</SelectItem>
                        <SelectItem value="partnership" className="rounded-xl py-3 cursor-pointer">{t("partnerships")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="message" className="text-sm font-bold text-slate-900 ml-1">{t("message")}</Label>
                  <Textarea
                    id="message"
                    placeholder={t("messagePlaceholder")}
                    required
                    className="min-h-[160px] rounded-[32px] bg-slate-50 border-transparent focus:bg-white focus:border-brand-teal/30 focus:ring-0 transition-all p-8 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-16 bg-[#00D181] hover:bg-[#00B871] text-brand-dark-blue font-black text-lg rounded-4xl transition-all shadow-lg hover:shadow-[#00D181]/20 group"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-brand-dark-blue/20 border-t-brand-dark-blue rounded-full animate-spin" />
                      {t("sending")}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      {t("sendMessage")} <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  )}
                </Button>

                <p className="text-center text-[10px] text-slate-400 font-medium">
                  {t("agreeTo")} <Link href="/legal/privacy-policy" className="text-slate-600 underline">{tFooter("privacyPolicy")}</Link> and <Link href="/legal/terms-of-condition" className="text-slate-600 underline">{tFooter("termsOfService")}</Link>.
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Global Presence Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative h-[500px] w-full rounded-[40px] overflow-hidden shadow-2xl group"
        >
          {/* World Map Background */}
          <div
            className="absolute inset-0 bg-[#0A0A1F] transition-transform duration-1000 group-hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
            <div className="absolute inset-0 bg-brand-dark-blue/60 backdrop-blur-[1px]" />
          </div>

          {/* Map Overlay Card */}
          <div className="absolute bottom-12 left-12 max-w-sm">
            <Card className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] text-white">
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <Globe className="w-6 h-6 text-emerald-400" />
                {t("globalPresence")}
              </h3>
              <p className="text-white/70 leading-relaxed font-medium">
                {t("globalPresenceDesc")}
              </p>
            </Card>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
