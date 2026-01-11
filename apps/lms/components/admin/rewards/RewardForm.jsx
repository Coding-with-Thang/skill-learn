"use client"

import { useEffect } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@skill-learn/ui/components/button"
import { Form } from "@skill-learn/ui/components/form"
import { FormInput } from "@skill-learn/ui/components/form-input"
import { FormTextarea } from "@skill-learn/ui/components/form-textarea"
import { FormSwitch } from "@skill-learn/ui/components/form-switch"
import { Label } from "@skill-learn/ui/components/label"
import { toast } from "sonner"
import { useRewardStore } from "@skill-learn/lib/stores/rewardStore.js"
import { Uploader } from "@/components/file-uploader/Uploader"

export function RewardForm({ reward, onClose }) {
  const { addReward, updateReward } = useRewardStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    prize: '',
    description: '',
    imageUrl: '',
    fileKey: '',
    cost: '',
    claimUrl: '',
    enabled: true,
    allowMultiple: false,
    maxRedemptions: 1
  })

  const watchedAllowMultiple = form.watch("allowMultiple")
  const watchedImageUrl = form.watch("imageUrl")

  useEffect(() => {
    if (reward) {
      form.reset({
        prize: reward.prize,
        description: reward.description,
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
      // Format the data before sending
      const submitData = {
        ...data,
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
        toast.success("Reward updated successfully")
      } else {
        await addReward(submitData)
        toast.success("Reward added successfully")
      }
      onClose()
    } catch (error) {
      toast.error(error.message || "Something went wrong")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput
            name="prize"
            label="Reward Name"
            placeholder="Enter reward name"
            required
          />

          <FormInput
            name="cost"
            label="Points Required"
            type="number"
            min="0"
            placeholder="10000"
            required
          />
        </div>

        <FormTextarea
          name="description"
          label="Description"
          placeholder="Enter description"
          required
        />

        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
            Reward Image <span className="text-red-500">*</span>
          </Label>
          <Uploader
            uploadEndpoint="/api/admin/rewards/upload"
            value={formData.imageUrl || ""}
            onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url || "" }))}
            onUploadComplete={(upload) => {
              // upload: { url, path }
              // store storage path as fileKey for database
              if (upload?.path) {
                setFormData(prev => ({ ...prev, fileKey: upload.path }))
              }
            }}
          />
        </div>

        <FormInput
          name="claimUrl"
          label="Claim URL"
          type="url"
          placeholder="https://example.com/claim"
          description="Optional"
        />

        <div className="space-y-4">
          <FormSwitch
            name="enabled"
            label="Enable Reward"
            description="Make this reward available for redemption"
          />

          <FormSwitch
            name="allowMultiple"
            label="Allow Multiple Redemptions"
            description="Allow users to redeem this reward multiple times"
          />

          {watchedAllowMultiple && (
            <FormInput
              name="maxRedemptions"
              label="Maximum Redemptions"
              type="number"
              min="1"
              placeholder="Enter max redemptions"
              description="Leave empty for unlimited"
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
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="min-w-[100px]"
          >
            {form.formState.isSubmitting
              ? reward
                ? "Saving..."
                : "Adding..."
              : reward
                ? "Save Changes"
                : "Add Reward"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
