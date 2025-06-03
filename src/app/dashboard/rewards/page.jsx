"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Star, StarOff, ExternalLink, Search, Plus } from "lucide-react"
import { useRewardStore } from "@/app/store/rewardStore"
import { RewardForm } from "@/app/components/Admin/rewards/RewardForm"
import { toast } from "sonner"

export default function RewardsAdminPage() {
  const { fetchRewards, rewards, isLoading, updateReward, deleteReward } = useRewardStore()
  const [showModal, setShowModal] = useState(false)
  const [editingReward, setEditingReward] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    fetchRewards()
  }, [fetchRewards])

  const filteredRewards = rewards.filter(reward =>
    reward.prize.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (reward) => {
    setEditingReward(reward)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingReward(null)
  }

  const handleDelete = async (reward) => {
    try {
      await deleteReward(reward.id)
      toast.success('Reward deleted successfully')
      setConfirmDelete(null)
    } catch (error) {
      toast.error('Failed to delete reward')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Rewards Management</h1>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Reward
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reward</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead className="text-center">Multiple</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRewards.map((reward) => (
                <TableRow
                  key={reward.id}
                  className={`
                    ${reward.featured ? "bg-yellow-50" : ""}
                    ${!reward.enabled ? "opacity-60" : ""}
                  `}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={reward.imageUrl}
                          alt={reward.prize}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {reward.prize}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {reward.description}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat().format(reward.cost)}
                  </TableCell>
                  <TableCell>
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${reward.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"}
                    `}>
                      {reward.enabled ? "Active" : "Disabled"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateReward(reward.id, { featured: !reward.featured })}
                      className={reward.featured ? "text-yellow-600" : "text-gray-400"}
                    >
                      {reward.featured ? (
                        <Star className="h-5 w-5 fill-current" />
                      ) : (
                        <StarOff className="h-5 w-5" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${reward.allowMultiple
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"}
                    `}>
                      {reward.allowMultiple
                        ? reward.maxRedemptions
                          ? `Max ${reward.maxRedemptions}`
                          : "Unlimited"
                        : "Once"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(reward)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmDelete(reward)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? 'Edit Reward' : 'Add New Reward'}
            </DialogTitle>
          </DialogHeader>
          <RewardForm
            reward={editingReward}
            onClose={handleCloseModal}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reward</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete "{confirmDelete?.prize}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(confirmDelete)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
