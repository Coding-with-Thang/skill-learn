"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useDebounce } from "@skill-learn/lib/hooks/useDebounce"
import Image from "next/image"
import { Button } from "@skill-learn/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@skill-learn/ui/components/dialog"
import { Input } from "@skill-learn/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@skill-learn/ui/components/table"
import { Star, StarOff } from "lucide-react"
import { useRewardStore } from "@skill-learn/lib/stores/rewardStore"
import { RewardForm } from "@/components/admin/rewards/RewardForm"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@skill-learn/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@skill-learn/ui/components/select"
import { StatCard } from "@skill-learn/ui/components/stat-card"

type RewardItem = { id: string; prize: string; description?: string };

export default function RewardsAdminPage() {
  const t = useTranslations("adminRewards")
  const { fetchRewards, rewards, isLoading, updateReward, deleteReward } = useRewardStore()
  const [showModal, setShowModal] = useState(false)
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const searchTerm = useDebounce(searchInput, 300)
  const [confirmDelete, setConfirmDelete] = useState<RewardItem | null>(null)

  useEffect(() => {
    fetchRewards()
  }, [fetchRewards])

  const filteredRewards = rewards.filter(reward =>
    reward.prize.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (reward: RewardItem) => {
    setEditingReward(reward)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingReward(null)
  }

  const handleDelete = async (reward: RewardItem) => {
    try {
      await deleteReward(reward.id)
      toast.success(t("toastDeleted"))
      setConfirmDelete(null)
    } catch (error) {
      toast.error(t("errorDelete"))
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
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Reward Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title={t("totalRedemptions")}
          value={totalRedemptions}
          trend={+15}
        />
        <StatCard
          title={t("pendingClaims")}
          value={pendingClaims}
          trend={-2}
        />
        <StatCard
          title={t("popularReward")}
          value={mostPopularReward}
        />
      </div>

      {/* Reward Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("rewardsManagement")}</CardTitle>
            <Button
              onClick={() => setShowModal(true)}
            >
              {t("addNewReward")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Advanced Filters */}
          <div className="flex gap-4 mb-4">
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Select>
              <option>{t("status")}</option>
              <option>{t("active")}</option>
              <option>{t("disabled")}</option>
            </Select>
            <Select>
              <option>{t("sortBy")}</option>
              <option>{t("mostRedeemed")}</option>
              <option>{t("cost")}</option>
              <option>{t("recent")}</option>
            </Select>
          </div>

          {/* Rewards Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("reward")}</TableHead>
                <TableHead>{t("description")}</TableHead>
                <TableHead className="text-right">{t("cost")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-center">{t("featured")}</TableHead>
                <TableHead className="text-center">{t("multiple")}</TableHead>
                <TableHead className="text-center">{t("actions")}</TableHead>
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
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 relative">
                        <Image
                          src={reward.imageUrl}
                          alt={reward.prize}
                          fill
                          className="object-cover"
                          sizes="40px"
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
                      {reward.enabled ? t("active") : t("disabled")}
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
                          ? t("maxRedemptions", { count: reward.maxRedemptions })
                          : t("unlimited")
                        : t("once")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(reward)}
                      >
                        {t("edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmDelete(reward)}
                      >
                        {t("delete")}
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
          <CardTitle>{t("batchOperations")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button>{t("enableSelected")}</Button>
            <Button>{t("disableSelected")}</Button>
            <Button>{t("deleteSelected")}</Button>
            <Button>{t("exportData")}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px] z-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? '{t("edit")} Reward' : 'Add New Reward'}
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
            <DialogTitle>{t("deleteReward")}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            {t("deleteConfirm", { prize: confirmDelete?.prize ?? "" })}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
            >
              {t("delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
