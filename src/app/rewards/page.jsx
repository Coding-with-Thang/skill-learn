"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Circle, Ellipsis, Gift, Check } from "lucide-react"
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
import api from "@/utils/axios";

// Import images
import Gifts from "../../../public/gifts.png"
import Chest from "../../../public/chest.png"

// Components
import Loader from "../components/loader"

// Sub-components
const PageHeader = () => (
  <div className="flex flex-col gap-1 items-center justify-center w-full min-h-[220px] h-[220px] sm:h-[300px] bg-gradient-to-br from-green-400 to-yellow-200 text-white relative overflow-hidden">
    <Image
      src={Gifts}
      height={180}
      width={180}
      alt="Rewards gifts"
      className="absolute right-2 bottom-2 sm:right-9 sm:bottom-auto opacity-90 hover:opacity-100 transition-opacity w-32 h-32 sm:w-[300px] sm:h-[300px]"
      priority
    />
    <h1 className="text-3xl sm:text-6xl font-bold mb-2 drop-shadow-lg text-center z-10">Get Rewards</h1>
    <h2 className="text-lg sm:text-2xl font-bold text-green-100 uppercase tracking-wide text-center z-10">
      Earn points to unlock and redeem rewards from a wide variety of choices!
    </h2>
  </div>
)

const PointsBalance = ({ points }) => (
  <section className="w-full max-w-4xl mx-auto my-8 px-2 sm:px-4">
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-100">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Your Points Balance</h2>
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 sm:p-6 rounded-xl border border-yellow-200">
        <div className="bg-yellow-500 rounded-full p-3 mb-2 sm:mb-0">
          <span className="text-3xl sm:text-4xl">⭐</span>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-4xl sm:text-5xl font-bold text-gray-900">
            {new Intl.NumberFormat('en-US').format(points || 0)}
          </span>
          <span className="text-gray-600 text-base sm:text-lg">Available Points</span>
        </div>
      </div>
    </div>
  </section>
)

const DailyStreak = () => (
  <section className="w-full max-w-4xl mx-auto mb-8 px-2 sm:px-4">
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-100">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Daily Streak</h2>
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 p-1">
            <div className="bg-white rounded-full p-4">
              <span className="text-4xl sm:text-5xl font-bold">0</span>
            </div>
          </div>
          <p className="mt-2 font-medium text-gray-600">Current Streak</p>
        </div>
        <div className="flex-1 max-w-md">
          <div className="flex gap-2 sm:gap-4 justify-center mb-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                <Circle className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                {i < 6 && <Ellipsis className="text-gray-300 w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-center sm:text-left">
            Nice work! <strong>5 days away</strong> from unlocking your 500-point bonus.
          </p>
        </div>
        <div className="flex flex-col items-center mt-4 sm:mt-0">
          <Image
            src={Chest}
            width={60}
            height={60}
            alt="Streak bonus chest"
            className="drop-shadow-md w-14 h-14 sm:w-20 sm:h-20"
          />
          <span className="mt-2 font-medium text-gray-600">Streak Bonus</span>
        </div>
      </div>
    </div>
  </section>
)

const RewardCard = ({ reward, onRedeem, disabled, isLoading }) => (
  <Card className="w-full max-w-xs sm:max-w-sm transition-transform hover:scale-105 mx-auto">
    <CardHeader className="p-0">
      <div className="relative h-40 sm:h-48 w-full">
        <Image
          src={reward.imageUrl}
          fill
          style={{ objectFit: 'cover' }}
          alt={reward.prize}
          className="rounded-t-lg"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm sm:text-base">
          <span className="text-yellow-400 mr-1">⭐</span>
          {new Intl.NumberFormat('en-US').format(reward.cost)}
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{reward.prize}</h3>
      <p className="text-gray-600 text-sm sm:text-base">{reward.description}</p>
    </CardContent>
    <CardFooter className="p-4 pt-0 sm:p-6 sm:pt-0">
      <Button
        className="w-full font-medium"
        onClick={() => onRedeem(reward)}
        disabled={disabled || isLoading}
        variant={disabled ? "secondary" : "default"}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⭐</span> Redeeming...
          </span>
        ) : disabled ? (
          "Insufficient Points"
        ) : (
          "Redeem"
        )}
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
      console.error('Error claiming reward:', error)
      toast.error(error.response?.data?.error || "Failed to claim reward")
    } finally {
      setClaiming(false)
    }
  }

  if (redemption.claimed) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-green-600 flex items-center gap-1">
          <Check size={16} />
          Claimed
        </span>
        {redemption.claimUrl && (
          <BlurredClaimUrl url={redemption.claimUrl} />
        )}
      </div>
    )
  }

  if (!redemption.redeemed) {
    return (
      <span className="text-yellow-600 flex items-center gap-1">
        <Circle size={16} className="fill-yellow-600" />
        Pending
      </span>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClaim}
      disabled={claiming || redemption.claimed}
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

const BlurredClaimUrl = ({ url }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={cn(
        "text-blue-600 hover:text-blue-700 text-sm transition-all duration-200",
        !isHovered && "blur-sm select-none"
      )}>
        {url}
      </span>
      {!isHovered && (
        <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
          Hover to reveal
        </span>
      )}
    </a>
  );
};

