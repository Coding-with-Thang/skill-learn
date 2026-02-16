"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  Linkedin,
  Globe,
  X
} from "lucide-react";
import { Button } from "@skill-learn/ui/components/button";
import { Input } from "@skill-learn/ui/components/input";
import { Label } from "@skill-learn/ui/components/label";
import { Textarea } from "@skill-learn/ui/components/textarea";

export default function ApplyPage() {
  const t = useTranslations("careers");
  const { jobId } = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // In a real app, we'd send data to the backend here
    }, 2000);
  };

  const id = Array.isArray(jobId) ? jobId[0] : jobId;
  const formattedJobId = id?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-slate-200 border border-slate-100"
        >
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10 text-teal-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t("applicationSent")}</h2>
          <p className="text-slate-500 mb-10 leading-relaxed">{t("thankYouApplying", { role: formattedJobId ?? "" })}</p>
          <Link href="/careers">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-4xl h-14">
              {t("returnToCareers")}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 md:py-20">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Left Side: Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <Link href={`/careers/${jobId}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("backToRole")}
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{t("applyFor")} <br /><span className="text-teal-600">{formattedJobId}</span></h1>
              <p className="text-slate-500">
                {t("joinOurMission")}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 p-4 bg-white rounded-4xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t("remoteFirst")}</h4>
                  <p className="text-xs text-slate-500 mt-1">{t("remoteFirstDesc")}</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-white rounded-4xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t("growthBudget")}</h4>
                  <p className="text-xs text-slate-500 mt-1">{t("growthBudgetDesc")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("firstName")}</Label>
                    <Input id="firstName" placeholder={t("firstNamePlaceholder")} required className="rounded-xl border-slate-200 h-12 focus:border-teal-500 focus:ring-teal-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("lastName")}</Label>
                    <Input id="lastName" placeholder={t("lastNamePlaceholder")} required className="rounded-xl border-slate-200 h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("emailAddress")}</Label>
                  <Input id="email" type="email" placeholder={t("emailPlaceholder")} required className="rounded-xl border-slate-200 h-12" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phoneNumber")}</Label>
                  <Input id="phone" type="tel" placeholder={t("phonePlaceholder")} className="rounded-xl border-slate-200 h-12" />
                </div>

                <div className="space-y-2">
                  <Label>{t("resumeCv")}</Label>
                  <div
                    className={`border-2 border-dashed rounded-4xl p-8 text-center transition-colors cursor-pointer ${file ? "border-teal-500 bg-teal-50/30" : "border-slate-200 hover:border-teal-300"
                      }`}
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-teal-600" />
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-900">{file.name}</p>
                          <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          className="ml-4 p-1 rounded-full hover:bg-slate-200"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        >
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-700">{t("clickToUpload")}</p>
                        <p className="text-xs text-slate-400 mt-1">{t("pdfDocxUpTo10mb")}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder={t("linkedInPlaceholder")} className="pl-10 rounded-xl border-slate-200 h-12" />
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder={t("portfolioPlaceholder")} className="pl-10 rounded-xl border-slate-200 h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t("whyInterested")}</Label>
                  <Textarea
                    id="message"
                    placeholder={t("whyInterestedPlaceholder")}
                    rows={4}
                    className="rounded-4xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 p-4"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-14 rounded-4xl shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("submittingApplication")}
                    </>
                  ) : (
                    t("submitApplication")
                  )}
                </Button>

                <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                  {t("secureApplication")}
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
