"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Circle, Ellipsis, Gift, ExternalLink, Check } from "lucide-react"
import { useRewardStore } from "@/app/store/rewardStore"
import { usePointsStore } from "@/app/store/pointsStore"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// Import images
import Gifts from "../../../public/gifts.png"
import Chest from "../../../public/chest.png"

// Components
import Loader from "../components/loader"

// Sub-components
const PageHeader = () => (
  <div className="flex flex-col gap-1 items-center justify-center w-full h-[300px] bg-gradient-to-br from-green-400 to-green-600 text-white relative">
    <Image
      src={Gifts}
      height={300}
      width={300}
      alt="Rewards gifts"
      className="absolute right-9 opacity-90 hover:opacity-100 transition-opacity"
      priority
    />
    <h1 className="text-6xl font-bold mb-2 drop-shadow-lg">Get Rewards</h1>
    <h2 className="text-2xl font-bold text-green-100 uppercase tracking-wide">
      Unlock prizes and redeem rewards from a wide variety of choices!
    </h2>
  </div>
)

const PointsBalance = ({ points }) => (
  <section className="w-full max-w-4xl mx-auto my-8 px-4">
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Points Balance</h2>
      <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
        <div className="bg-yellow-500 rounded-full p-3">
          <span className="text-4xl">⭐</span>
        </div>
        <div className="flex flex-col">
          <span className="text-5xl font-bold text-gray-900">{points?.toLocaleString() || 0}</span>
          <span className="text-gray-600 text-lg">Available Points</span>
        </div>
      </div>
    </div>
  </section>
)

const DailyStreak = () => (
  <section className="w-full max-w-4xl mx-auto mb-8 px-4">
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Daily Streak</h2>
      <div className="flex gap-6 items-center justify-between">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 p-1">
            <div className="bg-white rounded-full p-4">
              <span className="text-5xl font-bold">0</span>
            </div>
          </div>
          <p className="mt-2 font-medium text-gray-600">Current Streak</p>
        </div>
        <div className="flex-1 max-w-md">
          <div className="flex gap-4 justify-center mb-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center">
                <Circle className="text-gray-400" />
                {i < 6 && <Ellipsis className="text-gray-300" />}
              </div>
            ))}
          </div>
          <p className="text-gray-600">
            Nice work! <strong>5 days away</strong> from unlocking your 500-point bonus.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Image
            src={Chest}
            width={80}
            height={80}
            alt="Streak bonus chest"
            className="drop-shadow-md"
          />
          <span className="mt-2 font-medium text-gray-600">Streak Bonus</span>
        </div>
      </div>
    </div>
  </section>
)

const RewardCard = ({ reward, onRedeem, disabled, isLoading }) => (
  <Card className="w-full max-w-sm transition-transform hover:scale-105">
    <CardHeader className="p-0">
      <div className="relative h-48 w-full">
        <Image
          src={reward.imageUrl}
          fill
          style={{ objectFit: 'cover' }}
          alt={reward.prize}
          className="rounded-t-lg"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full">
          <span className="text-yellow-400 mr-1">⭐</span>
          {reward.cost}
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{reward.prize}</h3>
      <p className="text-gray-600">{reward.description}</p>
    </CardContent>
    <CardFooter className="p-6 pt-0">
      <Button
        className="w-full font-medium"
        onClick={() => onRedeem(reward)}
        disabled={disabled}
        variant={disabled ? "secondary" : "default"}
      >
        {isLoading ? "Processing..." : disabled ? "Insufficient Points" : "Redeem"}
      </Button>
    </CardFooter>
  </Card>
)

