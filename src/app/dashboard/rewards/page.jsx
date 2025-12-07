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
import { Star, StarOff } from "lucide-react"
import { useRewardStore } from "@/app/store/rewardStore"
import { RewardForm } from "@/components/features/admin/rewards/RewardForm"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { StatCard } from "@/components/ui/stat-card"

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

  // Add mock statistics to prevent ReferenceError
  const totalRedemptions = 0;
  const pendingClaims = 0;
  const mostPopularReward = "N/A";

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
    <div className="p-6">
      {/* Reward Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Redemptions"
          value={totalRedemptions}
          trend={+15}
        />
        <StatCard
          title="Pending Claims"
          value={pendingClaims}
          trend={-2}
        />
        <StatCard
          title="Popular Reward"
          value={mostPopularReward}
        />
      </div>

      {/* Reward Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Rewards Management</CardTitle>
            <Button
              onClick={() => setShowModal(true)}
            >
              Add New Reward
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Advanced Filters */}
          <div className="flex gap-4 mb-4">
            <Input placeholder="Search rewards..." />
            <Select>
              <option>Status</option>
              <option>Active</option>
              <option>Disabled</option>
            </Select>
            <Select>
              <option>Sort by</option>
              <option>Most Redeemed</option>
              <option>Cost</option>
              <option>Recent</option>
            </Select>
          </div>

          {/* Rewards Table */}
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
        </CardContent>
      </Card>

      {/* Batch Operations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Batch Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button>Enable Selected</Button>
            <Button>Disable Selected</Button>
            <Button>Delete Selected</Button>
            <Button>Export Data</Button>
          </div>
        </CardContent>
      </Card>

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
