"use client";

import { useState } from "react";
import { updateSystemSetting } from "@/lib/actions/settings";
import { toast } from "sonner";

const SETTING_CATEGORIES = {
  "Points System": [
    { key: "DAILY_POINTS_LIMIT", label: "Daily Points Limit", description: "Maximum points a user can earn per day" },
    { key: "POINTS_FOR_PASSING_QUIZ", label: "Points for Passing Quiz", description: "Base points awarded for passing a quiz" },
    { key: "PERFECT_SCORE_BONUS", label: "Perfect Score Bonus", description: "Additional points awarded for achieving a perfect score" },
  ],
  "Quiz Settings": [
    { key: "DEFAULT_QUIZ_TIME_LIMIT", label: "Default Quiz Time Limit", description: "Time limit in seconds for quizzes" },
    { key: "DEFAULT_PASSING_SCORE", label: "Default Passing Score", description: "Minimum percentage required to pass a quiz" },
  ],
  "Streak Settings": [
    { key: "STREAK_MILESTONE_INTERVAL", label: "Streak Milestone Interval", description: "Number of days for streak milestone bonus" },
    { key: "STREAK_MILESTONE_BONUS", label: "Streak Milestone Bonus", description: "Points awarded for reaching streak milestone" },
    { key: "STREAK_RESET_HOUR", label: "Streak Reset Hour", description: "Hour of day (0-23) when streaks reset" },
    { key: "INACTIVITY_DAYS_FOR_STREAK_LOSS", label: "Inactivity Days for Streak Loss", description: "Days of inactivity before streak resets" },
  ],
};

export default function SettingsForm({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleSettingChange = async (key, value) => {
    try {
      setSaving(true);
      const category = Object.keys(SETTING_CATEGORIES).find(cat =>
        SETTING_CATEGORIES[cat].some(setting => setting.key === key)
      );
      const setting = SETTING_CATEGORIES[category].find(s => s.key === key);

      await updateSystemSetting(key, value, setting.description);
      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success("Setting updated successfully");
    } catch (error) {
      toast.error("Failed to update setting");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {Object.entries(SETTING_CATEGORIES).map(([category, categorySettings]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{category}</h2>
          <div className="grid gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            {categorySettings.map(({ key, label, description }) => (
              <div key={key} className="grid gap-2">
                <label className="font-medium text-sm">
                  {label}
                  <span className="text-gray-500 text-xs ml-2">({description})</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings[key] || ""}
                    onChange={(e) => handleSettingChange(key, e.target.value)}
                    className="border rounded px-3 py-2 w-full dark:bg-gray-700"
                    disabled={saving}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
} 