const RedemptionGroup = ({ redemptions, onClaimReward }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const latestRedemption = redemptions[0]; // Assuming sorted by date desc
  const totalRedemptions = redemptions.length;
  const unclaimedCount = redemptions.filter(r => !r.claimed).length;

  return (
    <TableRow className={cn(
      "transition-colors",
      latestRedemption.claimed && "bg-green-50/50"
    )}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden">
            <Image
              src={latestRedemption.reward.imageUrl}
              fill
              style={{ objectFit: 'cover' }}
              alt={latestRedemption.reward.prize}
            />
          </div>
          <div>
            <p className="font-medium">{latestRedemption.reward.prize}</p>
            <p className="text-sm text-gray-500">{latestRedemption.reward.description}</p>
            {totalRedemptions > 1 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1"
              >
                {isExpanded ? "Hide" : "Show"} all {totalRedemptions} redemptions
                {unclaimedCount > 0 && !isExpanded && (
                  <span className="text-yellow-600">
                    ({unclaimedCount} unclaimed)
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-1">
          <span className="text-yellow-500">⭐</span>
          {latestRedemption.pointsSpent.toLocaleString()}
        </span>
      </TableCell>
      <TableCell>
        {!isExpanded ? (
          <ClaimButton
            redemption={latestRedemption}
            onClaim={onClaimReward}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {redemptions.map((redemption) => (
              <div key={redemption.id} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
                <ClaimButton
                  redemption={redemption}
                  onClaim={onClaimReward}
                />
              </div>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <p className="font-medium">
            {format(new Date(latestRedemption.createdAt), "MMM d, yyyy")}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};

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

  // Group redemptions by prize name
  const groupedRedemptions = rewardHistory.reduce((acc, redemption) => {
    const prizeName = redemption.reward.prize;
    if (!acc[prizeName]) {
      acc[prizeName] = [];
    }
    acc[prizeName].push(redemption);
    return acc;
  }, {});

  // Sort groups by most recent redemption date
  const sortedGroups = Object.entries(groupedRedemptions)
    .sort(([, a], [, b]) => {
      const latestA = new Date(a[0].createdAt).getTime();
      const latestB = new Date(b[0].createdAt).getTime();
      return latestB - latestA;
    })
    .map(([, redemptions]) => redemptions);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reward</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedGroups.map((redemptions) => (
            <RedemptionGroup
              key={`${redemptions[0].reward.prize}-${redemptions[0].id}`}
              redemptions={redemptions.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )}
              onClaimReward={onClaimReward}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function RewardsPage() {
  const { fetchRewards, fetchRewardHistory, rewards, rewardHistory, isLoading, redeemReward } = useRewardStore()
  const { points, fetchPoints } = usePointsStore()
  const [redeemingRewardId, setRedeemingRewardId] = useState(null)

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

    setRedeemingRewardId(reward.id)
    try {
      const result = await redeemReward(reward.id)
      if (result.success) {
        toast.success(result.message || `Successfully redeemed ${reward.prize}`)
        // Refresh the reward history after successful redemption
        await fetchRewardHistory()
      }
    } catch (error) {
      console.error('Error redeeming reward:', error)
      // Only show generic error if no specific error was shown by the store
      if (!error.response?.data?.error) {
        toast.error('Failed to redeem reward')
      }
    } finally {
      setRedeemingRewardId(null)
    }
  }

  const handleClaimReward = async (redemption) => {
    try {
      await api.post(`/user/rewards/claim/${redemption.id}`);

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
        <section className="w-full max-w-4xl mx-auto px-2 sm:px-8 md:px-12 py-8">
          <PointsBalance points={points} />
          <DailyStreak />
          <div className="overflow-x-auto">
            {/* Featured Reward */}
            {featuredReward && (
              <section className="w-full max-w-4xl mx-auto mb-8 px-2 sm:px-4">
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-100">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Featured Reward</h2>
                  <div className="max-w-2xl mx-auto">
                    <RewardCard
                      reward={featuredReward}
                      onRedeem={handleRedeem}
                      disabled={points < featuredReward.cost}
                      isLoading={redeemingRewardId === featuredReward.id}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* All Rewards */}
            <section className="w-full max-w-4xl mx-auto mb-8 px-2 sm:px-4">
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">All Rewards</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rewards.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      reward={reward}
                      onRedeem={handleRedeem}
                      disabled={points < reward.cost}
                      isLoading={redeemingRewardId === reward.id}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Redemption History */}
            <section className="w-full max-w-4xl mx-auto px-2 sm:px-4">
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Redemption History</h2>
                <RedemptionHistory
                  rewardHistory={rewardHistory}
                  onClaimReward={handleClaimReward}
                />
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  )
}
