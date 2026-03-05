"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@skill-learn/ui/components/button"
import { Form } from "@skill-learn/ui/components/form"
import { FormInput } from "@skill-learn/ui/components/form-input"
import { FormTextarea } from "@skill-learn/ui/components/form-textarea"
import { FormSwitch } from "@skill-learn/ui/components/form-switch"
import { Label } from "@skill-learn/ui/components/label"
import { toast } from "sonner"
import { useRewardStore } from "@skill-learn/lib/stores/rewardStore"
import api from "@skill-learn/lib/utils/axios"
import { Uploader } from "@skill-learn/ui/components/file-uploader"
import { z } from "zod"
import { rewardCreateSchema } from "@skill-learn/lib/zodSchemas"

// Form schema: coerce cost and maxRedemptions from input string, add optional claimUrl
const rewardFormSchema = rewardCreateSchema.extend({
  cost: z.coerce.number().int("Cost must be an integer").positive("Cost must be positive"),
  claimUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  maxRedemptions: z.preprocess(
    (v) => {
      if (v === "" || v === undefined) return null
      if (typeof v === "number") return Number.isNaN(v) ? null : v
      const n = Number(v)
      return Number.isNaN(n) ? null : n
    },
    z.number().int().positive().nullable().optional()
  ),
})

const defaultValues = {
  prize: "",
  description: "",
  prizeFr: "",
  descriptionFr: "",
  imageUrl: "",
  fileKey: "",
  cost: "",
  claimUrl: "",
  enabled: true,
  allowMultiple: false,
  maxRedemptions: 1,
}

export function RewardForm({ reward, onClose }) {
  const t = useTranslations("adminRewards")
  const { addReward, updateReward } = useRewardStore()
  const form = useForm({
    resolver: zodResolver(rewardFormSchema),
    defaultValues,
  })

  const watchedAllowMultiple = form.watch("allowMultiple")
  const watchedImageUrl = form.watch("imageUrl")

  useEffect(() => {
    if (reward) {
      const prizeJson = (reward as { prizeJson?: Record<string, string> }).prizeJson;
      const descriptionJson = (reward as { descriptionJson?: Record<string, string> }).descriptionJson;
      form.reset({
        prize: reward.prize,
        description: reward.description,
        prizeFr: prizeJson?.fr || "",
        descriptionFr: descriptionJson?.fr || "",
        imageUrl: reward.imageUrl || '',
        fileKey: reward.fileKey || '',
        cost: reward.cost,
        claimUrl: reward.claimUrl || "",
        enabled: reward.enabled,
        allowMultiple: reward.allowMultiple,
        maxRedemptions: reward.maxRedemptions,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reward])

  // Clear maxRedemptions when allowMultiple is disabled
  useEffect(() => {
    if (!watchedAllowMultiple) {
      form.setValue("maxRedemptions", 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedAllowMultiple])

  const onSubmit = async (data) => {
    try {
      const submitData = {
        ...data,
        prizeJson: { en: data.prize, ...(data.prizeFr ? { fr: data.prizeFr } : {}) },
        descriptionJson: data.description || data.descriptionFr
          ? { ...(data.description ? { en: data.description } : {}), ...(data.descriptionFr ? { fr: data.descriptionFr } : {}) }
          : undefined,
        cost: typeof data.cost === "string" ? parseInt(data.cost, 10) : data.cost,
        maxRedemptions:
          data.allowMultiple && data.maxRedemptions
            ? typeof data.maxRedemptions === "string"
              ? parseInt(data.maxRedemptions, 10)
              : data.maxRedemptions
            : null,
      }

      if (reward) {
        await updateReward(reward.id, submitData)
        toast.success(t("toastUpdated"))
      } else {
        await addReward(submitData)
        toast.success(t("toastAdded"))
      }
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toastError"))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput
            name="prize"
            label={t("rewardName")}
            placeholder={t("rewardNamePlaceholder")}
            required
          />

          <FormInput
            name="cost"
            label={t("pointsRequired")}
            type="number"
            min="0"
            placeholder={t("pointsPlaceholder")}
            required
          />
        </div>

        <FormTextarea
          name="description"
          label={t("descriptionLabel")}
          placeholder={t("descriptionPlaceholder")}
          required
        />

        <div className="rounded-lg border p-3 bg-muted/30">
          <p className="text-sm font-medium mb-2">{t("translationsSection") ?? "Translations (French)"}</p>
          <FormInput
            name="prizeFr"
            label={t("prizeFr") ?? "Prize name (French)"}
            placeholder={t("prizeFrPlaceholder") ?? "French prize name (optional)"}
          />
          <div className="mt-2">
            <FormTextarea
              name="descriptionFr"
              label={t("descriptionFr") ?? "Description (French)"}
              placeholder={t("descriptionFrPlaceholder") ?? "French description (optional)"}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
            {t("rewardImage")} <span className="text-red-500">*</span>
          </Label>
          <Uploader
            api={api}
            uploadEndpoint="/api/admin/rewards/upload"
            mediaListEndpoint="/api/admin/media"
            value={watchedImageUrl || ""}
            onChange={(url) => form.setValue("imageUrl", url || "")}
            onUploadComplete={(upload) => {
              if (upload?.path) form.setValue("fileKey", upload.path)
            }}
          />
        </div>

        <FormInput
          name="claimUrl"
          label={t("claimUrl")}
          type="url"
          placeholder={t("claimUrlPlaceholder")}
          description={t("optional")}
        />

        <div className="space-y-4">
          <FormSwitch
            name="enabled"
            label={t("enableReward")}
            description={t("enableRewardDescription")}
          />

          <FormSwitch
            name="allowMultiple"
            label={t("allowMultiple")}
            description={t("allowMultipleDescription")}
          />

          {watchedAllowMultiple && (
            <FormInput
              name="maxRedemptions"
              label={t("maxRedemptions")}
              type="number"
              min="1"
              placeholder={t("maxRedemptionsPlaceholder")}
              description={t("maxRedemptionsHint")}
              className="w-32"
            />
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={form.formState.isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="min-w-[100px]"
          >
            {form.formState.isSubmitting
              ? reward
                ? t("saving")
                : t("adding")
              : reward
                ? t("saveChanges")
                : t("addReward")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
