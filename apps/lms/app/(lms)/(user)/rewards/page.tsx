"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { EnhancedButton } from "@skill-learn/ui/components/enhanced-button"
import { InteractiveCard, } from "@skill-learn/ui/components/interactive-card"
import { FeatureGate, FeatureDisabledPage } from "@skill-learn/ui/components/feature-gate"
import { Circle, Gift, Check, Coins, Filter, } from "lucide-react"
import { useRewardStore } from "@skill-learn/lib/stores/rewardStore"
import { usePointsStore } from "@skill-learn/lib/stores/pointsStore"
import { toast } from "sonner"
import { UI } from "@/config/constants"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@skill-learn/ui/components/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@skill-learn/ui/components/table"
import { cn } from "@skill-learn/lib/utils"
import api from "@skill-learn/lib/utils/axios";

// Components
import { Loader } from "@skill-learn/ui/components/loader"

// Sub-components
const RewardsHero = () => (
  <div className="w-full bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden">
    <div className="relative z-10 max-w-2xl">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
        Rewards Dashboard
      </h1>
      <p className="text-blue-100 text-lg">
        Earn points to unlock and redeem rewards from a wide variety of choices.
      </p>
    </div>
    {/* Abstract shape decoration matching mockup */}
    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 blur-3xl transform rotate-12 translate-x-1/4 -translate-y-1/4" />
    <div className="absolute right-0 bottom-0 h-2/3 w-1/4 bg-blue-500/20 blur-2xl rounded-full translate-x-1/8 translate-y-1/4" />
  </div>
)

const PointsBalance = ({ points }) => {
  // Mock next tier data since store doesn't have it yet
  const nextTierPoints = 8000;
  const pointsToNextTier = Math.max(0, nextTierPoints - points);
  const progress = Math.min(UI.MAX_PERCENTAGE, (points / nextTierPoints) * UI.MAX_PERCENTAGE);

  return (
    <div className="bg-white rounded-4xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-gray-900 text-lg">Your Points Balance</h3>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Coins size={24} />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">
            {new Intl.NumberFormat('en-US').format(points || 0)}
          </span>
          <span className="text-gray-500">Available Points</span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-blue-600 rounded-full transition-all ease-out`}
              style={{ width: `${progress}%`, transitionDuration: `${UI.TRANSITION_DURATION_MS}ms` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            {pointsToNextTier} points until next tier
          </p>
        </div>
      </div>
    </div>
  )
}

const DailyStreak = () => {
  // Using existing store structure or default 0
  const { streak } = usePointsStore();
  const currentStreak = streak?.current || 0;

  return (
    <div className="bg-white rounded-4xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 text-lg">Daily Streak</h3>
        <div className="flex gap-1">
          {[...Array(UI.STREAK_DISPLAY_DOTS)].map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === 4 ? 'bg-yellow-400' : 'border border-gray-300'}`} />
          ))}
        </div>
      </div>
      <div className="text-right text-xs font-medium text-orange-500 mb-4">Streak Bonus</div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900">{currentStreak}</span>
            <span className="text-gray-500">Current Streak</span>
          </div>
          <p className="text-sm text-gray-500 max-w-[200px]">
            Nice! <span className="font-semibold text-gray-900">5 days away</span> from unlocking your 500-point bonus.
          </p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
          <Gift className="text-yellow-600 h-8 w-8" />
        </div>
      </div>
    </div>
  )
}