const ClaimButton = ({ redemption, onClaim }) => {
  const [claiming, setClaiming] = useState(false)

  const handleClaim = async () => {
    setClaiming(true)
    try {
      await onClaim(redemption)
      toast.success("Successfully claimed reward!")
    } catch (error) {
      toast.error(error.message || "Failed to claim reward")
    } finally {
      setClaiming(false)
    }
  }

  if (redemption.claimed) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-green-600 flex items-center gap-1">
          <Check size={16} />
          Claimed
        </span>
        {redemption.claimUrl && (
          <a
            href={redemption.claimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            View <ExternalLink size={14} />
          </a>
        )}
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClaim}
      disabled={claiming}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        claiming && "cursor-not-allowed",
        !claiming && "hover:border-green-500 hover:text-green-600"
      )}
    >
      {claiming ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⭐</span> Claiming...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Gift size={16} /> Claim Reward
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-green-400 to-green-600 transform origin-left scale-x-0 transition-transform group-hover:scale-x-100" />
    </Button>
  )
}

const RedemptionHistory = ({ rewardHistory, onClaimReward }) => {
  if (!rewardHistory.length) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
          <Gift className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          No Rewards Redeemed Yet
        </h3>
        <p className="mt-1 text-gray-500">
          Complete quizzes and earn points to redeem exciting rewards!
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prize</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewardHistory.map((redemption) => (
            <TableRow
              key={redemption.id}
              className={cn(
                "transition-colors",
                redemption.claimed && "bg-green-50/50"
              )}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                    <Image
                      src={redemption.reward.imageUrl}
                      fill
                      style={{ objectFit: 'cover' }}
                      alt={redemption.reward.prize}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{redemption.reward.prize}</p>
                    <p className="text-sm text-gray-500">{redemption.reward.description}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  {redemption.pointsSpent.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  redemption.claimed
                    ? "bg-green-100 text-green-800"
                    : redemption.redeemed
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                )}>
                  {redemption.claimed
                    ? "Claimed"
                    : redemption.redeemed
                      ? "Ready to Claim"
                      : "Pending"}
                </span>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p className="font-medium">
                    {format(new Date(redemption.createdAt), "MMM d, yyyy")}
                  </p>
                  <p className="text-gray-500">
                    {format(new Date(redemption.createdAt), "h:mm a")}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {redemption.redeemed && !redemption.claimed && (
                  <ClaimButton
                    redemption={redemption}
                    onClaim={onClaimReward}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function RewardsPage() {
  const { fetchRewards, fetchRewardHistory, rewards, rewardHistory, isLoading, redeemReward } = useRewardStore()
  const { points, fetchPoints } = usePointsStore()

  useEffect(() => {
    fetchRewards()
    fetchPoints()
    fetchRewardHistory()
  }, [fetchRewards, fetchPoints, fetchRewardHistory])

  const featuredReward = rewards.find(reward => reward.featured === true)

  const handleRedeem = async (reward) => {
    if (points < reward.cost) {
      toast.error("You don't have enough points for this reward")
      return
    }
    // Add redemption logic here
  }

  const handleClaimReward = async (redemption) => {
    try {
      const response = await fetch(`/api/user/rewards/claim/${redemption.id}`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to claim reward')
      }

      // Refresh the reward history after claiming
      await fetchRewardHistory()
    } catch (error) {
      console.error('Error claiming reward:', error)
      throw error
    }
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />

      <main className="container mx-auto pb-20">
        <PointsBalance points={points} />
        <DailyStreak />

        {/* Featured Reward */}
        {featuredReward && (
          <section className="w-full max-w-4xl mx-auto mb-8 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Reward</h2>
              <div className="max-w-2xl mx-auto">
                <RewardCard
                  reward={featuredReward}
                  onRedeem={handleRedeem}
                  disabled={points < featuredReward.cost}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </section>
        )}

        {/* All Rewards */}
        <section className="w-full max-w-4xl mx-auto mb-8 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">All Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onRedeem={handleRedeem}
                  disabled={points < reward.cost}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Redemption History */}
        <section className="w-full max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Redemption History</h2>
            <RedemptionHistory
              rewardHistory={rewardHistory}
              onClaimReward={handleClaimReward}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
