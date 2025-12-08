"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Flame, BookOpen, Medal, Rocket, ShieldCheck } from "lucide-react";

export default function AchievementsWidget() {
  const achievements = [
    { label: "Perfect Start", icon: Star, color: "bg-yellow-100 text-yellow-600" },
    { label: "5 Day Streak", icon: Flame, color: "bg-orange-100 text-orange-600" },
    { label: "10 Lessons", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { label: "Top Earner", icon: Medal, color: "bg-gray-100 text-gray-600" },
    { label: "Quick Learner", icon: Rocket, color: "bg-purple-100 text-purple-600", opacity: "opacity-50" }, // Locked state example
    { label: "Quiz Master", icon: ShieldCheck, color: "bg-green-100 text-green-600", opacity: "opacity-50" },
  ];

  return (
    <Card className="w-full h-full bg-white rounded-3xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Achievements</CardTitle>
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