const FeaturedRewardCard = ({ reward, status, onRedeem, disabled, isLoading }) => {
  const { isOneTime, max, isFullyRedeemed } = status || {};

  return (
    <div className="bg-white rounded-3xl p-0 shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
      <div className="relative w-full md:w-2/5 h-64 md:h-auto bg-gray-900">
        <Image
          src={reward.imageUrl}
          alt={reward.prize}
          fill
          className="object-contain p-8"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
          {new Intl.NumberFormat('en-US').format(reward.cost)} pts
        </div>
        <div className="absolute top-4 left-4 flex gap-2">
          {isOneTime ? (
            <span className="bg-gray-100/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200">
              One-time
            </span>
          ) : (
            <span className="bg-purple-100/90 backdrop-blur-sm text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-200">
              {max ? `Limit: ${max}` : "Multiple"}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">{reward.prize}</h3>
        <p className="text-gray-500 mb-8 max-w-lg leading-relaxed text-lg">
          {reward.description}
        </p>
        <div>
          <EnhancedButton
            onClick={() => onRedeem(reward)}
            disabled={disabled || isLoading}
            loading={isLoading}
            className={`px-8 py-6 text-lg rounded-xl min-w-[200px] ${isFullyRedeemed
              ? "bg-gray-100/50 text-gray-400 cursor-pointer border border-gray-200"
              : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            {isLoading
              ? "Processing..."
              : isFullyRedeemed
                ? (isOneTime ? "Already Redeemed" : "Max Redemptions Reached")
                : "Redeem Reward"
            }
          </EnhancedButton>
          {isFullyRedeemed && (
            <p className="text-xs text-gray-400 mt-2">
              * View details in Redemption History below
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const RewardCard = ({ reward, status, onRedeem, disabled, isLoading }) => {
  const { isOneTime, max, isFullyRedeemed } = status || {};

  return (
    <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full bg-gray-50 flex items-center justify-center p-4">
        <div className="relative h-full w-full">
          <Image
            src={reward.imageUrl}
            fill
            className="object-contain"
            alt={reward.prize}
          />
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold shadow-sm border border-gray-100/50">
          {new Intl.NumberFormat('en-US').format(reward.cost)} pts
        </div>
        <div className="absolute top-3 left-3">
          {isOneTime ? (
            <span className="bg-gray-100/90 backdrop-blur-sm text-gray-700 text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded-4xld border border-gray-200">
              One-time
            </span>
          ) : (
            <span className="bg-purple-100/90 backdrop-blur-sm text-purple-700 text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded-4xld border border-purple-200">
              {max ? `Limit: ${max}` : "Multiple"}
            </span>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 mb-2 truncate" title={reward.prize}>{reward.prize}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1" title={reward.description}>
          {reward.description}
        </p>
        <EnhancedButton
          className={`w-full rounded-xl py-5 ${isFullyRedeemed
            ? "bg-gray-100/50 text-gray-400 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
            : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          onClick={() => onRedeem(reward)}
          disabled={disabled || isLoading}
          loading={isLoading}
        >
          {isLoading
            ? "Processing..."
            : isFullyRedeemed
              ? (isOneTime ? "Redeemed" : "Max Reached")
              : "Redeem"
          }
        </EnhancedButton>
      </div>
    </div>
  )
}

const ClaimButton = ({ redemption, onClaim }) => {
  const [claiming, setClaiming] = useState(false)

  const handleClaim = async () => {
    setClaiming(true)
    try {
      await onClaim(redemption)
      toast.success("Successfully claimed reward!")
    } catch (error) {
      console.error('Error claiming reward:', error)
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to claim reward";
      toast.error(msg)
    } finally {
      setClaiming(false)
    }
  }

  if (redemption.claimed) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-success flex items-center gap-1">
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
      <span className="text-warning flex items-center gap-1">
        <Circle size={16} className="fill-warning" />
        Pending
      </span>
    )
  }

  return (
    <EnhancedButton
      variant="outline"
      size="sm"
      onClick={handleClaim}
      disabled={claiming || redemption.claimed}
      loading={claiming}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        claiming && "cursor-not-allowed",
        !claiming && "hover:border-success hover:text-success"
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
    </EnhancedButton>
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
        "text-info hover:text-info-hover text-sm transition-all duration-200",
        !isHovered && "blur-sm select-none"
      )}>
        {url}
      </span>
      {!isHovered && (
        <span className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Hover to reveal
        </span>
      )}
    </a>
  );
};

