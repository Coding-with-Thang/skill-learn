import { useState } from "react"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRewardStore } from "@/lib/store/rewardStore"
import { toast } from "sonner"

export default function AddRewards({ reward, onClose }) {
  const { updateReward } = useRewardStore()
  const [formData, setFormData] = useState({
    prize: reward?.prize || "",
    description: reward?.description || "",
    cost: reward?.cost || "",
    imageUrl: reward?.imageUrl || "",
    claimUrl: reward?.claimUrl || "",
    enabled: reward?.enabled ?? true,
    allowMultiple: reward?.allowMultiple ?? false,
    maxRedemptions: reward?.maxRedemptions || null,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateReward(reward.id, formData)
      toast.success("Reward updated successfully")
      onClose?.()
    } catch (error) {
      toast.error("Failed to update reward")
      console.error(error)
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Reward</DialogTitle>
        <DialogDescription>
          Make changes to the reward here. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <Label htmlFor="prize">Reward Name</Label>
            <Input
              id="prize"
              value={formData.prize}
              onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="claimUrl">
              Claim URL
              <span className="ml-1 text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Input
              id="claimUrl"
              type="url"
              value={formData.claimUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, claimUrl: e.target.value }))}
              placeholder="https://example.com/claim"
            />
            <p className="text-sm text-gray-500">
              Add a URL that users will be directed to after claiming this reward
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </DialogContent>
  )
}