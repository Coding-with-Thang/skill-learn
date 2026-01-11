"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { updateSystemSetting } from "@/lib/actions/settings"
import { toast } from "sonner"
import { Form } from "@skill-learn/ui/components/form"
import { FormInput } from "@skill-learn/ui/components/form-input"
import { FormDescription } from "@skill-learn/ui/components/form"

const SETTING_CATEGORIES = {
  "Points System": [
    {
      key: "DAILY_POINTS_LIMIT",
      label: "Daily Points Limit",
      description: "Maximum points a user can earn per day",
    },
    {
      key: "POINTS_FOR_PASSING_QUIZ",
      label: "Points for Passing Quiz",
      description: "Base points awarded for passing a quiz",
    },
    {
      key: "PERFECT_SCORE_BONUS",
      label: "Perfect Score Bonus",
      description: "Additional points awarded for achieving a perfect score",
    },
  ],
  "Quiz Settings": [
    {
      key: "DEFAULT_QUIZ_TIME_LIMIT",
      label: "Default Quiz Time Limit",
      description: "Time limit in seconds for quizzes",
    },
    {
      key: "DEFAULT_PASSING_SCORE",
      label: "Default Passing Score",
      description: "Minimum percentage required to pass a quiz",
    },
  ],
  "Streak Settings": [
    {
      key: "STREAK_MILESTONE_INTERVAL",
      label: "Streak Milestone Interval",
      description: "Number of days for streak milestone bonus",
    },
    {
      key: "STREAK_MILESTONE_BONUS",
      label: "Streak Milestone Bonus",
      description: "Points awarded for reaching streak milestone",
    },
    {
      key: "STREAK_RESET_HOUR",
      label: "Streak Reset Hour",
      description: "Hour of day (0-23) when streaks reset",
    },
    {
      key: "INACTIVITY_DAYS_FOR_STREAK_LOSS",
      label: "Inactivity Days for Streak Loss",
      description: "Days of inactivity before streak resets",
    },
  ],
}

// Create a dynamic schema based on initial settings
const createSettingsSchema = (initialSettings) => {
  const schemaShape = {}
  Object.keys(initialSettings || {}).forEach((key) => {
    schemaShape[key] = z.string().min(1, "Setting value is required")
  })
  return z.object(schemaShape)
}

export default function SettingsForm({ initialSettings }) {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState(initialSettings)

  const schema = createSettingsSchema(initialSettings)
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialSettings || {},
  })

  const handleSettingChange = async (key, value) => {
    try {
      setSaving(true)
      const category = Object.keys(SETTING_CATEGORIES).find((cat) =>
        SETTING_CATEGORIES[cat].some((setting) => setting.key === key)
      )
      const setting = SETTING_CATEGORIES[category].find((s) => s.key === key)

      await updateSystemSetting(key, value, setting.description)
      setSettings((prev) => ({ ...prev, [key]: value }))
      form.setValue(key, value)
      toast.success("Setting updated successfully")
    } catch (error) {
      toast.error("Failed to update setting")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8">
        {Object.entries(SETTING_CATEGORIES).map(([category, categorySettings]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{category}</h2>
            <div className="grid gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              {categorySettings.map(({ key, label, description }) => (
                <FormInput
                  key={key}
                  name={key}
                  label={label}
                  description={description}
                  disabled={saving}
                  onBlur={(e) => {
                    const value = e.target.value
                    if (value !== settings[key]) {
                      handleSettingChange(key, value)
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </form>
    </Form>
  )
}
