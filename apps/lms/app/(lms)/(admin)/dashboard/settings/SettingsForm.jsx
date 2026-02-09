"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { updateSystemSetting } from "@/lib/actions/settings"
import { toast } from "sonner"
import { Form } from "@skill-learn/ui/components/form"
import { FormInput } from "@skill-learn/ui/components/form-input"
import { Button } from "@skill-learn/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@skill-learn/ui/components/card"
import { motion, AnimatePresence } from "framer-motion"
import { Coins, GraduationCap, Zap, Settings2, Loader2, Sparkles, Save, RotateCcw } from "lucide-react"

// Static Tailwind class per color so JIT can generate them (no dynamic class names)
const CATEGORY_BG_CLASS = {
  amber: "bg-amber-500/10",
  blue: "bg-blue-500/10",
  violet: "bg-violet-500/10",
}

const SETTING_CATEGORIES = {
  "Points System": {
    icon: <Coins className="w-5 h-5 text-amber-500" />,
    color: "amber",
    settings: [
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
    ]
  },
  "Quiz Settings": {
    icon: <GraduationCap className="w-5 h-5 text-blue-500" />,
    color: "blue",
    settings: [
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
    ]
  },
  "Streak Settings": {
    icon: <Zap className="w-5 h-5 text-violet-500" />,
    color: "violet",
    settings: [
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
    ]
  },
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

  const schema = createSettingsSchema(initialSettings)
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialSettings || {},
    mode: "onChange",
  })

  // Check if form is dirty
  const isDirty = form.formState.isDirty

  const onSubmit = async (data) => {
    try {
      setSaving(true)

      // Get only dirty fields to avoid unnecessary updates
      const dirtyFields = Object.keys(form.formState.dirtyFields)

      if (dirtyFields.length === 0) {
        toast.info("No changes to save")
        return
      }

      // We need to loop through each dirty field and update it
      const updatePromises = dirtyFields.map(key => {
        let settingInfo = null
        Object.values(SETTING_CATEGORIES).forEach(cat => {
          const found = cat.settings.find(s => s.key === key)
          if (found) settingInfo = found
        })

        return updateSystemSetting(key, data[key], settingInfo?.description || "")
      })

      await Promise.all(updatePromises)

      toast.success(`${dirtyFields.length} settings updated successfully`)
      form.reset(data) // Reset form state with new values
    } catch (error) {
      toast.error("Failed to update settings")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    form.reset(initialSettings)
    toast.info("Changes discarded")
  }

  return (
    <Form {...form}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-32"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Settings2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">System Configuration</h1>
            <p className="text-sm text-muted-foreground">Global variables that control the platform behavior and mechanics</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <AnimatePresence mode="popLayout">
            {Object.entries(SETTING_CATEGORIES).map(([category, info], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-none border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group">
                  <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${CATEGORY_BG_CLASS[info.color] ?? "bg-muted/20"} group-hover:scale-110 transition-transform`}>
                        {info.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">{category}</CardTitle>
                        <CardDescription className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                          Configure {category.toLowerCase()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {info.settings.map(({ key, label, description }) => (
                        <div key={key} className="relative space-y-2 group/input">
                          <label className="text-xs font-black uppercase tracking-tighter text-muted-foreground/80 group-focus-within/input:text-primary transition-colors mb-1">
                            {label}
                          </label>
                          <FormInput
                            name={key}
                            disabled={saving}
                            className="h-10 rounded-xl bg-background/50 border-border/40 focus:border-primary/50 focus:ring-primary/20 transition-all font-mono text-sm"
                          />
                          <p className="text-[10px] leading-relaxed text-muted-foreground font-medium pr-2">
                            {description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <Card className="bg-primary/5 border-primary/20 shadow-none">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-primary/20 rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs font-bold text-primary/80 uppercase tracking-widest leading-relaxed">
                Default settings are applied globally and instantly across all active users.
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4 border-t border-border/30 pt-10 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={saving || !isDirty}
              className="rounded-xl font-bold gap-2 px-6"
            >
              <RotateCcw className="w-4 h-4" />
              Discard Changes
            </Button>
            <Button
              type="submit"
              disabled={saving || !isDirty}
              className="rounded-xl font-black gap-2 px-10 py-6 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving Changes..." : "Apply All Settings"}
            </Button>
          </div>
        </form>

        {/* Floating Save Bar */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
            >
              <div className="bg-background/80 backdrop-blur-xl border border-primary/30 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-4xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm font-bold">You have unsaved changes</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={saving}
                    className="rounded-xl font-bold gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={saving}
                    className="rounded-xl font-black gap-2 px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Form>
  )
}