const RedemptionModal = ({ open, onOpenChange, reward, userPoints, onConfirm, isLoading }) => {
  if (!reward) return null;

  const insufficientPoints = userPoints < reward.cost;
  const pointDifference = reward.cost - userPoints;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-4xl">
        {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50"><Loader variant="gif" /></div>}
        <div className="p-6 pb-0 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              {insufficientPoints ? (
                <>
                  <div className="p-2 bg-red-100 rounded-full">
                    <div className="text-red-600 font-bold text-lg select-none">!</div>
                  </div>
                  <span className="text-gray-900">Insufficient Points</span>
                </>
              ) : (
                <span className="text-gray-900">Confirm Redemption</span>
              )}
            </DialogTitle>
          </div>

          <div className="flex justify-center mb-6">
            <div className="relative w-full h-40 bg-gray-900 rounded-xl overflow-hidden shadow-inner">
              <Image
                src={reward.imageUrl}
                alt={reward.prize}
                fill
                className="object-contain p-4"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold shadow-sm">
                {new Intl.NumberFormat('en-US').format(reward.cost)}
              </div>
            </div>
          </div>

          <h3 className="text-center text-xl font-bold text-gray-900 mb-2">{reward.prize}</h3>

          <p className="text-center text-gray-500 text-sm mb-6 px-4">
            {insufficientPoints
              ? "You do not have enough points to redeem this reward yet. Complete more training modules to build your balance."
              : "Are you sure you want to redeem this reward? This action will deduct points from your balance."
            }
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-500">Current Balance</span>
              <span className="text-sm font-bold text-gray-900">{new Intl.NumberFormat('en-US').format(userPoints)} pts</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-500">Redemption Cost</span>
              <span className="text-sm font-bold text-gray-900">{new Intl.NumberFormat('en-US').format(reward.cost)} pts</span>
            </div>
            <div className="h-px bg-gray-200 my-3"></div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-bold ${insufficientPoints ? 'text-red-500' : 'text-gray-500'}`}>
                {insufficientPoints ? 'Points Shortfall' : 'Remaining Balance'}
              </span>
              <span className={`text-sm font-bold ${insufficientPoints ? 'text-red-500' : 'text-green-600'}`}>
                {insufficientPoints
                  ? (
                    <span className="flex items-center gap-1">
                      <span className="text-xs">📉</span> - {new Intl.NumberFormat('en-US').format(pointDifference)} pts
                    </span>
                  )
                  : `${new Intl.NumberFormat('en-US').format(userPoints - reward.cost)} pts`
                }
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3">
          <EnhancedButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-gray-200 hover:bg-gray-100/50 hover:text-gray-900 text-gray-700"
            disabled={isLoading}
          >
            Cancel
          </EnhancedButton>
          {insufficientPoints ? (
            <EnhancedButton
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.location.href = '/training'} // Default action
            >
              Earn More Points
            </EnhancedButton>
          ) : (
            <EnhancedButton
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onConfirm}
              loading={isLoading}
            >
              Confirm Redeem
            </EnhancedButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
      latestRedemption.claimed && "bg-success/10"
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
            <p className="text-sm text-muted-foreground">{latestRedemption.reward.description}</p>
            {totalRedemptions > 1 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-info hover:text-info-hover mt-1 flex items-center gap-1 transition-colors duration-200"
              >
                {isExpanded ? "Hide" : "Show"} all {totalRedemptions} redemptions
                {unclaimedCount > 0 && !isExpanded && (
                  <span className="text-warning">
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
          <span className="text-warning">⭐</span>
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
              <div key={redemption.id} className="flex items-center justify-between gap-4 py-2 h-[52px] border-b border-border last:border-0">
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
        {!isExpanded ? (
          <div className="text-sm">
            <p className="font-medium">
              {format(new Date(latestRedemption.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {redemptions.map((redemption) => (
              <div key={redemption.id} className="flex items-center py-2 h-[52px] border-b border-border last:border-0">
                <span className="text-sm font-medium">
                  {format(new Date(redemption.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            ))}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

const RedemptionHistory = ({ rewardHistory, onClaimReward }) => {
  if (!rewardHistory.length) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
          <Gift className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">
          No Rewards Redeemed Yet
        </h3>
        <p className="mt-1 text-muted-foreground">
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
  type RedemptionItem = { createdAt: string; id: string; reward: { prize: string } };
  const sortedGroups: RedemptionItem[][] = Object.entries(groupedRedemptions)
    .sort(([, a], [, b]) => {
      const listA = a as RedemptionItem[];
      const listB = b as RedemptionItem[];
      const latestA = new Date(listA[0]?.createdAt ?? 0).getTime();
      const latestB = new Date(listB[0]?.createdAt ?? 0).getTime();
      return latestB - latestA;
    })
    .map(([, redemptions]) => redemptions as RedemptionItem[]);

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
              key={`${redemptions[0]?.reward.prize ?? "prize"}-${redemptions[0]?.id ?? "id"}`}
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
  const { fetchRewardsComplete, rewards, rewardHistory, isLoading, redeemReward } = useRewardStore()
  const { points, fetchUserData } = usePointsStore()
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null)

  // Modal state
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{ id: string; cost: number; prize: string } | null>(null);

  useEffect(() => {
    // Use consolidated endpoints: fetchRewardsComplete combines rewards + history
    fetchRewardsComplete()
    fetchUserData()
  }, [fetchRewardsComplete, fetchUserData])

  const featuredReward = rewards.find(reward => reward.featured === true)

  // Calculate redemption counts map
  const redemptionCounts = rewardHistory.reduce((acc, r) => {
    acc[r.rewardId] = (acc[r.rewardId] || 0) + 1;
    return acc;
  }, {});

  const getRedemptionStatus = (reward) => {
    const count = redemptionCounts[reward.id] || 0;
    const isOneTime = !reward.allowMultiple;
    const max = reward.maxRedemptions;

    // Check if fully redeemed
    let isFullyRedeemed = false;
    if (isOneTime && count >= 1) isFullyRedeemed = true;
    if (max && count >= max) isFullyRedeemed = true;

    return { count, isOneTime, max, isFullyRedeemed };
  };

  const handleRedeemedClick = () => {
    const historySection = document.getElementById('redemption-history');
    if (historySection) {
      historySection.scrollIntoView({ behavior: 'smooth' });
      // Optional: highlight the table briefly
      historySection.classList.add('ring-2', 'ring-blue-400', 'transition-all', 'duration-500');
      setTimeout(() => historySection.classList.remove('ring-2', 'ring-blue-400'), 2000);
    }
  };

  const handleRewardClick = (reward, status) => {
    if (status.isFullyRedeemed) {
      handleRedeemedClick();
      return;
    }
    handleRedeem(reward);
  };

  const handleRedeem = (reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  }

  const confirmRedemption = async () => {
    if (!selectedReward) return;

    // Check points again just in case
    if (points < selectedReward.cost) {
      // The modal handles this UI, but we prevent action here too
      return;
    }

    setRedeemingRewardId(selectedReward.id)
    try {
      const result = await redeemReward(selectedReward.id)
      if (result.success) {
        toast.success(result.message || `Successfully redeemed ${selectedReward.prize}`)
        // Refresh rewards and history (already done by redeemReward, but ensure UI is updated)
        await fetchRewardsComplete()
        // Close modal on success
        setShowRedeemModal(false);
      }
    } catch (error) {
      // Error notification is already handled by the store
      // Only show additional notification if store didn't handle it
      const err = error as { response?: { data?: { error?: string } } };
      if (!err.response?.data?.error) {
        toast.error('Failed to redeem reward')
      }
    } finally {
      setRedeemingRewardId(null)
    }
  }

  const handleClaimReward = async (redemption) => {
    try {
      await api.post(`/user/rewards/claim/${redemption.id}`);

      // Refresh rewards and history after claiming
      await fetchRewardsComplete()
    } catch (error) {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to claim reward';
      toast.error(msg);
      throw error;
    }
  }

  if (isLoading) {
    return <Loader variant="gif" />
  }

  return (
    <FeatureGate
      feature="rewards_store"
      featureName="Rewards Store"
      fallback={<FeatureDisabledPage featureName="Rewards Store" />}
    >
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto pb-20">
          <RewardsHero />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PointsBalance points={points} />
            <DailyStreak />
          </div>
          {/* Featured Reward */}
          {featuredReward && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Featured Reward</h2>
              </div>
              <FeaturedRewardCard
                reward={featuredReward}
                status={getRedemptionStatus(featuredReward)}
                onRedeem={(r) => handleRewardClick(r, getRedemptionStatus(r))}
                disabled={false}
                isLoading={redeemingRewardId === featuredReward.id}
              />
            </section>
          )}

          {/* All Rewards */}
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-900">All Rewards</h2>
              <div className="flex gap-2">
                {/* Placeholder for filters if needed, or simple text for now */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="text-sm border-gray-300 rounded-4xld shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white py-1.5 pl-3 pr-8">
                    <option>Popularity</option>
                    <option>Cost: Low to High</option>
                    <option>Cost: High to Low</option>
                  </select>
                </div>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-4xld text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  Filter
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.filter(r => r.id !== featuredReward?.id).map((reward) => {
                const status = getRedemptionStatus(reward);
                return (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    status={status}
                    onRedeem={(r) => handleRewardClick(r, status)}
                    disabled={false}
                    isLoading={redeemingRewardId === reward.id}
                  />
                );
              })}
            </div>
          </section>

          {/* Redemption History */}
          <section id="redemption-history" className="scroll-mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Redemption History</h2>
            <InteractiveCard className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <RedemptionHistory
                rewardHistory={rewardHistory}
                onClaimReward={handleClaimReward}
              />
            </InteractiveCard>
          </section>
        </div>

        <RedemptionModal
          open={showRedeemModal}
          onOpenChange={setShowRedeemModal}
          reward={selectedReward}
          userPoints={points}
          onConfirm={confirmRedemption}
          isLoading={redeemingRewardId === selectedReward?.id}
        />
      </div>
    </FeatureGate>
  )
}
