import { useState, useEffect } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRewardStore } from "@/app/store/rewardStore"

export function RewardForm({ reward, onClose }) {
  const { addReward, updateReward } = useRewardStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    prize: '',
    description: '',
    imageUrl: '',
    cost: '',
    claimUrl: '',
    enabled: true,
    allowMultiple: false,
    maxRedemptions: 1
  })

  useEffect(() => {
    if (reward) {
      setFormData({
        prize: reward.prize,
        description: reward.description,
        imageUrl: reward.imageUrl,
        cost: reward.cost,
        claimUrl: reward.claimUrl || '',
        enabled: reward.enabled,
        allowMultiple: reward.allowMultiple,
        maxRedemptions: reward.maxRedemptions
      })
    }
  }, [reward])

  const handleChange = (field) => (e) => {
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value

    // Handle number fields
    if (field === 'cost' || field === 'maxRedemptions') {
      value = value === '' ? '' : parseInt(value, 10)
    }

    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!formData.prize || !formData.description || !formData.cost) {
        throw new Error('Please fill in all required fields')
      }

      // Format the data before sending
      const submitData = {
        ...formData,
        cost: parseInt(formData.cost, 10),
        maxRedemptions: formData.allowMultiple && formData.maxRedemptions
          ? parseInt(formData.maxRedemptions, 10)
          : null
      };

      if (reward) {
        await updateReward(reward.id, submitData);
      } else {
        await addReward(submitData);
      }

      toast.success(reward ? 'Reward updated successfully' : 'Reward added successfully')
      onClose()
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prize" className="text-sm font-medium text-gray-700">
            Reward Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="prize"
            value={formData.prize}
            onChange={handleChange('prize')}
            placeholder="Enter reward name"
            className="transition-colors focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost" className="text-sm font-medium text-gray-700">
            Points Required <span className="text-red-500">*</span>
          </Label>
          <Input
            id="cost"
            type="number"
            min="0"
            value={formData.cost}
            onChange={handleChange('cost')}
            placeholder="10000"
            className="transition-colors focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </Label>
        <Input
          id="description"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="Enter description"
          className="transition-colors focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
          Image URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={handleChange('imageUrl')}
          placeholder="https://example.com/image.jpg"
          className="transition-colors focus:border-blue-500"
          required
        />
        {formData.imageUrl && (
          <div className="mt-2 p-2 border rounded-md">
            <div className="relative h-32 w-full rounded-md overflow-hidden">
              <Image
                src={formData.imageUrl}
                alt="Preview"
                fill
                className="object-cover"
                sizes="(max-width: 600px) 100vw, 600px"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="claimUrl" className="text-sm font-medium text-gray-700">
          Claim URL
          <span className="ml-1 text-gray-400 text-sm">(Optional)</span>
        </Label>
        <Input
          id="claimUrl"
          type="url"
          value={formData.claimUrl}
          onChange={handleChange('claimUrl')}
          placeholder="https://example.com/claim"
          className="transition-colors focus:border-blue-500"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="enabled" className="text-sm font-medium text-gray-700">
            Enable Reward
          </Label>
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="allowMultiple" className="text-sm font-medium text-gray-700">
            Allow Multiple Redemptions
          </Label>
          <Switch
            id="allowMultiple"
            checked={formData.allowMultiple}
            onCheckedChange={(checked) => setFormData(prev => ({
              ...prev,
              allowMultiple: checked,
              maxRedemptions: checked ? prev.maxRedemptions : 1
            }))}
          />
        </div>

        {formData.allowMultiple && (
          <div className="space-y-2">
            <Label htmlFor="maxRedemptions" className="text-sm font-medium text-gray-700">
              Maximum Redemptions
              <span className="ml-1 text-gray-400 text-sm">(Leave empty for unlimited)</span>
            </Label>
            <Input
              id="maxRedemptions"
              type="number"
              min="1"
              value={formData.maxRedemptions || ''}
              onChange={handleChange('maxRedemptions')}
              placeholder="Enter max redemptions"
              className="w-32 transition-colors focus:border-blue-500"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {reward ? 'Saving...' : 'Adding...'}
            </div>
          ) : (
            reward ? 'Save Changes' : 'Add Reward'
          )}
        </Button>
      </div>
    </form>
  )
} 