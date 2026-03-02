"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@skill-learn/ui/components/card";
import { Star, Flame, BookOpen, Medal, Rocket, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AchievementsWidget() {
  const t = useTranslations("home.achievements");
  const achievements = [
    { label: t("labels.perfectStart"), icon: Star, color: "bg-yellow-100 text-yellow-600" },
    { label: t("labels.fiveDayStreak"), icon: Flame, color: "bg-orange-100 text-orange-600" },
    { label: t("labels.tenLessons"), icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { label: t("labels.topEarner"), icon: Medal, color: "bg-gray-100 text-gray-600" },
    { label: t("labels.quickLearner"), icon: Rocket, color: "bg-purple-100 text-purple-600", opacity: "opacity-50" }, // Locked state example
    { label: t("labels.quizMaster"), icon: ShieldCheck, color: "bg-green-100 text-green-600", opacity: "opacity-50" },
  ];

  return (
    <Card className="w-full h-full bg-white rounded-3xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {achievements.map((item, idx) => (
            <div key={idx} className={`flex flex-col items-center gap-2 ${item.opacity || ''}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-xs text-center font-medium text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
